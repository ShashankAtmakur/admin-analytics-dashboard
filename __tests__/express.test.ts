import axios from 'axios'

let server: any = null
let baseURL = ''

beforeAll(async () => {
  // ensure fallback env credentials are present for login test
  process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com'
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Password123'
  // import createServer from server module
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const srv = require('../server/index')
  const createServer = srv.createServer || srv.default || srv
  const app = await createServer()
  server = app.listen(0)
  const addr: any = server.address()
  const port = typeof addr === 'string' ? addr : addr.port
  baseURL = `http://127.0.0.1:${port}`
})

afterAll(async () => {
  if (server && server.close) await new Promise((r) => server.close(r))
})

test('health and analytics endpoints', async () => {
  const h = await axios.get(`${baseURL}/health`)
  expect(h.status).toBe(200)
  expect(h.data.ok).toBe(true)

  const a = await axios.get(`${baseURL}/api/analytics`)
  expect(a.status).toBe(200)
  expect(a.data.kpis).toBeDefined()
})

test('fallback login works with demo credentials', async () => {
  const res = await axios.post(`${baseURL}/api/auth/login`, { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }, { validateStatus: () => true })
  // allow either 200 or 302 depending on implementation
  expect([200, 302]).toContain(res.status)
})
