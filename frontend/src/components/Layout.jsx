import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    { to: '/admin/dashboard', label: 'Dashboard & Reports', icon: LayoutDashboard },
    { to: '/admin/requests', label: 'Service Requests', icon: ClipboardList },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/activity-logs', label: 'Activity Logs', icon: History },
    { to: '/admin/developer-contract', label: 'Developer Contract', icon: Scale },
  ];

  const navLinks = isAdmin ? adminLinks : customerLinks;

  // Fetch notifications (gracefully ignores 404 before Day 6 adminRoutes is mounted)
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

  // Close notification dropdown on outside click
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
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">AUSE</span>
              <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Footer & Logout */}
        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-semibold text-white">{user?.full_name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-slate-800 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden text-sm text-slate-500 sm:block">
            Appliance Utility Service and Engagement
          </div>

          {/* Right Actions: Notification Bell */}
          <div className="relative ml-auto" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.notification_id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`block w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                          !notif.is_read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                          {!notif.is_read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600">{notif.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;