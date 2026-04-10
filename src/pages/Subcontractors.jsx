import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { getComplianceStatus, formatDate, validateRequired, validateEmail } from '../utils/helpers';
import {
  Plus,
  ArrowUpDown,
  Filter,
  ChevronRight,
  User,
  HardHat,
} from 'lucide-react';

export default function Subcontractors() {
  const { user, isConsultant } = useAuth();
  const { getSubsForGC, generalContractors, subcontractors, relationships, agents, addSubcontractor } = useData();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const gcFilter = searchParams.get('gc');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('company_name');
  const [sortDir, setSortDir] = useState('asc');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    company_name: '', contact_name: '', email: '', phone: '', trade: '',
    agent_name: '', agent_email: '', gc_id: gcFilter || '',
  });
  const [formErrors, setFormErrors] = useState({});

  const allSubs = useMemo(() => {
    if (isConsultant) {
      if (gcFilter) {
        return getSubsForGC(gcFilter);
      }
      const seen = new Set();
      const result = [];
      for (const rel of relationships) {
        const gc = generalContractors.find(g => g.id === rel.gc_id && g.consultant_id === user.id);
        if (!gc) continue;
        if (seen.has(rel.sub_id)) continue;
        seen.add(rel.sub_id);
        const sub = subcontractors.find(s => s.id === rel.sub_id);
        const agent = agents.find(a => a.id === rel.agent_id);
        if (sub) result.push({ ...sub, agent, relationship: rel });
      }
      return result;
    }
    return getSubsForGC(user.gc_id);
  }, [isConsultant, gcFilter, getSubsForGC, relationships, generalContractors, subcontractors, agents, user]);

  const filtered = useMemo(() => {
    let result = allSubs;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.company_name.toLowerCase().includes(q) ||
        s.contact_name.toLowerCase().includes(q) ||
        s.trade?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(s => {
        const status = getComplianceStatus(s.id);
        return status.overall === statusFilter;
      });
    }

    result.sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'company_name') {
        aVal = a.company_name; bVal = b.company_name;
      } else if (sortField === 'trade') {
        aVal = a.trade || ''; bVal = b.trade || '';
      } else if (sortField === 'gl_expiry') {
        const aS = getComplianceStatus(a.id);
        const bS = getComplianceStatus(b.id);
        aVal = aS.glCert?.expiration_date || '9999'; bVal = bS.glCert?.expiration_date || '9999';
      } else if (sortField === 'wc_expiry') {
        const aS = getComplianceStatus(a.id);
        const bS = getComplianceStatus(b.id);
        aVal = aS.wcCert?.expiration_date || '9999'; bVal = bS.wcCert?.expiration_date || '9999';
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allSubs, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const gcName = gcFilter ? generalContractors.find(g => g.id === gcFilter)?.company_name : null;

  const handleAddSub = (e) => {
    e.preventDefault();
    const errs = {};
    if (!validateRequired(form.company_name)) errs.company_name = 'Required';
    if (!validateRequired(form.contact_name)) errs.contact_name = 'Required';
    if (!validateEmail(form.email)) errs.email = 'Valid email required';
    if (!validateRequired(form.trade)) errs.trade = 'Required';
    if (!form.gc_id) errs.gc_id = 'Select a GC';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const targetGC = form.gc_id || (isConsultant ? '' : user.gc_id);
    addSubcontractor({
      company_name: form.company_name,
      contact_name: form.contact_name,
      email: form.email,
      phone: form.phone,
      trade: form.trade,
      is_sole_proprietor: false,
      iic_registered: false,
      w9_on_file: false,
    }, targetGC, agents[0]?.id);

    toast.success(`${form.company_name} has been added successfully.`);
    setShowAdd(false);
    setForm({ company_name: '', contact_name: '', email: '', phone: '', trade: '', agent_name: '', agent_email: '', gc_id: gcFilter || '' });
    setFormErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {gcName ? `${gcName} — Subcontractors` : (isConsultant ? 'All Subcontractors' : 'My Subcontractors')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} subcontractors</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-amber-action hover:bg-amber-action-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subcontractor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Search subs..." />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          {['all', 'compliant', 'expiring', 'expired'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  { key: 'company_name', label: 'Subcontractor' },
                  { key: 'trade', label: 'Trade' },
                  { key: 'gl_expiry', label: 'GL Status' },
                  { key: 'wc_expiry', label: 'WC Status' },
                  { key: 'agent', label: 'Agent', sortable: false },
                  { key: 'action', label: '', sortable: false },
                ].map(col => (
                  <th
                    key={col.key}
                    className="text-left text-xs font-medium text-gray-500 px-4 py-3"
                  >
                    {col.sortable !== false ? (
                      <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1 hover:text-gray-700">
                        {col.label}
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    ) : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(sub => {
                const status = getComplianceStatus(sub.id);
                return (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/subcontractors/${sub.id}`} className="block">
                        <p className="text-sm font-medium text-slate-900 hover:text-electric">{sub.company_name}</p>
                        <p className="text-xs text-gray-500">{sub.contact_name}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sub.trade || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={status.gl.label} color={status.gl.color} />
                      {status.glCert && <p className="text-xs text-gray-400 mt-0.5">Exp: {formatDate(status.glCert.expiration_date)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={status.wc.label} color={status.wc.color} />
                      {status.wcCert && <p className="text-xs text-gray-400 mt-0.5">Exp: {formatDate(status.wcCert.expiration_date)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {sub.agent ? (
                        <div>
                          <p className="text-sm text-gray-700">{sub.agent.name}</p>
                          <p className="text-xs text-gray-400">{sub.agent.agency}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No agent</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/subcontractors/${sub.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg inline-flex transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <HardHat className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No subcontractors found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sub Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Subcontractor" size="lg">
        <form onSubmit={handleAddSub} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'company_name', label: 'Company Name', required: true },
              { key: 'contact_name', label: 'Contact Name', required: true },
              { key: 'email', label: 'Email', type: 'email', required: true },
              { key: 'phone', label: 'Phone' },
              { key: 'trade', label: 'Trade', required: true },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  type={field.type || 'text'}
                  value={form[field.key]}
                  onChange={(e) => { setForm(f => ({ ...f, [field.key]: e.target.value })); setFormErrors(er => ({ ...er, [field.key]: '' })); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric ${formErrors[field.key] ? 'border-red-300' : 'border-gray-200'}`}
                />
                {formErrors[field.key] && <p className="text-xs text-red-500 mt-1">{formErrors[field.key]}</p>}
              </div>
            ))}
            {isConsultant && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GC Client<span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  value={form.gc_id}
                  onChange={(e) => { setForm(f => ({ ...f, gc_id: e.target.value })); setFormErrors(er => ({ ...er, gc_id: '' })); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric ${formErrors.gc_id ? 'border-red-300' : 'border-gray-200'}`}
                >
                  <option value="">Select GC...</option>
                  {generalContractors.filter(g => g.consultant_id === user.id).map(gc => (
                    <option key={gc.id} value={gc.id}>{gc.company_name}</option>
                  ))}
                </select>
                {formErrors.gc_id && <p className="text-xs text-red-500 mt-1">{formErrors.gc_id}</p>}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Insurance Agent (Optional)
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={form.agent_name}
                  onChange={(e) => setForm(f => ({ ...f, agent_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Email</label>
                <input
                  type="email"
                  value={form.agent_email}
                  onChange={(e) => setForm(f => ({ ...f, agent_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium bg-amber-action hover:bg-amber-action-dark text-white rounded-lg transition-colors">
              Add Subcontractor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
