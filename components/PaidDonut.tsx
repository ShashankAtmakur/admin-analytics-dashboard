import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function PaidDonut({ paid, free }: { paid: number; free: number }) {
  const data = [
    { name: 'Paid', value: paid },
    { name: 'Free', value: free },
  ]
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={50} outerRadius={80} label />
          <Cell key="c1" fill="#34D399" />
          <Cell key="c2" fill="#60A5FA" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
