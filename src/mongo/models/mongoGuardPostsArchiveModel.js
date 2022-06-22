import mongoose from 'mongoose'

export const MongooseSchema = new mongoose.Schema({
  reason: {
    type: String
  },

  userPerfomed: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userPerfomedSheme'
  },

  userPerfomedSheme:{
    type: String,
    enum: ['User', 'UserArchive']
  },

  number: {
    type: String,
  },

  name: {
    type: String,
    required: [true, 'Пожалуйста, введите наименование']
  },

  address: {
    type: String,
    required: [true, 'Пожалуйста, введите адресс']
  },

  photo:{
    type: String
  },  

  manager:{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'managerSheme'
  },

  managerSheme:{
    type: String,
    enum: ['User', 'UserArchive']
  },

  shifts: {
    type: [Number]
  },
  
  description: {
    type: String
  },

})

export default mongoose.models == null ? mongoose.model('GuardPostsArchive', MongooseSchema) : (mongoose.models.GuardPostsArchive || mongoose.model('GuardPostsArchive', MongooseSchema))