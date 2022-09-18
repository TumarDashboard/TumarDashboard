import mongoose from 'mongoose'

export const MongooseSchema = new mongoose.Schema({
  number: {
    type: String,
  },

  callsign: {
    type: String,
    required: [true, 'Пожалуйста, введите краткое наименование']
  },

  name: {
    type: String,
    // required: [true, 'Пожалуйста, введите наименование']
  },

  address: {
    type: String,
    // required: [true, 'Пожалуйста, введите адресс']
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
    default: 'User',
    enum: ['User', 'UserArchive']
  },

  shifts: {
    type: [String]
  },
  
  description: {
    type: String
  },

})

export default mongoose.models == null ? mongoose.model('GuardPosts', MongooseSchema) : (mongoose.models.GuardPosts || mongoose.model('GuardPosts', MongooseSchema))