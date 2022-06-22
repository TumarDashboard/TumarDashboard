import mongoose from 'mongoose'

export const MongooseSchema = new mongoose.Schema({
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
    // ref: 'User'
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

export default mongoose.models == null ? mongoose.model('GuardPosts', MongooseSchema) : (mongoose.models.GuardPosts || mongoose.model('GuardPosts', MongooseSchema))