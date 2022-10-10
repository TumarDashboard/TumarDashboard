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

  manager:{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'managerSheme'
  },

  managerSheme:{
    type: String,
    default: 'User',
    enum: ['User', 'UserArchive']
  },

  rate: {
    type: Number,
  },

})

export default mongoose.models == null ? mongoose.model('TimesheetsGuardPost', MongooseSchema) : (mongoose.models.TimesheetsGuardPost || mongoose.model('TimesheetsGuardPost', MongooseSchema))