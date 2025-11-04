export function getSeedData() {
  // small seeded dataset for demo
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

  return { users, analyses, feedbacks }
}
