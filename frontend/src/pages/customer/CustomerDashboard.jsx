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
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

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
    } catch (error) {
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
    ) {
      return;
    }

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

  // Derived KPI counts
  const totalRequests = requests.length;
  const actionNeededCount = requests.filter((r) => r.status === 'Quoted').length;
  const activeCount = requests.filter((r) =>
    ['Pending', 'Approved', 'Quoted', 'Quote Approved', 'Scheduled', 'In Progress'].includes(
      r.status
    )
  ).length;
  const completedCount = requests.filter((r) => r.status === 'Completed').length;

  const filteredRequests = requests.filter((req) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTION') return req.status === 'Quoted';
    if (filterStatus === 'ACTIVE')
      return !['Completed', 'Rejected', 'Quote Rejected', 'Cancelled'].includes(req.status);
    if (filterStatus === 'COMPLETED') return req.status === 'Completed';
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Welcome back, {user?.full_name?.split(' ')[0]}!
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Track your home appliance repairs, approve quotations, and view visit schedules.
            </p>
          </div>

          <Link
            to="/customer/new-request"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            <PlusCircle className="h-4 w-4" />
            New Repair Request
          </Link>
        </div>

        {/* Pending Quote Action Banner */}
        {actionNeededCount > 0 && (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
              <div>
                <p className="text-sm font-semibold text-purple-900">
                  You have {actionNeededCount} repair quotation
                  {actionNeededCount > 1 ? 's' : ''} awaiting your approval
                </p>
                <p className="text-xs text-purple-700">
                  Review the diagnosis and estimated cost so our team can schedule your home visit.
                </p>
              </div>
            </div>
            <button
              onClick={() => setFilterStatus('ACTION')}
              className="self-start rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 sm:self-auto"
            >
              View Quoted Requests
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Total Requests</span>
              <Wrench className="h-4 w-4 text-stone-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-stone-900">{totalRequests}</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Active Repairs</span>
              <Clock className="h-4 w-4 text-teal-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-teal-700">{activeCount}</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Needs Quote Approval</span>
              <FileText className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-purple-600">{actionNeededCount}</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">Completed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{completedCount}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: `All (${totalRequests})` },
            { key: 'ACTIVE', label: `Active (${activeCount})` },
            { key: 'ACTION', label: `Awaiting Quote Approval (${actionNeededCount})` },
            { key: 'COMPLETED', label: `Completed (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                filterStatus === tab.key
                  ? 'bg-teal-700 text-white'
                  : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Repair Request Cards */}
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-stone-200 bg-white">
            <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <Wrench className="mx-auto h-10 w-10 text-stone-300" />
            <h3 className="mt-3 text-base font-semibold text-stone-800">
              No repair requests found
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Need an appliance fixed? Submit a home-service repair request to get started.
            </p>
            <Link
              to="/customer/new-request"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
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
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-teal-300"
              >
                <div>
                  {/* Top Row: Date, Appliance & Status (Internal Ticket # hidden from customer) */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-stone-400">
                        Submitted {formatDate(req.created_at)}
                      </span>
                      <h3 className="mt-0.5 text-base font-bold text-stone-900">
                        {req.appliance_type}
                        {req.brand_model ? (
                          <span className="ml-1.5 text-sm font-normal text-stone-500">
                            ({req.brand_model})
                          </span>
                        ) : null}
                      </h3>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Problem Description */}
                  <p className="mt-3 line-clamp-2 text-sm text-stone-600">
                    {req.problem_description}
                  </p>

                  {/* Meta Info: Service Address & Schedule / Quote */}
                  <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-3 text-xs text-stone-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                      <span className="line-clamp-1">{req.service_address}</span>
                    </div>

                    {req.scheduled_date ? (
                      <div className="flex items-center gap-2 font-medium text-teal-700">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          Visit Scheduled: {formatDate(req.scheduled_date)} ({req.scheduled_time})
                        </span>
                      </div>
                    ) : req.preferred_date ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                        <span>Preferred Date: {formatDate(req.preferred_date)}</span>
                      </div>
                    ) : null}

                    {Number(req.estimated_cost) > 0 && (
                      <div className="pt-1 font-semibold text-stone-800">
                        Estimated Repair Cost: ₱{Number(req.estimated_cost).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Link & Soft Cancel */}
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                  <div>
                    {req.status === 'Pending' ? (
                      <button
                        type="button"
                        disabled={cancellingId === req.request_id}
                        onClick={() => handleCancelRequest(req.request_id, req.appliance_type)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {cancellingId === req.request_id ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    ) : (
                      <span className="text-xs text-stone-400">
                        {req.status === 'Quoted'
                          ? 'Action required: Review quotation'
                          : 'View full diagnosis & timeline'}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/customer/requests/${req.request_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
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