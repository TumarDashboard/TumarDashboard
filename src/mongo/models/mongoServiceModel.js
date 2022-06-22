import mongoose from 'mongoose'

const MongooseSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  }
})

export default mongoose.models == null ? mongoose.model('Service', MongooseSchema) : (mongoose.models.Service || mongoose.model('Service', MongooseSchema))