import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import auseLogo from '../assets/ause-logo.png';

const PublicNavbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'technician'
        ? '/technician/jobs'
        : '/customer/dashboard';

  return (
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
            <span className="text-xl font-black tracking-tight text-slate-950">
              AUSE
            </span>
          </Link>
        </div>

        {/* Center: Clean Navigation Links */}
        <nav className="hidden items-center justify-center gap-7 md:flex">
          <a
            href="/#services"
            className="text-xs font-semibold text-slate-600 transition hover:text-blue-600"
          >
            Services
          </a>
          <a
            href="/#process"
            className="text-xs font-semibold text-slate-600 transition hover:text-blue-600"
          >
            Process
          </a>
          <a
            href="/#contact"
            className="text-xs font-semibold text-slate-600 transition hover:text-blue-600"
          >
            Contact
          </a>
          {!user && (
            <Link
              to="/login"
              className={`text-xs font-bold transition ${
                pathname === '/login'
                  ? 'text-blue-600'
                  : 'text-slate-900 hover:text-blue-600'
              }`}
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
              className={`rounded-xl px-3 py-2 text-xs font-bold transition md:hidden ${
                pathname === '/login'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Sign In
            </Link>
          )}
          <Link
            to={user ? dashboardPath : '/register'}
            className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-cyan-600"
          >
            {user ? 'Dashboard' : 'Book a Repair'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;