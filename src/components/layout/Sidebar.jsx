import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import {
    RiDashboardLine,
    RiBookOpenLine,
    RiDiscussLine,
    RiTrophyLine,
    RiFlashlightLine,
    RiUser3Line,
    RiLogoutBoxLine,
    RiHistoryLine,
    RiShieldKeyholeLine
} from 'react-icons/ri';
import clsx from 'clsx';
import logo from '../../assets/logo.png';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const menuItems = [
        { path: '/dashboard', label: 'Overview', icon: RiDashboardLine },
        { path: '/resources', label: 'Library', icon: RiBookOpenLine },
        { path: '/community', label: 'Community', icon: RiDiscussLine },
        { path: '/leaderboard', label: 'Leaderboard', icon: RiTrophyLine },
        { path: '/updates', label: 'Updates', icon: RiHistoryLine },
        { path: '/features', label: 'Features', icon: RiFlashlightLine },
    ];

    const bottomItems = [
        { path: '/profile', label: 'Profile', icon: RiUser3Line },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <img
                        src={logo}
                        alt="ZeroCode"
                        className="w-8 h-8 invert brightness-200 contrast-125 transition-transform group-hover:scale-110"
                    />
                    <span className="font-black text-xl tracking-tighter text-white group-hover:text-zinc-300 transition-colors uppercase">
                        ZeroCode
                    </span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Menu
                </div>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-400"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                            )}
                        >
                            <Icon size={18} className={isActive ? "text-indigo-400" : "text-zinc-500"} />
                            {item.label}
                        </Link>
                    );
                })}

                {isAdmin && (
                    <div className="mt-8">
                        <div className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Admin
                        </div>
                        <Link
                            to="/admin"
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                location.pathname.startsWith('/admin')
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                            )}
                        >
                            <RiShieldKeyholeLine size={18} />
                            Admin Panel
                        </Link>
                    </div>
                )}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-zinc-800/50">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-1",
                                isActive
                                    ? "bg-zinc-800 text-white"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                            )}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 mt-2"
                >
                    <RiLogoutBoxLine size={18} />
                    Sign Out
                </button>

                {/* User Mini Profile */}
                <div className="mt-4 flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-zinc-700">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                            {user?.name || 'User'}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                            {user?.subscription_tier || 'Free'} Plan
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
