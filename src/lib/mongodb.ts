import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('MongoDB: Using cached connection.');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable command buffering if not connected
      // useNewUrlParser: true, // Deprecated, no longer needed
      // useUnifiedTopology: true, // Deprecated, no longer needed
    };

    console.log('MongoDB: Creating new connection promise.');
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      console.log('MongoDB: Connection successful.');
      return mongooseInstance;
    }).catch(error => {
      console.error('MongoDB: Connection error:', error);
      cached.promise = null; // Reset promise on error
      throw error; // Re-throw error to be caught by caller
    });
  }

  try {
    console.log('MongoDB: Awaiting connection promise.');
    cached.conn = await cached.promise;
  } catch (e) {
    // If the promise was rejected, clear it so we can try again
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
