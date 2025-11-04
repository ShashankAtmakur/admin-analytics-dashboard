export default function Leaderboard({ users }: { users: { id: string; name: string; cvScore: number; country: string }[] }) {
  return (
    <div>
      <table className="min-w-full text-left">
        <thead className="border-b">
          <tr>
            <th className="py-2">#</th>
            <th>Name</th>
            <th>Score</th>
            <th>Country</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} className="border-b">
              <td className="py-2">{i + 1}</td>
              <td>{u.name}</td>
              <td className="font-medium">{u.cvScore}</td>
              <td>{u.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
