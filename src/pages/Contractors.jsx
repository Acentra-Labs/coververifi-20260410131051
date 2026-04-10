import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import SearchInput from '../components/shared/SearchInput';
import Modal from '../components/shared/Modal';
import { getGCStats, formatDate, validateEmail, validatePhone, validateRequired } from '../utils/helpers';
import {
  Building2,
  Plus,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

export default function Contractors() {
  const { user } = useAuth();
  const { getGCsForConsultant, relationships, addGC } = useData();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ company_name: '', contact_name: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});

  const gcs = getGCsForConsultant(user.id);

  const filtered = useMemo(() => {
    if (!search) return gcs;
    const q = search.toLowerCase();
    return gcs.filter(gc =>
      gc.company_name.toLowerCase().includes(q) ||
      gc.contact_name.toLowerCase().includes(q)
    );
  }, [gcs, search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!validateRequired(form.company_name)) errs.company_name = 'Required';
    if (!validateRequired(form.contact_name)) errs.contact_name = 'Required';
    if (!validateEmail(form.email)) errs.email = 'Valid email required';
    if (form.phone && !validatePhone(form.phone)) errs.phone = 'Valid phone required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    addGC(form, user.id);
    toast.success(`${form.company_name} has been added as a GC client.`);
    setShowAdd(false);
    setForm({ company_name: '', contact_name: '', email: '', phone: '', address: '' });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GC Clients</h1>
          <p className="text-sm text-gray-500 mt-1">{gcs.length} general contractors</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 bg-amber-action hover:bg-amber-action-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add GC Client
        </button>
      </div>

      <div className="max-w-xs">
        <SearchInput value={search} onChange={setSearch} placeholder="Search GCs..." />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(gc => {
          const stats = getGCStats(gc.id, relationships);
          const pct = stats.total > 0 ? Math.round((stats.compliant / stats.total) * 100) : 0;
          return (
            <Link
              key={gc.id}
              to={`/subcontractors?gc=${gc.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-electric">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-electric transition-colors">{gc.company_name}</h3>
                    <p className="text-xs text-gray-500">{gc.contact_name}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className={`text-2xl font-bold ${pct === 100 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                  {pct}%
                </div>
                <span className="text-xs text-gray-500">compliant</span>
              </div>

              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" />{stats.compliant}</div>
                <div className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" />{stats.expiring}</div>
                <div className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-500" />{stats.expired}</div>
                <span>{stats.total} subs total</span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Mail className="w-3 h-3" /> {gc.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="w-3 h-3" /> {gc.phone}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Add GC Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add GC Client">
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'company_name', label: 'Company Name', required: true },
            { key: 'contact_name', label: 'Contact Name', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <input
                type={field.type || 'text'}
                value={form[field.key]}
                onChange={(e) => { setForm(f => ({ ...f, [field.key]: e.target.value })); setErrors(er => ({ ...er, [field.key]: '' })); }}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric ${errors[field.key] ? 'border-red-300' : 'border-gray-200'}`}
              />
              {errors[field.key] && <p className="text-xs text-red-500 mt-1">{errors[field.key]}</p>}
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-medium bg-amber-action hover:bg-amber-action-dark text-white rounded-lg transition-colors">
              Add GC Client
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
