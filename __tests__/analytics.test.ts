import getAnalyticsServerSide from '../lib/analytics'

describe('analytics helper', () => {
  it('returns serializable analytics with expected keys', async () => {
    const data = await getAnalyticsServerSide()
    expect(data).toBeDefined()
    expect(data.kpis).toBeDefined()
    expect(typeof data.kpis.totalUsers).toBe('number')
    expect(Array.isArray(data.topUsers)).toBe(true)
    if (data.topUsers.length > 0) {
      expect(typeof data.topUsers[0].id).toBe('string')
    }
  })
})
