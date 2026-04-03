import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.NEXT_PRIVATE_MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
    }

    const db = mongoose.connection.db;

    // Find users with positions containing empty string
    const usersWithEmptyPositions = await db.collection('users').find({
      positions: ''
    }).toArray();

    const before = usersWithEmptyPositions.map(u => ({
      email: u.email,
      positions: u.positions
    }));

    // Update: remove empty strings from positions arrays
    const result = await db.collection('users').updateMany(
      { positions: '' },
      { $pull: { positions: '' } }
    );

    // Verify after fix
    const stillBroken = await db.collection('users').find({
      positions: ''
    }).toArray();

    res.status(200).json({
      status: 'OK',
      affectedBefore: before,
      modifiedCount: result.modifiedCount,
      stillBroken: stillBroken.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
