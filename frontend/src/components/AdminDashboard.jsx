import { useEffect, useState } from "react";
import { fetchAdminUsers, fetchAdminAnalytics } from "../api/adminApi";
import ErrorMessage from "./ErrorMessage";
import Logo from "./Logo";

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-xl font-semibold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default function AdminDashboard({ onClose }) {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminUsers().then(setUsers).catch((err) => setError(err.message));
    fetchAdminAnalytics().then(setAnalytics).catch((err) => setError(err.message));
  }, []);

  const maxDay = Math.max(1, ...(analytics?.generations_by_day.map((d) => d.n) || [1]));

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7 shrink-0" />
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <button className="text-teal-600 hover:underline" onClick={onClose}>
            Back to app
          </button>
        </div>

        <ErrorMessage message={error} />

        {analytics && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Users" value={analytics.total_users} />
              <Stat label="Total generations" value={analytics.total_generations} />
              <Stat label="Top language" value={analytics.top_languages[0]?.language ?? "-"} />
              <Stat label="Top voice" value={analytics.top_voices[0]?.voice ?? "-"} />
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Generations (last 14 days)</h2>
              <div className="flex items-end gap-1 h-24">
                {analytics.generations_by_day.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                    title={`${d.day}: ${d.n}`}
                  >
                    <div
                      className="w-full bg-teal-500 rounded-t"
                      style={{ height: `${(d.n / maxDay) * 100}%`, minHeight: 2 }}
                    />
                  </div>
                ))}
                {!analytics.generations_by_day.length && (
                  <p className="text-sm text-gray-400 m-auto">No generations yet.</p>
                )}
              </div>
            </div>
          </>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-2">Users</h2>
          {users.length === 0 ? (
            <p className="text-sm text-gray-400">No users yet.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="py-1">Email</th>
                  <th className="py-1">Joined</th>
                  <th className="py-1 text-right">Generations</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-1">{u.email}</td>
                    <td className="py-1">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-1 text-right">{u.generation_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
