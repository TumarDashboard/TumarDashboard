import mongoose from 'mongoose';

export default async function handler(req, res) {
  const info = {
    uri_exists: !!process.env.NEXT_PRIVATE_MONGODB_URI,
    uri_start: process.env.NEXT_PRIVATE_MONGODB_URI
      ? process.env.NEXT_PRIVATE_MONGODB_URI.substring(0, 40) + '...'
      : 'NOT SET',
    readyState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  };

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.NEXT_PRIVATE_MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });
    }

    info.readyStateAfter = mongoose.connection.readyState;
    info.host = mongoose.connection.host;
    info.dbName = mongoose.connection.name;

    const collections = await mongoose.connection.db.listCollections().toArray();
    info.collections = collections.map(c => c.name);
    info.status = 'CONNECTED';

    res.status(200).json(info);
  } catch (error) {
    info.error = error.message;
    info.errorName = error.name;
    info.status = 'FAILED';
    res.status(500).json(info);
  }
}
