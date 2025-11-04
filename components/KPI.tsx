import { Activity } from 'lucide-react'
type Props = { title: string; value: string | number }

export default function KPI({ title, value }: Props) {
    return (
        <div className="bg-white p-4 rounded shadow flex items-center gap-4">
            <div className="p-3 bg-sky-50 rounded">
                <Activity className="text-sky-500" />
            </div>
            <div>
                <div className="text-sm text-gray-500">{title}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
        </div>
    )
}
