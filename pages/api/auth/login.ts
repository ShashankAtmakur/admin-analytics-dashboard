import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { connect } from '../../../lib/db'

const DEMO = { email: 'admin@example.com', password: 'Password123' }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { email, password } = req.body

  // try connect to DB
  await connect()
  let UserModel: any = null
  try {
    UserModel = require('../../../models/User').default
  } catch (e) {
    // ignore
  }

  // if DB user exists, verify password, otherwise fallback to demo
  if (UserModel) {
    const user = await UserModel.findOne({ email }).lean()
    if (user && user.passwordHash) {
      const ok = await bcrypt.compare(password, user.passwordHash)
      if (ok && user.role === 'admin') {
        const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' })
        const secure = process.env.NODE_ENV === 'production' ? '; Secure; SameSite=Lax' : '; SameSite=Lax'
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${8 * 3600}${secure}`)
        return res.json({ ok: true })
      }
    }
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  // fallback demo
  if (email === DEMO.email && password === DEMO.password) {
    const token = jwt.sign({ role: 'admin', email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '8h' })
    const secure = process.env.NODE_ENV === 'production' ? '; Secure; SameSite=Lax' : '; SameSite=Lax'
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${8 * 3600}${secure}`)
    return res.json({ ok: true })
  }

  return res.status(401).json({ message: 'Invalid credentials' })
}
