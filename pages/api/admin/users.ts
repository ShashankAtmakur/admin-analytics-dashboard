import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

function unauthorized(res: NextApiResponse) {
  return res.status(401).json({ message: 'Unauthorized' })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies?.token
  try {
    if (!token) return unauthorized(res)
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    if (payload.role !== 'admin') return unauthorized(res)
  } catch (e) {
    return unauthorized(res)
  }

  const User = require('../../../models/User').default

  if (req.method === 'GET') {
    const users = await User.find({}, { name: 1, email: 1, country: 1, careerStage: 1, isPaid: 1, cvScore: 1, role: 1 }).limit(200).lean()
    return res.json({ users })
  }

  if (req.method === 'PUT') {
    const { id, isPaid, role } = req.body
    if (!id) return res.status(400).json({ message: 'Missing id' })
    const update: any = {}
    if (typeof isPaid === 'boolean') update.isPaid = isPaid
    if (role) update.role = role
    await User.updateOne({ _id: id }, { $set: update })
    return res.json({ ok: true })
  }

  return res.status(405).end()
}
