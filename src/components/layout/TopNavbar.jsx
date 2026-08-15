import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import AvatarWithBorder from '../common/AvatarWithBorder';
import {
    RiDashboardLine,
    RiBookOpenLine,
    RiDiscussLine,
    RiTrophyLine,
    RiUser3Line,
    RiLogoutBoxRLine,
    RiShieldKeyholeLine,
    RiArrowDownSLine,
    RiRocketLine,
    RiNodeTree,
    RiHistoryLine
} from 'react-icons/ri';
import clsx from 'clsx';
import logo from '../../assets/logo_z.png';

export default function TopNavbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Admin access logic
    const [clickCount, setClickCount] = useState(0);
    const clickTimer = useRef(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogoClick = (e) => {
        e.preventDefault();
        setClickCount(prev => prev + 1);
        clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => setClickCount(0), 2000);

        if (clickCount >= 4) {
            setClickCount(0);
            navigate(isAdmin ? '/admin' : '/admin/access');
        } else {
            navigate('/dashboard');
        }
    };

    const navLinks = [
        { path: '/dashboard', label: 'Overview', icon: RiDashboardLine },
        { path: '/resources', label: 'Library', icon: RiBookOpenLine },
        { path: '/specializations', label: 'Sectors', icon: RiNodeTree },
        { path: '/features', label: 'Features', icon: RiRocketLine },
        { path: '/community', label: 'Community', icon: RiDiscussLine },
        { path: '/leaderboard', label: 'Leaderboard', icon: RiTrophyLine },
        { path: '/updates', label: 'Updates', icon: RiHistoryLine },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-cyan-500/10">
            {/* Cyber Decorative Line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>

            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between relative z-10">

                {/* Logo & Main Nav */}
                <div className="flex items-center gap-12">
                    <button onClick={handleLogoClick} className="flex flex-col items-start group focus:outline-none">
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-500 font-mono text-xl opacity-50 group-hover:opacity-100 transition-opacity">{'//'}</span>
                            <span className="font-black text-2xl tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:text-cyan-50 transition-colors">
                                ZEROCODE
                            </span>
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse ml-1" />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600 tracking-[0.3em] uppercase ml-7 group-hover:text-cyan-500/50 transition-colors">
                            SYSTEM_CORE
                        </span>
                    </button>

                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={clsx(
                                        "relative px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-2 group overflow-hidden rounded-lg",
                                        isActive
                                            ? "text-cyan-400 bg-cyan-950/30 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]"
                                            : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
                                    )}
                                >
                                    <Icon size={14} className={clsx("transition-colors", isActive ? "text-cyan-400" : "text-zinc-600 group-hover:text-zinc-300")} />
                                    {link.label}

                                    {isActive && (
                                        <>
                                            <div className="absolute inset-0 bg-cyan-400/5 animate-pulse-slow pointer-events-none" />
                                            <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-500 box-shadow-[0_0_5px_cyan]" />
                                            <div className="absolute bottom-0 right-0 w-1 h-1 bg-cyan-500 box-shadow-[0_0_5px_cyan]" />
                                        </>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-8">
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-sm bg-red-950/30 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-900/50 hover:border-red-500 hover:text-red-400 transition-all shadow-[0_0_10px_-4px_rgba(239,68,68,0.3)]"
                        >
                            <RiShieldKeyholeLine size={12} />
                            <span>SECTOR_ADM</span>
                        </Link>
                    )}

                    <div className="relative" onMouseLeave={() => setTimeout(() => setIsProfileOpen(false), 300)}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            onMouseEnter={() => setIsProfileOpen(true)}
                            className="flex items-center gap-4 group focus:outline-none"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                    {user?.name || 'User'}
                                </div>
                                <div className="flex items-center justify-end gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                                    <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest group-hover:text-cyan-500/70 transition-colors">
                                        {user?.role === 'admin' ? 'NET_ADMIN' : 'NET_USER'}
                                    </div>
                                </div>
                            </div>
                            <div className="relative p-0.5 border border-white/10 group-hover:border-cyan-500/50 rounded-full transition-colors">
                                <AvatarWithBorder
                                    url={user?.avatar}
                                    name={user?.name}
                                    border={user?.border}
                                    size="md"
                                    className="w-9 h-9"
                                />
                            </div>
                        </button>

                        {/* Cyber Dropdown */}
                        <div className={clsx(
                            "absolute right-0 top-full pt-6 w-64 transition-all duration-200 origin-top-right z-50",
                            isProfileOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
                        )}>
                            <div className="bg-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-[0_0_30px_-10px_rgba(34,211,238,0.2)] overflow-hidden relative">
                                {/* Decor */}
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-500" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-500" />

                                <div className="p-4 border-b border-white/10 sm:hidden">
                                    <div className="text-sm font-black text-white uppercase">{user?.name}</div>
                                    <div className="text-[10px] text-cyan-500 font-mono tracking-widest">{user?.role}</div>
                                </div>

                                <div className="p-2 space-y-1">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold font-mono text-zinc-400 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent hover:border-cyan-500/20 rounded transition-all group uppercase tracking-wider"
                                    >
                                        <RiUser3Line size={14} className="group-hover:drop-shadow-[0_0_5px_cyan]" />
                                        ACCESS_PROFILE
                                    </Link>

                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold font-mono text-zinc-400 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/20 rounded transition-all group uppercase tracking-wider"
                                    >
                                        <RiLogoutBoxRLine size={14} className="group-hover:drop-shadow-[0_0_5px_crimson]" />
                                        TERMINATE_SESSION
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
