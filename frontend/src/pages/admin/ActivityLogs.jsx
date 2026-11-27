import { useState, useEffect } from 'react';
import { History, Search, ShieldCheck, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const MODULE_BADGE = {
  Authentication: 'bg-blue-100 text-blue-800',
  'Repair Requests': 'bg-blue-100 text-blue-800',
  'Billing & Payments': 'bg-emerald-100 text-emerald-800',
  Account: 'bg-amber-100 text-amber-800',
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/activity-logs');
        setLogs(data);
      } catch (error) {
        toast.error('Failed to load system activity logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesModule = moduleFilter === 'ALL' || log.system_module === moduleFilter;
    const matchesRole =
      roleFilter === 'ALL' ||
      (log.actor_role || '').toLowerCase() === roleFilter.toLowerCase();
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !term ||
      log.actor_name?.toLowerCase().includes(term) ||
      log.event_action?.toLowerCase().includes(term) ||
      log.event_description?.toLowerCase().includes(term);

    return matchesModule && matchesRole && matchesSearch;
  });

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">System Activity & Audit Logs</h1>
            <p className="mt-1 text-sm text-slate-500">
              Chronological audit trail of logins, service requests, quotations, schedules, and
              payments.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            {logs.length} Recorded Events
          </div>
        </div>

        {/* ── Search & Filters ──────────────────────────────────── */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap">
          {/* Search */}
          <div className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user, action, or description..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Modules</option>
            <option value="Authentication">Authentication</option>
            <option value="Repair Requests">Repair Requests</option>
            <option value="Billing & Payments">Billing & Payments</option>
            <option value="Account">Account</option>
          </select>

          {/* Role Filter */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
            <Users className="h-4 w-4 text-blue-600 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-sm text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Users</option>
              <option value="admin">Admin Only</option>
              <option value="customer">Customer Only</option>
            </select>
          </div>
        </div>

        {/* ── Logs Table ────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No activity logs match your filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">User / Role</th>
                    <th className="px-4 py-3.5">Module</th>
                    <th className="px-4 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.audit_id} className="transition hover:bg-blue-50/30">
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <History className="h-3.5 w-3.5 text-slate-300" />
                          {formatTimestamp(log.logged_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900">{log.actor_name}</span>
                        <span
                          className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            (log.actor_role || '').toLowerCase() === 'admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {log.actor_role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            MODULE_BADGE[log.system_module] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.system_module}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {log.event_action}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        {log.event_description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ActivityLogs;