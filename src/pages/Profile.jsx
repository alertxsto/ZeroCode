import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, SUBSCRIPTION_TIERS } from '../contexts/AuthProvider';
import { useProgress } from '../contexts/ProgressProvider';
import { getCourseProgress } from '../data/courses/index';
import { courses } from '../data/curriculumStructure';
import AppLayout from '../components/layout/AppLayout';
import {
    RiEdit2Line, RiCameraLine, RiVipCrownLine, RiCheckLine, RiLoader4Line,
    RiPhoneLine, RiMailLine, RiCalendarLine, RiShieldKeyholeLine, RiLogoutBoxRLine,
    RiBookOpenLine, RiFundsLine, RiTimeLine, RiTrophyLine, RiAwardLine, RiVipCrownFill,
    RiArrowRightLine
} from 'react-icons/ri';
import { VscCode } from 'react-icons/vsc';
import clsx from 'clsx';
import AvatarWithBorder from '../components/common/AvatarWithBorder';
import RealisticDNA from '../components/RealisticDNA';
import { whatsappLink } from '../lib/pricing';

const TIER_STYLES = {
    free: { label: 'Explorer', gradient: 'from-zinc-500 to-zinc-400', glow: 'shadow-zinc-500/20' },
    beginner: { label: 'Scout', gradient: 'from-blue-500 to-indigo-500', glow: 'shadow-blue-500/20' },
    intermediate: { label: 'Specialist', gradient: 'from-violet-500 to-purple-500', glow: 'shadow-purple-500/20' },
    advanced: { label: 'Elite', gradient: 'from-rose-500 to-red-500', glow: 'shadow-red-500/20' },
    fullstack: { label: 'Architect', gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-500/20' },
    admin: { label: 'Administrator', gradient: 'from-amber-400 to-orange-500', glow: 'shadow-orange-500/20' }
};

const PRESET_AVATARS = [
    '/avatars/avatar_cyber.png',
    '/avatars/avatar_glass.png',
    '/avatars/avatar_pixel.png',
    '/avatars/avatar_visor.png'
];

export default function Profile() {
    const { user, logout, updateUser, subscriptionTier, isAdmin, refreshUser } = useAuth();
    const { completedCourses, completedItems, userStats } = useProgress(); // userStats from context
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        avatar: user?.avatar || '',
        border: user?.border || 'none'
    });

    // Update form when user data changes (e.g. after refresh)
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                avatar: user.avatar || '',
                border: user.border || 'none'
            });
        }
    }, [user]);

    // Initial refresh to get latest join date and other fields
    useEffect(() => {
        refreshUser();
    }, []);

    const handleLogout = () => { logout(); navigate('/login'); };
    const handleSave = async () => {
        const result = await updateUser(formData);
        if (result.success) {
            setIsEditing(false);
        } else {
            alert('Failed to save profile: ' + result.error);
        }
    };
    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            avatar: user?.avatar || '',
            border: user?.border || 'none'
        });
        setIsEditing(false);
    };

    const handleUpgrade = () => {
        const message = [
            'Hi ZeroCode! I want to upgrade my account.',
            '',
            `Email: ${user?.email}`,
            `Name: ${user?.name}`,
            `Current tier: ${subscriptionTier}`,
            '',
            'Please send me the payment instructions and I will confirm once transferred.'
        ].join('\n');
        window.open(whatsappLink(message), '_blank');
    };

    // Calculate Stats
    const courseCatalog = Object.values(courses);
    const totalCourses = courseCatalog.length;
    const completedCoursesCount = completedCourses.length;
    const totalItems = completedItems.length;
    const completionRate = totalCourses > 0 ? Math.round((completedCoursesCount / totalCourses) * 100) : 0;
    const coursesInProgress = courseCatalog.filter(course => {
        const progress = getCourseProgress(course.id, completedItems);
        return progress.percentage > 0 && progress.percentage < 100;
    });

    const currentTier = TIER_STYLES[subscriptionTier] || TIER_STYLES.free;
    // Fallback if joined_date is missing
    const joinDate = user?.joined_date
        ? new Date(user.joined_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        : (user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Unknown');

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">

                {/* CYBER HEADER */}
                <div className="relative rounded-sm bg-black border border-white/10 overflow-hidden isolate shadow-2xl">
                    {/* DNA Background */}
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
                        <RealisticDNA />
                    </div>
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 z-0" />

                    {/* Content Container */}
                    <div className="relative z-10 p-8 md:p-12 backdrop-blur-sm bg-black/40">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">

                            {/* Avatar Section */}
                            <div className="relative group shrink-0">
                                {/* Tech Borders for Avatar */}
                                <div className="absolute -inset-4 border border-cyan-500/20 rounded-xl" />
                                <div className="absolute -inset-4 border-t border-l border-cyan-500/50 w-6 h-6 rounded-tl-xl" />
                                <div className="absolute -inset-4 border-b border-r border-cyan-500/50 w-6 h-6 rounded-br-xl right-0 bottom-0" />

                                <div className="w-32 h-32 relative z-10">
                                    <AvatarWithBorder
                                        url={formData.avatar || user?.avatar}
                                        name={user?.name}
                                        border={isEditing ? formData.border : user?.border}
                                        size="custom"
                                        className="w-full h-full shadow-2xl"
                                    />
                                </div>

                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="absolute -bottom-2 -right-2 w-8 h-8 rounded-sm bg-cyan-900/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-lg z-30 group/edit">
                                        <RiEdit2Line size={14} />
                                    </button>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                {isEditing ? (
                                    <div className="space-y-6 max-w-lg bg-black/60 p-6 rounded-sm border border-white/10 backdrop-blur-md relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-50">
                                            <VscCode className="text-cyan-500 animate-pulse" size={20} />
                                        </div>

                                        {/* Avatar Selection */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">Select_Avatar_Shell</label>
                                            <div className="grid grid-cols-5 gap-3">
                                                {PRESET_AVATARS.map((avatarUrl) => (
                                                    <button
                                                        key={avatarUrl}
                                                        onClick={() => setFormData({ ...formData, avatar: avatarUrl })}
                                                        className={clsx(
                                                            "relative aspect-square rounded-sm bg-black border transition-all overflow-hidden group",
                                                            formData.avatar === avatarUrl
                                                                ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] z-10"
                                                                : "border-white/10 hover:border-white/30"
                                                        )}
                                                    >
                                                        <img src={avatarUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                        {formData.avatar === avatarUrl && (
                                                            <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30">
                                                                <RiCheckLine className="text-cyan-400 drop-shadow-md" size={16} />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Border Selection */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">Select_Frame_Matrix</label>
                                            <div className="grid grid-cols-4 gap-3">
                                                {[
                                                    { id: 'none', label: 'None', preview: <div className="w-full h-full bg-white/5" /> },
                                                    {
                                                        id: 'neural',
                                                        label: 'Neural',
                                                        preview: (
                                                            <div className="relative w-full h-full flex items-center justify-center">
                                                                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/50 animate-[spin_10s_linear_infinite]" />
                                                                <div className="w-6 h-6 rounded-full bg-zinc-800 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                                                            </div>
                                                        )
                                                    },
                                                    {
                                                        id: 'warlord',
                                                        label: 'Warlord',
                                                        preview: (
                                                            <div className="relative w-full h-full flex items-center justify-center">
                                                                <div className="absolute inset-1 bg-gradient-to-br from-yellow-500 to-red-600 clip-hex opacity-50" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                                                                <div className="w-6 h-6 bg-zinc-800" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                                                            </div>
                                                        )
                                                    },
                                                    {
                                                        id: 'ghost',
                                                        label: 'Ghost',
                                                        preview: (
                                                            <div className="relative w-full h-full bg-purple-900/40 border border-purple-500/50 flex items-center justify-center overflow-hidden">
                                                                <div className="absolute top-0 w-full h-[1px] bg-purple-400 animate-[scanline_2s_linear_infinite]" />
                                                            </div>
                                                        )
                                                    },
                                                    {
                                                        id: 'operator',
                                                        label: 'Operator',
                                                        preview: (
                                                            <div className="relative w-full h-full flex items-center justify-center">
                                                                <div className="absolute inset-1 border-l border-t border-emerald-500 rounded-tl w-3 h-3" />
                                                                <div className="absolute inset-1 border-r border-b border-emerald-500 rounded-br w-3 h-3 right-0 bottom-0" />
                                                            </div>
                                                        )
                                                    },
                                                    {
                                                        id: 'scanner',
                                                        label: 'Scanner',
                                                        preview: (
                                                            <div className="relative w-full h-full flex items-center justify-center">
                                                                <div className="absolute inset-1 rounded-full border border-emerald-500/30 opacity-50" />
                                                                <div className="absolute inset-1 rounded-full border-t-2 border-emerald-500 animate-[spin_4s_linear_infinite]" />
                                                            </div>
                                                        )
                                                    },
                                                    {
                                                        id: 'crimson',
                                                        label: 'Crimson',
                                                        preview: (
                                                            <div className="relative w-full h-full flex items-center justify-center">
                                                                <div className="absolute inset-1 bg-red-600/20 rounded-lg animate-pulse" />
                                                                <div className="absolute inset-1 border border-red-500/50 rounded-lg transform rotate-3" />
                                                            </div>
                                                        )
                                                    },
                                                    {
                                                        id: 'synth',
                                                        label: 'Synth',
                                                        preview: (
                                                            <div className="relative w-full h-full flex items-center justify-center">
                                                                <div className="absolute inset-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-[spin_2s_linear_infinite] opacity-70 blur-sm" />
                                                            </div>
                                                        )
                                                    }
                                                ].map((border) => (
                                                    <button
                                                        key={border.id}
                                                        onClick={() => setFormData({ ...formData, border: border.id })}
                                                        className={clsx(
                                                            "relative aspect-square rounded-sm bg-black border transition-all p-2 overflow-hidden",
                                                            formData.border === border.id
                                                                ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] z-10"
                                                                : "border-white/10 hover:border-white/30"
                                                        )}
                                                    >
                                                        {border.preview}
                                                        {formData.border === border.id && (
                                                            <div className="absolute inset-0 bg-cyan-500/10 border-2 border-cyan-500" />
                                                        )}
                                                        <span className="absolute bottom-1 left-0 right-0 text-[8px] font-mono text-center text-gray-500 uppercase">{border.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4 max-w-sm">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Operative_Alias</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="text-lg font-bold text-white bg-black/50 border border-white/10 p-2 rounded-sm focus:border-cyan-500 focus:outline-none w-full font-mono"
                                                    placeholder="Display Name"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Comms_Link</label>
                                                <div className="flex items-center gap-2 text-zinc-400 bg-black/50 px-3 py-2 rounded-sm border border-white/10 group-focus-within:border-cyan-500 transition-colors">
                                                    <RiPhoneLine size={14} className="text-cyan-500" />
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="bg-transparent text-sm focus:outline-none w-full font-mono text-white placeholder-gray-700"
                                                        placeholder="Phone Number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button onClick={handleSave} className="flex-1 py-2 bg-cyan-600/80 text-white text-xs font-bold rounded-sm border border-cyan-400/50 hover:bg-cyan-500 uppercase tracking-wider font-mono">Save_Changes</button>
                                            <button onClick={handleCancel} className="flex-1 py-2 bg-black text-gray-400 text-xs font-bold rounded-sm border border-white/10 hover:bg-white/5 uppercase tracking-wider font-mono">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-1 items-center md:items-start">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                                                <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em] font-mono">System_Online</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                                                    {user?.name || 'Unknown_Operative'}
                                                </h1>
                                                <span className={clsx(
                                                    "px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border font-mono backdrop-blur-md",
                                                    subscriptionTier === 'free' ? "border-zinc-700 bg-zinc-900/50 text-zinc-400" :
                                                        "border-cyan-500 bg-cyan-950/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                                )}>
                                                    {currentTier.label} // CLASS
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-gray-400 mt-2">
                                            <div className="flex items-center gap-2 group">
                                                <div className="p-1.5 rounded-sm bg-white/5 border border-white/10 group-hover:border-cyan-500/50 transition-colors">
                                                    <RiMailLine className="text-cyan-500" size={14} />
                                                </div>
                                                <span className="font-mono text-xs">{user?.email}</span>
                                            </div>
                                            <div className="hidden md:block w-px h-4 bg-white/10" />
                                            <div className="flex items-center gap-2 group">
                                                <div className="p-1.5 rounded-sm bg-white/5 border border-white/10 group-hover:border-cyan-500/50 transition-colors">
                                                    <RiCalendarLine className="text-cyan-500" size={14} />
                                                </div>
                                                <span className="font-mono text-xs">JOINED_{joinDate.replace(/ /g, '_').toUpperCase()}</span>
                                            </div>
                                            <div className="hidden md:block w-px h-4 bg-white/10" />
                                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider transition-colors border-b border-cyan-500/30 hover:border-cyan-500 pb-0.5">
                                                Edit_Profile <RiEdit2Line size={12} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Quick Action */}
                            <div className="flex flex-col gap-3 min-w-[160px]">
                                {isAdmin && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className="px-5 py-3 rounded-sm border border-yellow-500/30 bg-yellow-900/10 text-yellow-500 font-bold text-xs uppercase tracking-widest hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all flex items-center justify-center gap-2 group font-mono relative overflow-hidden"
                                    >
                                        <span className="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                        <RiShieldKeyholeLine size={16} /> ADMIN_PANEL
                                    </button>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="px-5 py-3 rounded-sm border border-red-500/30 bg-red-900/10 text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center justify-center gap-2 group font-mono relative overflow-hidden"
                                >
                                    <span className="absolute inset-0 bg-red-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                                    <RiLogoutBoxRLine size={16} /> TERMINATE_SESSION
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & Learning */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'STREAK_COUNT', value: `${userStats?.streak || 0} D`, icon: RiFundsLine, color: 'text-orange-500', bg: 'bg-orange-900/10', border: 'border-orange-500/30' },
                                { label: 'FOCUS_TIME', value: userStats?.focusTime || '0h', icon: RiTimeLine, color: 'text-emerald-500', bg: 'bg-emerald-900/10', border: 'border-emerald-500/30' },
                                { label: 'MODS_COMPLETE', value: completedCoursesCount, icon: RiTrophyLine, color: 'text-amber-500', bg: 'bg-amber-900/10', border: 'border-amber-500/30' },
                                { label: 'COMPLETION_RATE', value: `${completionRate}%`, icon: RiAwardLine, color: 'text-cyan-500', bg: 'bg-cyan-900/10', border: 'border-cyan-500/30' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-4 rounded-sm bg-black border border-white/10 hover:border-white/30 transition-all group relative overflow-hidden"
                                >
                                    <div className={clsx("absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity", stat.color)}>
                                        <stat.icon size={40} className="transform rotate-12 blur-[2px]" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className={clsx("w-8 h-8 rounded-sm flex items-center justify-center mb-3 border", stat.bg, stat.border)}>
                                            <stat.icon className={stat.color} size={16} />
                                        </div>
                                        <div className="text-2xl font-black text-white tracking-tighter font-mono">{stat.value}</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 font-mono">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Activity / In Progress */}
                        <div>
                            <h2 className="text-sm font-bold text-cyan-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 font-mono">
                                <VscCode size={20} /> MISSION_PROTOCOLS_ACTIVE
                            </h2>

                            {coursesInProgress.length > 0 ? (
                                <div className="space-y-4">
                                    {coursesInProgress.map((course, idx) => {
                                        const progress = getCourseProgress(course.id, completedItems);
                                        return (
                                            <div
                                                key={course.id}
                                                onClick={() => navigate(`/course/${course.id}`)}
                                                className="group relative p-6 rounded-sm bg-black border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden"
                                            >
                                                {/* Tech Deco */}
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 transform rotate-45 translate-x-8 -translate-y-8 group-hover:bg-cyan-500/10 transition-colors"></div>

                                                <div className="flex items-center justify-between mb-4 relative z-10">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{course.title}</h3>
                                                        <p className="text-xs text-gray-500 mt-1 font-mono">PROGRESS_STATUS: {progress.completed}/{progress.total} MODULES</p>
                                                    </div>
                                                    <span className="text-xl font-mono font-black text-cyan-500 group-hover:text-cyan-400">{progress.percentage}%</span>
                                                </div>

                                                <div className="h-2 w-full bg-zinc-900 rounded-none overflow-hidden relative z-10 border border-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress.percentage}%` }}
                                                        className="h-full bg-cyan-500 relative"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                                    </motion.div>
                                                </div>

                                                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <RiArrowRightLine className="text-cyan-500" size={20} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 rounded-sm bg-black border border-white/10 border-dashed text-center">
                                    <div className="w-12 h-12 rounded-sm bg-zinc-900 mx-auto flex items-center justify-center mb-4 border border-white/5">
                                        <VscCode className="text-gray-600" size={24} />
                                    </div>
                                    <h3 className="text-white font-bold font-mono uppercase tracking-wider text-xs">NO_ACTIVE_MISSIONS</h3>
                                    <p className="text-xs text-gray-500 mt-2 mb-6 font-mono max-w-xs mx-auto">Initiate new learning protocols to populate this data stream.</p>
                                    <button onClick={() => navigate('/dashboard')} className="text-cyan-500 text-xs font-bold hover:text-cyan-300 font-mono uppercase tracking-widest border-b border-cyan-500/30 hover:border-cyan-500 transition-colors pb-1">
                                        ACCESS_CATALOG //
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: License Card */}
                    <div className="space-y-6">
                        <div className="relative p-6 rounded-sm bg-black border border-white/10 overflow-hidden group">
                            {/* Card Visuals */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Access_License_Key</h3>
                                    <RiShieldKeyholeLine className="text-cyan-500" size={20} />
                                </div>

                                <div className="mb-8 text-center py-6 border-y border-white/10 relative bg-white/[0.02]">
                                    <div className="text-[10px] font-mono text-cyan-500 uppercase mb-2 tracking-[0.2em]">Current_Plan</div>
                                    <div className={clsx("text-3xl font-black uppercase tracking-tighter text-white",
                                        subscriptionTier === 'free' ? "text-gray-400" : "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                    )}>
                                        {currentTier.label}
                                    </div>
                                </div>

                                {subscriptionTier === 'free' ? (
                                    <div className="space-y-4">
                                        <p className="text-[10px] text-gray-400 text-center leading-relaxed font-mono">
                                            RESTRICTED_ACCESS. Upgrade license to unlock full protocol capabilities.
                                        </p>
                                        <button
                                            onClick={handleUpgrade}
                                            className="w-full py-4 bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                                        >
                                            <span className="absolute inset-0 bg-cyan-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 z-0"></span>
                                            <span className="relative z-10 flex items-center gap-2">
                                                <RiVipCrownFill size={16} /> UPGRADE_CLEARANCE
                                            </span>
                                        </button>
                                        <p className="text-[9px] text-gray-600 text-center leading-relaxed font-mono">
                                            HOW_TO_ACTIVATE:<br />
                                            1. Send the WA message above<br />
                                            2. Transfer to the account given by admin<br />
                                            3. Reply with your transfer receipt<br />
                                            4. Access granted within 24h
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-sm p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-sm bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                                            <RiVipCrownFill size={14} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">Pro_Active</div>
                                            <div className="text-[10px] text-emerald-400/80 font-mono">EXP: INDEFINITE</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info Box */}
                        <div className="p-5 rounded-sm bg-black border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-white/5"></div>
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 font-mono">OPERATIVE_DATA_LOG</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600 font-mono">USER_ID</span>
                                    <span className="font-mono text-white">#{user?.id?.toString().padStart(6, '0')}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600 font-mono">REGION</span>
                                    <span className="text-white font-mono uppercase">GLOBAL_NET</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-600 font-mono">SYS_VER</span>
                                    <span className="font-mono text-cyan-500">v2.7.0.BETA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


