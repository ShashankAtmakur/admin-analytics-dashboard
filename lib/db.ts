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
    // In production, fail fast and surface the error so deployments don't proceed
    const message = (err as any)?.message || String(err)
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.error('MongoDB connection failed (production) - aborting startup:', message)
      throw err
    }
    // In non-production (dev), log and fall back to seeded data for convenience
    // eslint-disable-next-line no-console
    console.error('MongoDB connection failed, falling back to seed data:', message)
    return null
  }
}

export function disconnect() {
  if (mongoose.connection.readyState !== 0) return mongoose.disconnect()
  return Promise.resolve()
}
