import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthProvider';
import { useProgress } from '../contexts/ProgressProvider';
import { getOverallProgress } from '../data/curriculumStructure';
import { apiFetch } from '../lib/apiClient';
import {
    MessageSquare, Plus, Search, ThumbsUp, MessageCircle,
    Clock, User, X, Send, ChevronRight, Hash, TrendingUp, Zap, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiFireLine, RiTimeLine, RiLineChartLine } from 'react-icons/ri';
import clsx from 'clsx';
import AvatarWithBorder from '../components/common/AvatarWithBorder';

const CATEGORIES = [
    { id: 'all', label: 'ALL_SIGNALS', color: 'text-gray-400 border-gray-700' },
    { id: 'general', label: 'General_Comms', color: 'text-cyan-400 border-cyan-900/50' },
    { id: 'html-css', label: 'HTML_CSS_Proto', color: 'text-orange-400 border-orange-900/50' },
    { id: 'javascript', label: 'JS_Scripting', color: 'text-yellow-400 border-yellow-900/50' },
    { id: 'react', label: 'React_Core', color: 'text-blue-400 border-blue-900/50' },
    { id: 'backend', label: 'Server_Side', color: 'text-green-400 border-green-900/50' },
    { id: 'help', label: 'System_Help', color: 'text-red-400 border-red-900/50' },
];

