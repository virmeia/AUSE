import { useState, useEffect } from 'react';
import { Plus, Trash2, X, FileCheck2 } from 'lucide-react';
import api from '../api/axios';

const ItemizedQuoteModal = ({ request, onClose, onSaved }) => {
  const [items, setItems] = useState([
    { item_type: 'Diagnostic Fee', description: 'On-site inspection & troubleshooting', quantity: 1, unit_price: 350 },
  ]);
  const [adminNotes, setAdminNotes] = useState(request?.admin_notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!request) return;
    api
      .get(`/requests/${request.request_id}/quotation-items`)
      .then((res) => {
        if (res.data?.items?.length) {
          setItems(res.data.items);
        }
      })
      .catch(() => {});
  }, [request]);

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { item_type: 'Part', description: '', quantity: 1, unit_price: 0 },
    ]);
  };

  const removeRow = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateRow = (index, field, value) => {
    setItems((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const grandTotal = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/requests/${request.request_id}/quotation-items`, {
        items,
        admin_notes: adminNotes,
        status: 'Quoted',
      });
      onSaved?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save quotation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">
                Itemized Quotation — Ticket #{request.request_id}
              </h3>
              <p className="text-xs text-slate-500">
                {request.appliance_type} • {request.customer_name}
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

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2.5"
              >
                <select
                  value={item.item_type}
                  onChange={(e) => updateRow(idx, 'item_type', e.target.value)}
                  className="col-span-3 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value="Part">Part</option>
                  <option value="Labor">Labor</option>
                  <option value="Diagnostic Fee">Diagnostic</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  required
                  placeholder="Description (e.g. Dual Run Capacitor)"
                  value={item.description}
                  onChange={(e) => updateRow(idx, 'description', e.target.value)}
                  className="col-span-5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none"
                />

                <input
                  type="number"
                  min="1"
                  required
                  value={item.quantity}
                  onChange={(e) => updateRow(idx, 'quantity', e.target.value)}
                  className="col-span-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-xs font-semibold text-slate-900 outline-none"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="₱ Price"
                  value={item.unit_price}
                  onChange={(e) => updateRow(idx, 'unit_price', e.target.value)}
                  className="col-span-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-right text-xs font-bold text-slate-900 outline-none"
                />

                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  disabled={items.length === 1}
                  className="col-span-1 flex justify-center text-slate-400 hover:text-rose-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Line Item
            </button>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500">Total Estimate: </span>
              <span className="text-lg font-extrabold text-slate-950">
                ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Diagnosis Notes for Customer
            </label>
            <textarea
              rows={2}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Explain root cause, parts needed, and warranty coverage..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
            />
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
              className="rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-blue-800 hover:to-blue-600 disabled:opacity-60"
            >
              {saving ? 'Sending Quote...' : 'Send Itemized Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemizedQuoteModal;