import { useEffect, useState } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import KPI from '../components/KPI'
import CountryChart from '../components/CountryChart'
import CVTrendChart from '../components/CVTrendChart'
import PaidDonut from '../components/PaidDonut'
import Leaderboard from '../components/Leaderboard'
import FeedbackChart from '../components/FeedbackChart'
import SatisfactionDonut from '../components/SatisfactionDonut'
import { useRouter } from 'next/router'
import type { GetServerSideProps } from 'next'
import jwt from 'jsonwebtoken'
import getAnalyticsServerSide from '../lib/analytics'

type Props = { data: any }

export default function Dashboard({ data }: Props) {
  const [kpis, setKpis] = useState(() => ({
    totalUsers: data?.kpis?.totalUsers || 0,
    feedbackCount: data?.kpis?.feedbackCount || 0,
    avgCvScore: data?.kpis?.avgCvScore || 0,
    analysisCount: data?.kpis?.analysisCount || 0,
    activeUsers: 0,
  }))

  useEffect(() => {
    // initialize activeUsers from server if available
    setKpis((s) => ({ ...s, activeUsers: data?.kpis?.activeUsers || 0 }))

    const es = new EventSource('/api/realtime')
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data)
        const { kpis: incoming } = parsed as any
        setKpis((prev) => ({
          ...prev,
          // increment total users by any newUsers reported
          totalUsers: prev.totalUsers + (incoming?.newUsers || 0),
          // update active users to the latest active value
          activeUsers: typeof incoming?.active === 'number' ? incoming.active : prev.activeUsers,
        }))
      } catch (err) {
        // ignore malformed message
        console.error('SSE parse error', err)
      }
    }
    es.onerror = (err) => {
      console.error('SSE error', err)
      es.close()
    }

    return () => es.close()
  }, [data])

  return (
    <div className="min-h-screen p-6">
      <div className="container">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <KPI title="Total Users" value={kpis.totalUsers} />
          <KPI title="Active Users" value={kpis.activeUsers} />
          <KPI title="Feedbacks" value={kpis.feedbackCount} />
          <KPI title="Avg CV Score" value={kpis.avgCvScore} />
          <KPI title="Analyses" value={kpis.analysisCount} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Users by Country</h3>
            <CountryChart data={data.countryDistribution} />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">CV Analysis Trends</h3>
            <CVTrendChart data={data.analysisTrends} />
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Paid vs Free</h3>
            <PaidDonut paid={data.paidCount} free={data.freeCount} />
          </div>
        </section>
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded shadow lg:col-span-1">
            <h3 className="font-semibold mb-2">Top Users</h3>
            <Leaderboard users={data.topUsers} />
          </div>

          <div className="bg-white p-4 rounded shadow lg:col-span-1">
            <h3 className="font-semibold mb-2">Career Stage Breakdown</h3>
            <ul className="space-y-2">
              {Object.entries(data.careerStage).map(([k, v]: any) => (
                <li key={k} className="flex justify-between">
                  <span>{k}</span>
                  <span className="font-medium">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded shadow lg:col-span-1">
            <h3 className="font-semibold mb-2">Feedback: Rating Distribution</h3>
            {/* Build rating histogram from feedbacks */}
            <FeedbackChart data={data.feedbackDistribution || []} />
            <div className="mt-4">
              <h4 className="font-medium">Satisfaction</h4>
              <SatisfactionDonut satisfied={data.satisfiedCount || 0} unsatisfied={data.unsatisfiedCount || 0} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = (context.req as any).cookies?.token || null
  try {
    if (!token) return { redirect: { destination: '/login', permanent: false } }
    jwt.verify(token, process.env.JWT_SECRET || 'devsecret')
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  try {
    const data = await getAnalyticsServerSide()

    // sanitize data to ensure no non-serializable values (like ObjectId) remain
    const sanitizeForJSON = (obj: any) => {
      return JSON.parse(
        JSON.stringify(obj, (_key, value) => {
          // convert Mongo ObjectId-like objects to strings
          if (value && typeof value === 'object') {
            // detect bson ObjectId by _bsontype or presence of toHexString/toString
            if (value._bsontype === 'ObjectID') return String(value)
            if (typeof value.toHexString === 'function') return value.toHexString()
            if (typeof value.toString === 'function' && value.constructor && value.constructor.name === 'ObjectID') return value.toString()
          }
          if (_key === '_id') return String(value)
          return value
        })
      )
    }

    const safe = sanitizeForJSON(data)
    // As an extra guard, ensure topUsers entries don't contain _id
    if (safe?.topUsers && Array.isArray(safe.topUsers)) {
      safe.topUsers = safe.topUsers.map((u: any) => ({ id: u.id || String(u._id || u.id), name: u.name, cvScore: u.cvScore, country: u.country }))
    }

    return { props: { data: safe } }
  } catch (err) {
    console.error(err)
    return { props: { data: null } }
  }
}
