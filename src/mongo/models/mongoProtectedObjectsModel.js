import mongoose from 'mongoose'

export const MongooseSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Пожалуйста, введите номер объекта']
  },

  name: {
    type: String,
  },

  address: {
    type: String,
  },

  photo:{
    type: String
  },
  
  description: {
    type: String
  },

}, { timestamps: true })

export default mongoose.models == null ? mongoose.model('ProtectedObjects', MongooseSchema) : (mongoose.models.GuardPosts || mongoose.model('ProtectedObjects', MongooseSchema))