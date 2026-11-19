import { useState, useEffect } from 'react';
import {
  Search,
  Check,
  X,
  FileText,
  Calendar,
  Play,
  CheckCircle2,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  Phone,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';
import { QuoteModal, ScheduleModal, PaymentModal } from '../../components/Modals';

const APPLIANCE_OPTIONS = [
  'ALL',
  'Refrigerator',
  'Washing Machine',
  'Air Conditioner',
  'Electric Fan',
  'Microwave Oven',
];

const STATUS_OPTIONS = [
  'ALL',
  'Pending',
  'Approved',
  'Quoted',
  'Quote Approved',
  'Scheduled',
  'In Progress',
  'Completed',
  'Rejected',
  'Quote Rejected',
];

const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  '/api',
  ''
);

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [applianceFilter, setApplianceFilter] = useState('ALL');

  // Active modal state (ready for Day 4–6 Modals.jsx integration)
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'quote' | 'schedule' | 'payment' | 'image'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAllRequests = async () => {
    try {
      const { data } = await api.get('/requests');
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // Quick status transitions (Approve, Reject, In Progress, Completed)
  const handleStatusUpdate = async (requestId, newStatus) => {
    let admin_remarks = null;
    if (newStatus === 'Rejected') {
      admin_remarks = window.prompt('Enter reason for rejecting this request (optional):');
      if (admin_remarks === null) return; // User cancelled prompt
    }

    setActionLoadingId(requestId);
    try {
      await api.put(`/requests/${requestId}/status`, {
        status: newStatus,
        admin_remarks,
      });
      toast.success(`Request #${requestId} marked as ${newStatus}.`);
      fetchAllRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openModal = (request, modalType) => {
  setSelectedRequest(request);
  setActiveModal(modalType);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesAppliance =
      applianceFilter === 'ALL' || req.appliance_type === applianceFilter;
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !term ||
      String(req.request_id).includes(term) ||
      req.customer_name?.toLowerCase().includes(term) ||
      req.appliance_type?.toLowerCase().includes(term) ||
      req.service_address?.toLowerCase().includes(term);

    return matchesStatus && matchesAppliance && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Request Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review incoming repair requests, record diagnoses & quotes, and schedule home visits.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, customer name, or address..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st === 'ALL' ? 'All Statuses' : st}
              </option>
            ))}
          </select>

          <select
            value={applianceFilter}
            onChange={(e) => setApplianceFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            {APPLIANCE_OPTIONS.map((app) => (
              <option key={app} value={app}>
                {app === 'ALL' ? 'All Appliances' : app}
              </option>
            ))}
          </select>
        </div>

        {/* Requests Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No service requests match your current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Ticket & Customer</th>
                    <th className="px-4 py-3.5">Appliance & Issue</th>
                    <th className="px-4 py-3.5">Service Location & Schedule</th>
                    <th className="px-4 py-3.5">Quotation</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.request_id} className="hover:bg-slate-50/70">
                      {/* Ticket & Customer */}
                      <td className="px-4 py-4 align-top">
                        <span className="font-bold text-slate-900">#{req.request_id}</span>
                        <p className="mt-0.5 font-medium text-slate-800">{req.customer_name}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />
                          {req.customer_phone}
                        </p>
                      </td>

                      {/* Appliance & Problem */}
                      <td className="max-w-xs px-4 py-4 align-top">
                        <p className="font-semibold text-slate-900">{req.appliance_type}</p>
                        {req.brand_model && (
                          <p className="text-xs text-slate-500">{req.brand_model}</p>
                        )}
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                          {req.problem_description}
                        </p>
                        {req.appliance_image && (
                          <button
                            onClick={() => openModal(req, 'image')}
                            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            <ImageIcon className="h-3.5 w-3.5" />
                            View Photo
                          </button>
                        )}
                      </td>

                      {/* Location & Schedule */}
                      <td className="max-w-xs px-4 py-4 align-top text-xs text-slate-600">
                        <p className="flex items-start gap-1">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>{req.service_address}</span>
                        </p>
                        {req.scheduled_date ? (
                          <p className="mt-1.5 flex items-center gap-1 font-semibold text-blue-700">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {formatDate(req.scheduled_date)} ({req.scheduled_time})
                          </p>
                        ) : req.preferred_date ? (
                          <p className="mt-1.5 text-slate-400">
                            Pref: {formatDate(req.preferred_date)}
                          </p>
                        ) : null}
                      </td>

                      {/* Quotation */}
                      <td className="px-4 py-4 align-top">
                        {Number(req.estimated_cost) > 0 ? (
                          <div>
                            <p className="font-semibold text-slate-900">
                              ₱{Number(req.estimated_cost).toLocaleString()}
                            </p>
                            {req.payment_status && (
                              <span className="text-[11px] font-medium text-emerald-600">
                                {req.payment_status}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Not quoted</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 align-top">
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Contextual Workflow Actions */}
                      <td className="px-4 py-4 align-top text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1.5">
                          {req.status === 'Pending' && (
                            <>
                              <button
                                disabled={actionLoadingId === req.request_id}
                                onClick={() => handleStatusUpdate(req.request_id, 'Approved')}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                disabled={actionLoadingId === req.request_id}
                                onClick={() => handleStatusUpdate(req.request_id, 'Rejected')}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </>
                          )}

                          {['Approved', 'Quoted', 'Quote Rejected'].includes(req.status) && (
                            <button
                              onClick={() => openModal(req, 'quote')}
                              className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {req.status === 'Approved' ? 'Diagnose & Quote' : 'Revise Quote'}
                            </button>
                          )}

                          {req.status === 'Quote Approved' && (
                            <button
                              onClick={() => openModal(req, 'schedule')}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              Schedule Visit
                            </button>
                          )}

                          {req.status === 'Scheduled' && (
                            <button
                              disabled={actionLoadingId === req.request_id}
                              onClick={() => handleStatusUpdate(req.request_id, 'In Progress')}
                              className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700"
                            >
                              <Play className="h-3.5 w-3.5" />
                              Start Repair
                            </button>
                          )}

                          {req.status === 'In Progress' && (
                            <button
                              disabled={actionLoadingId === req.request_id}
                              onClick={() => handleStatusUpdate(req.request_id, 'Completed')}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark Completed
                            </button>
                          )}

                          {req.status === 'Completed' && (
                            <button
                              onClick={() => openModal(req, 'payment')}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              Record Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Lightbox Modal */}
      {activeModal === 'image' && selectedRequest?.appliance_image && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg overflow-hidden rounded-2xl bg-white p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Ticket #{selectedRequest.request_id} — {selectedRequest.appliance_type}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={`${BACKEND_ORIGIN}${selectedRequest.appliance_image}`}
              alt={selectedRequest.appliance_type}
              className="max-h-[70vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {activeModal === 'quote' && selectedRequest && (
        <QuoteModal
            request={selectedRequest}
            onClose={() => setActiveModal(null)}
            onSuccess={fetchAllRequests}
        />
        )}

      {activeModal === 'schedule' && selectedRequest && (
        <ScheduleModal
            request={selectedRequest}
            onClose={() => setActiveModal(null)}
            onSuccess={fetchAllRequests}
        />
        )}
        
      {activeModal === 'payment' && selectedRequest && (
        <PaymentModal
          request={selectedRequest}
          onClose={() => setActiveModal(null)}
          onSuccess={fetchAllRequests}
        />
      )}
    </Layout>
  );
};

export default ManageRequests;