import { useState, useEffect } from 'react';
import { History, Search, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const MODULE_BADGE = {
  Authentication: 'bg-blue-100 text-blue-800',
  'Repair Requests': 'bg-teal-100 text-teal-800',
  'Billing & Payments': 'bg-emerald-100 text-emerald-800',
  Account: 'bg-amber-100 text-amber-800',
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

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
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !term ||
      log.actor_name?.toLowerCase().includes(term) ||
      log.event_action?.toLowerCase().includes(term) ||
      log.event_description?.toLowerCase().includes(term);

    return matchesModule && matchesSearch;
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
            <h1 className="text-2xl font-bold text-stone-900">System Activity & Audit Logs</h1>
            <p className="mt-1 text-sm text-stone-500">
              Chronological audit trail of logins, service requests, quotations, schedules, and
              payments.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            {logs.length} Recorded Events
          </div>
        </div>

        {/* Search & Module Filter */}
        <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user, action, or description..."
              className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 focus:border-teal-600 focus:outline-none"
          >
            <option value="ALL">All System Modules</option>
            <option value="Authentication">Authentication</option>
            <option value="Repair Requests">Repair Requests</option>
            <option value="Billing & Payments">Billing & Payments</option>
            <option value="Account">Account</option>
          </select>
        </div>

        {/* Logs Table */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-10 text-center text-sm text-stone-500">
              No activity logs match your filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5">User / Role</th>
                    <th className="px-4 py-3.5">Module</th>
                    <th className="px-4 py-3.5">Action</th>
                    <th className="px-4 py-3.5">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.audit_id} className="hover:bg-stone-50/70">
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1.5">
                          <History className="h-3.5 w-3.5 text-stone-400" />
                          {formatTimestamp(log.logged_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-stone-900">{log.actor_name}</span>
                        <span className="ml-1.5 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-stone-600">
                          {log.actor_role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            MODULE_BADGE[log.system_module] || 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {log.system_module}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-stone-800">
                        {log.event_action}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-stone-600">
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