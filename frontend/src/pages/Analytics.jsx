import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/leads/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-slate-500">Loading analytics...</div>;
  if (!stats) return <div className="text-red-500">Failed to load data</div>;

  const COLORS = ['#3b82f6', '#eab308', '#6366f1', '#a855f7', '#22c55e', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="standard-panel p-6 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-6">
            <h2 className="text-lg font-bold text-gray-900">Lead Distribution</h2>
          </div>
          <div className="h-80 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="standard-panel p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Performance Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-gray-600 font-medium">Total Pipeline</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight">{stats.totalLeads}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-gray-600 font-medium">Won Deals</span>
              <span className="text-xl font-bold text-emerald-600 tracking-tight">{stats.wonLeads}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-gray-600 font-medium">Lost Deals</span>
              <span className="text-xl font-bold text-red-600 tracking-tight">
                {stats.statusData.find(d => d.name === 'Lost')?.value || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <span className="text-gray-600 font-medium">Win Rate</span>
              <span className="text-xl font-bold text-blue-600 tracking-tight">{stats.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
