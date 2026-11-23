import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  DollarSign,
  Users,
  ArrowRight,
  Loader2,
  TrendingUp,
  BarChart2,
  FileBarChart2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from 'recharts';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import api from '../../api/axios';

/* ── Animated KPI count-up hook ───────────────────────────────── */
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) { setValue(0); return; }
    const num = Number(target);
    const steps = 40;
    const step = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, num);
      setValue(Math.floor(current));
      if (current >= num) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

/* ── Custom Tooltip for AreaChart ─────────────────────────────── */
const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-teal-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-stone-700 mb-1">{label}</p>
      <p className="text-teal-600 font-semibold">
        ₱{Number(payload[0].value).toLocaleString()}
      </p>
      {payload[0].payload.paid_jobs !== undefined && (
        <p className="text-stone-400 mt-0.5">{payload[0].payload.paid_jobs} jobs paid</p>
      )}
    </div>
  );
};

const TEAL_SHADES = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'];

const AdminDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/admin/reports');
        setReportData(data);
      } catch {
        toast.error('Failed to load dashboard analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const summary = reportData?.summary || {};
  const applianceBreakdown = reportData?.applianceBreakdown || [];
  const monthlyTrend = reportData?.monthlyTrend || [];

  const totalTickets = Number(summary.total_requests || 0);
  const completionRate =
    totalTickets > 0
      ? Math.round((Number(summary.completed_requests || 0) / totalTickets) * 100)
      : 0;

  /* Recharts data */
  const areaData = monthlyTrend.map((m) => ({
    name: m.month_label,
    revenue: Number(m.collected_revenue || 0),
    paid_jobs: m.paid_jobs,
  }));

  const barData = applianceBreakdown.map((item, i) => ({
    name: item.category_name,
    count: Number(item.request_count),
    color: TEAL_SHADES[i % TEAL_SHADES.length],
    pct:
      totalTickets > 0
        ? Math.round((Number(item.request_count) / totalTickets) * 100)
        : 0,
  }));

  /* Animated KPI values */
  const animRevenue = useCountUp(summary.total_revenue, 1000);
  const animQueue = useCountUp(
    Number(summary.pending_requests || 0) + Number(summary.active_requests || 0),
    700
  );
  const animCompleted = useCountUp(summary.completed_requests, 800);
  const animCustomers = useCountUp(summary.total_customers, 600);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ── Page Header ───────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Operations Dashboard</h1>
            <p className="mt-1 text-sm text-stone-500">
              Real-time service performance overview and revenue analytics.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/requests"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              Manage Queue
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/reports"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
            >
              <FileBarChart2 className="h-4 w-4 text-teal-600" />
              View Reports
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            {/* ── KPI Cards ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Revenue */}
              <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-50 opacity-60" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Collected Revenue
                  </span>
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <p className="kpi-value mt-3 text-2xl font-bold text-emerald-600">
                  ₱{animRevenue.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  Unpaid: ₱{Number(summary.pending_balance || 0).toLocaleString()}
                </p>
              </div>

              {/* Queue */}
              <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-amber-50 opacity-60" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Active & Pending
                  </span>
                  <div className="rounded-xl bg-amber-50 p-2.5 text-amber-500">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <p className="kpi-value mt-3 text-2xl font-bold text-stone-900">{animQueue}</p>
                <p className="mt-1 text-xs text-stone-400">
                  {summary.pending_requests || 0} new · {summary.scheduled_visits || 0} scheduled
                </p>
              </div>

              {/* Completed */}
              <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-teal-50 opacity-70" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Completed Repairs
                  </span>
                  <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <p className="kpi-value mt-3 text-2xl font-bold text-teal-700">
                  {animCompleted}{' '}
                  <span className="text-xs font-medium text-stone-400">({completionRate}%)</span>
                </p>
                <p className="mt-1 text-xs text-stone-400">
                  {summary.cancelled_requests || 0} cancelled · {totalTickets} total
                </p>
              </div>

              {/* Customers */}
              <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-teal-50 opacity-50" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    Registered Clients
                  </span>
                  <div className="rounded-xl bg-teal-50 p-2.5 text-teal-500">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <p className="kpi-value mt-3 text-2xl font-bold text-stone-900">{animCustomers}</p>
                <p className="mt-1 text-xs text-stone-400">Active household accounts</p>
              </div>
            </div>

            {/* ── Charts Row ────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Area Chart: Monthly Revenue */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-teal-50 p-1.5 text-teal-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold text-stone-900">Monthly Collected Revenue</span>
                  </div>
                  <span className="text-xs text-stone-400">PHP (₱)</span>
                </div>

                {areaData.length === 0 ? (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-stone-50 text-xs text-stone-400">
                    No payment data for the selected period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f4" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#78716c' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#78716c' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₱${v.toLocaleString()}`}
                        width={72}
                      />
                      <Tooltip content={<RevenueTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        fill="url(#tealGrad)"
                        dot={{ fill: '#0d9488', r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Horizontal Bar Chart: Appliance Demand */}
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <div className="rounded-lg bg-teal-50 p-1.5 text-teal-600">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-stone-900">Demand by Appliance</span>
                </div>

                {barData.length === 0 ? (
                  <p className="text-xs text-stone-400">No repair requests in this range.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      layout="vertical"
                      data={barData}
                      margin={{ top: 0, right: 32, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={110}
                        tick={{ fontSize: 11, fill: '#78716c' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(v, _, props) => [`${v} tickets (${props.payload.pct}%)`, 'Requests']}
                        contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e7e5e4' }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={800}>
                        {barData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey="count"
                          position="right"
                          style={{ fontSize: 11, fontWeight: 600, fill: '#44403c' }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ── Quick Links Row ───────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Service Requests', to: '/admin/requests', icon: Wrench, color: 'teal' },
                { label: 'Customers', to: '/admin/customers', icon: Users, color: 'teal' },
                { label: 'Payments', to: '/admin/payments', icon: DollarSign, color: 'emerald' },
                { label: 'Activity Logs', to: '/admin/activity-logs', icon: Clock, color: 'stone' },
              ].map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/40 hover:text-teal-700"
                >
                  <Icon className="h-4 w-4 text-teal-600 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;