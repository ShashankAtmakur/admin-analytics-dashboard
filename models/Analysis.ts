import mongoose from 'mongoose'

const AnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema)
