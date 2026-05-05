'use client'

export default function UsersTab() {
  const users = [
    { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'user', joined: '2024-01-15' },
    { id: 2, name: 'John Smith', email: 'john@example.com', role: 'user', joined: '2024-02-20' },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin', joined: '2023-11-05' },
    { id: 4, name: 'Bob Wilson', email: 'bob@example.com', role: 'user', joined: '2024-03-10' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Users</h1>
        <p className="font-sans text-text/60 mt-2">Manage user accounts and permissions</p>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-organic shadow-organic overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-primary/5">
              <tr>
                <th className="px-6 py-4 text-left font-sans font-semibold text-text">Name</th>
                <th className="px-6 py-4 text-left font-sans font-semibold text-text">Email</th>
                <th className="px-6 py-4 text-left font-sans font-semibold text-text">Role</th>
                <th className="px-6 py-4 text-left font-sans font-semibold text-text">Joined</th>
                <th className="px-6 py-4 text-left font-sans font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-text/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-background/50 transition-colors duration-200">
                  <td className="px-6 py-4 font-sans text-text">{user.name}</td>
                  <td className="px-6 py-4 font-sans text-text/70">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-cta/10 text-cta'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-sans text-text/50">{user.joined}</td>
                  <td className="px-6 py-4">
                    <button className="text-primary hover:text-primary/80 font-sans text-sm font-medium cursor-pointer">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-text/50 text-sm">Showing 1-4 of 1247 users</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white text-text/50 rounded-xl font-sans text-sm cursor-not-allowed" disabled>
            Previous
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl font-sans text-sm hover:bg-primary/90 cursor-pointer">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}