import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  DollarSign,
  Users,
  Printer,
  Download,
  BarChart3,
  PieChart,
  Filter,
  RotateCcw,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date & Year Report Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState('ALL');

  const fetchReports = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      if (filters.year && filters.year !== 'ALL') params.append('year', filters.year);

      const { data } = await api.get(`/admin/reports?${params.toString()}`);
      setReportData(data);
    } catch (error) {
      toast.error('Failed to load dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports({ start_date: startDate, end_date: endDate, year: selectedYear });
  }, [startDate, endDate, selectedYear]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedYear('ALL');
  };

  const handleExportCSV = () => {
    const rows = reportData?.reportRows || [];
    if (rows.length === 0) {
      return toast.error('No report records available for the selected date range.');
    }

    const headers = [
      'Ticket Reference',
      'Date Requested',
      'Client Full Name',
      'Client Contact',
      'Appliance Category',
      'Unit Model',
      'Repair Stage',
      'Quoted Fee (PHP)',
      'Settled Amount (PHP)',
      'Remaining Balance (PHP)',
      'Payment Channel',
      'Billing Status',
    ];

    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const csvContent = [
      headers.join(','),
      ...rows.map((r) =>
        [
          `#${r.ticket_reference}`,
          r.date_requested,
          r.client_full_name,
          r.client_contact || 'N/A',
          r.appliance_category,
          r.unit_model,
          r.repair_stage,
          Number(r.quoted_fee).toFixed(2),
          Number(r.settled_amount).toFixed(2),
          Number(r.remaining_balance).toFixed(2),
          r.payment_channel,
          r.billing_status,
        ]
          .map(escapeCsv)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateSuffix =
      startDate || endDate
        ? `${startDate || 'start'}_to_${endDate || 'today'}`
        : selectedYear !== 'ALL'
          ? selectedYear
          : new Date().toISOString().split('T')[0];

    link.href = url;
    link.setAttribute('download', `AUSE_Service_Report_${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV Report downloaded!');
  };

  const summary = reportData?.summary || {};
  const applianceBreakdown = reportData?.applianceBreakdown || [];
  const monthlyTrend = reportData?.monthlyTrend || [];
  const reportRows = reportData?.reportRows || [];

  const maxMonthlyRev = Math.max(
    ...monthlyTrend.map((m) => Number(m.collected_revenue || 0)),
    1
  );

  const totalTickets = Number(summary.total_requests || 0);
  const completionRate =
    totalTickets > 0 ? Math.round((Number(summary.completed_requests || 0) / totalTickets) * 100) : 0;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header & Export Actions */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Operations Dashboard & Analytics
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Real-time service performance, revenue charts, and date-filtered exportable reports.
            </p>
          </div>

          <div className="no-print flex flex-wrap gap-2.5">
            <Link
              to="/admin/requests"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              Manage Queue
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Date-Range & Year Filter Bar */}
        <div className="no-print flex flex-wrap items-end gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500 sm:mr-2 sm:self-center">
            <Filter className="h-4 w-4 text-teal-600" />
            Report Filter:
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stone-500">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 focus:border-teal-600 focus:outline-none"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stone-500">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-700 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stone-500">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-700 focus:border-teal-600 focus:outline-none"
            />
          </div>

          {(startDate || endDate || selectedYear !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Collected Revenue
                  </span>
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  ₱{Number(summary.total_revenue || 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Unpaid balance: ₱{Number(summary.pending_balance || 0).toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Active & Pending Queue
                  </span>
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-stone-900">
                  {Number(summary.pending_requests || 0) + Number(summary.active_requests || 0)}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {summary.pending_requests || 0} new • {summary.scheduled_visits || 0} scheduled
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Completed Repairs
                  </span>
                  <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-teal-700">
                  {summary.completed_requests || 0}{' '}
                  <span className="text-xs font-medium text-stone-400">
                    ({completionRate}% rate)
                  </span>
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {summary.cancelled_requests || 0} cancelled • {totalTickets} total tickets
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Registered Clients
                  </span>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold text-stone-900">
                  {summary.total_customers || 0}
                </p>
                <p className="mt-1 text-xs text-stone-500">Active household accounts</p>
              </div>
            </div>

            {/* Visual Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Visual Bar Chart: Monthly Revenue Trend */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base font-bold text-stone-900">
                    <BarChart3 className="h-5 w-5 text-teal-600" />
                    Monthly Collected Revenue Chart
                  </div>
                  <span className="text-xs text-stone-400">PHP (₱)</span>
                </div>

                {monthlyTrend.length === 0 ? (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-stone-50 text-xs text-stone-400">
                    No payment data available to plot for the selected period.
                  </div>
                ) : (
                  <div className="flex h-52 items-end gap-4 border-b border-stone-200 px-2 pt-6">
                    {monthlyTrend.map((m) => {
                      const val = Number(m.collected_revenue || 0);
                      const heightPct = Math.max(8, Math.round((val / maxMonthlyRev) * 100));
                      return (
                        <div
                          key={m.sort_key}
                          className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                        >
                          <span className="text-[11px] font-bold text-stone-700">
                            ₱{val.toLocaleString()}
                          </span>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full max-w-12 rounded-t-lg bg-linear-to-t from-teal-600 to-emerald-400 transition-all duration-300"
                            title={`${m.month_label}: ₱${val.toLocaleString()} (${m.paid_jobs} jobs)`}
                          />
                          <span className="text-[11px] font-medium text-stone-500">
                            {m.month_label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Visual Breakdown: Appliance Service Demand */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-base font-bold text-stone-900">
                  <PieChart className="h-5 w-5 text-emerald-600" />
                  Demand by Appliance
                </div>

                {applianceBreakdown.length === 0 ? (
                  <p className="text-xs text-stone-400">No repair requests in this range.</p>
                ) : (
                  <div className="space-y-4">
                    {applianceBreakdown.map((item) => {
                      const pct =
                        totalTickets > 0
                          ? Math.round((Number(item.request_count) / totalTickets) * 100)
                          : 0;
                      return (
                        <div key={item.category_name}>
                          <div className="mb-1 flex justify-between text-xs font-semibold">
                            <span className="text-stone-800">{item.category_name}</span>
                            <span className="text-stone-500">
                              {item.request_count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Joined & Aliased Service + Financial Report Preview Table */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 px-6 py-4">
                <div className="flex items-center gap-2 text-base font-bold text-stone-900">
                  <Wrench className="h-4 w-4 text-teal-600" />
                  Consolidated Service & Billing Report ({reportRows.length} records)
                </div>
                <span className="text-xs text-stone-400">
                  Joined across Repair Requests, Clients & Payments
                </span>
              </div>

              {reportRows.length === 0 ? (
                <p className="p-8 text-center text-xs text-stone-400">
                  No records match the selected date or year filter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="border-b border-stone-200 bg-stone-50 font-semibold uppercase text-stone-500">
                      <tr>
                        <th className="px-4 py-3">Ticket Ref</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Client Name</th>
                        <th className="px-4 py-3">Appliance</th>
                        <th className="px-4 py-3">Stage</th>
                        <th className="px-4 py-3">Quoted Fee</th>
                        <th className="px-4 py-3">Settled</th>
                        <th className="px-4 py-3">Billing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {reportRows.map((row) => (
                        <tr key={row.ticket_reference} className="hover:bg-stone-50/70">
                          <td className="px-4 py-3 font-bold text-stone-900">
                            #{row.ticket_reference}
                          </td>
                          <td className="px-4 py-3 text-stone-600">{row.date_requested}</td>
                          <td className="px-4 py-3 font-medium text-stone-800">
                            {row.client_full_name}
                          </td>
                          <td className="px-4 py-3 text-stone-600">{row.appliance_category}</td>
                          <td className="px-4 py-3 font-semibold text-stone-700">
                            {row.repair_stage}
                          </td>
                          <td className="px-4 py-3 text-stone-700">
                            ₱{Number(row.quoted_fee).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-600">
                            ₱{Number(row.settled_amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-stone-700">
                            {row.billing_status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;