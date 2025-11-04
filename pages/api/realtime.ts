import type { NextApiRequest, NextApiResponse } from 'next'

// SSE endpoint that streams simulated KPI updates every 5 seconds
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let counter = 0
    const interval = setInterval(() => {
        counter++
        // send a random small delta for KPIs
        const payload = {
            time: new Date().toISOString(),
            kpis: {
                active: Math.max(0, 50 + Math.round(Math.sin(counter / 3) * 5 + (Math.random() * 6 - 3))),
                newUsers: Math.max(0, Math.round(Math.random() * 5)),
            },
        }
        res.write(`data: ${JSON.stringify(payload)}\n\n`)
    }, 5000)

    req.on('close', () => {
        clearInterval(interval)
    })
}
