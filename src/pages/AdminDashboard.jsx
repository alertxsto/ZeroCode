import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth, SUBSCRIPTION_TIERS } from '../contexts/AuthProvider';
import { useProgress } from '../contexts/ProgressProvider';
import { apiFetch } from '../lib/apiClient';
import { PRICING, formatPrice } from '../lib/pricing';
import TopNavbar from '../components/layout/TopNavbar';
import {
    Users, Search, Check, X, Crown, Shield, ArrowLeft,
    RefreshCw, AlertCircle, ChevronDown, Activity,
    BarChart3, Database, HardDrive, Filter, Download
} from 'lucide-react';
import {
    RiUserFollowLine, RiUserStarLine, RiUserSettingsLine,
    RiArrowRightUpLine, RiGlobalLine, RiTimeLine, RiAwardLine
} from 'react-icons/ri';
import clsx from 'clsx';

const TIER_COLORS = {
    free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    beginner: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    intermediate: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
    fullstack: 'bg-green-500/20 text-green-400 border-green-500/30',
    admin: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
};

const TIER_OPTIONS = [
    { value: 'free', label: 'Free (Demo)' },
    { value: 'beginner', label: `Beginner (${formatPrice(PRICING.starter.price)})` },
    { value: 'intermediate', label: `Intermediate (${formatPrice(PRICING.developer.price)})` },
    { value: 'advanced', label: `Advanced (${formatPrice(PRICING.professional.price)})` },
    { value: 'fullstack', label: `Fullstack (${formatPrice(PRICING.master.price)})` },
    { value: 'admin', label: 'Admin' }
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { setUnitReward } = useProgress();
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTier, setFilterTier] = useState('all');
    const [editingUser, setEditingUser] = useState(null);
    const [newTier, setNewTier] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('users'); // users, logs, analytics, settings
    const [settings, setSettings] = useState({
        maintenance: false,
        ai: true,
        registry: true
    });
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async (query = searchQuery) => {
        // Fix: If called by event handler, query might be an Event object
        const finalQuery = typeof query === 'string' ? query : searchQuery;

        // Only set loading true if we don't have users yet (prevent complete UI collapse)
        if (users.length === 0) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const [usersRes, analyticsRes, logsRes] = await Promise.allSettled([
                apiFetch(`/api/admin/users${finalQuery ? `?search=${encodeURIComponent(finalQuery)}` : ''}`),
                apiFetch('/api/admin/analytics'),
                apiFetch('/api/admin/analytics'),
            ]);

            if (usersRes.status === 'fulfilled' && usersRes.value.success) {
                setUsers(usersRes.value.users);
            }

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
                setAnalytics(analyticsRes.value.analytics);
            }

            if (logsRes.status === 'fulfilled' && logsRes.value.success) {
                setLogs(logsRes.value.activity);
            }
        } catch (error) {
            console.error('Critical data load error:', error);
            setMessage({ type: 'error', text: 'Failed to synchronize with central intelligence.' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isAdmin === false) {
            navigate('/dashboard');
        } else if (isAdmin === true) {
            loadData();
        }
    }, [isAdmin]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isAdmin) loadData(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const confirmUpdateTier = (userId, tier) => {
        const userObj = users.find(u => u.id === userId);
        setPendingUpdate({ userId, tier, userName: userObj?.name });
        setIsConfirmOpen(true);
    };

    const handleUpdateTier = async () => {
        if (!pendingUpdate) return;
        const { userId, tier } = pendingUpdate;

        setUpdating(true);
        try {
            await apiFetch('/api/admin/users', {
                method: 'PATCH',
                body: { userId, tier }
            });
            setMessage({ type: 'success', text: `User ${pendingUpdate.userName} upgraded to ${tier}!` });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
        setEditingUser(null);
        setNewTier('');
        loadData();
        setUpdating(false);
        setIsConfirmOpen(false);
        setPendingUpdate(null);

        setTimeout(() => setMessage(null), 3000);
    };

    const filteredUsers = users.filter(u => {
        const matchesTier = filterTier === 'all' || u.subscription_tier === filterTier;
        return matchesTier;
    });

    const stats = {
        total: users.length,
        free: users.filter(u => u.subscription_tier === 'free').length,
        paid: users.filter(u => !['free', 'admin'].includes(u.subscription_tier)).length,
        admin: users.filter(u => u.subscription_tier === 'admin' || u.is_admin).length
    };

    const statsCards = [
        {
            label: 'Total Personnel',
            value: stats.total,
            icon: <Users size={24} />,
            color: 'text-indigo-400',
            trend: '+12%',
            desc: 'Total registered accounts'
        },
        {
            label: 'Demo Clearance',
            value: stats.free,
            icon: <Activity size={24} />,
            color: 'text-zinc-500',
            trend: '-2%',
            desc: 'Standard free access'
        },
        {
            label: 'Elite Access',
            value: stats.paid,
            icon: <Crown size={24} />,
            color: 'text-amber-400',
            trend: '+24%',
            desc: 'Premium paid students'
        },
        {
            label: 'System Admins',
            value: stats.admin,
            icon: <Shield size={24} />,
            color: 'text-indigo-500',
            trend: '0%',
            desc: 'Operational controllers'
        }
    ];

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col">
            <TopNavbar />

            <div className="flex flex-1 pt-16 h-screen overflow-hidden">
                {/* MODERN SIDEBAR */}
                <aside className="w-64 border-r border-white/5 bg-zinc-950 hidden md:flex flex-col p-4 shrink-0 overflow-y-auto">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4 px-2">Operation Modules</h3>
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                                        activeTab === 'users'
                                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <RiUserFollowLine size={20} />
                                    <span>User Registry</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('logs')}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                                        activeTab === 'logs'
                                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Database size={20} className={activeTab === 'logs' ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"} />
                                    <span>Database Logs</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                                        activeTab === 'analytics'
                                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <BarChart3 size={20} className={activeTab === 'analytics' ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"} />
                                    <span>System Analytics</span>
                                </button>
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-4 px-2">Configuration</h3>
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm group",
                                        activeTab === 'settings'
                                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <RiUserSettingsLine size={20} className={activeTab === 'settings' ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"} />
                                    <span>Global Settings</span>
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-medium text-sm group">
                                    <HardDrive size={20} className="text-zinc-500 group-hover:text-zinc-300" />
                                    <span>Storage Audit</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-indigo-400 mb-1">
                            <RiGlobalLine size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Server Status</span>
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center justify-between">
                            <span>Operational</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-950 p-4 md:p-8">
                    <div className="max-w-6xl mx-auto space-y-10">

                        {/* HEADER & TOP STATS */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 animate-fade-in">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-[0.3em]">
                                    <div className="w-8 h-[1px] bg-indigo-500/50"></div>
                                    <span>System Overview</span>
                                </div>
                                <h1 className="text-4xl font-black text-white tracking-tighter">Command Center</h1>
                                <p className="text-zinc-500 text-sm max-w-md">Secure gateway for managing ZeroCode intelligence and student clearance levels.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => loadData()}
                                    className="p-3 bg-zinc-900 border border-white/5 rounded-2xl text-zinc-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
                                    title="Refresh Data"
                                    disabled={loading || refreshing}
                                >
                                    <RefreshCw size={20} className={loading || refreshing ? "animate-spin" : ""} />
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-400 transition-all hover:shadow-[0_0_30px_rgba(129,140,248,0.3)]">
                                    <Download size={16} />
                                    <span>Export CSV</span>
                                </button>
                                <button
                                    onClick={() => setUnitReward({
                                        unitId: 'unit-01',
                                        unitTitle: 'Neural Network Fundamentals',
                                        courseId: 'python',
                                        courseTitle: 'Python for AI Mastery',
                                        userName: 'Admin Preview'
                                    })}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all hover:shadow-[0_0_30px_rgba(79,70,229,0.3)]"
                                >
                                    <RiAwardLine size={16} />
                                    <span>Preview Unit Card</span>
                                </button>
                            </div>
                        </div>

                        {/* STATS TILES */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
                            {statsCards.map((stat, i) => (
                                <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                                    <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 group-hover:scale-125 transition-transform duration-700">
                                        {stat.icon}
                                    </div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={clsx("p-3 rounded-2xl bg-zinc-900 border border-white/5", stat.color)}>
                                            {stat.icon}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            <RiArrowRightUpLine />
                                            {stat.trend}
                                        </div>
                                    </div>
                                    <div className="text-3xl font-black text-white mb-1 tracking-tighter">{stat.value}</div>
                                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono italic">{stat.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* MODULE CONTENT */}
                        {activeTab === 'users' && (
                            <>
                                <div className="space-y-6 animate-fade-in-up delay-200">
                                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <RiUserStarLine className="text-indigo-400" size={24} />
                                            <h2 className="text-xl font-bold tracking-tight">Active Registrations</h2>
                                        </div>

                                        <div className="flex gap-2 w-full md:w-auto">
                                            <div className="relative group flex-1 md:w-64">
                                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Quick scan (email/name)..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-2.5 bg-zinc-900 border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                                                />
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={filterTier}
                                                    onChange={(e) => setFilterTier(e.target.value)}
                                                    className="appearance-none pl-4 pr-10 py-2.5 bg-zinc-900 border border-white/5 rounded-2xl text-xs font-bold text-zinc-400 uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 cursor-pointer min-w-[140px]"
                                                >
                                                    <option value="all">ALL TIERS</option>
                                                    {TIER_OPTIONS.map(t => (
                                                        <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>
                                                    ))}
                                                </select>
                                                <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* DATA TABLE */}
                                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                                        {loading ? (
                                            <div className="py-32 flex flex-col items-center justify-center space-y-4">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                                                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 opacity-50" size={24} />
                                                </div>
                                                <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.4em] animate-pulse">Syncing Intel...</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse">
                                                    <thead>
                                                        <tr className="bg-white/5 border-b border-white/5">
                                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Personnel Information</th>
                                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Clearance Level</th>
                                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Activity Date</th>
                                                            <th className="px-8 py-5 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {filteredUsers.map((u) => (
                                                            <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-xs text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
                                                                            {u.name?.[0] || 'U'}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-white tracking-tight">{u.name}</div>
                                                                            <div className="text-xs text-zinc-500 font-mono">{u.email}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    {editingUser === u.id ? (
                                                                        <select
                                                                            value={newTier}
                                                                            onChange={(e) => setNewTier(e.target.value)}
                                                                            className="w-full bg-zinc-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-indigo-400 focus:outline-none"
                                                                            autoFocus
                                                                        >
                                                                            <option value="">Select Level...</option>
                                                                            {TIER_OPTIONS.map(t => (
                                                                                <option key={t.value} value={t.value}>{t.label}</option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        <div className={clsx(
                                                                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                                                                            u.subscription_tier === 'admin' ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]" :
                                                                                u.subscription_tier === 'fullstack' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                                                                    "bg-zinc-900 border-white/10 text-zinc-400"
                                                                        )}>
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                                            {u.subscription_tier}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="px-8 py-6">
                                                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                                                                        <RiTimeLine className="text-zinc-600" />
                                                                        {new Date(u.joined_date).toLocaleDateString()}
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    {editingUser === u.id ? (
                                                                        <div className="flex items-center justify-end gap-2 shrink-0">
                                                                            <button
                                                                                onClick={() => confirmUpdateTier(u.id, newTier)}
                                                                                className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all"
                                                                            >
                                                                                <Check size={18} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditingUser(null)}
                                                                                className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                                                                            >
                                                                                <X size={18} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => { setEditingUser(u.id); setNewTier(u.subscription_tier); }}
                                                                            className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/20 transition-all"
                                                                        >
                                                                            Modify
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SYSTEM PROTOCOL INFO */}
                                <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-12 text-indigo-500/10 animate-pulse pointer-events-none">
                                        <Shield size={160} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                            <AlertCircle size={20} />
                                        </div>
                                        Operational Protocols
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { step: '01', title: 'Verify', text: 'Confirm payment receipt via external secure channels.' },
                                            { step: '02', title: 'Locate', text: 'Use server-side scan to find the unique personnel entry.' },
                                            { step: '03', title: 'Update', text: 'Re-assign clearance level to match the transaction.' },
                                            { step: '04', title: 'Status', text: 'Clearance is granted instantly upon confirmation.' }
                                        ].map((step, i) => (
                                            <div key={i} className="relative z-10">
                                                <div className="text-[10px] font-black text-indigo-500 mb-2 font-mono">STEP_{step.step}</div>
                                                <div className="font-bold text-white mb-1 uppercase tracking-tight">{step.title}</div>
                                                <p className="text-xs text-zinc-500 font-mono leading-relaxed">{step.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'logs' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Database className="text-indigo-400" size={24} />
                                        <h2 className="text-xl font-bold tracking-tight">Database Activity Stream</h2>
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Live Feed Active
                                    </div>
                                </div>
                                <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                                    <div className="divide-y divide-white/5">
                                        {logs.length > 0 ? logs.map((log, i) => (
                                            <div key={i} className="p-6 hover:bg-white/[0.02] transition-all flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className={clsx(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                                                        log.type === 'USER_JOINED' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                                            log.type === 'FORUM_POST' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                                                                "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                                    )}>
                                                        {log.type === 'USER_JOINED' ? <Users size={20} /> :
                                                            log.type === 'FORUM_POST' ? <Activity size={20} /> :
                                                                <Shield size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                                            {log.type === 'USER_JOINED' ? `Personnel registration authorized: ${log.name}` :
                                                                log.type === 'FORUM_POST' ? `Intelligence shared: "${log.title}" by ${log.user_name}` :
                                                                    `Module progress: ${log.user_name} advanced to ${log.course_id}`}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                                                            <span className="uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-md border border-white/5">{log.type}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1"><RiTimeLine /> {new Date(log.timestamp).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                                                    <RiArrowRightUpLine size={20} />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="py-20 text-center">
                                                <div className="text-zinc-500 font-mono text-sm animate-pulse">Scanning database for activity...</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="text-indigo-400" size={24} />
                                    <h2 className="text-xl font-bold tracking-tight">System Intelligence</h2>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* TIER DISTRIBUTION (REAL) */}
                                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between h-80">
                                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">Clearance Distribution</div>
                                        <div className="flex-1 flex items-end gap-3 px-4">
                                            {analytics?.tierDistribution?.map((t, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                                    <div className="text-[10px] font-mono text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                                                        {t.count}
                                                    </div>
                                                    <div
                                                        className="w-full bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t-lg transition-all hover:bg-indigo-500/40 cursor-help"
                                                        style={{ height: `${Math.max(10, (t.count / users.length) * 100)}%` }}
                                                    ></div>
                                                    <div className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter truncate w-full text-center">
                                                        {t.subscription_tier}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* POPULAR COURSES (REAL) */}
                                    <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 flex flex-col h-80">
                                        <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 px-2">Knowledge Hotspots</div>
                                        <div className="space-y-4 flex-1">
                                            {analytics?.popularCourses?.map((course, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-white/5">
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{course.course_id.toUpperCase()}</span>
                                                    </div>
                                                    <div className="text-xs font-mono text-zinc-500">
                                                        {course.enrollments} ENROLLED
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* SIGNUP TREND (REAL) */}
                                <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8">
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8 px-2 text-center">7-Day Personnel Growth Matrix</div>
                                    <div className="h-40 flex items-end gap-2">
                                        {analytics?.signupTrend?.map((day, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div className="text-[10px] font-mono text-emerald-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{day.count}</div>
                                                <div
                                                    className="w-full bg-emerald-500/20 border-t-2 border-emerald-500 rounded-t-sm transition-all hover:bg-emerald-500/40"
                                                    style={{ height: `${Math.min(100, (day.count * 20) + 10)}%` }}
                                                ></div>
                                                <div className="text-[8px] font-bold text-zinc-700 font-mono mt-2">
                                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6 animate-fade-in-up">
                                <div className="flex items-center gap-3">
                                    <RiUserSettingsLine className="text-indigo-400" size={24} />
                                    <h2 className="text-xl font-bold tracking-tight">Global Configurations</h2>
                                </div>
                                <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-8 space-y-6">
                                    {[
                                        { id: 'maintenance', title: 'Maintenance Mode', desc: 'Seal the platform for deep-space updates.', active: settings.maintenance },
                                        { id: 'ai', title: 'AI Overdrive', desc: 'Enable maximum intelligence for student assistance.', active: settings.ai },
                                        { id: 'registry', title: 'Public Registry', desc: 'Allows search engines to crawl student success stories.', active: settings.registry }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div>
                                                <div className="font-bold text-sm uppercase tracking-tight">{item.title}</div>
                                                <div className="text-xs text-zinc-500 font-mono italic">{item.desc}</div>
                                            </div>
                                            <div
                                                onClick={() => {
                                                    setSettings(prev => ({ ...prev, [item.id]: !item.active }));
                                                    setMessage({ type: 'success', text: `${item.title} ${!item.active ? 'ENABLED' : 'DISABLED'}` });
                                                    setTimeout(() => setMessage(null), 2000);
                                                }}
                                                className={clsx(
                                                    "w-12 h-6 rounded-full p-1 transition-all cursor-pointer",
                                                    item.active ? "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]" : "bg-zinc-800"
                                                )}
                                            >
                                                <div className={clsx("w-4 h-4 bg-white rounded-full transition-all shadow-sm", item.active ? "translate-x-6" : "translate-x-0")}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div >

            {/* CONFIRMATION OVERLAY */}
            {
                isConfirmOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-xl animate-fade-in px-4">
                        <div className="bg-zinc-900 border border-white/10 rounded-[3rem] p-12 max-w-md w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-scale-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-amber-500/5 -rotate-12">
                                <Shield size={200} />
                            </div>
                            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                                <RiUserSettingsLine size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-center text-white mb-2 tracking-tighter uppercase">Initialize Upgrade</h2>
                            <p className="text-zinc-500 text-center text-xs mb-10 leading-relaxed font-mono px-4">
                                Authorized personnel: <span className="text-white font-bold">{pendingUpdate?.userName}</span> will be granted <span className="text-amber-400 font-bold uppercase tracking-widest">{pendingUpdate?.tier}</span> level clearance.
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={handleUpdateTier}
                                    disabled={updating}
                                    className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-400 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                                >
                                    {updating ? 'EXECUTING...' : 'Authorize Clearance'}
                                </button>
                                <button
                                    onClick={() => setIsConfirmOpen(false)}
                                    className="w-full py-4 bg-transparent text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all"
                                >
                                    Abort Mission
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* MESSAGE FEEDBACK */}
            {
                message && (
                    <div className={clsx(
                        "fixed bottom-8 right-8 z-[110] px-6 py-4 rounded-2xl border flex items-center gap-4 animate-slide-in-right shadow-2xl backdrop-blur-md",
                        message.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                    )}>
                        {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        <div className="text-xs font-bold uppercase tracking-widest">{message.text}</div>
                    </div>
                )
            }
        </div >
    );
}
