import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Snowflake,
  ShieldCheck,
  WashingMachine,
  Microwave,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  CalendarCheck,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import auseLogo from '../../assets/ause-logo.png';
import landingPageBg from '../../assets/landingpage-bg.png';

/* ── Subtle Fade-Up Scroll Animation ───────────────────────────── */
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
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const SERVICES = [
  {
    name: 'Air Conditioners',
    desc: 'Cooling diagnostics, cleaning, freon recharge, and compressor care.',
    icon: Snowflake,
  },
  {
    name: 'Refrigerators',
    desc: 'Inverter cooling issues, thermostat calibration, and relay replacement.',
    icon: ShieldCheck,
  },
  {
    name: 'Washing Machines',
    desc: 'Spin, drainage, motor, and digital control board troubleshooting.',
    icon: WashingMachine,
  },
  {
    name: 'Microwaves & Fans',
    desc: 'Heating element, oscillation, motor, and power board repairs.',
    icon: Microwave,
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Submit Request',
    desc: 'Pick your appliance, describe the issue, and choose a preferred date.',
    icon: ClipboardList,
  },
  {
    num: '02',
    title: 'Approve Quote',
    desc: 'Review an itemized diagnosis and cost estimate online before we start.',
    icon: FileCheck2,
  },
  {
    num: '03',
    title: 'Doorstep Repair',
    desc: 'Confirmed arrival window with transparent billing and 30-day warranty.',
    icon: CalendarCheck,
  },
];

