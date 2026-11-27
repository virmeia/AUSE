import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  CreditCard,
  Users,
  FileSpreadsheet,
  Mail,
  History,
  Scale,
  PlusCircle,
  UserCircle,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  UserCog,
  KeyRound,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import auseLogo from '../assets/ause-logo.png';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ause_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ause_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const role = user?.role || 'customer';

  const navItems =
    role === 'admin'
      ? [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Repair Requests', path: '/admin/requests', icon: Wrench },
          { name: 'Payments & Billing', path: '/admin/payments', icon: CreditCard },
          { name: 'Customers', path: '/admin/customers', icon: Users },
          { name: 'Inquiries', path: '/admin/inquiries', icon: Mail },
          { name: 'Export Reports', path: '/admin/reports', icon: FileSpreadsheet },
          { name: 'Activity Logs', path: '/admin/activity-logs', icon: History },
          { name: 'System Contract', path: '/admin/developer-contract', icon: Scale },
        ]
      : role === 'technician'
        ? [{ name: 'My Assigned Jobs', path: '/technician/jobs', icon: Wrench }]
        : [
            { name: 'My Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
            { name: 'New Request', path: '/customer/new-request', icon: PlusCircle },
            { name: 'My Profile', path: '/customer/profile', icon: UserCircle },
          ];

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : res.data?.notifications || []);
    } catch {
      // Ignore if endpoint is temporarily unreachable
    }
    if (role === 'admin') {
      try {
        const inqRes = await api.get('/inquiries');
        const list = Array.isArray(inqRes.data) ? inqRes.data : [];
        setNewInquiriesCount(list.filter((i) => i.status === 'New').length);
      } catch {
        // Ignore if inquiries endpoint is unreachable
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
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
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const workspaceLabel =
    role === 'admin'
      ? 'Admin Workspace'
      : role === 'technician'
        ? 'Technician Portal'
        : 'Customer Portal';

  const initials = (user?.full_name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ── Purity UI Floating Sidebar ──────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200/70 bg-slate-50/95 py-6 backdrop-blur-md transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarCollapsed ? 'w-64 px-4 lg:w-20 lg:px-2.5' : 'w-64 px-4'
        } ${sidebarOpen ? 'translate-x-0 bg-white' : '-translate-x-full'}`}
      >
        <div
          className={`flex items-center pb-6 ${
            sidebarCollapsed ? 'justify-between px-2 lg:justify-center lg:px-0' : 'justify-between px-2'
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5" title="AUSE Home">
            <img src={auseLogo} alt="AUSE Logo" className="h-8 w-8 shrink-0 object-contain" />
            <span
              className={`text-xl font-black tracking-tight text-slate-950 transition-opacity ${
                sidebarCollapsed ? 'lg:hidden' : ''
              }`}
            >
              AUSE
            </span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent" />

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.name : undefined}
                className={`group flex items-center rounded-2xl py-2.5 text-xs font-bold transition-all ${
                  sidebarCollapsed
                    ? 'gap-3 px-3 lg:justify-center lg:gap-0 lg:px-0'
                    : 'gap-3 px-3'
                } ${
                  active
                    ? 'bg-white text-slate-950 shadow-sm shadow-blue-950/5 ring-1 ring-blue-100'
                    : 'text-slate-500 hover:bg-white/80 hover:text-slate-900'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active
                      ? 'bg-linear-to-br from-blue-600 to-cyan-500 text-white shadow-xs shadow-blue-600/25'
                      : 'bg-white text-blue-600 shadow-2xs group-hover:bg-cyan-50 group-hover:text-cyan-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`flex-1 truncate ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                  {item.name}
                </span>
                {item.path === '/admin/inquiries' && newInquiriesCount > 0 && (
                  <span
                    className={`rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white ${
                      sidebarCollapsed ? 'lg:hidden' : ''
                    }`}
                  >
                    {newInquiriesCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/60 bg-white/85 px-4 py-3.5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-2xs lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={toggleSidebarCollapse}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
              className="hidden rounded-xl border border-slate-200/80 bg-white p-2 text-slate-500 shadow-2xs transition hover:border-cyan-300 hover:text-blue-600 lg:inline-flex"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <span className="text-xs font-bold tracking-wide text-slate-600">
                {workspaceLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-2xs transition hover:border-blue-300 hover:text-blue-600"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="text-xs font-extrabold text-slate-950">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
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
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.notification_id || n.id}
                          className={`px-4 py-3 text-xs ${
                            !n.is_read ? 'bg-blue-50/40' : 'bg-white'
                          }`}
                        >
                          {n.title && (
                            <p className="font-extrabold text-slate-950">{n.title}</p>
                          )}
                          <p className="font-medium text-slate-700">{n.message}</p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {n.created_at
                              ? new Date(n.created_at).toLocaleString()
                              : 'Just now'}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-3 rounded-2xl py-1 pr-1 pl-2 transition hover:bg-slate-100/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-cyan-500 text-xs font-extrabold text-white shadow-xs">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-extrabold text-slate-950">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-[11px] font-medium capitalize text-slate-500">
                    {role}
                  </p>
                </div>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      profileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2.5 w-56 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                  <Link
                    to={role === 'admin' ? '/admin/customers' : role === 'technician' ? '/technician/jobs' : '/customer/profile'}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <UserCog className="h-4 w-4 text-cyan-500" />
                    <span>Manage Account</span>
                  </Link>

                  <Link
                    to={role === 'admin' ? '/admin/logs' : role === 'technician' ? '/technician/jobs' : '/customer/profile'}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <KeyRound className="h-4 w-4 text-blue-500" />
                    <span>Change Password</span>
                  </Link>

                  {role === 'admin' && (
                    <Link
                      to="/admin/logs"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <RefreshCw className="h-4 w-4 text-cyan-600" />
                      <span>Activity Log</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;