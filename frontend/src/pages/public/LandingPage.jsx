import { useState, useEffect, useRef } from 'react';
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
  Wind,
  CheckCircle2,
  PhoneCall,
  Star,
  Clock,
  BadgeDollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Replace this with your actual hero photo in src/assets/, e.g.:
// import heroBg from '../../assets/hero-repair.jpg';
const heroBg = '';

/* ── Lightweight Scroll-Reveal Animation Wrapper ──────────────── */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const HERO_PILLARS = [
  {
    num: '01',
    title: 'Quality Appliance Repair',
    desc: 'Expert diagnostics and repair for essential household appliances.',
  },
  {
    num: '02',
    title: 'Upfront Cost Quotations',
    desc: 'Review and approve itemized repair estimates before any work starts.',
  },
  {
    num: '03',
    title: 'Scheduled Doorstep Visits',
    desc: 'Confirmed arrival windows with digital service and payment records.',
  },
];

const APPLIANCES = [
  {
    tag: 'Comfort',
    name: 'Air Conditioners',
    desc: 'Split-type and window-type cooling diagnostics, cleaning, and compressor service.',
    icon: Snowflake,
  },
  {
    tag: 'Kitchen',
    name: 'Refrigerators',
    desc: 'Inverter and non-inverter cooling issues, thermostat, and relay repairs.',
    icon: ShieldCheck,
  },
  {
    tag: 'Laundry',
    name: 'Washing Machines',
    desc: 'Top-load and front-load spin, drainage, motor, and control board troubleshooting.',
    icon: WashingMachine,
  },
  {
    tag: 'Kitchen & Home',
    name: 'Microwaves & Electric Fans',
    desc: 'Heating element replacement, oscillation, motor, and power board repairs.',
    icon: Microwave,
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Submit Request',
    desc: 'Choose your appliance, describe the issue, and upload a reference photo.',
    icon: Wrench,
  },
  {
    step: '02',
    title: 'Approve Quote',
    desc: 'Review our technician diagnosis and estimated repair fee online.',
    icon: FileCheck2,
  },
  {
    step: '03',
    title: 'Schedule Visit',
    desc: 'Get a confirmed home-service date and arrival time window.',
    icon: CalendarCheck,
  },
  {
    step: '04',
    title: 'Service Done',
    desc: 'Appliance repaired on-site with transparent billing and warranty.',
    icon: CheckCircle2,
  },
];

const REVIEWS = [
  {
    initial: 'C',
    name: 'Chantal P.',
    service: 'Air Conditioner',
    comment: 'Communicative, fast, and clean. Explains the diagnosis clearly before fixing.',
  },
  {
    initial: 'J',
    name: 'Jonel B.',
    service: 'Refrigerator',
    comment: 'Very efficient and helpful. Transparent quotation with no surprise fees.',
  },
  {
    initial: 'M',
    name: 'Marie B.',
    service: 'Washing Machine',
    comment: 'Arrived right on the scheduled window and got our washer spinning again fast.',
  },
];

