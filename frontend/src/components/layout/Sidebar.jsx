import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, UserPlus, ClipboardList,
    Menu, X, GraduationCap, ChevronLeft, Home,
    Compass, ArrowRightLeft, BookOpen
} from 'lucide-react';
import collegeLogo from '../../assets/rcee.png';
import GlobalSearch from '../ui/GlobalSearch';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { to: '/home',           label: 'Home',           icon: Home,          roles: ['faculty', 'hod'] },
        { to: '/my-research',    label: 'My Research',    icon: BookOpen,       roles: ['faculty', 'hod'] },
        { to: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard,roles: ['admin', 'hod'] },
        { to: '/explore',        label: 'Explore',        icon: Compass,        roles: ['admin', 'hod'] },
        { to: '/faculty',        label: 'Faculty',        icon: Users,          roles: ['admin', 'hod'] },
        { to: '/compare',        label: 'Compare Depts',  icon: ArrowRightLeft, roles: ['admin'] },
        { to: '/create-account', label: 'Create Account', icon: UserPlus,       roles: ['admin', 'hod'] },
        { to: '/my-profile',     label: 'My Profile',     icon: GraduationCap,  roles: ['admin', 'faculty', 'hod'] },
        { to: '/activity-logs',  label: 'Activity Logs',  icon: ClipboardList,  roles: ['admin'] },
    ];

    const filteredNav = navItems.filter((item) => item.roles.includes(user?.role));

    const SidebarContent = () => (
        <div className="flex flex-col h-full">

            {/* ── Logo strip ── */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-primary-100"
                 style={{ background: 'linear-gradient(135deg,#9a3412,#ea580c)' }}>
                <img
                    src={collegeLogo}
                    alt="RCEE"
                    className="w-10 h-10 rounded-lg bg-white p-0.5 shadow-md shrink-0 object-contain"
                />
                {!collapsed && (
                    <div>
                        <h1 className="text-white font-heading font-bold text-sm leading-tight tracking-tight">RCEE RIMS</h1>
                        <p className="text-primary-200 text-[10px] leading-tight">Research Info. Mgmt System</p>
                    </div>
                )}
            </div>

            {/* ── Search ── */}
            {!collapsed && (
                <div className="px-3 pt-4 pb-2">
                    <GlobalSearch />
                </div>
            )}

            {/* ── Navigation ── */}
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
                {filteredNav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            ${isActive
                                ? 'bg-gradient-to-r from-primary-50 to-orange-50 text-primary-700 border border-primary-200 shadow-orange-sm'
                                : 'text-dark-500 hover:bg-primary-50 hover:text-primary-700'
                            }`
                        }
                        title={collapsed ? item.label : undefined}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`shrink-0 p-1.5 rounded-lg ${isActive ? 'bg-primary-500 text-white' : 'text-dark-400'}`}>
                                    <item.icon className="w-4 h-4" />
                                </span>
                                {!collapsed && <span>{item.label}</span>}
                                {isActive && !collapsed && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* ── User footer — avatar card only ── */}
            <div className="px-3 py-4 border-t border-dark-100">
                {collapsed ? (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-sm font-bold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-primary-50 border border-primary-100">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-dark-800 text-sm font-semibold truncate">{user?.name}</p>
                            <p className="text-dark-400 text-xs capitalize truncate">{user?.role} · {user?.department}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-primary-600 text-white p-2 rounded-xl shadow-orange-md"
            >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300
                lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* Desktop sidebar — fixed, never scrolls */}
            <aside className={`hidden lg:flex flex-col h-screen bg-white border-r border-primary-100 shadow-sm
                fixed top-0 left-0 z-20 transition-all duration-300
                ${collapsed ? 'w-[68px]' : 'w-64'}`}>
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-6 bg-white border border-primary-200 text-primary-500 hover:text-primary-700 hover:border-primary-400
                        w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-sm"
                >
                    <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                </button>
            </aside>


        </>
    );
};

export default Sidebar;
