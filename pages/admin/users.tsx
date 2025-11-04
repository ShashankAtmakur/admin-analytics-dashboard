import type { GetServerSideProps } from 'next'
import getAnalyticsServerSide from '../../lib/analytics'
import jwt from 'jsonwebtoken'
import React from 'react'

export default function AdminUsers({ users }: { users: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Users</h2>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2">Name</th>
              <th>Email</th>
              <th>Country</th>
              <th>Stage</th>
              <th>Paid</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td>{u.email}</td>
                <td>{u.country}</td>
                <td>{u.careerStage}</td>
                <td>{u.isPaid ? 'Yes' : 'No'}</td>
                <td className="font-medium">{u.cvScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = (context.req as any).cookies?.token || null
  try {
    if (!token) return { redirect: { destination: '/login', permanent: false } }
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
    if (payload.role !== 'admin') return { redirect: { destination: '/login', permanent: false } }
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  // fetch users from DB (use models directly)
  try {
    const User = require('../../models/User').default
    const usersRaw = await User.find({}, { name: 1, email: 1, country: 1, careerStage: 1, isPaid: 1, cvScore: 1 }).limit(200).lean()
    const users = usersRaw.map((u: any) => ({
      id: String(u._1d || u._id || u.id),
      name: u.name ?? null,
      email: u.email ?? null,
      country: u.country ?? null,
      careerStage: u.careerStage ?? null,
      isPaid: typeof u.isPaid === 'boolean' ? u.isPaid : false,
      cvScore: typeof u.cvScore === 'number' ? u.cvScore : 0,
    }))
    return { props: { users } }
  } catch (err) {
    console.error(err)
    return { props: { users: [] } }
  }
}
