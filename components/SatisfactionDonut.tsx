import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function SatisfactionDonut({ satisfied, unsatisfied }: { satisfied: number; unsatisfied: number }) {
  const data = [
    { name: 'Satisfied', value: satisfied },
    { name: 'Unsatisfied', value: unsatisfied },
  ]
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={50} outerRadius={80} label />
          <Cell key="c1" fill="#34D399" />
          <Cell key="c2" fill="#ef4444" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
