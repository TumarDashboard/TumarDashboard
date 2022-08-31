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
    type: mongoose.Schema.Types.ObjectId
  }

})

export default mongoose.models == null ? mongoose.model('TimesheetsGuardPostManagers', MongooseSchema) : (mongoose.models.TimesheetsGuardPostManagers || mongoose.model('TimesheetsGuardPostManagers', MongooseSchema))