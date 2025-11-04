import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // clear cookie
  res.setHeader('Set-Cookie', `token=; HttpOnly; Path=/; Max-Age=0`)
  res.writeHead(302, { Location: '/login' })
  res.end()
}
