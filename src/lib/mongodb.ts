import mongoose from 'mongoose';

export class MissingEnvironmentError extends Error {
  constructor(variableName: string) {
    super(`${variableName} is not configured`);
    this.name = 'MissingEnvironmentError';
  }
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
const cached = globalThis.mongooseCache ?? { conn: null, promise: null };
globalThis.mongooseCache = cached;

async function dbConnect() {
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new MissingEnvironmentError('MONGODB_URI');
  }

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
    cached.promise = mongoose.connect(mongodbUri, opts).then((mongooseInstance) => {
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
