import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Clock } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const ManageInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inquiries');
      setInquiries(res.data || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}`, { status });
      fetchInquiries();
    } catch {
      alert('Failed to update inquiry status.');
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Customer Inquiries</h1>
          <p className="mt-1 text-sm text-slate-500">
            Messages and feedback submitted from the public landing page contact form.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="py-8 text-center text-xs text-slate-400">Loading inquiries...</p>
          ) : inquiries.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No inquiries yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {inquiries.map((inq) => (
                <div
                  key={inq.inquiry_id}
                  className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-extrabold text-slate-950">
                        {inq.sender_name}
                      </span>
                      <span className="text-xs text-slate-400">{inq.sender_email}</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          inq.status === 'New'
                            ? 'bg-amber-50 text-amber-700'
                            : inq.status === 'Replied'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{inq.message}</p>
                    <p className="text-[10px] text-slate-400">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {new Date(inq.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <a
                      href={`mailto:${inq.sender_email}?subject=Re: AUSE Appliance Service Inquiry`}
                      onClick={() => updateStatus(inq.inquiry_id, 'Replied')}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Reply via Email
                    </a>
                    {inq.status !== 'Resolved' && (
                      <button
                        onClick={() => updateStatus(inq.inquiry_id, 'Resolved')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ManageInquiries;