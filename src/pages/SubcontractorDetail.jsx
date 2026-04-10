import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { getComplianceStatus, formatDate, formatDateTime, formatCurrency } from '../utils/helpers';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Shield,
  ShieldAlert,
  Send,
  Clock,
  Upload,
  User,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export default function SubcontractorDetail() {
  const { subId } = useParams();
  const { user, isConsultant } = useAuth();
  const { subcontractors, getCertsForSub, getVRsForSub, relationships, generalContractors, agents, sendVerification } = useData();
  const toast = useToast();
  const [showSendVerification, setShowSendVerification] = useState(false);
  const [verifyType, setVerifyType] = useState('general_liability');

  const sub = subcontractors.find(s => s.id === subId);
  const certs = getCertsForSub(subId);
  const vrs = getVRsForSub(subId);
  const status = getComplianceStatus(subId);

  const linkedGCs = useMemo(() => {
    if (!isConsultant) return [];
    return relationships
      .filter(r => r.sub_id === subId)
      .map(r => {
        const gc = generalContractors.find(g => g.id === r.gc_id);
        const agent = agents.find(a => a.id === r.agent_id);
        return { ...r, gc, agent };
      })
      .filter(r => r.gc);
  }, [subId, relationships, generalContractors, agents, isConsultant]);

  const subAgent = useMemo(() => {
    const rel = relationships.find(r => r.sub_id === subId);
    return rel ? agents.find(a => a.id === rel.agent_id) : null;
  }, [subId, relationships, agents]);

  if (!sub) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Subcontractor not found.</p>
        <Link to="/subcontractors" className="text-electric hover:underline text-sm mt-2 inline-block">Back to list</Link>
      </div>
    );
  }

  const handleSendVerification = () => {
    const rel = relationships.find(r => r.sub_id === subId);
    if (!rel) { toast.error('No GC relationship found'); return; }
    sendVerification(rel.gc_id, subId, rel.agent_id, verifyType);
    toast.success(`Verification request sent for ${verifyType === 'general_liability' ? 'General Liability' : 'Workers Comp'}`);
    setShowSendVerification(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/subcontractors" className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-0.5">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{sub.company_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500">{sub.trade}</span>
                <StatusBadge
                  label={status.overall === 'compliant' ? 'Compliant' : status.overall === 'expiring' ? 'Expiring' : 'Non-Compliant'}
                  color={status.overall}
                  size="lg"
                />
                {sub.is_sole_proprietor && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Sole Proprietor</span>
                )}
                {sub.ghost_policy && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Ghost Policy
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowSendVerification(true)}
              className="inline-flex items-center gap-2 bg-amber-action hover:bg-amber-action-dark text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Request Verification
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{sub.contact_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{sub.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{sub.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{sub.address}</span>
            </div>
          </div>

          {/* Agent */}
          {subAgent && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Insurance Agent</h3>
              <p className="text-sm font-medium text-gray-900">{subAgent.name}</p>
              <p className="text-xs text-gray-500">{subAgent.agency}</p>
              <p className="text-xs text-gray-500 mt-1">{subAgent.email}</p>
              <p className="text-xs text-gray-500">{subAgent.phone}</p>
            </div>
          )}

          {/* W9 Status */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">W-9 Status</h3>
            {sub.w9_on_file ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">On file — uploaded {formatDate(sub.w9_uploaded_at)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-700">Not on file</span>
              </div>
            )}
            {sub.ein && <p className="text-xs text-gray-500 mt-1">EIN: {sub.ein} &middot; {sub.tax_classification}</p>}
          </div>
        </div>

        {/* Certificates */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Insurance Certificates</h2>

          {/* GL Card */}
          <div className={`bg-white rounded-xl border p-5 ${
            status.gl.color === 'expired' ? 'border-red-200' :
            status.gl.color === 'expiring' ? 'border-amber-200' :
            status.gl.color === 'compliant' ? 'border-green-200' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-electric" />
                <h3 className="font-semibold text-gray-900">General Liability</h3>
              </div>
              <StatusBadge label={status.gl.label} color={status.gl.color} size="lg" />
            </div>
            {status.glCert ? (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Policy #:</span> <span className="text-gray-900 font-medium">{status.glCert.policy_number}</span></div>
                <div><span className="text-gray-500">Carrier:</span> <span className="text-gray-900">{status.glCert.carrier}</span></div>
                <div><span className="text-gray-500">Effective:</span> <span className="text-gray-900">{formatDate(status.glCert.effective_date)}</span></div>
                <div><span className="text-gray-500">Expires:</span> <span className="text-gray-900 font-medium">{formatDate(status.glCert.expiration_date)}</span></div>
                <div><span className="text-gray-500">Per Occurrence:</span> <span className="text-gray-900">{formatCurrency(status.glCert.coverage_per_occurrence)}</span></div>
                <div><span className="text-gray-500">Aggregate:</span> <span className="text-gray-900">{formatCurrency(status.glCert.coverage_aggregate)}</span></div>
                <div><span className="text-gray-500">Additional Insured:</span> <span className={status.glCert.additional_insured_confirmed ? 'text-green-600' : 'text-amber-600'}>{status.glCert.additional_insured_confirmed ? 'Confirmed' : 'Not confirmed'}</span></div>
                <div><span className="text-gray-500">Verified:</span> <span className="text-gray-900">{status.glCert.verified ? formatDate(status.glCert.verified_at) : 'Pending'}</span></div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No certificate on file.</p>
            )}
          </div>

          {/* WC Card */}
          <div className={`bg-white rounded-xl border p-5 ${
            status.wc.color === 'expired' ? 'border-red-200' :
            status.wc.color === 'expiring' ? 'border-amber-200' :
            status.wc.color === 'compliant' ? 'border-green-200' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-electric" />
                <h3 className="font-semibold text-gray-900">Workers Compensation</h3>
              </div>
              <StatusBadge label={status.wc.label} color={status.wc.color} size="lg" />
            </div>
            {status.wcCert ? (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Policy #:</span> <span className="text-gray-900 font-medium">{status.wcCert.policy_number}</span></div>
                <div><span className="text-gray-500">Carrier:</span> <span className="text-gray-900">{status.wcCert.carrier}</span></div>
                <div><span className="text-gray-500">Effective:</span> <span className="text-gray-900">{formatDate(status.wcCert.effective_date)}</span></div>
                <div><span className="text-gray-500">Expires:</span> <span className="text-gray-900 font-medium">{formatDate(status.wcCert.expiration_date)}</span></div>
                <div><span className="text-gray-500">Coverage:</span> <span className="text-gray-900">{formatCurrency(status.wcCert.coverage_per_occurrence)}</span></div>
                {status.wcCert.is_ghost_policy && (
                  <div className="sm:col-span-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3" /> Ghost Policy — No actual coverage
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No certificate on file.</p>
            )}
          </div>

          {/* Linked GCs (consultant view) */}
          {isConsultant && linkedGCs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                Linked GC Clients ({linkedGCs.length})
              </h3>
              <div className="divide-y divide-gray-100">
                {linkedGCs.map(rel => (
                  <div key={rel.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rel.gc?.company_name}</p>
                      <p className="text-xs text-gray-500">Agent: {rel.agent?.name || 'Not assigned'}</p>
                    </div>
                    {rel.require_additional_insured && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Addl. Insured Req.</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification History */}
          {vrs.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                Verification History
              </h3>
              <div className="divide-y divide-gray-100">
                {vrs.map(vr => (
                  <div key={vr.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm text-gray-900">
                        {vr.type === 'new_certificate' ? 'New Certificate Request' : 'Verification Request'}
                        {' — '}
                        {vr.policy_type === 'general_liability' ? 'GL' : 'WC'}
                      </p>
                      <p className="text-xs text-gray-500">Sent: {formatDateTime(vr.sent_at)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      vr.status === 'responded' ? 'bg-green-100 text-green-700' :
                      vr.status === 'expired' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {vr.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Verification Modal */}
      <Modal isOpen={showSendVerification} onClose={() => setShowSendVerification(false)} title="Send Verification Request">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Send a verification request to the insurance agent for <strong>{sub.company_name}</strong>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type</label>
            <select
              value={verifyType}
              onChange={(e) => setVerifyType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
            >
              <option value="general_liability">General Liability</option>
              <option value="workers_comp">Workers Compensation</option>
            </select>
          </div>
          {subAgent && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Request will be sent to:</p>
              <p className="text-sm font-medium text-gray-900">{subAgent.name}</p>
              <p className="text-xs text-gray-500">{subAgent.email}</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowSendVerification(false)} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSendVerification} className="flex-1 py-2.5 text-sm font-medium bg-amber-action hover:bg-amber-action-dark text-white rounded-lg transition-colors flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Request
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
