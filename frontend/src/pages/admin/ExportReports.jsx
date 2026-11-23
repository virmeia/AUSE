import { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Filter,
  RotateCcw,
  Download,
  Printer,
  Wrench,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const ExportReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } catch {
      toast.error('Failed to load report data.');
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

  const reportRows = reportData?.reportRows || [];

  const handleExportCSV = () => {
    if (reportRows.length === 0)
      return toast.error('No records available for the selected range.');

    const headers = [
      'Ticket Reference', 'Date Requested', 'Client Full Name', 'Client Contact',
      'Appliance Category', 'Unit Model', 'Repair Stage', 'Quoted Fee (PHP)',
      'Settled Amount (PHP)', 'Remaining Balance (PHP)', 'Payment Channel', 'Billing Status',
    ];

    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const csvContent = [
      headers.join(','),
      ...reportRows.map((r) =>
        [
          `#${r.ticket_reference}`, r.date_requested, r.client_full_name,
          r.client_contact || 'N/A', r.appliance_category, r.unit_model, r.repair_stage,
          Number(r.quoted_fee).toFixed(2), Number(r.settled_amount).toFixed(2),
          Number(r.remaining_balance).toFixed(2), r.payment_channel, r.billing_status,
        ].map(escapeCsv).join(',')
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

  const hasFilters = startDate || endDate || selectedYear !== 'ALL';

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <FileBarChart2 className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900">Reports & Export</h1>
            </div>
            <p className="mt-1 text-sm text-stone-500 ml-11">
              Filterable consolidated service and billing records. Export as CSV or print.
            </p>
          </div>

          <div className="no-print flex flex-wrap gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────── */}
        <div className="no-print flex flex-wrap items-end gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-500 sm:mr-2 sm:self-center">
            <Filter className="h-4 w-4 text-teal-600" />
            Filter:
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stone-500">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 focus:border-teal-600 focus:outline-none"
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
              className="rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-700 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-stone-500">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-700 focus:border-teal-600 focus:outline-none"
            />
          </div>

          {hasFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          <span className="ml-auto self-center text-xs text-stone-400">
            {!loading && `${reportRows.length} records`}
          </span>
        </div>

        {/* ── Report Table ──────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
              <Wrench className="h-4 w-4 text-teal-600" />
              Consolidated Service & Billing Report
            </div>
            <span className="text-xs text-stone-400">
              Joined across Repair Requests, Clients & Payments
            </span>
          </div>

          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
            </div>
          ) : reportRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14">
              <FileBarChart2 className="h-10 w-10 text-stone-200" />
              <p className="text-sm text-stone-400">No records match the selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="border-b border-stone-200 bg-stone-50 font-semibold uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-3.5">Ticket Ref</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Client Name</th>
                    <th className="px-4 py-3.5">Appliance</th>
                    <th className="px-4 py-3.5">Stage</th>
                    <th className="px-4 py-3.5">Quoted Fee</th>
                    <th className="px-4 py-3.5">Settled</th>
                    <th className="px-4 py-3.5">Billing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reportRows.map((row) => (
                    <tr key={row.ticket_reference} className="transition hover:bg-teal-50/30">
                      <td className="px-4 py-3 font-bold text-teal-700">
                        #{row.ticket_reference}
                      </td>
                      <td className="px-4 py-3 text-stone-500">{row.date_requested}</td>
                      <td className="px-4 py-3 font-medium text-stone-800">
                        {row.client_full_name}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{row.appliance_category}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                          {row.repair_stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        ₱{Number(row.quoted_fee).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">
                        ₱{Number(row.settled_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            row.billing_status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : row.billing_status === 'Partial'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {row.billing_status}
                        </span>
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

export default ExportReports;
