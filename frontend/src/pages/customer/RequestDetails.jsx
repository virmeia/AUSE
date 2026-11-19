import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  CreditCard,
  Info,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api/axios';

const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  '/api',
  ''
);

const RequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  const fetchDetails = async () => {
    try {
      const { data } = await api.get(`/requests/${id}`);
      setRequest(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load repair request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleQuoteDecision = async (decision) => {
    const confirmMsg =
      decision === 'Quote Approved'
        ? `Approve the quotation of ₱${Number(request.estimated_cost).toLocaleString()} and proceed with scheduling?`
        : 'Are you sure you want to decline this repair quotation?';

    if (!window.confirm(confirmMsg)) return;

    setResponding(true);
    try {
      await api.put(`/requests/${id}/quote-response`, { decision });
      toast.success(
        decision === 'Quote Approved'
          ? 'Quotation approved! Our team will schedule your home-service visit soon.'
          : 'Quotation declined.'
      );
      fetchDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit your response.');
    } finally {
      setResponding(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this repair request?')) return;
    setResponding(true);
    try {
      await api.put(`/requests/${id}/cancel`, {
        reason: 'Cancelled by customer',
      });
      toast.success('Repair request cancelled.');
      fetchDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not cancel request.');
    } finally {
      setResponding(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-stone-600">Repair request not found.</p>
          <Link
            to="/customer/dashboard"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Repairs
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back link & Title (No internal ticket # exposed) */}
        <div>
          <Link
            to="/customer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Repairs
          </Link>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                {request.appliance_type} Service Request
              </h1>
              <p className="text-xs text-stone-500">
                Submitted on {formatDate(request.created_at)}
                {request.brand_model ? ` • Model: ${request.brand_model}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <StatusBadge status={request.status} />
              {request.status === 'Pending' && (
                <button
                  type="button"
                  disabled={responding}
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Banner when Quotation awaits Customer Approval */}
        {request.status === 'Quoted' && (
          <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-purple-950">
                  Repair Quotation Ready for Your Approval
                </h2>
                <p className="mt-0.5 text-xs text-purple-800">
                  Please review the diagnosis and estimated repair cost below before we book your
                  home-service visit.
                </p>
              </div>
              <div className="flex shrink-0 gap-2.5">
                <button
                  disabled={responding}
                  onClick={() => handleQuoteDecision('Quote Approved')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Quote
                </button>
                <button
                  disabled={responding}
                  onClick={() => handleQuoteDecision('Quote Rejected')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Reported Issue Card */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900">
                <Wrench className="h-4 w-4 text-teal-600" />
                Appliance & Problem Details
              </div>

              <p className="text-sm leading-relaxed text-stone-700">
                {request.problem_description}
              </p>

              {request.appliance_image && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                    Uploaded Photo
                  </p>
                  <img
                    src={`${BACKEND_ORIGIN}${request.appliance_image}`}
                    alt={request.appliance_type}
                    className="max-h-64 rounded-xl border border-stone-200 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Diagnosis & Quotation Card */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-stone-900">
                <FileText className="h-4 w-4 text-purple-600" />
                Technician Diagnosis & Quotation
              </div>

              {!request.diagnosis_notes && Number(request.estimated_cost) === 0 ? (
                <p className="text-sm text-stone-500">
                  Our technician team has not posted a diagnosis and cost estimate yet. You will
                  receive a notification as soon as it is ready.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Diagnosis Notes
                    </span>
                    <p className="mt-1 text-sm text-stone-800">{request.diagnosis_notes}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Recommended Repair / Action
                    </span>
                    <p className="mt-1 text-sm text-stone-800">{request.recommended_service}</p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-stone-50 p-4">
                    <span className="text-sm font-semibold text-stone-700">
                      Estimated Repair Cost
                    </span>
                    <span className="text-xl font-bold text-stone-900">
                      ₱{Number(request.estimated_cost).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Schedule, Address & Payment */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-stone-900">Home-Service Visit</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Appointment Schedule
                  </span>
                  {request.scheduled_date ? (
                    <div className="mt-1 rounded-lg bg-teal-50 p-3 text-teal-900">
                      <p className="font-bold">{formatDate(request.scheduled_date)}</p>
                      <p className="text-xs">{request.scheduled_time}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-stone-500">
                      Not scheduled yet
                      {request.preferred_date
                        ? ` (Preferred: ${formatDate(request.preferred_date)})`
                        : ''}
                    </p>
                  )}
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Service Address
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-stone-700">
                    {request.service_address}
                  </p>
                </div>

                {request.admin_remarks && (
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
                      <Info className="h-3.5 w-3.5" />
                      Service Notes
                    </span>
                    <p className="mt-1 text-xs text-stone-600">{request.admin_remarks}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Payment Summary
              </div>

              {request.payment_id ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Amount:</span>
                    <span className="font-semibold text-stone-900">
                      ₱{Number(request.total_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Amount Paid:</span>
                    <span className="font-semibold text-emerald-600">
                      ₱{Number(request.amount_paid).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Remaining Balance:</span>
                    <span className="font-semibold text-stone-900">
                      ₱{Number(request.balance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-stone-100 pt-2">
                    <span className="text-stone-500">Method / Status:</span>
                    <span className="font-bold text-stone-800">
                      {request.payment_method} ({request.payment_status})
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500">
                  No payment recorded yet. Payment is settled upon completion of the home-service
                  repair.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestDetails;