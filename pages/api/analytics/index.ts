import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import getAnalyticsServerSide from '../../../lib/analytics'

function unauthorized(res: NextApiResponse) {
  return res.status(401).json({ message: 'Unauthorized' })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // simple auth: check cookie token
  const token = req.cookies?.token
  try {
    if (!token) return unauthorized(res)
    jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
  } catch (e) {
    return unauthorized(res)
  }

  try {
    const analytics = await getAnalyticsServerSide()
    return res.json(analytics)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Failed to collect analytics' })
  }
}
 
