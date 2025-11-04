import mongoose from 'mongoose'

export async function connect() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    // no DB configured; using seed data
    return null
  }
  if (mongoose.connection.readyState === 1) return mongoose
  try {
    // set a reasonable server selection timeout to fail fast in dev if DB is unreachable
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined, serverSelectionTimeoutMS: 5000 })
    return mongoose
  } catch (err) {
    // log and fallback to seed mode by returning null
    // callers should handle a null return value and use seed data
    // but we avoid throwing here to prevent unhandled Mongoose buffering errors
    // which surface as serialization/runtime issues in Next dev
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed, falling back to seed data:', (err as any)?.message || String(err))
    return null
  }
}

export function disconnect() {
  if (mongoose.connection.readyState !== 0) return mongoose.disconnect()
  return Promise.resolve()
}
