import mongoConnect from "../../../src/mongo/mongoConnect";
import mongoTimesheetsGuardsModel from "../../../src/mongo/models/mongoTimesheetsGuardsModel";
import mongoTimesheetsGuardPostModel from "../../../src/mongo/models/mongoTimesheetsGuardPostModel";
import mongoGuardsModel from "../../../src/mongo/models/mongoGuardsModel";
import mongoGuardsArchiveModel from "../../../src/mongo/models/mongoGuardsArchiveModel";
import mongoGuardPostsModel from "../../../src/mongo/models/mongoGuardPostsModel";
import mongoGuardPostsArchiveModel from "../../../src/mongo/models/mongoGuardPostsArchiveModel";

export default async function handler(req, res) {
  // CORS headers for tumar-finance
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Integration-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth by integration key
  const key = req.headers['x-integration-key'];
  if (!key || key !== process.env.NEXT_PRIVATE_INTEGRATION_KEY) {
    return res.status(401).json({ error: 'Invalid integration key' });
  }

  try {
    await mongoConnect();

    // Month parameter (default: current month)
    const monthParam = req.query.month; // format: YYYY-MM-01
    const date = monthParam ? new Date(monthParam) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // 1. Get all guard posts (active + archived)
    const [guardPosts, guardPostsArchive] = await Promise.all([
      mongoGuardPostsModel.find({}).lean(),
      mongoGuardPostsArchiveModel.find({}).lean(),
    ]);
    const allGuardPosts = [...guardPosts, ...guardPostsArchive];

    // 2. Get all guards (active + archived)
    const [guards, guardsArchive] = await Promise.all([
      mongoGuardsModel.find({}).lean(),
      mongoGuardsArchiveModel.find({}).lean(),
    ]);
    const allGuards = [...guards, ...guardsArchive];
    const guardsMap = {};
    allGuards.forEach(g => { guardsMap[g._id.toString()] = g; });

    // 3. Get timesheet data for the month
    const [timesheetGuards, timesheetPosts] = await Promise.all([
      mongoTimesheetsGuardsModel.find({ month: date }).lean(),
      mongoTimesheetsGuardPostModel.find({ month: date }).lean(),
    ]);

    // Build rate map from timesheet posts (overrides guard post default rate)
    const rateMap = {};
    timesheetPosts.forEach(tp => {
      rateMap[tp.guardPost.toString()] = tp.rate;
    });

    // 4. Build response: per guard post, per guard — hours worked, rate, salary
    const postsSummary = allGuardPosts.map(gp => {
      const gpId = gp._id.toString();
      const rate = rateMap[gpId] != null ? rateMap[gpId] : gp.rate;

      // Find all timesheet entries for this guard post
      const entries = timesheetGuards.filter(tg => tg.guardPost.toString() === gpId);

      const guardsData = entries.map(entry => {
        const guard = guardsMap[entry.guard.toString()];
        if (!guard) return null;

        // Count worked days (timesheetDays contains day numbers that were worked)
        const daysWorked = entry.timesheetDays ? entry.timesheetDays.length : 0;
        // Count shifts (non-empty entries)
        const shiftsWorked = entry.timesheetShifts ? entry.timesheetShifts.filter(s => s && s !== '').length : 0;
        // Sum actual hours from shifts (each timesheetShifts entry is hours for that day)
        // This matches TumarDashboard Excel: hoursCount = SUM of shift values
        const totalHours = entry.timesheetShifts ? entry.timesheetShifts.reduce((sum, s) => {
          const val = parseInt(s);
          return sum + (isNaN(val) ? 0 : val);
        }, 0) : 0;
        const salary = rate ? Math.round(totalHours * rate) : 0;

        return {
          guardId: guard._id.toString(),
          surname: guard.surname,
          firstName: guard.firstName,
          patronymic: guard.patronymic || '',
          isOfficial: guard.isOfficial || false,
          iin: guard.iin || '',
          daysWorked,
          shiftsWorked,
          totalHours,
          salary,
        };
      }).filter(Boolean);

      const officialGuards = guardsData.filter(g => g.isOfficial);
      const unofficialGuards = guardsData.filter(g => !g.isOfficial);

      return {
        guardPostId: gpId,
        number: gp.number || '',
        callsign: gp.callsign || '',
        name: gp.name || '',
        address: gp.address || '',
        rate: rate || 0,
        totalGuards: guardsData.length,
        officialCount: officialGuards.length,
        unofficialCount: unofficialGuards.length,
        totalSalary: guardsData.reduce((s, g) => s + g.salary, 0),
        officialSalary: officialGuards.reduce((s, g) => s + g.salary, 0),
        unofficialSalary: unofficialGuards.reduce((s, g) => s + g.salary, 0),
        guards: guardsData,
      };
    }).filter(p => p.guards.length > 0);

    // 5. Build totals
    const totals = {
      totalGuards: postsSummary.reduce((s, p) => s + p.totalGuards, 0),
      officialCount: postsSummary.reduce((s, p) => s + p.officialCount, 0),
      unofficialCount: postsSummary.reduce((s, p) => s + p.unofficialCount, 0),
      totalSalary: postsSummary.reduce((s, p) => s + p.totalSalary, 0),
      officialSalary: postsSummary.reduce((s, p) => s + p.officialSalary, 0),
      unofficialSalary: postsSummary.reduce((s, p) => s + p.unofficialSalary, 0),
      taxEstimate: Math.round(postsSummary.reduce((s, p) => s + p.officialSalary, 0) * 0.12),
    };

    return res.status(200).json({
      success: true,
      month: date.toISOString().slice(0, 10),
      syncedAt: new Date().toISOString(),
      totals,
      guardPosts: postsSummary,
    });

  } catch (error) {
    console.error('Integration sync error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
