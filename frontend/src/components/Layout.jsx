import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  LayoutDashboard,
  PlusCircle,
  User,
  ClipboardList,
  Users,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  CheckCheck,
  History,
  Scale,
  FileBarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Layout = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const customerLinks = [
    { to: '/customer/dashboard', label: 'My Repairs', icon: LayoutDashboard },
    { to: '/customer/new-request', label: 'New Repair Request', icon: PlusCircle },
    { to: '/customer/profile', label: 'Profile & Address', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/reports', label: 'Reports & Export', icon: FileBarChart2 },
    { to: '/admin/requests', label: 'Service Requests', icon: ClipboardList },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/activity-logs', label: 'Activity Logs', icon: History },
    { to: '/admin/developer-contract', label: 'Developer Contract', icon: Scale },
  ];

  const navLinks = isAdmin ? adminLinks : customerLinks;

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/admin/notifications');
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // Endpoint will become active on Day 6
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.put('/admin/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {
      // Ignore if endpoint not yet mounted
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.put(`/admin/notifications/${notif.notification_id}/read`);
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notif.notification_id ? { ...n, is_read: 1 } : n
          )
        );
      } catch {
        // Ignore if endpoint not yet mounted
      }
    }
    setNotifOpen(false);
    if (notif.request_id) {
      navigate(isAdmin ? '/admin/requests' : `/customer/requests/${notif.request_id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-teal-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-teal-950 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-teal-900/70 px-5">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 shadow-lg shadow-teal-500/30 group-hover:bg-teal-400 transition-colors">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-teal-200 transition-colors">AUSE</span>
              <span className="ml-2 rounded-md bg-teal-800/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                {user?.role}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-teal-400 hover:bg-teal-900 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-500/20 text-white shadow-sm ring-1 ring-teal-500/30'
                    : 'text-teal-200/70 hover:bg-teal-900/60 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active left-bar indicator */}
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-teal-400 transition-all duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-300' : 'text-teal-400/60 group-hover:text-teal-300'
                    }`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer & Logout */}
        <div className="border-t border-teal-900/70 p-4">
          <div className="mb-3 rounded-xl bg-teal-900/50 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
            <p className="truncate text-xs text-teal-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-400/80 transition hover:bg-teal-900/60 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Wrapper ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden text-sm font-medium text-stone-400 sm:block">
            Appliance Utility Service and Engagement
          </div>

          {/* Notification Bell */}
          <div className="relative ml-auto" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative rounded-xl p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                  <span className="text-sm font-bold text-stone-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-stone-400">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.notification_id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`block w-full px-4 py-3 text-left transition hover:bg-stone-50 ${
                          !notif.is_read ? 'bg-teal-50/60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-stone-800">{notif.title}</p>
                          {!notif.is_read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-stone-500">{notif.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;