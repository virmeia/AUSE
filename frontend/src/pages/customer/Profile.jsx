import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    default_address: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        default_address: user.default_address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateUserProfile(formData);
      toast.success('Profile and service address updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Profile & Service Address</h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your contact number and home-service address accurate for technician visits.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Read-only Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email Address (Account ID)
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-500"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Contact Number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phone_number"
                required
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="0917 123 4567"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          {/* Default Service Address */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Default Home-Service Address
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                name="default_address"
                rows="3"
                required
                value={formData.default_address}
                onChange={handleChange}
                placeholder="House/Unit No., Street, Barangay, City"
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              This address will automatically pre-fill when you submit a new repair request.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;