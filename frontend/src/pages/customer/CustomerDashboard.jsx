import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Wrench,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  FileText,
  XCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

/* Status → left-border accent color */
const STATUS_BORDER = {
  Pending:          'border-l-amber-400',
  Quoted:           'border-l-cyan-500',
  'Quote Approved': 'border-l-blue-500',
  'Quote Rejected': 'border-l-rose-400',
  Scheduled:        'border-l-sky-500',
  'In Progress':    'border-l-cyan-400',
  Approved:         'border-l-blue-600',
  Completed:        'border-l-emerald-500',
  Rejected:         'border-l-rose-500',
  Cancelled:        'border-l-slate-400',
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchMyRequests = async () => {
    try {
      const { data } = await api.get('/requests/my-requests');
      setRequests(data);
    } catch {
      toast.error('Failed to load your repair requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleCancelRequest = async (requestId, applianceType) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel your ${applianceType} repair request?`
      )
    ) return;

    setCancellingId(requestId);
    try {
      await api.put(`/requests/${requestId}/cancel`, {
        reason: 'Cancelled by customer prior to review',
      });
      toast.success('Repair request cancelled.');
      fetchMyRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not cancel request.');
    } finally {
      setCancellingId(null);
    }
  };

  const totalRequests    = requests.length;
  const actionNeededCount = requests.filter((r) => r.status === 'Quoted').length;
  const activeCount       = requests.filter((r) =>
    ['Pending', 'Approved', 'Quoted', 'Quote Approved', 'Scheduled', 'In Progress'].includes(r.status)
  ).length;
  const completedCount   = requests.filter((r) => r.status === 'Completed').length;

  const filteredRequests = requests.filter((req) => {
    if (filterStatus === 'ALL')       return true;
    if (filterStatus === 'ACTION')    return req.status === 'Quoted';
    if (filterStatus === 'ACTIVE')    return !['Completed', 'Rejected', 'Quote Rejected', 'Cancelled'].includes(req.status);
    if (filterStatus === 'COMPLETED') return req.status === 'Completed';
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const firstName = user?.full_name?.split(' ')[0] ?? 'there';

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── Welcome Banner ───────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-800 via-blue-600 to-cyan-500 p-6 shadow-lg shadow-blue-900/10">
          {/* Decorative dot grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-cyan-400/25 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Customer Portal
              </div>
              <h1 className="text-2xl font-extrabold leading-tight text-white">
                Welcome back, {firstName}!
              </h1>
              <p className="mt-1 text-sm text-blue-100/90">
                Track repairs, approve quotations, and view your visit schedule.
              </p>
            </div>
            <Link
              to="/customer/new-request"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-cyan-50"
            >
              <PlusCircle className="h-4 w-4" />
              New Repair Request
            </Link>
          </div>
        </div>

        {/* ── Quote Action Banner ──────────────────────────────── */}
        {actionNeededCount > 0 && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50/70 p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-100">
                <FileText className="h-4 w-4 text-cyan-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  You have {actionNeededCount} quotation{actionNeededCount > 1 ? 's' : ''} awaiting your approval
                </p>
                <p className="text-xs text-slate-600">
                  Review the diagnosis and estimated cost so our team can schedule your home visit.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilterStatus('ACTION')}
              className="self-start rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 sm:self-auto"
            >
              View Quoted Requests
            </button>
          </div>
        )}

        {/* ── KPI Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Total */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-slate-400 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Requests</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Wrench className="h-4 w-4 text-slate-500" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{totalRequests}</p>
            <p className="mt-0.5 text-xs text-slate-400">all time</p>
          </div>

          {/* Active */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-500 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Active Repairs</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-blue-700">{activeCount}</p>
            <p className="mt-0.5 text-xs text-blue-400">in progress</p>
          </div>

          {/* Needs Action */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-cyan-500 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Needs Approval</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
                <FileText className="h-4 w-4 text-cyan-600" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-cyan-700">{actionNeededCount}</p>
            <p className="mt-0.5 text-xs text-cyan-500">quote{actionNeededCount !== 1 ? 's' : ''} pending</p>
          </div>

          {/* Completed */}
          <div className="rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Completed</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-emerald-600">{completedCount}</p>
            <p className="mt-0.5 text-xs text-emerald-400">repaired</p>
          </div>
        </div>

        {/* ── Filter Tabs ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL',       label: `All`,                  count: totalRequests },
            { key: 'ACTIVE',    label: `Active`,               count: activeCount },
            { key: 'ACTION',    label: `Awaiting Approval`,    count: actionNeededCount },
            { key: 'COMPLETED', label: `Completed`,            count: completedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filterStatus === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                filterStatus === tab.key ? 'bg-blue-500 text-cyan-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Repair Request Cards ─────────────────────────────── */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Wrench className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-800">
              No repair requests found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Need an appliance fixed? Submit a home-service repair request to get started.
            </p>
            <Link
              to="/customer/new-request"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" />
              Submit Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredRequests.map((req) => (
              <div
                key={req.request_id}
                className={`flex flex-col justify-between rounded-2xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md ${STATUS_BORDER[req.status] ?? 'border-l-slate-300'}`}
              >
                <div>
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">
                        Submitted {formatDate(req.created_at)}
                      </span>
                      <h3 className="mt-0.5 text-base font-bold text-slate-900">
                        {req.appliance_type}
                        {req.brand_model ? (
                          <span className="ml-1.5 text-sm font-normal text-slate-500">
                            ({req.brand_model})
                          </span>
                        ) : null}
                      </h3>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Problem */}
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {req.problem_description}
                  </p>

                  {/* Meta */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{req.service_address}</span>
                    </div>

                    {req.scheduled_date ? (
                      <div className="flex items-center gap-2 font-medium text-blue-700">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-cyan-600" />
                        <span>
                          Visit Scheduled: {formatDate(req.scheduled_date)} ({req.scheduled_time})
                        </span>
                      </div>
                    ) : req.preferred_date ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>Preferred Date: {formatDate(req.preferred_date)}</span>
                      </div>
                    ) : null}

                    {Number(req.estimated_cost) > 0 && (
                      <div className="pt-1 font-semibold text-slate-800">
                        Estimated Repair Cost: ₱{Number(req.estimated_cost).toLocaleString()}
                      </div>
                    )}

                    {req.status === 'Completed' && req.warranty_expires_at && (
                      <div className="pt-1 text-[11px] font-semibold text-emerald-700">
                        {new Date(req.warranty_expires_at) >= new Date()
                          ? `✓ 30-Day Warranty Active until ${formatDate(req.warranty_expires_at)}`
                          : '30-Day Warranty Expired'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    {req.status === 'Pending' ? (
                      <button
                        type="button"
                        disabled={cancellingId === req.request_id}
                        onClick={() => handleCancelRequest(req.request_id, req.appliance_type)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {cancellingId === req.request_id ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {req.status === 'Quoted'
                          ? '⚠ Action required: Review quotation'
                          : 'View full diagnosis & timeline'}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/customer/requests/${req.request_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-cyan-600"
                  >
                    Track Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomerDashboard;
