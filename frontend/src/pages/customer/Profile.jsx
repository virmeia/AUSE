import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Save, Loader2, Wrench, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    default_address: '',
  });
  const [saving, setSaving] = useState(false);
  const [appliances, setAppliances] = useState([]);
  const [newAppliance, setNewAppliance] = useState({
    appliance_type: 'Air Conditioner',
    brand_model: '',
    serial_number: '',
    purchase_year: '',
  });
  const [addingAppliance, setAddingAppliance] = useState(false);

  const loadAppliances = async () => {
    try {
      const { data } = await api.get('/appliances');
      setAppliances(Array.isArray(data) ? data : []);
    } catch {
      // Ignore if not loaded
    }
  };

  useEffect(() => {
    loadAppliances();
  }, []);

  const handleAddAppliance = async (e) => {
    e.preventDefault();
    setAddingAppliance(true);
    try {
      await api.post('/appliances', newAppliance);
      toast.success('Appliance saved!');
      setNewAppliance({
        appliance_type: 'Air Conditioner',
        brand_model: '',
        serial_number: '',
        purchase_year: '',
      });
      loadAppliances();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save appliance.');
    } finally {
      setAddingAppliance(false);
    }
  };

  const handleDeleteAppliance = async (applianceId) => {
    try {
      await api.delete(`/appliances/${applianceId}`);
      setAppliances((prev) => prev.filter((a) => a.appliance_id !== applianceId));
      toast.success('Appliance removed.');
    } catch {
      toast.error('Failed to remove appliance.');
    }
  };

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
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Profile & Service Address</h1>
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

        {/* Saved Customer Appliances ("My Home") */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900">My Saved Appliances</h2>
              <p className="text-xs text-slate-500">
                Save your home appliances for 1-click booking on future repair requests.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddAppliance} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <select
              value={newAppliance.appliance_type}
              onChange={(e) =>
                setNewAppliance((p) => ({ ...p, appliance_type: e.target.value }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="Air Conditioner">Air Conditioner</option>
              <option value="Refrigerator">Refrigerator</option>
              <option value="Washing Machine">Washing Machine</option>
              <option value="Microwave / Oven">Microwave / Oven</option>
              <option value="Electric Fan / Air Cooler">Electric Fan / Air Cooler</option>
              <option value="Television / Home Audio">Television / Home Audio</option>
              <option value="Water Dispenser / Heater">Water Dispenser / Heater</option>
              <option value="Other Home Appliance">Other Home Appliance</option>
            </select>
            <input
              type="text"
              placeholder="Brand & Model (e.g., LG Dual Inverter)"
              value={newAppliance.brand_model}
              onChange={(e) =>
                setNewAppliance((p) => ({ ...p, brand_model: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Serial # / Year (Optional)"
              value={newAppliance.serial_number}
              onChange={(e) =>
                setNewAppliance((p) => ({ ...p, serial_number: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={addingAppliance}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Appliance
            </button>
          </form>

          {appliances.length === 0 ? (
            <p className="text-xs text-slate-400">No appliances saved yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {appliances.map((app) => (
                <div
                  key={app.appliance_id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{app.appliance_type}</p>
                    <p className="text-[11px] text-slate-500">
                      {app.brand_model || 'No model specified'}
                      {app.serial_number ? ` • SN: ${app.serial_number}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAppliance(app.appliance_id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Remove appliance"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;