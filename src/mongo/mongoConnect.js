import mongoose from 'mongoose'

mongoose.set('strictQuery', false);
mongoose.set('bufferTimeoutMS', 30000);

let connectionPromise = null;

export default async function mongoConnect() {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // Connection in progress - wait for it
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  // Start new connection
  connectionPromise = mongoose.connect(process.env.NEXT_PRIVATE_MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  try {
    await connectionPromise;
    console.log('MongoDB connected successfully to', mongoose.connection.host);
  } catch (error) {
    connectionPromise = null;
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}
