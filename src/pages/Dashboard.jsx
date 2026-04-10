import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import StatsCard from '../components/shared/StatsCard';
import StatusBadge from '../components/shared/StatusBadge';
import { getComplianceStatus, getGCStats, formatDate, formatDateTime } from '../utils/helpers';
import {
  Building2,
  HardHat,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  Activity,
  Send,
} from 'lucide-react';

export default function Dashboard() {
  const { user, isConsultant } = useAuth();
  const { generalContractors, subcontractors, relationships, activityLog, verificationRequests, getGCsForConsultant, getSubsForGC } = useData();

  const myGCs = isConsultant
    ? getGCsForConsultant(user.id)
    : generalContractors.filter(gc => gc.id === user.gc_id);

  const stats = useMemo(() => {
    if (isConsultant) {
      let totalSubs = 0, compliant = 0, expiring = 0, expired = 0;
      for (const gc of myGCs) {
        const s = getGCStats(gc.id, relationships);
        totalSubs += s.total;
        compliant += s.compliant;
        expiring += s.expiring;
        expired += s.expired;
      }
      const pendingVRs = verificationRequests.filter(vr => vr.status === 'sent').length;
      return { gcCount: myGCs.length, totalSubs, compliant, expiring, expired, pendingVRs };
    } else {
      const gcStats = getGCStats(user.gc_id, relationships);
      const pendingVRs = verificationRequests.filter(vr => vr.gc_id === user.gc_id && vr.status === 'sent').length;
      return { ...gcStats, pendingVRs };
    }
  }, [myGCs, relationships, verificationRequests, isConsultant, user]);

  const actionItems = useMemo(() => {
    const items = [];
    const subsToCheck = isConsultant
      ? subcontractors
      : getSubsForGC(user.gc_id);

    for (const sub of subsToCheck) {
      const subObj = typeof sub === 'object' && sub.id ? sub : subcontractors.find(s => s.id === sub);
      if (!subObj) continue;
      const status = getComplianceStatus(subObj.id);
      if (status.overall === 'expired') {
        items.push({ type: 'expired', sub: subObj, status, priority: 3 });
      } else if (status.overall === 'expiring') {
        items.push({ type: 'expiring', sub: subObj, status, priority: 2 });
      }
    }

    items.sort((a, b) => b.priority - a.priority);
    return items.slice(0, 8);
  }, [subcontractors, isConsultant, user, getSubsForGC]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isConsultant ? 'Consultant Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user.name}. Here&apos;s your compliance overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isConsultant && (
          <StatsCard label="GC Clients" value={stats.gcCount} icon={Building2} color="blue" />
        )}
        <StatsCard label="Total Subs" value={isConsultant ? stats.totalSubs : stats.total} icon={HardHat} color="gray" />
        <StatsCard label="Compliant" value={stats.compliant} icon={ShieldCheck} color="green" />
        <StatsCard label="Expiring" value={stats.expiring} icon={AlertTriangle} color="amber" />
        <StatsCard label="Non-Compliant" value={stats.expired} icon={AlertCircle} color="red" />
        {!isConsultant && (
          <StatsCard label="Pending Verifications" value={stats.pendingVRs} icon={Send} color="blue" />
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* GC Cards (consultant only) */}
        {isConsultant && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">GC Clients</h2>
              <Link to="/contractors" className="text-sm text-electric hover:text-electric-dark flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {myGCs.slice(0, 4).map(gc => {
                const gcStats = getGCStats(gc.id, relationships);
                const pct = gcStats.total > 0 ? Math.round((gcStats.compliant / gcStats.total) * 100) : 0;
                return (
                  <Link
                    key={gc.id}
                    to={`/subcontractors?gc=${gc.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-electric transition-colors">{gc.company_name}</h3>
                        <p className="text-xs text-gray-500">{gc.contact_name}</p>
                      </div>
                      <div className={`text-lg font-bold ${pct === 100 ? 'text-green-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                        {pct}%
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{gcStats.total} subs</span>
                      {gcStats.expired > 0 && <span className="text-red-600 font-medium">{gcStats.expired} non-compliant</span>}
                      {gcStats.expiring > 0 && <span className="text-amber-600 font-medium">{gcStats.expiring} expiring</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Items */}
        {!isConsultant && (
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Action Items</h2>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{actionItems.length} items</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {actionItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">All subcontractors are compliant!</div>
              ) : (
                actionItems.map((item, i) => (
                  <Link
                    key={i}
                    to={`/subcontractors/${item.sub.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${item.type === 'expired' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      {item.type === 'expired' ? <AlertCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.sub.company_name}</p>
                      <p className="text-xs text-gray-500">
                        {item.status.gl.color !== 'compliant' && `GL: ${item.status.gl.label}`}
                        {item.status.gl.color !== 'compliant' && item.status.wc.color !== 'compliant' && ' · '}
                        {item.status.wc.color !== 'compliant' && `WC: ${item.status.wc.label}`}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* Consultant Action Items */}
        {isConsultant && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Action Items</h2>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{actionItems.length}</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {actionItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">All clear!</div>
              ) : (
                actionItems.slice(0, 5).map((item, i) => (
                  <Link
                    key={i}
                    to={`/subcontractors/${item.sub.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${item.type === 'expired' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.sub.company_name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.status.gl.color !== 'compliant' ? `GL: ${item.status.gl.label}` : ''}
                        {item.status.wc.color !== 'compliant' ? ` WC: ${item.status.wc.label}` : ''}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div className={isConsultant ? 'lg:col-span-3' : ''}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {activityLog.slice(0, 6).map(entry => (
              <div key={entry.id} className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                  entry.type === 'cert_expired' ? 'bg-red-500' :
                  entry.type === 'expiration_warning' ? 'bg-amber-500' :
                  entry.type === 'cert_uploaded' ? 'bg-green-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">{entry.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{entry.user} &middot; {formatDateTime(entry.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