const LandingPage = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [inquiry, setInquiry] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard';

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySent(true);
    setInquiry({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-950">
      {/* ── 3-Column Sticky Navbar (Left Logo | Center Links | Right CTA) ── */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl grid-cols-2 items-center px-4 py-3.5 sm:px-6 md:grid-cols-3">
          {/* Left: Brand Logo */}
          <div className="justify-self-start">
            <Link to="/" className="flex items-center gap-2.5">
              {auseLogo && (
                <img
                  src={auseLogo}
                  alt="AUSE Logo"
                  className="h-9 w-auto object-contain"
                />
              )}
              <span className="text-xl font-black tracking-tight text-neutral-950">
                AUSE
              </span>
            </Link>
          </div>

          {/* Center: Clean Navigation Links */}
          <nav className="hidden items-center justify-center gap-7 md:flex">
            <a
              href="#services"
              className="text-xs font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Services
            </a>
            <a
              href="#process"
              className="text-xs font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Process
            </a>
            <a
              href="#contact"
              className="text-xs font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Contact
            </a>
            {!user && (
              <Link
                to="/login"
                className="text-xs font-bold text-neutral-900 transition hover:text-blue-600"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Right: Primary Gradient Action Button */}
          <div className="flex items-center justify-end gap-2">
            {!user && (
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 md:hidden"
              >
                Sign In
              </Link>
            )}
            <Link
              to={user ? dashboardPath : '/register'}
              className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-700 to-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-blue-800 hover:to-blue-600"
            >
              {user ? 'Dashboard' : 'Book a Repair'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Landing Page Background ────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {landingPageBg ? (
          <>
            <img
              src={landingPageBg}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-neutral-950/90 via-blue-950/80 to-blue-800/75" />
          </>
        ) : (
          <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-176 -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
        )}

        <div
          className={`relative mx-auto max-w-3xl px-4 text-center transition-all duration-700 ease-out sm:px-6 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
        >
          <div
            className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold shadow-xs ${
              landingPageBg
                ? 'border-white/25 bg-white/15 text-white backdrop-blur-sm'
                : 'border-blue-200/80 bg-white text-blue-700'
            }`}
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${landingPageBg ? 'text-blue-300' : 'text-blue-600'}`}
            />
            Appliance Utility Service & Engagement
          </div>

          <h1
            className={`text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.12] ${
              landingPageBg ? 'text-white' : 'text-neutral-950'
            }`}
          >
            Home appliance repair,{' '}
            <span className={landingPageBg ? 'text-blue-300' : 'text-blue-600'}>
              quoted transparently.
            </span>
          </h1>

          <p
            className={`mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg ${
              landingPageBg ? 'text-blue-100' : 'text-slate-500'
            }`}
          >
            Submit your appliance issue online, review and approve your repair estimate
            upfront, and track your scheduled technician visit in one clean portal.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={user ? dashboardPath : '/register'}
              className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-700 to-blue-500 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:from-blue-800 hover:to-blue-600 hover:shadow-lg"
            >
              {user ? 'Open Dashboard' : 'Book a Repair'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {!user && (
              <Link
                to="/login"
                className={`inline-flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                  landingPageBg
                    ? 'border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                    : 'border-slate-200 bg-white text-neutral-950 shadow-xs hover:border-blue-300'
                }`}
              >
                Track Request
              </Link>
            )}
          </div>

          <div
            className={`mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold ${
              landingPageBg ? 'text-blue-100' : 'text-slate-500'
            }`}
          >
            {['Upfront Quote Approval', 'No Hidden Charges', '30-Day Service Warranty'].map(
              (item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className={`h-4 w-4 ${landingPageBg ? 'text-blue-300' : 'text-blue-600'}`}
                  />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Services Section ────────────────────────────────────── */}
      <section id="services" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Services
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
                Essential Home Appliances
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.name} delay={idx * 90}>
                  <div className="group h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-base font-bold text-neutral-950">{item.name}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Process Section ─────────────────────────────────────── */}
      <section id="process" className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                Process
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
                Three Simple Steps
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.num} delay={idx * 100}>
                  <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-extrabold tracking-wider text-slate-300">
                        {step.num}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-neutral-950">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{step.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Minimalist Contact & Inquiry Section ────────────────── */}
      <section id="contact" className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <div className="grid grid-cols-1 gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-12">
              {/* Left Service Info */}
              <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Contact
                  </p>
                  <h2 className="mt-1.5 text-2xl font-extrabold text-neutral-950">
                    Questions or feedback?
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Need help checking if we service your appliance model or area? Send us a
                    quick inquiry and our support desk will get back to you.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>(02) 8555-0194 / +63 917 555 0194</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span>support@ause-repair.ph</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>Grace Park, Caloocan City, Metro Manila</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Mon – Sat, 8:00 AM – 5:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Right Quick Inquiry Form */}
              <div className="lg:col-span-7">
                {inquirySent ? (
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-blue-100 bg-blue-50/50 p-8 text-center">
                    <CheckCircle2 className="h-10 w-10 text-blue-600" />
                    <h3 className="mt-3 text-base font-bold text-neutral-950">
                      Inquiry Received
                    </h3>
                    <p className="mt-1 max-w-sm text-xs text-slate-500">
                      Thank you for reaching out. Our team will respond to your email within
                      business hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setInquirySent(false)}
                      className="mt-4 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={inquiry.name}
                          onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                          placeholder="Juan Dela Cruz"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={inquiry.email}
                          onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
                          placeholder="juan@email.com"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition focus:border-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Inquiry or Feedback
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={inquiry.message}
                        onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                        placeholder="Ask about an appliance issue, service coverage, or share feedback..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition focus:border-blue-600 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      Send Message
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Ready to Schedule Gradient CTA Banner ───────────────── */}
      <section className="py-16">
        <Reveal>
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-neutral-950 via-blue-900 to-blue-600 px-6 py-12 text-center text-white shadow-lg shadow-blue-950/15 sm:px-12">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Ready to schedule a home visit?
              </h2>
              <p className="mx-auto mt-2.5 max-w-md text-sm text-blue-100">
                Create your account in seconds and get an upfront repair quotation.
              </p>
              <div className="mt-7">
                <Link
                  to={user ? dashboardPath : '/register'}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-neutral-950 shadow-sm transition hover:bg-blue-50"
                >
                  {user ? 'Go to Dashboard' : 'Get Started'}
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Minimalist Footer (Terms & Conditions Moved Here) ───── */}
      <footer className="border-t border-slate-200/70 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:flex-row sm:px-6">
          <p>© 2026 AUSE — Appliance Utility Service & Engagement</p>
          <div className="flex items-center gap-6 font-semibold text-slate-500">
            <Link to="/legal" className="transition hover:text-blue-600">
              Terms & Conditions
            </Link>
            <Link to="/login" className="transition hover:text-blue-600">
              Portal Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;