const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-sky-100 text-sky-800 border-sky-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Quoted: 'bg-purple-100 text-purple-800 border-purple-200',
  'Quote Approved': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Quote Rejected': 'bg-rose-100 text-rose-800 border-rose-200',
  Scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const StatusBadge = ({ status }) => {
  const badgeClass =
    STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${badgeClass}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;