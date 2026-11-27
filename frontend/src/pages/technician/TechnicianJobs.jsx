import { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Camera,
  PenTool,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const SignaturePad = ({ onChange }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) * canvas.width) / rect.width,
      y: ((clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const startDraw = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    if (e.touches) e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(canvasRef.current.toDataURL('image/png'));
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
          <PenTool className="h-3 w-3 text-blue-600" />
          Customer E-Signature
        </span>
        <button
          type="button"
          onClick={clearPad}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600"
        >
          <RotateCcw className="h-3 w-3" />
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={420}
        height={110}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        className="w-full touch-none rounded-xl border border-slate-200 bg-slate-50"
      />
    </div>
  );
};

const TechnicianJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [notesMap, setNotesMap] = useState({});
  const [photoMap, setPhotoMap] = useState({});
  const [signatureMap, setSignatureMap] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/technician/my-jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to load technician jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleComplete = async (jobId) => {
    setSubmittingId(jobId);
    try {
      const formData = new FormData();
      formData.append(
        'technician_notes',
        notesMap[jobId] || 'Completed on-site repair and tested unit.'
      );
      if (signatureMap[jobId]) {
        formData.append('customer_signature', signatureMap[jobId]);
      }
      if (photoMap[jobId]) {
        formData.append('after_photo', photoMap[jobId]);
      }

      await api.put(`/technician/jobs/${jobId}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Job marked Completed with 30-day warranty!');
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update job status.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            My Assigned Visits
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View scheduled home visits, upload after-repair proof, and capture customer sign-off.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-xs text-slate-400">
            Loading assigned dispatches...
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center text-xs text-slate-400">
            No service visits assigned to you yet.
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.request_id}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-blue-600">
                        Ticket #{job.request_id}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {job.appliance_type} — {job.customer_name}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      job.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-600 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>
                      {job.scheduled_date
                        ? new Date(job.scheduled_date).toLocaleDateString()
                        : 'TBD'}{' '}
                      ({job.scheduled_time || job.arrival_window || 'Standard Window'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span>{job.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="truncate">{job.service_address || job.customer_address}</span>
                  </div>
                </div>

                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <strong className="text-slate-900">Reported Issue:</strong>{' '}
                  {job.problem_description || job.issue_description}
                </p>

                {job.status !== 'Completed' ? (
                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    <input
                      type="text"
                      placeholder="Enter work performed / parts replaced..."
                      value={notesMap[job.request_id] || ''}
                      onChange={(e) =>
                        setNotesMap({ ...notesMap, [job.request_id]: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                          <Camera className="h-3 w-3 text-blue-600" />
                          After-Repair Photo (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) =>
                            setPhotoMap({ ...photoMap, [job.request_id]: e.target.files?.[0] || null })
                          }
                          className="block w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-50 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-blue-700"
                        />
                      </div>

                      <SignaturePad
                        onChange={(sig) =>
                          setSignatureMap((prev) => ({ ...prev, [job.request_id]: sig }))
                        }
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        disabled={submittingId === job.request_id}
                        onClick={() => handleComplete(job.request_id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {submittingId === job.request_id ? 'Completing...' : 'Mark Job Completed'}
                      </button>
                    </div>
                  </div>
                ) : (
                  job.warranty_expires_at && (
                    <p className="mt-3 text-xs font-semibold text-emerald-700">
                      ✓ Completed • 30-Day Warranty valid until{' '}
                      {new Date(job.warranty_expires_at).toLocaleDateString()}
                    </p>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TechnicianJobs;
