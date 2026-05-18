import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, TrendingUp, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/leads/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        
        const leadsRes = await axios.get('http://localhost:5000/api/leads?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentLeads(leadsRes.data.leads || []);
      } catch (error) {
        console.error('Error fetching stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-slate-500">Loading dashboard...</div>;
  if (!stats) return <div className="text-red-500">Failed to load data</div>;

  const statCards = [
    { title: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'bg-blue-600' },
    { title: 'Won Leads', value: stats.wonLeads, icon: TrendingUp, color: 'bg-emerald-500' },
    { title: 'Win Rate', value: `${stats.conversionRate}%`, icon: PieChartIcon, color: 'bg-purple-500' },
    { title: 'Active Pipeline', value: stats.totalLeads - stats.wonLeads - (stats.statusData?.find(s => s.name === 'Lost')?.value || 0), icon: Activity, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="standard-panel p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="standard-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Leads by Status</h2>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.statusData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13}} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '6px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="standard-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500 text-sm">No leads added yet.</td>
                  </tr>
                ) : (
                  recentLeads.map(lead => (
                    <tr key={lead._id}>
                      <td className="py-3">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-500">{lead.company || '-'}</div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-gray-500 text-right">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
