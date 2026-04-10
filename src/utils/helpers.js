import { certificates } from '../data/mockData';

export function getComplianceStatus(subId, requirements = {}) {
  const glReq = requirements.gl || 1000000;
  const wcReq = requirements.wc || 500000;
  const today = new Date();

  const subCerts = certificates.filter(c => c.sub_id === subId);
  const glCert = subCerts
    .filter(c => c.type === 'general_liability')
    .sort((a, b) => new Date(b.expiration_date) - new Date(a.expiration_date))[0];
  const wcCert = subCerts
    .filter(c => c.type === 'workers_comp')
    .sort((a, b) => new Date(b.expiration_date) - new Date(a.expiration_date))[0];

  const glStatus = getCertStatus(glCert, glReq, today);
  const wcStatus = getCertStatus(wcCert, wcReq, today);

  const overall = getOverallStatus(glStatus, wcStatus);

  return { gl: glStatus, wc: wcStatus, overall, glCert, wcCert };
}

function getCertStatus(cert, requirement, today) {
  if (!cert) return { status: 'none', label: 'No Certificate', color: 'expired' };

  if (!cert.verified) {
    return { status: 'pending', label: 'Pending Verification', color: 'pending' };
  }

  if (cert.is_ghost_policy) {
    return { status: 'ghost', label: 'Ghost Policy', color: 'expiring' };
  }

  const expDate = new Date(cert.expiration_date);
  const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { status: 'expired', label: 'Expired', color: 'expired', daysUntilExpiry };
  }

  if (cert.coverage_per_occurrence < requirement) {
    return { status: 'insufficient', label: 'Insufficient Coverage', color: 'expired' };
  }

  if (daysUntilExpiry <= 7) {
    return { status: 'expiring', label: `Expires in ${daysUntilExpiry}d`, color: 'expired', daysUntilExpiry };
  }

  if (daysUntilExpiry <= 30) {
    return { status: 'expiring', label: `Expires in ${daysUntilExpiry}d`, color: 'expiring', daysUntilExpiry };
  }

  return { status: 'compliant', label: 'Compliant', color: 'compliant', daysUntilExpiry };
}

function getOverallStatus(glStatus, wcStatus) {
  const priority = { expired: 4, none: 4, insufficient: 3, expiring: 2, ghost: 2, pending: 1, compliant: 0 };
  const glP = priority[glStatus.status] ?? 0;
  const wcP = priority[wcStatus.status] ?? 0;

  if (glP >= 3 || wcP >= 3) return 'expired';
  if (glP >= 1 || wcP >= 1) return 'expiring';
  return 'compliant';
}

export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getStatusBadgeClasses(color) {
  const map = {
    compliant: 'bg-green-100 text-green-800 border-green-200',
    expiring: 'bg-amber-100 text-amber-800 border-amber-200',
    expired: 'bg-red-100 text-red-800 border-red-200',
    pending: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[color] || map.pending;
}

export function getCompliancePercent(subIds, requirements) {
  if (!subIds.length) return 0;
  let compliant = 0;
  for (const id of subIds) {
    const status = getComplianceStatus(id, requirements);
    if (status.overall === 'compliant') compliant++;
  }
  return Math.round((compliant / subIds.length) * 100);
}

export function getGCStats(gcId, relationships) {
  const rels = relationships.filter(r => r.gc_id === gcId);
  const subIds = rels.map(r => r.sub_id);
  let compliant = 0, expiring = 0, expired = 0;

  for (const id of subIds) {
    const status = getComplianceStatus(id);
    if (status.overall === 'compliant') compliant++;
    else if (status.overall === 'expiring') expiring++;
    else expired++;
  }

  return { total: subIds.length, compliant, expiring, expired, subIds };
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
  return /^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(phone.replace(/\s/g, ''));
}

export function validateRequired(value) {
  return value && value.trim().length > 0;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
