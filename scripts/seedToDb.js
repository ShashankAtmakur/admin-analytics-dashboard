#!/usr/bin/env node
// Simple seeder for MongoDB — run with: MONGODB_URI="youruri" node scripts/seedToDb.js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('Please set MONGODB_URI environment variable')
    process.exit(1)
  }
  await mongoose.connect(uri)
  console.log('Connected to', uri)

  // Define models inline so this script can run with plain Node (no TS transpile required)
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    country: { type: String },
    careerStage: { type: String },
    isPaid: { type: Boolean, default: false },
    cvScore: { type: Number, default: 0 },
    passwordHash: { type: String },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now },
  })
  const AnalysisSchema = new mongoose.Schema({ userId: { type: String, required: true }, score: { type: Number, required: true }, createdAt: { type: Date, default: Date.now } })
  const FeedbackSchema = new mongoose.Schema({ userId: { type: String, required: true }, rating: { type: Number, required: true }, satisfied: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now } })

  const User = mongoose.models.User || mongoose.model('User', UserSchema)
  const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema)
  const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema)

  // clear collections
  await User.deleteMany({})
  await Analysis.deleteMany({})
  await Feedback.deleteMany({})

  const countries = ['USA', 'India', 'UK', 'Canada', 'Germany']
  const careerStages = ['Fresher', 'Graduate', 'Experienced']

  const users = Array.from({ length: 120 }).map((_, i) => {
    const country = countries[i % countries.length]
    const careerStage = careerStages[i % careerStages.length]
    const isPaid = i % 5 === 0
    const cvScore = Math.round(50 + Math.random() * 50)
    return {
      name: `User ${i}`,
      email: `user${i}@example.com`,
      country,
      careerStage,
      isPaid,
      cvScore,
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24),
    }
  })

  // insert users
  const inserted = await User.insertMany(users)
  console.log('Inserted users:', inserted.length)

  const analyses = Array.from({ length: 420 }).map((_, i) => ({
    userId: inserted[i % inserted.length]._id.toString(),
    score: Math.round(50 + Math.random() * 50),
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12),
  }))
  await Analysis.insertMany(analyses)
  console.log('Inserted analyses:', analyses.length)

  const feedbacks = Array.from({ length: 80 }).map((_, i) => ({
    userId: inserted[i % inserted.length]._id.toString(),
    rating: 1 + (i % 5),
    satisfied: i % 7 !== 0,
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 36),
  }))
  await Feedback.insertMany(feedbacks)
  console.log('Inserted feedbacks:', feedbacks.length)

  // create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Password123'
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(adminPassword, salt)
  await User.create({ name: 'Admin', email: adminEmail, passwordHash: hash, role: 'admin', cvScore: 0 })
  console.log('Created admin:', adminEmail)

  await mongoose.disconnect()
  console.log('Seeding complete')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
