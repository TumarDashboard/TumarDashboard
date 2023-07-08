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

  sim1:{
    type: String,
  },

  sim2:{
    type: String,
  },

}, { timestamps: true })

export default mongoose.models == null ? mongoose.model('ProtectedObjectsArchive', MongooseSchema) : (mongoose.models.ProtectedObjectsArchive || mongoose.model('ProtectedObjectsArchive', MongooseSchema))