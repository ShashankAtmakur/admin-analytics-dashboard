// use require for seedData to be resilient when this module is loaded from a plain node
// process via ts-node/register (avoids ESM resolution issues)
let getSeedData: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sd = require('./seedData')
  getSeedData = sd.getSeedData || (sd.default && sd.default.getSeedData) || sd
} catch (e) {
  // will attempt to import later if needed
}
let connect: any = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dbMod = require('./db')
  connect = dbMod.connect || (dbMod.default && dbMod.default.connect)
} catch (e) {
  // caller will handle null connect (fallback to seed data)
}

export async function getAnalyticsServerSide() {
  // try to obtain a DB connection if `connect` is available; otherwise fall back to seed data
  let db: any = null
  try {
    if (!connect) {
      // attempt to require at runtime (handles different module shapes)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const dbMod = require('./db')
      connect = dbMod.connect || (dbMod.default && dbMod.default.connect)
    }
    if (typeof connect === 'function') {
      db = await connect()
    } else {
      db = null
    }
  } catch (e) {
    db = null
  }
  if (!db) {
    // fallback to seed data
    let seedFn: any = getSeedData
    if (!seedFn) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const sd = require('./seedData')
        seedFn = sd.getSeedData || (sd.default && sd.default.getSeedData) || sd
      } catch (e) {
        seedFn = null
      }
    }
    if (!seedFn) throw new Error('No seed data available')
    const { users, analyses, feedbacks } = seedFn()

    const totalUsers = users.length
    const feedbackCount = feedbacks.length
    const analysisCount = analyses.length
    const avgCvScore = +(users.reduce((s: number, u: any) => s + u.cvScore, 0) / users.length).toFixed(2)

    const countryMap: any = {}
    users.forEach((u: any) => (countryMap[u.country] = (countryMap[u.country] || 0) + 1))
    const countryDistribution = Object.keys(countryMap).map(k => ({ country: k, count: countryMap[k] }))

    const trendsMap: any = {}
    analyses.forEach((a: any) => {
      const d = new Date(a.createdAt).toISOString().slice(0, 10)
      trendsMap[d] = (trendsMap[d] || 0) + 1
    })
    const analysisTrends = Object.entries(trendsMap).map(([date, count]) => ({ date, count }))

    const paidCount = users.filter((u: any) => u.isPaid).length
    const freeCount = users.filter((u: any) => !u.isPaid).length

    const careerStage: any = {}
    users.forEach((u: any) => (careerStage[u.careerStage] = (careerStage[u.careerStage] || 0) + 1))

    const topUsers = users
      .slice()
      .sort((a: any, b: any) => b.cvScore - a.cvScore)
      .slice(0, 10)
      .map((u: any) => ({ id: u.id, name: u.name, cvScore: u.cvScore, country: u.country }))

    const ratingMap: any = {}
    let satisfiedCount = 0
    let unsatisfiedCount = 0
    feedbacks.forEach((f: any) => {
      ratingMap[f.rating] = (ratingMap[f.rating] || 0) + 1
      if (f.satisfied) satisfiedCount++
      else unsatisfiedCount++
    })
    const feedbackDistribution = Object.keys(ratingMap)
      .map(k => ({ rating: Number(k), count: ratingMap[k] }))
      .sort((a, b) => a.rating - b.rating)

    return {
      kpis: { totalUsers, feedbackCount, analysisCount, avgCvScore },
      countryDistribution,
      analysisTrends,
      paidCount,
      freeCount,
      careerStage,
      topUsers,
      feedbackDistribution,
      satisfiedCount,
      unsatisfiedCount,
    }
  }

  const User = require('../models/User').default
  const Analysis = require('../models/Analysis').default
  const Feedback = require('../models/Feedback').default

  const totalUsers = await User.countDocuments()
  const feedbackCount = await Feedback.countDocuments()
  const analysisCount = await Analysis.countDocuments()

  const avgCvAgg = await User.aggregate([{ $group: { _id: null, avg: { $avg: '$cvScore' } } }])
  const avgCvScore = avgCvAgg && avgCvAgg[0] ? +avgCvAgg[0].avg.toFixed(2) : 0

  const countryAgg = await User.aggregate([
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $project: { country: '$_id', count: 1, _id: 0 } },
  ])

  const trendsAgg = await Analysis.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $project: { date: '$_id', count: 1, _id: 0 } },
    { $sort: { date: 1 } },
  ])

  const paidCount = await User.countDocuments({ isPaid: true })
  const freeCount = await User.countDocuments({ isPaid: { $ne: true } })

  const careerAgg = await User.aggregate([{ $group: { _id: '$careerStage', count: { $sum: 1 } } }])
  const careerStage: any = {}
  careerAgg.forEach((c: any) => (careerStage[c._id] = c.count))

  const topUsersRaw = await User.find({}, { name: 1, cvScore: 1, country: 1 }).sort({ cvScore: -1 }).limit(10).lean()
  const topUsers = topUsersRaw.map((u: any) => ({ id: String(u._id || u.id), name: u.name, cvScore: u.cvScore, country: u.country }))

  const ratingAgg = await Feedback.aggregate([
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $project: { rating: '$_id', count: 1, _id: 0 } },
    { $sort: { rating: 1 } },
  ])
  const satisfiedCountAgg = await Feedback.countDocuments({ satisfied: true })
  const unsatisfiedCountAgg = await Feedback.countDocuments({ satisfied: { $ne: true } })

  return {
    kpis: { totalUsers, feedbackCount, analysisCount, avgCvScore },
    countryDistribution: countryAgg,
    analysisTrends: trendsAgg,
    paidCount,
    freeCount,
    careerStage,
  topUsers,
    feedbackDistribution: ratingAgg,
    satisfiedCount: satisfiedCountAgg,
    unsatisfiedCount: unsatisfiedCountAgg,
  }
}

export default getAnalyticsServerSide
