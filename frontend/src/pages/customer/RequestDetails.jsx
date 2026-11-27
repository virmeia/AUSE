import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  FileDown,
  ShieldCheck,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import api, { downloadReceiptPdf } from '../../api/axios';

const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  '/api',
  ''
);

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [claimingWarranty, setClaimingWarranty] = useState(false);

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
    const diagFee = Number(request.diagnostic_fee || 0);
    const confirmMsg =
      decision === 'Quote Approved'
        ? `Approve the quotation of ₱${Number(request.estimated_cost).toLocaleString()} and proceed with scheduling?`
        : diagFee > 0
          ? `Decline the main repair? A diagnostic/check-up fee of ₱${diagFee.toLocaleString()} will still apply.`
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

  const handleClaimWarranty = async () => {
    const reason = window.prompt(
      'Describe the recurring issue covered under your 30-day service warranty:'
    );
    if (reason === null) return;
    setClaimingWarranty(true);
    try {
      const { data } = await api.post(`/requests/${id}/claim-warranty`, { reason });
      toast.success(data.message || 'Warranty claim submitted!');
      if (data.request_id) {
        navigate(`/customer/requests/${data.request_id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit warranty claim.');
    } finally {
      setClaimingWarranty(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        request_id: Number(id),
        rating,
        comment: reviewComment,
      });
      toast.success('Thank you for your verified review!');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-600">Repair request not found.</p>
          <Link
            to="/customer/dashboard"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Repairs
          </Link>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {request.appliance_type} Service Request
              </h1>
              <p className="text-xs text-slate-500">
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
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
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
          <div className="rounded-2xl border-2 border-cyan-300 bg-cyan-50/70 p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Repair Quotation Ready for Your Approval
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
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
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Wrench className="h-4 w-4 text-blue-600" />
                Appliance & Problem Details
              </div>

              <p className="text-sm leading-relaxed text-slate-700">
                {request.problem_description}
              </p>

              {request.appliance_image && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Uploaded Photo
                  </p>
                  <img
                    src={`${BACKEND_ORIGIN}${request.appliance_image}`}
                    alt={request.appliance_type}
                    className="max-h-64 rounded-xl border border-slate-200 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Diagnosis & Quotation Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="h-4 w-4 text-cyan-600" />
                Technician Diagnosis & Quotation
              </div>

              {!request.diagnosis_notes && Number(request.estimated_cost) === 0 ? (
                <p className="text-sm text-slate-500">
                  Our technician team has not posted a diagnosis and cost estimate yet. You will
                  receive a notification as soon as it is ready.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Diagnosis Notes
                    </span>
                    <p className="mt-1 text-sm text-slate-800">{request.diagnosis_notes}</p>
                  </div>

                  {request.recommended_service && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Recommended Repair / Action
                      </span>
                      <p className="mt-1 text-sm text-slate-800">{request.recommended_service}</p>
                    </div>
                  )}

                  {Array.isArray(request.quotation_items) && request.quotation_items.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Itemized Quotation Breakdown
                      </span>
                      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <tr>
                              <th className="px-3 py-2.5">Type</th>
                              <th className="px-3 py-2.5">Description</th>
                              <th className="px-3 py-2.5 text-right">Qty</th>
                              <th className="px-3 py-2.5 text-right">Unit Price</th>
                              <th className="px-3 py-2.5 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {request.quotation_items.map((item) => (
                              <tr key={item.item_id}>
                                <td className="px-3 py-2.5">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      item.item_type === 'Diagnostic Fee'
                                        ? 'bg-amber-50 text-amber-700'
                                        : item.item_type === 'Labor'
                                          ? 'bg-cyan-50 text-cyan-700'
                                          : 'bg-blue-50 text-blue-700'
                                    }`}
                                  >
                                    {item.item_type}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 font-medium text-slate-800">
                                  {item.description}
                                </td>
                                <td className="px-3 py-2.5 text-right text-slate-600">
                                  {item.quantity}
                                </td>
                                <td className="px-3 py-2.5 text-right text-slate-600">
                                  ₱{Number(item.unit_price).toLocaleString()}
                                </td>
                                <td className="px-3 py-2.5 text-right font-semibold text-slate-900">
                                  ₱{Number(item.subtotal || item.quantity * item.unit_price).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-700">
                        {request.status === 'Quote Rejected' && Number(request.diagnostic_fee) > 0
                          ? 'Diagnostic Fee Due'
                          : 'Estimated Repair Cost'}
                      </span>
                      {Number(request.diagnostic_fee) > 0 && request.status !== 'Quote Rejected' && (
                        <p className="text-[11px] text-slate-500">
                          Includes ₱{Number(request.diagnostic_fee).toLocaleString()} diagnostic/check-up fee
                        </p>
                      )}
                    </div>
                    <span className="text-xl font-bold text-blue-700">
                      ₱{Number(request.estimated_cost).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Schedule, Address & Payment */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-900">Home-Service Visit</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    Appointment Schedule
                  </span>
                  {request.scheduled_date ? (
                    <div className="mt-1 rounded-lg bg-blue-50 p-3 text-blue-900">
                      <p className="font-bold">{formatDate(request.scheduled_date)}</p>
                      <p className="text-xs text-cyan-700">{request.scheduled_time}</p>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">
                      Not scheduled yet
                      {request.preferred_date
                        ? ` (Preferred: ${formatDate(request.preferred_date)})`
                        : ''}
                    </p>
                  )}
                </div>

                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Service Address
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    {request.service_address}
                  </p>
                </div>

                {request.admin_remarks && (
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Info className="h-3.5 w-3.5" />
                      Service Notes
                    </span>
                    <p className="mt-1 text-xs text-slate-600">{request.admin_remarks}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Payment Summary
              </div>

              {request.payment_id ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="font-semibold text-slate-900">
                      ₱{Number(request.total_amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-semibold text-emerald-600">
                      ₱{Number(request.amount_paid).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Balance:</span>
                    <span className="font-semibold text-slate-900">
                      ₱{Number(request.balance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2">
                    <span className="text-slate-500">Method / Status:</span>
                    <span className="font-bold text-slate-800">
                      {request.payment_method} ({request.payment_status})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      downloadReceiptPdf(request.request_id).catch(() =>
                        toast.error('Failed to download PDF receipt.')
                      )
                    }
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    Download Official Receipt (PDF)
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  No payment recorded yet. Payment is settled upon completion of the home-service
                  repair.
                </p>
              )}
            </div>

            {/* Warranty & Completion Proof */}
            {request.status === 'Completed' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  30-Day Service Warranty
                </div>

                {(() => {
                  const expiresAt = request.warranty_expires_at
                    ? new Date(request.warranty_expires_at)
                    : null;
                  const isActive = !expiresAt || expiresAt >= new Date();
                  return (
                    <div className="space-y-3">
                      <div
                        className={`rounded-xl p-3 text-xs font-medium ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <p className="font-bold">Warranty Active</p>
                            {expiresAt && (
                              <p className="mt-0.5 text-[11px]">
                                Valid until {formatDate(request.warranty_expires_at)}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="font-bold">30-Day Warranty Expired</p>
                        )}
                      </div>

                      {isActive && (
                        <button
                          type="button"
                          disabled={claimingWarranty}
                          onClick={handleClaimWarranty}
                          className="w-full rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                        >
                          {claimingWarranty ? 'Submitting...' : 'Claim Warranty'}
                        </button>
                      )}

                      {request.after_photo && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            After-Repair Photo
                          </p>
                          <img
                            src={`${BACKEND_ORIGIN}${request.after_photo}`}
                            alt="After repair"
                            className="max-h-40 w-full rounded-xl border border-slate-200 object-cover"
                          />
                        </div>
                      )}

                      {request.customer_signature && (
                        <div>
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Customer Sign-Off
                          </p>
                          <img
                            src={request.customer_signature}
                            alt="Customer signature"
                            className="max-h-20 rounded-xl border border-slate-200 bg-slate-50 p-1.5"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Verified Post-Repair Review */}
            {request.status === 'Completed' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Star className="h-4 w-4 text-amber-400" />
                  Rate Your Repair Experience
                </div>

                {request.review ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${
                            n <= request.review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="ml-1 font-bold text-slate-800">
                        {request.review.rating}/5
                      </span>
                    </div>
                    {request.review.comment && (
                      <p className="rounded-xl bg-slate-50 p-3 text-slate-700">
                        &ldquo;{request.review.comment}&rdquo;
                      </p>
                    )}
                    <p className="text-[11px] font-semibold text-emerald-600">
                      ✓ Verified review published
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className="p-0.5 transition hover:scale-110"
                          aria-label={`Rate ${n} stars`}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows="2"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="How was the technician and repair quality?"
                      className="w-full resize-none rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RequestDetails;