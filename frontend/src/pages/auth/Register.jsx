import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PublicNavbar from '../../components/PublicNavbar';
import auseLogo from '../../assets/ause-logo.png';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreed_terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (!formData.agreed_terms) {
      return setError('Please read and agree to the Terms & Conditions.');
    }

    setLoading(true);
    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });
      navigate('/customer/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200/75 text-slate-800">
      {/* Soft Welcoming Blue Glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-300/35 blur-3xl" />

      {/* Persistent Horizontal Navbar */}
      <PublicNavbar />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg rounded-3xl border border-white/90 bg-white/95 p-8 shadow-xl shadow-blue-900/10 backdrop-blur-md sm:p-10">
          {/* Header */}
          <div className="text-center">
            <img
              src={auseLogo}
              alt="AUSE Logo"
              className="mx-auto mb-3 h-11 w-auto object-contain"
            />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
              Create your AUSE account
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">
              Book home-appliance repairs and review transparent quotations online.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3.5 pl-10 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0917 123 4567"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3.5 pl-10 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3.5 pl-10 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Home Service Address
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/Unit No., Street, Barangay, City"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3.5 pl-10 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-9 pl-10 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3.5 pl-10 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs text-slate-600">
              <input
                type="checkbox"
                name="agreed_terms"
                required
                checked={formData.agreed_terms}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
              <span>
                I have read and agree to the{' '}
                <Link
                  to="/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 underline hover:text-blue-700"
                >
                  Terms & Conditions and Service Agreement
                </Link>{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-800 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account & Book'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Footer Switch */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;