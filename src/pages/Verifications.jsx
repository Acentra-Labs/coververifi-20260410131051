import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SearchInput from '../components/shared/SearchInput';
import { formatDateTime } from '../utils/helpers';
import {
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Filter,
  ClipboardCheck,
} from 'lucide-react';

export default function Verifications() {
  const { user, isConsultant } = useAuth();
  const { verificationRequests, subcontractors, agents, generalContractors } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const vrs = useMemo(() => {
    let items = verificationRequests;
    if (!isConsultant) {
      items = items.filter(vr => vr.gc_id === user.gc_id);
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(vr => {
        const sub = subcontractors.find(s => s.id === vr.sub_id);
        const agent = agents.find(a => a.id === vr.agent_id);
        return (
          sub?.company_name.toLowerCase().includes(q) ||
          agent?.name.toLowerCase().includes(q)
        );
      });
    }

    if (statusFilter !== 'all') {
      items = items.filter(vr => vr.status === statusFilter);
    }

    return items.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
  }, [verificationRequests, isConsultant, user, search, statusFilter, subcontractors, agents]);

  const statusIcon = (status) => {
    switch (status) {
      case 'sent': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'responded': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const counts = useMemo(() => ({
    all: verificationRequests.length,
    sent: verificationRequests.filter(v => v.status === 'sent').length,
    responded: verificationRequests.filter(v => v.status === 'responded').length,
    expired: verificationRequests.filter(v => v.status === 'expired').length,
  }), [verificationRequests]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verification Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Track agent verification requests and responses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{counts.sent}</div>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{counts.responded}</div>
          <p className="text-xs text-gray-500 mt-1">Responded</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{counts.expired}</div>
          <p className="text-xs text-gray-500 mt-1">Expired</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by sub or agent..." />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {['all', 'sent', 'responded', 'expired'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {vrs.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No verification requests found</p>
          </div>
        ) : (
          vrs.map(vr => {
            const sub = subcontractors.find(s => s.id === vr.sub_id);
            const agent = agents.find(a => a.id === vr.agent_id);
            const gc = generalContractors.find(g => g.id === vr.gc_id);
            return (
              <div key={vr.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                {statusIcon(vr.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/subcontractors/${vr.sub_id}`} className="text-sm font-medium text-slate-900 hover:text-electric">
                      {sub?.company_name || 'Unknown'}
                    </Link>
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {vr.policy_type === 'general_liability' ? 'GL' : 'WC'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {vr.type === 'new_certificate' ? 'New cert request' : 'Verification'} to {agent?.name || 'Unknown'}
                    {isConsultant && gc && <span> &middot; {gc.company_name}</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    vr.status === 'responded' ? 'bg-green-100 text-green-700' :
                    vr.status === 'expired' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {vr.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(vr.sent_at)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
