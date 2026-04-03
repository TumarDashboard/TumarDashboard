import mongoose from 'mongoose'

mongoose.set('strictQuery', false);

export default async function mongoConnect() {

  if (mongoose.connection.readyState >= 1) {
    return
  }
  
  return mongoose.connect(process.env.NEXT_PRIVATE_MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  
}
