import { getStatusBadgeClasses } from '../../utils/helpers';

export default function StatusBadge({ label, color, size = 'sm' }) {
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${getStatusBadgeClasses(color)}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        color === 'compliant' ? 'bg-green-500' :
        color === 'expiring' ? 'bg-amber-500' :
        color === 'expired' ? 'bg-red-500' :
        'bg-gray-400'
      }`} />
      {label}
    </span>
  );
}
