import { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle2, Clock, Edit3, Loader2, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { PaymentModal } from '../../components/Modals';
import api, { downloadReceiptPdf } from '../../api/axios';

const PAYMENT_BADGE = {
  Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Partial: 'bg-amber-100 text-amber-800 border-amber-200',
  Unpaid: 'bg-red-100 text-red-800 border-red-200',
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingPayment, setEditingPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/admin/payments');
      setPayments(data);
    } catch (error) {
      toast.error('Failed to load payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
  const totalBalance = payments.reduce((sum, p) => sum + Number(p.balance || 0), 0);

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.payment_status === statusFilter;
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !term ||
      String(p.request_id).includes(term) ||
      p.customer_name?.toLowerCase().includes(term) ||
      p.appliance_type?.toLowerCase().includes(term) ||
      p.payment_method?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Payments & Billing Ledger</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track collected repair payments, partial balances, and payment methods across all jobs.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total Collected Revenue</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              ₱{totalCollected.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Outstanding Balances</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              ₱{totalBalance.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Recorded Transactions</span>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{payments.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, customer name, appliance, or method..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No payment records found. Record a payment from a Completed ticket in Service
              Requests.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Ticket & Date</th>
                    <th className="px-4 py-3.5">Customer & Appliance</th>
                    <th className="px-4 py-3.5">Total Bill</th>
                    <th className="px-4 py-3.5">Amount Paid</th>
                    <th className="px-4 py-3.5">Balance</th>
                    <th className="px-4 py-3.5">Method</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.payment_id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-900">#{pay.request_id}</span>
                        <p className="text-xs text-slate-500">{formatDate(pay.payment_date)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{pay.customer_name}</p>
                        <p className="text-xs text-slate-500">{pay.appliance_type}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800">
                        ₱{Number(pay.total_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-semibold text-emerald-600">
                        ₱{Number(pay.amount_paid).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700">
                        ₱{Number(pay.balance).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-700">
                        {pay.payment_method}
                        {pay.notes && (
                          <span className="block text-[11px] text-slate-400">{pay.notes}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            PAYMENT_BADGE[pay.payment_status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pay.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              downloadReceiptPdf(pay.request_id).catch(() =>
                                toast.error('Failed to download PDF receipt.')
                              )
                            }
                            title="Download PDF Official Receipt"
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                            PDF
                          </button>
                          <button
                            onClick={() =>
                              setEditingPayment({
                                ...pay,
                                payment_notes: pay.notes,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Update
                          </button>
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

      {editingPayment && (
        <PaymentModal
          request={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSuccess={fetchPayments}
        />
      )}
    </Layout>
  );
};

export default Payments;