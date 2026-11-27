import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Wrench, Upload, Calendar, MapPin, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const APPLIANCE_OPTIONS = [
  'Refrigerator',
  'Air Conditioner',
  'Washing Machine',
  'Microwave / Oven',
  'Electric Fan / Air Cooler',
  'Television / Home Audio',
  'Water Dispenser / Heater',
  'Other Home Appliance',
];

const NewRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applianceType, setApplianceType] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState(user?.default_address || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAppliances, setSavedAppliances] = useState([]);

  useEffect(() => {
    api
      .get('/appliances')
      .then((res) => setSavedAppliances(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const handleSelectSavedAppliance = (appliance) => {
    setApplianceType(appliance.appliance_type || '');
    setBrandModel(appliance.brand_model || '');
    toast.success(`Loaded ${appliance.appliance_type} from My Appliances!`);
  };

  const today = new Date().toISOString().split('T')[0];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applianceType) {
      return toast.error('Please select the type of appliance.');
    }
    if (!preferredDate) {
      return toast.error('Please choose your preferred visit date.');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('appliance_type', applianceType);
      formData.append('brand_model', brandModel);
      formData.append('problem_description', problemDescription);
      formData.append('service_address', serviceAddress);
      formData.append('preferred_date', preferredDate);
      if (imageFile) {
        formData.append('appliance_image', imageFile);
      }

      await api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Repair request submitted! Our team will review it shortly.');
      navigate('/customer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit repair request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link
            to="/customer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Repairs
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Submit New Repair Request</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tell us what is wrong with your appliance and when you would prefer a technician visit.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {savedAppliances.length > 0 && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-3.5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                Quick-Fill from My Saved Appliances
              </div>
              <div className="flex flex-wrap gap-2">
                {savedAppliances.map((app) => (
                  <button
                    key={app.appliance_id}
                    type="button"
                    onClick={() => handleSelectSavedAppliance(app)}
                    className="rounded-lg border border-cyan-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
                  >
                    {app.appliance_type}
                    {app.brand_model ? ` (${app.brand_model})` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Appliance Type & Brand/Model */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Appliance Type <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Wrench className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  required
                  value={applianceType}
                  onChange={(e) => setApplianceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
                >
                  <option value="" disabled>
                    -- Select an appliance --
                  </option>
                  {APPLIANCE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Brand & Model (Optional)
              </label>
              <input
                type="text"
                value={brandModel}
                onChange={(e) => setBrandModel(e.target.value)}
                placeholder="e.g., LG Inverter 2-Door"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Problem Description (Fixed size, no resize handle) */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows="4"
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the symptoms (e.g., not cooling, unusual noise, leaking water, won't turn on)..."
              className="w-full resize-none rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Service Address (Fixed size, no resize handle) */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Home Service Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <textarea
                required
                rows="2"
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                placeholder="House/Unit #, Street, Barangay, City"
                className="w-full resize-none rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Preferred Visit Date (Required) */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Preferred Service Visit Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative max-w-xs">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                required
                min={today}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Optional Image Attachment */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Photo of Appliance / Issue (Optional, Max 5MB)
            </label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition hover:border-cyan-500 hover:bg-cyan-50/40">
              <Upload className="h-5 w-5 text-slate-400" />
              <span className="mt-1 text-xs font-medium text-slate-600">
                {imageFile ? imageFile.name : 'Click to upload JPG, PNG, or WEBP'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 max-h-48 rounded-xl border border-slate-200 object-cover"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Link
              to="/customer/dashboard"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Repair Request
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewRequest;