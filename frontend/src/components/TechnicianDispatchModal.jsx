import { useState, useEffect } from 'react';
import { UserCheck, Calendar, Clock, UserPlus, X, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const TIME_SLOTS = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM',
];

const TechnicianDispatchModal = ({ request, onClose, onAssigned }) => {
  const [technicians, setTechnicians] = useState([]);
  const [techId, setTechId] = useState(request?.technician_id || '');
  const [scheduledDate, setScheduledDate] = useState(
    request?.scheduled_date ? request.scheduled_date.slice(0, 10) : ''
  );
  const [scheduledTime, setScheduledTime] = useState(
    request?.scheduled_time || TIME_SLOTS[0]
  );

  // Quick Add Technician toggle
  const [showNewTech, setShowNewTech] = useState(false);
  const [newTech, setNewTech] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    specialty: 'Aircon & Refrigeration',
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTechnicians = async () => {
    try {
      const res = await api.get('/admin/technicians');
      setTechnicians(res.data || []);
    } catch {
      setTechnicians([]);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const handleCreateTech = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await api.post('/admin/technicians', newTech);
      await loadTechnicians();
      setTechId(res.data.technician_id);
      setShowNewTech(false);
      setNewTech({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        specialty: 'Aircon & Refrigeration',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add technician.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put(`/admin/requests/${request.request_id}/assign`, {
        technician_id: techId,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
      });
      onAssigned?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not assign technician.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">
                Assign Technician — Ticket #{request.request_id}
              </h3>
              <p className="text-xs text-slate-500">
                {request.appliance_type} • {request.service_address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showNewTech ? (
          <form onSubmit={handleCreateTech} className="mt-5 space-y-3">
            <p className="text-xs font-extrabold text-slate-950">
              Register New Technician
            </p>
            <input
              type="text"
              required
              placeholder="Full Name (e.g. Carlo Mendoza)"
              value={newTech.full_name}
              onChange={(e) => setNewTech({ ...newTech, full_name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-blue-600 focus:bg-white"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="email"
                required
                placeholder="Email"
                value={newTech.email}
                onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-blue-600 focus:bg-white"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newTech.phone_number}
                onChange={(e) =>
                  setNewTech({ ...newTech, phone_number: e.target.value })
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="password"
                required
                placeholder="Temporary Password"
                value={newTech.password}
                onChange={(e) => setNewTech({ ...newTech, password: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-blue-600 focus:bg-white"
              />
              <input
                type="text"
                placeholder="Specialty"
                value={newTech.specialty}
                onChange={(e) => setNewTech({ ...newTech, specialty: e.target.value })}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewTech(false)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                {saving ? 'Creating...' : 'Save Technician'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAssign} className="mt-5 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Select Field Technician
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewTech(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  + New Technician
                </button>
              </div>
              <select
                required
                value={techId}
                onChange={(e) => setTechId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="">-- Choose Technician --</option>
                {technicians.map((t) => (
                  <option key={t.user_id} value={t.user_id}>
                    {t.full_name} ({t.specialty || 'General'}) — {t.active_jobs} active
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  Visit Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  Arrival Window
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving ? 'Dispatching...' : 'Confirm & Dispatch'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TechnicianDispatchModal;