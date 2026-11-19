import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, User, Mail, Phone, MapPin, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

// Auto-format 11-digit PH mobile number into "0917 123 4567"
const formatPhoneNumber = (rawValue) => {
  const digits = rawValue.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    default_address: '',
    password: '',
    confirmPassword: '',
    agreed_terms: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone_number') {
      setFormData((prev) => ({ ...prev, phone_number: formatPhoneNumber(value) }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    if (!formData.agreed_terms) {
      return toast.error('Please agree to the Terms & Conditions to continue.');
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        default_address: formData.default_address,
        password: formData.password,
        agreed_terms: formData.agreed_terms,
      });

      login(data.token, data.user);
      toast.success('Welcome to AUSE! Your account is ready.');
      navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm"
          >
            <Wrench className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-900">Create Customer Account</h1>
          <p className="mt-1 text-xs text-stone-500">
            Book home-appliance repairs and track service visits easily.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Juan Dela Cruz"
                className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@example.com"
                className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Contact Number (Auto-formatted with spaces) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                name="phone_number"
                required
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="0917 123 4567"
                className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Default Home Address */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Default Home Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                name="default_address"
                required
                value={formData.default_address}
                onChange={handleChange}
                placeholder="Blk 4 Lot 12, Brgy. San Isidro, Caloocan City"
                className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Password (Stacked vertically) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Confirm Password (Stacked vertically on its own line) */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-stone-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="w-full rounded-xl border border-stone-300 py-2.5 pl-9 pr-3 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Terms & Conditions Agreement */}
          <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs text-stone-600">
            <input
              type="checkbox"
              name="agreed_terms"
              required
              checked={formData.agreed_terms}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-600"
            />
            <span>
              I have read and agree to the{' '}
              <Link
                to="/legal"
                target="_blank"
                className="font-semibold text-teal-700 underline hover:text-teal-800"
              >
                Terms & Conditions and Service Agreement
              </Link>{' '}
              <span className="text-red-500">*</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-700 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;