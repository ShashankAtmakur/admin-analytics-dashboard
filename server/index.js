const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

// Load local environment variables from .env.local when present (safe: .env.local is gitignored)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') })
} catch (e) {
  // ignore if dotenv not available; env vars can be provided externally
}

// Reuse application's db helper and models (load defensively to support ts-node/register interop)
let connect = null
try {
  const dbMod = require('../lib/db')
  connect = dbMod.connect || (dbMod.default && dbMod.default.connect)
} catch (e) {
  // will attempt to run without DB (seed fallback)
  console.error('Warning: could not require lib/db, running in seed fallback mode')
}

async function createServer() {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(cookieParser())

  // Health
  app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }))

  // Connect DB (if available)
  const db = null
  // If a DB connect helper is present we could try to use it, but for the fallback
  // server we'll return deterministic seeded analytics to avoid requiring TS modules.

  // Simple analytics endpoint (fallback seeded analytics)
  app.get('/api/analytics', async (req, res) => {
    try {
      // generate small seeded dataset for demo (mirrors lib/seedData)
      const countries = ['USA', 'India', 'UK', 'Canada', 'Germany']
      const careerStages = ['Fresher', 'Graduate', 'Experienced']
      const users = Array.from({ length: 120 }).map((_, i) => {
        const country = countries[i % countries.length]
        const careerStage = careerStages[i % careerStages.length]
        const isPaid = i % 5 === 0
        const cvScore = Math.round(50 + Math.random() * 50)
        return {
          id: `u_${i}`,
          name: `User ${i}`,
          country,
          careerStage,
          isPaid,
          cvScore,
          createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
        }
      })

      const analyses = Array.from({ length: 420 }).map((_, i) => ({
        id: `a_${i}`,
        userId: `u_${i % users.length}`,
        score: Math.round(50 + Math.random() * 50),
        createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toISOString(),
      }))

      const feedbacks = Array.from({ length: 80 }).map((_, i) => ({
        id: `f_${i}`,
        userId: `u_${i % users.length}`,
        rating: 1 + (i % 5),
        satisfied: i % 7 !== 0,
        createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 36).toISOString(),
      }))

      // compute aggregates
      const totalUsers = users.length
      const feedbackCount = feedbacks.length
      const analysisCount = analyses.length
      const avgCvScore = +(users.reduce((s, u) => s + u.cvScore, 0) / users.length).toFixed(2)

      const countryMap = {}
      users.forEach((u) => (countryMap[u.country] = (countryMap[u.country] || 0) + 1))
      const countryDistribution = Object.keys(countryMap).map((k) => ({ country: k, count: countryMap[k] }))

      const trendsMap = {}
      analyses.forEach((a) => {
        const d = new Date(a.createdAt).toISOString().slice(0, 10)
        trendsMap[d] = (trendsMap[d] || 0) + 1
      })
      const analysisTrends = Object.entries(trendsMap).map(([date, count]) => ({ date, count }))

      const paidCount = users.filter((u) => u.isPaid).length
      const freeCount = users.filter((u) => !u.isPaid).length

      const careerStage = {}
      users.forEach((u) => (careerStage[u.careerStage] = (careerStage[u.careerStage] || 0) + 1))

      const topUsers = users
        .slice()
        .sort((a, b) => b.cvScore - a.cvScore)
        .slice(0, 10)
        .map((u) => ({ id: u.id, name: u.name, cvScore: u.cvScore, country: u.country }))

      const ratingMap = {}
      let satisfiedCount = 0
      let unsatisfiedCount = 0
      feedbacks.forEach((f) => {
        ratingMap[f.rating] = (ratingMap[f.rating] || 0) + 1
        if (f.satisfied) satisfiedCount++
        else unsatisfiedCount++
      })
      const feedbackDistribution = Object.keys(ratingMap)
        .map((k) => ({ rating: Number(k), count: ratingMap[k] }))
        .sort((a, b) => a.rating - b.rating)

      return res.json({
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
      })
    } catch (err) {
      console.error('analytics error', err)
      return res.status(500).json({ error: 'analytics_error' })
    }
  })

  // Auth: simple login that issues a JWT cookie (same as Next API)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {}
      const User = require('../models/User').default
      const bcrypt = require('bcryptjs')
      const jwt = require('jsonwebtoken')

      // try to find user (if db available)
      if (db) {
        const user = await User.findOne({ email }).lean()
        if (!user) return res.status(401).json({ error: 'invalid_credentials' })
        const ok = await bcrypt.compare(password, user.passwordHash || '')
        if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
        const token = jwt.sign({ id: String(user._id), role: user.role || 'admin', email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
        return res.json({ ok: true })
      }

      // Fallback: simple demo credentials from env
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        const token = require('jsonwebtoken').sign({ id: 'demo', role: 'admin', email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
        return res.json({ ok: true })
      }

      return res.status(401).json({ error: 'invalid_credentials' })
    } catch (err) {
      console.error('login error', err)
      return res.status(500).json({ error: 'server_error' })
    }
  })

  // Simple SSE endpoint for real-time KPIs
  app.get('/api/realtime', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let counter = 0
    const interval = setInterval(() => {
      counter++
      const payload = {
        time: new Date().toISOString(),
        kpis: {
          active: Math.max(0, 50 + Math.round(Math.sin(counter / 3) * 5 + (Math.random() * 6 - 3))),
          newUsers: Math.max(0, Math.round(Math.random() * 5)),
        },
      }
      res.write(`data: ${JSON.stringify(payload)}\n\n`)
    }, 5000)

    req.on('close', () => clearInterval(interval))
  })

  return app
}

// If run directly, start listening. When required (e.g. by tests), callers can
// import createServer and start/inspect the app without it auto-listening.
if (require.main === module) {
  createServer()
    .then((app) => {
      const port = process.env.PORT || 4000
      app.listen(port, () => console.log(`Express fallback server listening on http://localhost:${port}`))
    })
    .catch((err) => {
      console.error('Failed to start express fallback server', err)
      process.exit(1)
    })
}

// CommonJS export for testability
module.exports = { createServer }
module.exports.default = createServer
