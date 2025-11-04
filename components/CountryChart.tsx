import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#60A5FA', '#34D399', '#FB923C', '#F97316', '#A78BFA']

export default function CountryChart({ data }: { data: { country: string; count: number }[] }) {
  const pieData = data.map(d => ({ name: d.country, value: d.count }))
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={pieData} outerRadius={80} label />
          {pieData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
