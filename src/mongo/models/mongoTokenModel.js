import mongoose from 'mongoose'

const MongooseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  refreshToken: {
    type: String,
    required: true,
  }
})

export default mongoose.models == null ? mongoose.model('Token', MongooseSchema) : (mongoose.models.Token || mongoose.model('Token', MongooseSchema))