const LandingPage = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* ── Top Navbar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform duration-300 group-hover:rotate-12">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-neutral-950">
                AUSE
              </span>
              <span className="hidden text-xs font-medium text-neutral-500 sm:inline">
                {' '}
                • Appliance Utility Service & Engagement
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <a
              href="#services"
              className="hidden text-xs font-semibold text-neutral-600 transition-colors hover:text-blue-600 md:inline"
            >
              Services
            </a>
            <a
              href="#workflow"
              className="hidden text-xs font-semibold text-neutral-600 transition-colors hover:text-blue-600 md:inline"
            >
              How It Works
            </a>
            <Link
              to="/legal"
              className="hidden text-xs font-semibold text-neutral-600 transition-colors hover:text-blue-600 md:inline"
            >
              Terms
            </Link>

            {user ? (
              <Link
                to={dashboardPath}
                className="group inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-neutral-800 transition hover:bg-neutral-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-neutral-950 shadow-sm transition hover:bg-amber-300"
                >
                  Book Now!
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Full-Bleed Hero with Background Image + Blue Gradient Overlay ── */}
      <section className="relative overflow-hidden bg-neutral-950 py-16 text-white sm:py-24">
        {/* Background Picture Layer */}
        {heroBg && (
          <img
            src={heroBg}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center scale-105 transition-transform duration-1000"
          />
        )}

        {/* Deep Black-to-Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-blue-950/85 to-blue-800/75" />

        {/* Subtle Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 right-10 h-80 w-80 animate-pulse rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {/* Hero Main Copy */}
          <div
            className={`max-w-2xl space-y-6 transition-all duration-700 ease-out ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-950/60 px-3.5 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-sm">
              <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" />
              Trusted Home Appliance Repair in PH
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl sm:leading-tight">
              Professional appliance repair{' '}
              <span className="text-amber-400">at your doorstep.</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-blue-100/90">
              Booking an appliance repair shouldn&apos;t be a headache. Submit your request
              online, approve your diagnosis quotation upfront, and track your scheduled
              home-service visit with AUSE.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                to={user ? dashboardPath : '/register'}
                className="group inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-neutral-950 shadow-lg shadow-amber-400/20 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
              >
                {user ? 'Open My Dashboard' : 'Book a Repair Request'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
                >
                  Track Existing Request
                </Link>
              )}
            </div>

            <div className="flex flex-wrap gap-5 pt-2 text-xs font-semibold text-blue-100">
              {['No Hidden Fees', 'Upfront Quote Approval', '30-Day Service Warranty'].map(
                (item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          {/* 3-Column Numbered Pillars (Staggered Entrance) */}
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {HERO_PILLARS.map((item, idx) => (
              <div
                key={item.num}
                style={{ transitionDelay: `${200 + idx * 120}ms` }}
                className={`rounded-2xl border border-white/15 bg-neutral-950/65 p-6 backdrop-blur-md transition-all duration-700 hover:-translate-y-1 hover:border-amber-400/60 ${
                  mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                }`}
              >
                <span className="inline-block rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black text-neutral-950">
                  {item.num}
                </span>
                <h3 className="mt-3 text-base font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-blue-100/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── High-Contrast Black Stats & Value Strip ─────────────── */}
      <section className="border-t border-neutral-800 bg-neutral-950 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="grid grid-cols-2 gap-6 border-b border-neutral-800 pb-10 md:grid-cols-4">
              {[
                { value: '500+', label: 'Appliances Repaired' },
                { value: '5 Core', label: 'Home Appliance Categories' },
                { value: '100%', label: 'Quote Approval First' },
                { value: '30 Days', label: 'Service Workmanship Warranty' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-extrabold text-blue-500">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-neutral-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Clock,
                title: 'Earliest Consultation',
                desc: 'Fast online request review and diagnosis feedback.',
              },
              {
                icon: Wrench,
                title: 'Customized Solution',
                desc: 'Targeted troubleshooting tailored to your appliance issue.',
              },
              {
                icon: BadgeDollarSign,
                title: 'Affordable Pricing',
                desc: 'Transparent peso estimates with zero hidden charges.',
              },
              {
                icon: Wind,
                title: 'All-In-One Care',
                desc: 'From cooling units to laundry and kitchen essentials.',
              },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <Reveal key={title} delay={idx * 100}>
                <div className="group h-full rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-neutral-950 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported Appliances (Our Services) ─────────────────── */}
      <section id="services" className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                  Our Services
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
                  Supported Home Appliances
                </h2>
              </div>
              <p className="text-xs font-medium text-neutral-500">
                Covers Refrigerators, Washing Machines, Air Conditioners, Electric Fans & Microwaves
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {APPLIANCES.map((app, idx) => {
              const Icon = app.icon;
              return (
                <Reveal key={app.name} delay={idx * 100}>
                  <div className="group h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-600 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-bold text-neutral-700 transition-colors group-hover:bg-amber-400 group-hover:text-neutral-950">
                        {app.tag} →
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-neutral-950">{app.name}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">{app.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4-Step Simple Workflow ──────────────────────────────── */}
      <section id="workflow" className="border-t border-neutral-200 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="rounded-full bg-blue-50 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-600">
                Simple Workflow
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
                How AUSE Works
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.step} delay={idx * 110}>
                  <div className="group h-full rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-600 hover:bg-white hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-black text-neutral-300 transition-colors group-hover:text-amber-400">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-neutral-950">{item.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Customer Reviews Strip ──────────────────────────────── */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                  Reviews
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-neutral-950">
                  Hear It from Our Customers
                </h2>
              </div>
              <div className="hidden items-center gap-1 text-amber-400 sm:flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {REVIEWS.map((rev, idx) => (
              <Reveal key={rev.name} delay={idx * 100}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-sm font-extrabold text-amber-400">
                      {rev.initial}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-950">{rev.name}</p>
                      <span className="text-xs font-semibold text-blue-600">{rev.service}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-neutral-600">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blue + Yellow CTA Banner ────────────────────────────── */}
      <section className="bg-blue-600 py-14 text-white">
        <Reveal>
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-neutral-950/30 px-3.5 py-1.5 text-xs font-semibold text-amber-300">
              <PhoneCall className="h-3.5 w-3.5" />
              Service Hours: Mon – Sat, 8:00 AM – 5:00 PM
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Need a reliable technician at your doorstep?
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Create an account in seconds, submit your appliance issue, and review your quote
              before scheduling.
            </p>
            <div className="mt-6">
              <Link
                to={user ? dashboardPath : '/register'}
                className="group inline-flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-extrabold text-neutral-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-amber-300"
              >
                {user ? 'Go to Dashboard' : 'Book Now!'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Crisp Black Footer ──────────────────────────────────── */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-10 text-neutral-400">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Wrench className="h-4 w-4 text-amber-400" />
              <span className="font-extrabold tracking-tight">
                AUSE — Appliance Utility Service & Engagement
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              © 2026 AUSE Home Appliance Services. All rights reserved.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs font-semibold">
            <Link to="/legal" className="text-neutral-300 transition hover:text-amber-400">
              Terms & Conditions
            </Link>
            <Link to="/login" className="text-neutral-300 transition hover:text-blue-400">
              Portal Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;