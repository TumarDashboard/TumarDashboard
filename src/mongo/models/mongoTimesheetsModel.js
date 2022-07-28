import mongoose from 'mongoose'

export const MongooseSchema = new mongoose.Schema({
  guardPost: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Не указан физ. пост']
  },

  month: {
    type: Date,
    required: [true, 'Не указан месяц']
  },

  guard: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Не указан охранник'],
    refPath: 'guardSheme'
  },

  guardSheme:{
    type: String,
    default: 'Guards',
    enum: ['Guards', 'GuardsArchive']
  },

  timesheetShifts: {
    type: [String],
    required: [true, 'Отсутствуют данные о сменах']
  },

  timesheetDays:{
    type: [Number],
    required: [true, 'Отсутствуют данные о днях']
  }

})

export default mongoose.models == null ? mongoose.model('TimesheetsGuards', MongooseSchema) : (mongoose.models.TimesheetsGuards || mongoose.model('TimesheetsGuards', MongooseSchema))