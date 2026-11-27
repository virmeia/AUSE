import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/admin/customers');
        setCustomers(data);
      } catch (error) {
        toast.error('Failed to load customer directory.');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      !term ||
      c.full_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone_number?.toLowerCase().includes(term) ||
      c.default_address?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Customer Directory</h1>
            <p className="mt-1 text-sm text-slate-500">
              View registered household accounts, default service locations, and service history.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <Users className="h-4 w-4 text-blue-600" />
            {customers.length} Registered Customer{customers.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Search */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or address..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-52 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No customers match your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Contact Information</th>
                    <th className="px-4 py-3.5">Default Service Address</th>
                    <th className="px-4 py-3.5">Requests</th>
                    <th className="px-4 py-3.5">Total Paid</th>
                    <th className="px-4 py-3.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.user_id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        {cust.full_name}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {cust.email}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {cust.phone_number || '—'}
                        </p>
                      </td>
                      <td className="max-w-xs px-4 py-4 text-xs text-slate-600">
                        <p className="flex items-start gap-1.5">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>{cust.default_address || 'No default address saved'}</span>
                        </p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-blue-600">
                        {cust.total_requests}
                      </td>
                      <td className="px-4 py-4 font-semibold text-emerald-600">
                        ₱{Number(cust.total_spent || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(cust.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Customers;