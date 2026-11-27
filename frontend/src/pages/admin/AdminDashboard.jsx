import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Wrench,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const formatPHP = (amount) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(amount || 0));

const APPLIANCE_COLORS = [
  'bg-blue-600',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-amber-400',
  'bg-rose-500',
];

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch from your core endpoints so KPIs always stay 100% synced
        const [reqRes, payRes] = await Promise.all([
          api.get('/requests'),
          api.get('/payments').catch(() => ({ data: [] })),
        ]);

        const reqList = Array.isArray(reqRes.data)
          ? reqRes.data
          : reqRes.data?.requests || [];
        const payList = Array.isArray(payRes.data)
          ? payRes.data
          : payRes.data?.payments || [];

        setRequests(reqList);
        setPayments(payList);

        // Optional analytics endpoint if configured
        const statsRes = await api.get('/reports/analytics').catch(() => ({ data: null }));
        if (statsRes.data) setAnalytics(statsRes.data);
      } catch (err) {
        console.error('Error syncing dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Compute live KPIs directly from synced database rows (with analytics fallback)
  const totalRevenue =
    analytics?.totalRevenue ??
    analytics?.total_revenue ??
    payments.reduce((sum, p) => sum + Number(p.amount_paid || p.amount || 0), 0);

  const totalRequests =
    analytics?.totalRequests ?? analytics?.total_requests ?? requests.length;

  const pendingOrQuoted =
    analytics?.pendingRequests ??
    requests.filter((r) => ['Pending', 'Quoted'].includes(r.status)).length;

  const completedRepairs =
    analytics?.completedRequests ??
    requests.filter((r) => r.status === 'Completed').length;

  // Group requests by appliance type dynamically
  const applianceCounts = requests.reduce((acc, r) => {
    const key = r.appliance_type || 'Other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const applianceList =
    analytics?.applianceBreakdown ||
    Object.entries(applianceCounts).map(([appliance_type, count]) => ({
      appliance_type,
      count,
    }));

  const totalAppliances = Math.max(
    applianceList.reduce((sum, item) => sum + Number(item.count || 0), 0),
    1
  );

  // Group payments by month dynamically
  const monthlyMap = payments.reduce((acc, p) => {
    const dateVal = p.payment_date || p.created_at;
    const monthLabel = dateVal
      ? new Date(dateVal).toLocaleString('en-US', { month: 'short' })
      : 'Recent';
    acc[monthLabel] = (acc[monthLabel] || 0) + Number(p.amount_paid || p.amount || 0);
    return acc;
  }, {});

  const monthlyRevenue =
    analytics?.monthlyRevenue ||
    Object.entries(monthlyMap).map(([month, total]) => ({ month, total }));

  const maxMonthly = Math.max(...monthlyRevenue.map((m) => Number(m.total || 0)), 1);

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: formatPHP(totalRevenue),
      sub: `${payments.length} verified payments`,
      icon: Wallet,
      iconBg: 'bg-emerald-500 shadow-emerald-500/25',
      subColor: 'text-emerald-600',
    },
    {
      label: 'Total Requests',
      value: totalRequests,
      sub: 'All logged repair tickets',
      icon: Wrench,
      iconBg: 'bg-blue-600 shadow-blue-600/25',
      subColor: 'text-blue-600',
    },
    {
      label: 'Pending & Quoted',
      value: pendingOrQuoted,
      sub: 'Awaiting review or approval',
      icon: Clock,
      iconBg: 'bg-amber-400 text-slate-950 shadow-amber-400/30',
      subColor: 'text-amber-600',
    },
    {
      label: 'Completed Repairs',
      value: completedRepairs,
      sub: 'Closed doorstep visits',
      icon: CheckCircle2,
      iconBg: 'bg-cyan-500 shadow-cyan-500/25',
      subColor: 'text-cyan-600',
    },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ── Top Welcome & Quick Report Shortcut ─────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Operations Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Real-time repair tickets, technician schedule queue, and revenue metrics.
            </p>
          </div>

          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-blue-800 hover:to-blue-600"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Reports
          </Link>
        </div>

        {/* ── Multi-Color Purity UI 4-Card KPI Grid ───────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-1.5 text-xl font-extrabold text-slate-950">
                    {loading ? '—' : card.value}
                  </p>
                  <p className={`mt-1 text-[11px] font-semibold ${card.subColor}`}>
                    {card.sub}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${card.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Visual Analytics Row ────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Monthly Revenue Bar Chart */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-7">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950">
                  Monthly Revenue Collection
                </h3>
                <p className="text-xs text-slate-400">
                  Verified service fees collected per month
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-950 p-6 text-white">
              {monthlyRevenue.length > 0 ? (
                <div className="flex h-44 items-end justify-between gap-3 pt-4">
                  {monthlyRevenue.map((item, idx) => {
                    const heightPct = Math.max(
                      Math.round((Number(item.total || 0) / maxMonthly) * 100),
                      14
                    );
                    return (
                      <div
                        key={item.month || idx}
                        className="group flex flex-1 flex-col items-center gap-2"
                      >
                        <span className="text-[10px] font-bold text-amber-300 opacity-0 transition group-hover:opacity-100">
                          {formatPHP(item.total)}
                        </span>
                        <div className="flex h-32 w-full max-w-[36px] items-end rounded-full bg-white/10 p-1">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full rounded-full bg-gradient-to-t from-blue-500 to-amber-300 transition-all duration-500"
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-300">
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center text-xs text-slate-400">
                  No payment records logged yet.
                </div>
              )}
            </div>
          </div>

          {/* Appliance Service Breakdown (Multi-color Progress Bars) */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950">
                    Requests by Appliance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Service demand across household units
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <PieChart className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {applianceList.length > 0 ? (
                  applianceList.map((item, idx) => {
                    const pct = Math.round(
                      (Number(item.count || 0) / totalAppliances) * 100
                    );
                    const barColor = APPLIANCE_COLORS[idx % APPLIANCE_COLORS.length];

                    return (
                      <div key={item.appliance_type} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">
                            {item.appliance_type}
                          </span>
                          <span className="font-semibold text-slate-500">
                            {item.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-10 text-center text-xs text-slate-400">
                    No repair requests submitted yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <Link
                to="/admin/requests"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700"
              >
                Open Full Repair Queue
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Recent Repair Requests Table ────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-950">
                Recent Service Requests
              </h3>
              <p className="text-xs text-slate-400">
                Latest incoming appliance tickets requiring diagnosis or scheduling
              </p>
            </div>
            <Link
              to="/admin/requests"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-900 transition hover:border-blue-300 hover:bg-white"
            >
              View All
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4">Ticket</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Appliance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quoted Fee</th>
                  <th className="pl-4 py-3 text-right">Preferred Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Syncing dashboard records...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No repair requests found.
                    </td>
                  </tr>
                ) : (
                  requests.slice(0, 6).map((r) => (
                    <tr
                      key={r.request_id || r.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="py-3.5 pr-4 font-bold text-slate-950">
                        #{r.request_id || r.id}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {r.customer_name || 'Customer'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{r.appliance_type}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            r.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : r.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-600'
                                : r.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">
                        {r.estimated_cost ? formatPHP(r.estimated_cost) : 'Pending Quote'}
                      </td>
                      <td className="pl-4 py-3.5 text-right text-slate-500">
                        {r.preferred_date
                          ? new Date(r.preferred_date).toLocaleDateString()
                          : 'Flexible'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;