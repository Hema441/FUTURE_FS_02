import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New',
    notes: '',
    followUpDate: ''
  });
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      const fetchLead = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/leads/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = res.data;
          if (data.followUpDate) {
            data.followUpDate = new Date(data.followUpDate).toISOString().split('T')[0];
          }
          setFormData(data);
        } catch (err) {
          setError('Failed to fetch lead details');
        } finally {
          setLoading(false);
        }
      };
      fetchLead();
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (isNew) {
        await axios.post('http://localhost:5000/api/leads', formData, config);
      } else {
        await axios.put(`http://localhost:5000/api/leads/${id}`, formData, config);
      }
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/leads')}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isNew ? 'Create New Lead' : 'Lead Details'}
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="standard-panel p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
            <input required type="text" name="name" placeholder="E.g. Jane Smith" value={formData.name} onChange={handleChange} className="standard-input" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
            <input required type="email" name="email" placeholder="jane@example.com" value={formData.email} onChange={handleChange} className="standard-input" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="text" name="phone" placeholder="(555) 123-4567" value={formData.phone} onChange={handleChange} className="standard-input" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input type="text" name="company" placeholder="Acme Corp" value={formData.company} onChange={handleChange} className="standard-input" />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Lead Source</label>
            <select name="source" value={formData.source} onChange={handleChange} className="standard-input appearance-none bg-white" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Event">Event</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Current Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="standard-input appearance-none bg-white" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          
          <div className="space-y-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
            <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} className="standard-input md:w-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
          <textarea rows="4" name="notes" placeholder="Enter any context, background info, or specific requirements here..." value={formData.notes} onChange={handleChange} className="standard-input resize-none"></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={() => navigate('/leads')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Lead'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadDetails;
