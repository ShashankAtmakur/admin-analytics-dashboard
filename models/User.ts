import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  country: { type: String },
  careerStage: { type: String },
  isPaid: { type: Boolean, default: false },
  cvScore: { type: Number, default: 0 },
  passwordHash: { type: String },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
