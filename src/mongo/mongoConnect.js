import mongoose from 'mongoose'

export default async function mongoConnect() {

  if (mongoose.connection.readyState >= 1) {
    return
  }

  return mongoose.connect(process.env.NEXT_PRIVATE_MONGODB_URI);
  
}
