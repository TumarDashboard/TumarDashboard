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

  sim1:{
    type: String,
  },

  sim2:{
    type: String,
  },

}, { timestamps: true })

MongooseSchema.index({'$**': 'text'});

export default mongoose.models == null ? mongoose.model('ProtectedObjects', MongooseSchema) : (mongoose.models.ProtectedObjects || mongoose.model('ProtectedObjects', MongooseSchema))