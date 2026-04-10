import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import SearchInput from '../components/shared/SearchInput';
import { formatDate } from '../utils/helpers';
import {
  FileText,
  Upload,
  Download,
  Filter,
  Shield,
  ShieldAlert,
  File,
} from 'lucide-react';

export default function Documents() {
  const { user, isConsultant } = useAuth();
  const { certificates, subcontractors, relationships } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const docs = useMemo(() => {
    let certs = certificates.filter(c => c.document_url);

    if (!isConsultant) {
      const subIds = relationships.filter(r => r.gc_id === user.gc_id).map(r => r.sub_id);
      certs = certs.filter(c => subIds.includes(c.sub_id));
    }

    if (typeFilter !== 'all') {
      certs = certs.filter(c => c.type === typeFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      certs = certs.filter(c => {
        const sub = subcontractors.find(s => s.id === c.sub_id);
        return (
          sub?.company_name.toLowerCase().includes(q) ||
          c.policy_number.toLowerCase().includes(q) ||
          c.carrier.toLowerCase().includes(q)
        );
      });
    }

    return certs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [certificates, subcontractors, relationships, isConsultant, user, search, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">{docs.length} certificates on file</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors">
          <Upload className="w-4 h-4" />
          Upload Certificate
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search documents..." />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {[
            { key: 'all', label: 'All' },
            { key: 'general_liability', label: 'GL' },
            { key: 'workers_comp', label: 'WC' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setTypeFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                typeFilter === f.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Document</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Subcontractor</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Carrier</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Effective</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Expires</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Verified</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map(cert => {
                const sub = subcontractors.find(s => s.id === cert.sub_id);
                const isGL = cert.type === 'general_liability';
                return (
                  <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${isGL ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {isGL ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cert.policy_number}</p>
                          <p className="text-xs text-gray-500">{isGL ? 'General Liability' : 'Workers Comp'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sub?.company_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cert.carrier}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(cert.effective_date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(cert.expiration_date)}</td>
                    <td className="px-4 py-3">
                      {cert.verified ? (
                        <span className="text-xs text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {docs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <File className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No documents found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
