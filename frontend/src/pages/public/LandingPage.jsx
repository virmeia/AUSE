import { Link } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  CalendarCheck,
  FileCheck2,
  ArrowRight,
  Snowflake,
  WashingMachine,
  Microwave,
  Tv,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const APPLIANCES = [
  {
    name: 'Air Conditioners',
    desc: 'Split-type, window-type, cleaning, freon recharge, and compressor diagnostics.',
    icon: Snowflake,
  },
  {
    name: 'Refrigerators & Freezers',
    desc: 'Inverter and non-inverter cooling issues, thermostat, and relay repairs.',
    icon: ShieldCheck,
  },
  {
    name: 'Washing Machines',
    desc: 'Top-load and front-load spin, drainage, motor, and control board service.',
    icon: WashingMachine,
  },
  {
    name: 'Microwaves, Ovens & TVs',
    desc: 'Heating element replacement, power board troubleshooting, and home electronics.',
    icon: Microwave,
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Submit Your Repair Request',
    desc: 'Select your appliance, describe the issue, attach an optional photo, and pick your preferred visit date.',
    icon: Wrench,
  },
  {
    step: '02',
    title: 'Review Transparent Quotation',
    desc: 'Our technician team evaluates your ticket and sends an itemized diagnosis and cost estimate before any work begins.',
    icon: FileCheck2,
  },
  {
    step: '03',
    title: 'Scheduled Home-Service Visit',
    desc: 'Once you approve the quote, we confirm an arrival window and complete the repair right at your doorstep.',
    icon: CalendarCheck,
  },
];

const LandingPage = () => {
  const { user } = useAuth();

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-stone-900">
                AUSE
              </span>
              <span className="hidden text-xs font-medium text-stone-400 sm:inline">
                {' '}
                • Appliance Utility Service & Engagement
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/legal"
              className="hidden text-xs font-semibold text-stone-600 hover:text-teal-700 md:inline"
            >
              Terms & Agreements
            </Link>

            {user ? (
              <Link
                to={dashboardPath}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
                >
                  Book a Repair
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-stone-200 bg-linear-to-b from-white to-stone-100 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-semibold text-teal-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                Trusted Home-Appliance Diagnostics & Doorstep Repair
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl sm:leading-tight">
                Reliable appliance repair,{' '}
                <span className="text-teal-600">quoted transparently</span> before we visit.
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-stone-600">
                AUSE connects homeowners with certified repair technicians. Submit your
                appliance issue online, review and approve your quotation upfront, and track
                your scheduled home-service visit in real time.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  to={user ? dashboardPath : '/register'}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                >
                  {user ? 'Open My Dashboard' : 'Request Home Service'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                  >
                    Sign In to Track Request
                  </Link>
                )}
              </div>
            </div>

            {/* Right Info Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-md sm:p-8">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
                      Service Promise
                    </p>
                    <h2 className="mt-0.5 text-lg font-bold text-stone-900">
                      Why Homeowners Choose AUSE
                    </h2>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>

                <ul className="mt-5 space-y-4 text-sm">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-stone-900">
                        No Surprise Charges:
                      </span>{' '}
                      <span className="text-stone-600">
                        Review and approve your diagnosis fee or repair estimate online first.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-stone-900">
                        Conflict-Free Scheduling:
                      </span>{' '}
                      <span className="text-stone-600">
                        Confirmed 2-hour arrival windows so you never wait around all day.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <span className="font-semibold text-stone-900">
                        30-Day Service Warranty:
                      </span>{' '}
                      <span className="text-stone-600">
                        Digital service records and itemized billing receipts saved to your
                        account.
                      </span>
                    </div>
                  </li>
                </ul>

                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-stone-50 p-3.5 text-xs text-stone-600">
                  <PhoneCall className="h-4 w-4 shrink-0 text-teal-600" />
                  <span>
                    Service Hours: <strong>Mon – Sat, 8:00 AM – 5:00 PM</strong> (Metro Manila)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
              Simple 3-Step Process
            </p>
            <h2 className="mt-1 text-2xl font-bold text-stone-900 sm:text-3xl">
              How AUSE Home Repair Works
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-extrabold text-stone-300">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Appliances */}
      <section className="border-t border-stone-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
                What We Service
              </p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">
                Supported Household Appliances
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
              <Tv className="h-4 w-4 text-teal-600" />
              Plus Electric Fans, Water Dispensers & Small Appliances
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {APPLIANCES.map((app) => {
              const Icon = app.icon;
              return (
                <div
                  key={app.name}
                  className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 transition hover:border-teal-300 hover:bg-white"
                >
                  <Icon className="h-6 w-6 text-teal-600" />
                  <h3 className="mt-3 text-sm font-bold text-stone-900">{app.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-stone-600">{app.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer with Terms & Developer Contract Links */}
      <footer className="border-t border-stone-200 bg-stone-900 py-10 text-stone-400">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Wrench className="h-4 w-4 text-teal-400" />
              <span className="font-bold tracking-tight">
                AUSE — Appliance Utility Service & Engagement
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-400">
              © 2026 AUSE Home Appliance Services. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs font-medium">
            <Link to="/legal" className="text-stone-300 hover:text-teal-400">
              Terms & Conditions
            </Link>
            <Link to="/login" className="text-stone-300 hover:text-teal-400">
              Portal Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;