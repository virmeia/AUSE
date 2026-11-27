import { useState, useEffect } from 'react';
import {
  Search,
  FileSpreadsheet,
  UserCheck,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import Layout from '../../components/Layout';
import ItemizedQuoteModal from '../../components/ItemizedQuoteModal';
import TechnicianDispatchModal from '../../components/TechnicianDispatchModal';
import api from '../../api/axios';

const formatPHP = (amount) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(amount || 0));

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [quoteTarget, setQuoteTarget] = useState(null);
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(Array.isArray(res.data) ? res.data : res.data?.requests || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const filtered = requests.filter((r) => {
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      String(r.request_id).includes(q) ||
      (r.customer_name || '').toLowerCase().includes(q) ||
      (r.appliance_type || '').toLowerCase().includes(q) ||
      (r.service_address || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header & Search Filter Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Service Request Queue
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Send itemized quotations, assign field technicians, and track repair progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket, customer, unit..."
                className="rounded-xl border border-slate-200 bg-white py-2 pr-3.5 pl-9 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Quoted">Quoted</option>
              <option value="Quote Approved">Quote Approved</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Requests Table Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-3">Ticket</th>
                  <th className="px-3 py-3">Customer & Location</th>
                  <th className="px-3 py-3">Appliance</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Technician</th>
                  <th className="px-3 py-3">Quote</th>
                  <th className="pl-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      Loading service tickets...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No repair requests match your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((req) => (
                    <tr
                      key={req.request_id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="py-3.5 pr-3 font-extrabold text-slate-950">
                        #{req.request_id}
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-bold text-slate-900">{req.customer_name}</p>
                        <p className="max-w-50 truncate text-[11px] text-slate-400">
                          {req.service_address}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-slate-800">
                          {req.appliance_type}
                        </p>
                        {req.brand_model && (
                          <p className="text-[11px] text-slate-400">{req.brand_model}</p>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            req.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : req.status === 'Cancelled' || req.status === 'Quote Rejected'
                                ? 'bg-rose-50 text-rose-600'
                                : req.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">
                        {req.technician_name ? (
                          <div>
                            <p className="font-semibold text-slate-900">
                              {req.technician_name}
                            </p>
                            {req.scheduled_date && (
                              <p className="text-[10px] text-slate-400">
                                {new Date(req.scheduled_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 font-bold text-slate-950">
                        {req.estimated_cost ? formatPHP(req.estimated_cost) : '—'}
                      </td>
                      <td className="pl-3 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailTarget(req)}
                            title="View Details"
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {!['Completed', 'Cancelled'].includes(req.status) && (
                            <>
                              <button
                                onClick={() => setQuoteTarget(req)}
                                title="Build Itemized Quote"
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-100"
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                Quote
                              </button>

                              <button
                                onClick={() => setDispatchTarget(req)}
                                title="Assign Technician"
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Dispatch
                              </button>

                              <button
                                onClick={() =>
                                  handleStatusChange(req.request_id, 'Completed')
                                }
                                title="Mark Completed"
                                className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Itemized Quotation Modal */}
      {quoteTarget && (
        <ItemizedQuoteModal
          request={quoteTarget}
          onClose={() => setQuoteTarget(null)}
          onSaved={fetchRequests}
        />
      )}

      {/* Technician Dispatch Modal */}
      {dispatchTarget && (
        <TechnicianDispatchModal
          request={dispatchTarget}
          onClose={() => setDispatchTarget(null)}
          onAssigned={fetchRequests}
        />
      )}

      {/* Quick Ticket Details Modal */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-950">
                Ticket #{detailTarget.request_id} — {detailTarget.appliance_type}
              </h3>
              <button
                onClick={() => setDetailTarget(null)}
                className="text-slate-400 hover:text-slate-900"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
              <p>
                <strong className="text-slate-950">Customer:</strong>{' '}
                {detailTarget.customer_name} ({detailTarget.customer_phone || 'No phone'})
              </p>
              <p>
                <strong className="text-slate-950">Address:</strong>{' '}
                {detailTarget.service_address}
              </p>
              <p>
                <strong className="text-slate-950">Problem Description:</strong>{' '}
                {detailTarget.problem_description}
              </p>
              {detailTarget.technician_notes && (
                <p className="rounded-xl bg-emerald-50 p-3 text-emerald-800">
                  <strong>Technician Field Notes:</strong>{' '}
                  {detailTarget.technician_notes}
                </p>
              )}
              {detailTarget.appliance_image && (
                <img
                  src={`http://localhost:5000${detailTarget.appliance_image}`}
                  alt="Uploaded appliance"
                  className="mt-2 max-h-52 w-full rounded-2xl border border-slate-100 object-cover"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageRequests;