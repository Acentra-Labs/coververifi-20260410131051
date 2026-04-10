import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { formatDate, formatCurrency } from '../utils/helpers';
import {
  Shield,
  CheckCircle,
  Upload,
  AlertCircle,
  Clock,
  Building2,
  HardHat,
} from 'lucide-react';

export default function AgentPortal() {
  const { token } = useParams();
  const { verificationRequests, subcontractors, generalContractors, agents } = useData();
  const [confirmed, setConfirmed] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const vr = verificationRequests.find(v => v.token === token);
  const sub = vr ? subcontractors.find(s => s.id === vr.sub_id) : null;
  const gc = vr ? generalContractors.find(g => g.id === vr.gc_id) : null;
  const agent = vr ? agents.find(a => a.id === vr.agent_id) : null;

  if (!vr || !sub || !gc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Link Invalid or Expired</h1>
          <p className="text-sm text-gray-500">
            This verification link is no longer valid. It may have expired or already been used.
            Please contact the requesting party for a new link.
          </p>
        </div>
      </div>
    );
  }

  if (confirmed || uploaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h1>
          <p className="text-sm text-gray-500">
            {confirmed
              ? 'Coverage has been confirmed. The requesting party has been notified.'
              : 'Your certificate has been received. It will be reviewed shortly.'
            }
          </p>
          <p className="text-xs text-gray-400 mt-4">You may close this window.</p>
        </div>
      </div>
    );
  }

  const isNewCert = vr.type === 'new_certificate';
  const policyLabel = vr.policy_type === 'general_liability' ? 'General Liability' : 'Workers Compensation';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-electric to-cyan-accent mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">CoverVerifi</h1>
          <p className="text-sm text-gray-500">Insurance Verification Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Status bar */}
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              {isNewCert ? 'Certificate Upload Requested' : 'Coverage Verification Requested'}
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Request details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <HardHat className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Subcontractor</p>
                  <p className="text-sm font-medium text-gray-900">{sub.company_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Requested by</p>
                  <p className="text-sm font-medium text-gray-900">{gc.company_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Policy Type Required</p>
                  <p className="text-sm font-medium text-gray-900">{policyLabel}</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 mb-2">Coverage Requirements</p>
              {vr.policy_type === 'general_liability' ? (
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>Per Occurrence: {formatCurrency(gc.default_gl_requirement)}</li>
                  <li>Aggregate: {formatCurrency(gc.default_gl_requirement * 2)}</li>
                  {gc.require_additional_insured && <li>Additional insured endorsement required</li>}
                </ul>
              ) : (
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>Employer&apos;s Liability: {formatCurrency(gc.default_wc_requirement)}</li>
                  <li>Workers Comp: Statutory (Idaho)</li>
                </ul>
              )}
            </div>

            {/* Actions */}
            {isNewCert ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-electric hover:bg-blue-50/30 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload certificate</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, PNG, or JPG up to 10MB</p>
                </div>
                <button
                  onClick={() => setUploaded(true)}
                  className="w-full bg-amber-action hover:bg-amber-action-dark text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Submit Certificate
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-700 text-center">
                  Is the {policyLabel.toLowerCase()} policy for <strong>{sub.company_name}</strong> currently active?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfirmed(true)}
                    className="py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Yes, Active
                  </button>
                  <button
                    onClick={() => setConfirmed(true)}
                    className="py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" /> No / Changed
                  </button>
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setUploaded(true)}
                    className="text-sm text-electric hover:underline"
                  >
                    Or upload a replacement certificate instead
                  </button>
                </div>
              </div>
            )}

            {/* No longer agent */}
            <div className="text-center pt-2 border-t border-gray-100">
              <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                I am no longer this company&apos;s agent
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Secure verification powered by CoverVerifi &middot; Acentra Labs
        </p>
      </div>
    </div>
  );
}