export default function Forum() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { completedCourses } = useProgress();
    const progress = getOverallProgress(completedCourses);

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchIntelligenceStream();
    }, [sortBy]);

    const fetchIntelligenceStream = async () => {
        try {
            const data = await apiFetch(`/api/forum?resource=posts&sortBy=${sortBy}`);
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.title.trim() || !newPost.content.trim()) return;

        setSubmitting(true);
        try {
            await apiFetch('/api/forum?resource=posts', {
                method: 'POST',
                body: { title: newPost.title, content: newPost.content, category: newPost.category }
            });
            setNewPost({ title: '', content: '', category: 'general' });
            setShowNewPost(false);
            fetchIntelligenceStream();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'JUST_NOW';
        if (mins < 60) return `${mins}m_AGO`;
        if (hours < 24) return `${hours}h_AGO`;
        if (days < 7) return `${days}d_AGO`;
        return d.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-cyan-500 font-mono text-xs animate-pulse">LOADING_NEURAL_LINK...</span>
                </div>
            </div>
        );
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-sans relative">
                {/* CYBER BACKGROUND */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                    {/* HUB HEADER */}
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16 border-b border-white/10 pb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                                <span className="text-[10px] font-mono text-green-400 tracking-[0.2em] uppercase">Net_Status: Online</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2">
                                NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 glitch-text" data-text="NETWORK">NETWORK</span>
                            </h1>
                            <p className="text-gray-400 font-mono text-sm max-w-xl border-l-2 border-cyan-500/30 pl-4">
                                &gt; Global developer synchronization active.<br />
                                &gt; Share intelligence, debugging protocols, and architectural patterns.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            {[
                                { label: 'Signals', value: posts.length, icon: <MessageSquare size={14} className="text-cyan-400" /> },
                                { label: 'Net_Intel', value: '8.4TB', icon: <Zap size={14} className="text-yellow-400" /> },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 px-6 py-3 rounded-sm backdrop-blur-sm">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                                        {stat.icon} {stat.label}
                                    </div>
                                    <div className="text-2xl font-bold text-white tabular-nums">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CONTROLS */}
                    <div className="flex flex-col lg:flex-row gap-6 mb-10">
                        {/* SEARCH */}
                        <div className="relative flex-1">
                            <div className="absolute inset-0 bg-cyan-500/5 blur-xl pointer-events-none" />
                            <div className="relative flex items-center bg-black/50 border border-white/10 focus-within:border-cyan-500/50 transition-colors">
                                <span className="pl-4 text-cyan-500 font-mono text-lg">{'>'}</span>
                                <input
                                    type="text"
                                    placeholder="SEARCH_DATABASE..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-4 bg-transparent text-sm font-mono text-white placeholder-gray-600 focus:outline-none uppercase"
                                />
                                <div className="pr-4">
                                    <Search size={18} className="text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* CREATE BUTTON */}
                        <button
                            onClick={() => setShowNewPost(true)}
                            className="relative group px-8 py-4 bg-cyan-500 hover:bg-cyan-400 transition-all cursor-pointer"
                            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                        >
                            <div className="flex items-center gap-3 text-black font-black text-xs uppercase tracking-widest">
                                <Plus size={16} strokeWidth={3} />
                                Broadcast_Signal
                            </div>
                        </button>
                    </div>

                    {/* CATEGORY MATRIX */}
                    <div className="flex gap-2 overflow-x-auto pb-8 no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={clsx(
                                    "px-4 py-2 border text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap",
                                    selectedCategory === cat.id
                                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)]"
                                        : "bg-black/40 border-white/10 text-gray-500 hover:border-white/30 hover:text-white"
                                )}
                            >
                                [{cat.label}]
                            </button>
                        ))}
                    </div>

                    {/* FEED STREAM */}
                    <div className="space-y-4">
                        <AnimatePresence mode='popLayout'>
                            {filteredPosts.map((post, idx) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => navigate(`/forum/${post.id}`)}
                                    className="group relative bg-black/40 border border-white/10 hover:border-cyan-500/50 p-6 transition-all cursor-pointer overflow-hidden backdrop-blur-sm"
                                >
                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

                                    <div className="flex gap-6">
                                        {/* VOTE CELL */}
                                        <div className="hidden md:flex flex-col items-center gap-1 min-w-[50px] border-r border-white/5 pr-6">
                                            <ChevronRight className="text-gray-600 -rotate-90" size={16} />
                                            <span className="text-xl font-bold text-cyan-400">{post.likes || 0}</span>
                                            <span className="text-[8px] font-mono text-gray-500">VOTES</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                <AvatarWithBorder
                                                    url={post.author_avatar}
                                                    name={post.author_name}
                                                    border={post.author_border}
                                                    size="sm"
                                                    className="w-8 h-8"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-300 hover:text-cyan-400 transition-colors uppercase flex items-center gap-2">
                                                        @{post.author_name}
                                                        {post.author_tier === 'admin' ? (
                                                            <span className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] px-1.5 py-0.5 rounded font-mono tracking-wider">ADM</span>
                                                        ) : (
                                                            <span className={clsx(
                                                                "text-[10px] px-1.5 py-0.5 rounded font-mono tracking-wider border",
                                                                post.author_tier === 'elite' ? "bg-purple-500/10 border-purple-500/50 text-purple-400" :
                                                                    post.author_tier === 'pro' ? "bg-blue-500/10 border-blue-500/50 text-blue-400" :
                                                                        "bg-gray-700/30 border-gray-600 text-gray-400"
                                                            )}>
                                                                {post.author_tier ? post.author_tier.substring(0, 3).toUpperCase() : 'USR'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <span className="text-[8px] font-mono text-gray-600 px-2 py-0.5 border border-white/10 rounded">
                                                    {formatDate(post.created_at)}
                                                </span>
                                                <span className={clsx(
                                                    "ml-auto text-[8px] px-2 py-0.5 border uppercase tracking-wider font-mono",
                                                    CATEGORIES.find(c => c.id === post.category)?.color || CATEGORIES[0].color
                                                )}>
                                                    {CATEGORIES.find(c => c.id === post.category)?.label}
                                                </span>
                                            </div>

                                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                                                {post.title}
                                            </h3>

                                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 font-mono">
                                                {post.content}
                                            </p>

                                            {/* MOBILE METRICS */}
                                            <div className="flex md:hidden items-center gap-4 mt-4 text-[10px] font-mono text-gray-500">
                                                <span className="flex items-center gap-1"><ThumbsUp size={10} /> {post.likes || 0} UPVOTES</span>
                                                <span className="flex items-center gap-1"><MessageCircle size={10} /> {post.reply_count || 0} REPLIES</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* MODAL */}
                    <AnimatePresence>
                        {showNewPost && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowNewPost(false)}
                                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="relative w-full max-w-2xl bg-black border border-cyan-500/30 p-1"
                                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)" }}
                                >
                                    <div className="bg-zinc-900/90 p-8 relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                                                <span className="text-cyan-500 text-4xl leading-none">/</span>
                                                INITIATE_PROTOCOL
                                            </h2>
                                            <button onClick={() => setShowNewPost(false)} className="text-gray-500 hover:text-red-500 transition-colors">
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <form onSubmit={handleCreatePost} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-mono text-cyan-500 uppercase">Target_Sector</label>
                                                    <select
                                                        value={newPost.category}
                                                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                                        className="w-full bg-black border border-white/20 p-3 text-sm text-white font-mono focus:border-cyan-500 focus:outline-none"
                                                    >
                                                        {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-mono text-cyan-500 uppercase">Subject_Line</label>
                                                    <input
                                                        type="text"
                                                        value={newPost.title}
                                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                                        className="w-full bg-black border border-white/20 p-3 text-sm text-white font-bold placeholder-gray-700 focus:border-cyan-500 focus:outline-none"
                                                        placeholder="ENTER_TITLE..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-mono text-cyan-500 uppercase">Transmission_Data</label>
                                                <textarea
                                                    value={newPost.content}
                                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                                    rows={6}
                                                    className="w-full bg-black border border-white/20 p-3 text-sm text-gray-300 font-mono placeholder-gray-700 focus:border-cyan-500 focus:outline-none resize-none"
                                                    placeholder="Input architectural data..."
                                                />
                                            </div>

                                            <div className="flex justify-end gap-4 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPost(false)}
                                                    className="px-6 py-3 text-xs font-mono text-gray-500 hover:text-white transition-colors"
                                                >
                                                    TERMINATE
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="px-8 py-3 bg-cyan-500 text-black font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors disabled:opacity-50"
                                                >
                                                    {submitting ? 'UPLOADING...' : 'SEND_TRANSMISSION'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AppLayout>
    );
}

