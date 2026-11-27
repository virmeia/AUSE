import { useState, useEffect } from 'react';
import { X, FileText, Calendar, Clock, CreditCard, Stethoscope, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
];

const PAYMENT_METHODS = ['Cash', 'GCash', 'Bank Transfer', 'Maya'];

const ADMIN_REMARK_OPTIONS = [
  'Standard 30-day service warranty included.',
  'Diagnostic/inspection fee applies; final repair cost confirmed after on-site check.',
  'Subject to OEM replacement part availability.',
  'Please ensure clear access and power/water supply near the appliance.',
  'Technician will call 30 minutes prior to arrival.',
];

// 1. Admin Diagnosis & Quotation Modal
export const QuoteModal = ({ request, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    diagnosis_notes: '',
    recommended_service: '',
    estimated_cost: '',
    admin_remarks: ADMIN_REMARK_OPTIONS[0],
  });
  const [needsOnSiteCheck, setNeedsOnSiteCheck] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setFormData({
        diagnosis_notes: request.diagnosis_notes || '',
        recommended_service: request.recommended_service || '',
        estimated_cost: Number(request.estimated_cost) > 0 ? request.estimated_cost : '',
        admin_remarks: ADMIN_REMARK_OPTIONS.includes(request.admin_remarks)
          ? request.admin_remarks
          : ADMIN_REMARK_OPTIONS[0],
      });
      setNeedsOnSiteCheck(false);
    }
  }, [request]);

  if (!request) return null;

  const handleToggleOnSiteCheck = (checked) => {
    setNeedsOnSiteCheck(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        diagnosis_notes:
          'Unable to determine exact fault remotely. Requires physical on-site inspection and diagnostic testing by our technician.',
        recommended_service:
          'On-Site Physical Checkup & Hardware Diagnostics (Final repair scope to be confirmed upon inspection).',
        estimated_cost: prev.estimated_cost || '350',
        admin_remarks: ADMIN_REMARK_OPTIONS[1],
      }));
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.estimated_cost) <= 0) {
      return toast.error('Estimated cost / diagnostic fee must be greater than ₱0.');
    }

    setSubmitting(true);
    try {
      await api.put(`/requests/${request.request_id}/quote`, {
        diagnosis_notes: formData.diagnosis_notes,
        recommended_service: formData.recommended_service,
        estimated_cost: Number(formData.estimated_cost),
        admin_remarks: formData.admin_remarks || null,
      });
      toast.success(`Quotation sent to ${request.customer_name}!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Diagnosis & Repair Quotation
              </h3>
              <p className="text-xs text-slate-500">
                Ticket #{request.request_id} • {request.appliance_type} ({request.customer_name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Reported Issue: </span>
            {request.problem_description}
          </div>

          {/* Quick-Fill Option for Unknown Fault / Needs Physical Check */}
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900">
            <input
              type="checkbox"
              checked={needsOnSiteCheck}
              onChange={(e) => handleToggleOnSiteCheck(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-blue-400 text-blue-600 focus:ring-blue-600"
            />
            <div>
              <span className="flex items-center gap-1 font-bold">
                <Stethoscope className="h-3.5 w-3.5 text-blue-700" />
                Requires On-Site Physical Inspection First
              </span>
              <span className="mt-0.5 block text-[11px] text-blue-800">
                Auto-fills initial checkup notes and diagnostic fee when the exact issue cannot be
                identified without inspecting the unit in person.
              </span>
            </div>
          </label>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Technical Diagnosis Findings <span className="text-red-500">*</span>
            </label>
            <textarea
              name="diagnosis_notes"
              rows="3"
              required
              value={formData.diagnosis_notes}
              onChange={handleChange}
              placeholder="Enter initial assessment or inspection findings..."
              className="w-full resize-none rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Recommended Repair / Action <span className="text-red-500">*</span>
            </label>
            <textarea
              name="recommended_service"
              rows="2"
              required
              value={formData.recommended_service}
              onChange={handleChange}
              placeholder="Enter recommended repair service or on-site diagnostic check..."
              className="w-full resize-none rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Stacked Estimated Cost (₱) */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Estimated Total Cost / Diagnostic Fee <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                ₱
              </span>
              <input
                type="number"
                name="estimated_cost"
                min="1"
                step="0.01"
                required
                value={formData.estimated_cost}
                onChange={handleChange}
                placeholder="1500.00"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-8 pr-3 text-sm font-medium focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Stacked Admin Remarks Dropdown */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Admin Remarks
            </label>
            <select
              name="admin_remarks"
              value={formData.admin_remarks}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              {ADMIN_REMARK_OPTIONS.map((remark) => (
                <option key={remark} value={remark}>
                  {remark}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Quotation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Admin Home-Service Visit Scheduling Modal
export const ScheduleModal = ({ request, onClose, onSuccess }) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState(TIME_SLOTS[0]);
  const [adminRemarks, setAdminRemarks] = useState(ADMIN_REMARK_OPTIONS[4]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      const defaultDate = request.preferred_date
        ? new Date(request.preferred_date).toISOString().split('T')[0]
        : '';
      setScheduledDate(defaultDate);
      setScheduledTime(request.scheduled_time || TIME_SLOTS[0]);
      setAdminRemarks(
        ADMIN_REMARK_OPTIONS.includes(request.admin_remarks)
          ? request.admin_remarks
          : ADMIN_REMARK_OPTIONS[4]
      );
    }
  }, [request]);

  if (!request) return null;

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/requests/${request.request_id}/schedule`, {
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        admin_remarks: adminRemarks || null,
      });
      toast.success('Home-service visit scheduled!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule visit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Schedule Home-Service Visit</h3>
              <p className="text-xs text-slate-500">
                Ticket #{request.request_id} • {request.customer_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p>
              <span className="font-semibold text-slate-800">Service Address: </span>
              {request.service_address}
            </p>
            {request.preferred_date && (
              <p className="mt-1">
                <span className="font-semibold text-slate-800">Customer Preferred Date: </span>
                {new Date(request.preferred_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={today}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Arrival Time Window <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Visit Instructions / Admin Remarks
            </label>
            <select
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              {ADMIN_REMARK_OPTIONS.map((remark) => (
                <option key={remark} value={remark}>
                  {remark}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Admin Record Payment Modal
export const PaymentModal = ({ request, onClose, onSuccess }) => {
  const [totalAmount, setTotalAmount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      const total =
        Number(request.total_amount) > 0
          ? request.total_amount
          : Number(request.estimated_cost) || '';
      setTotalAmount(total);
      setAmountPaid(
        request.amount_paid !== undefined && request.amount_paid !== null
          ? request.amount_paid
          : total
      );
      setPaymentMethod(request.payment_method || 'Cash');
      setNotes(request.payment_notes || '');
    }
  }, [request]);

  if (!request) return null;

  const computedBalance = Math.max(0, Number(totalAmount || 0) - Number(amountPaid || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/payments', {
        request_id: request.request_id,
        total_amount: Number(totalAmount),
        amount_paid: Number(amountPaid),
        payment_method: paymentMethod,
        notes: notes || null,
      });
      toast.success(`Payment recorded for Ticket #${request.request_id}!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Service Payment</h3>
              <p className="text-xs text-slate-500">
                Ticket #{request.request_id} • {request.customer_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Total Bill (₱) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Amount Paid (₱) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs">
            <span className="font-medium text-slate-600">Calculated Remaining Balance:</span>
            <span className="text-sm font-bold text-slate-900">
              ₱{computedBalance.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Receipt / Reference Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., GCash Ref #1049283 or Cash collected on-site"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};