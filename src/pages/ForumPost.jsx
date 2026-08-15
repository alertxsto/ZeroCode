import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthProvider';
import { apiFetch } from '../lib/apiClient';
import {
    ArrowLeft, ThumbsUp, MessageCircle, Clock, Send, Trash2, Edit2, X,
    ShieldAlert, Terminal, Share2, MoreHorizontal, CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import AvatarWithBorder from '../components/common/AvatarWithBorder';

const CATEGORIES = [
    { id: 'general', label: 'General_Comms', color: 'text-cyan-400 border-cyan-900/50' },
    { id: 'html-css', label: 'HTML_CSS_Proto', color: 'text-orange-400 border-orange-900/50' },
    { id: 'javascript', label: 'JS_Scripting', color: 'text-yellow-400 border-yellow-900/50' },
    { id: 'react', label: 'React_Core', color: 'text-blue-400 border-blue-900/50' },
    { id: 'backend', label: 'Server_Side', color: 'text-green-400 border-green-900/50' },
    { id: 'help', label: 'System_Help', color: 'text-red-400 border-red-900/50' },
];

export default function ForumPost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Edit State
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostContent, setEditPostContent] = useState('');
    const [editPostTitle, setEditPostTitle] = useState('');

    // Reply Edit State (one at a time)
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editReplyContent, setEditReplyContent] = useState('');

    // Delete Modal State
    const [deleteConfig, setDeleteConfig] = useState({ open: false, type: null, id: null });

    const replyRef = useRef(null);

    // Auto-expand textarea
    useEffect(() => {
        if (replyRef.current) {
            replyRef.current.style.height = 'auto';
            const newHeight = Math.min(replyRef.current.scrollHeight, 200); // Max ~8 lines
            replyRef.current.style.height = `${newHeight}px`;
        }
    }, [replyContent]);

    useEffect(() => {
        loadPost();
        loadReplies();
    }, [postId]);

    const loadPost = async () => {
        try {
            const data = await apiFetch(`/api/forum?resource=posts&id=${postId}`);
            const result = [data.post];
            if (result.length > 0) {
                setPost(result[0]);
                setEditPostContent(result[0].content);
                setEditPostTitle(result[0].title);
            } else {
                navigate('/community');
            }
        } catch (error) {
            console.error('Error loading post:', error);
            navigate('/community');
        } finally {
            setLoading(false);
        }
    };

    const loadReplies = async () => {
        try {
            const data = await apiFetch(`/api/forum?resource=replies&id=${postId}`);
            setReplies(data.replies || []);
        } catch (error) {
            console.error('Error loading replies:', error);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setSubmitting(true);
        try {
            await apiFetch('/api/forum?resource=replies', {
                method: 'POST',
                body: { postId, content: replyContent }
            });
            setReplyContent('');
            loadReplies();
        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdatePost = async () => {
        try {
            await apiFetch(`/api/forum?resource=posts&id=${postId}`, {
                method: 'PATCH',
                body: { title: editPostTitle, content: editPostContent }
            });
            setIsEditingPost(false);
            loadPost();
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post');
        }
    };

    const handleUpdateReply = async (replyId) => {
        try {
            await apiFetch(`/api/forum?resource=replies&id=${replyId}`, {
                method: 'PATCH',
                body: { content: editReplyContent }
            });
            setEditingReplyId(null);
            loadReplies();
        } catch (error) {
            console.error('Error updating reply:', error);
            alert('Failed to update reply');
        }
    };

    const handleLike = async () => {
        try {
            await apiFetch(`/api/forum?resource=likes&id=${postId}`, { method: 'POST' });
            loadPost();
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleDeletePost = () => {
        setDeleteConfig({ open: true, type: 'post', id: postId });
    };

    const handleDeleteReply = (replyId) => {
        setDeleteConfig({ open: true, type: 'reply', id: replyId });
    };

    const confirmDelete = async () => {
        const { type, id } = deleteConfig;
        setDeleteConfig({ ...deleteConfig, open: false });

        try {
            if (type === 'post') {
                await apiFetch(`/api/forum?resource=posts&id=${id}`, { method: 'DELETE' });
                navigate('/community');
            } else if (type === 'reply') {
                await apiFetch(`/api/forum?resource=replies&id=${id}`, { method: 'DELETE' });
                loadReplies();
            }
        } catch (error) {
            console.error('Error during deletion:', error);
            alert('CRITICAL_ERROR: Deletion failed');
        }
    };

    const renderContent = (content) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) =>
            part.startsWith('@')
                ? <span key={i} className="text-cyan-400 font-bold bg-cyan-500/10 px-1 rounded mx-0.5 border border-cyan-500/20">{part}</span>
                : <span key={i}>{part}</span>
        );
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-cyan-500 font-mono text-xs animate-pulse">DECRYPTING_SIGNAL...</span>
                </div>
            </div>
        );
    }

    if (!post) return null;

    const canEditPost = post.user_id === user.id;
    const canDeletePost = isAdmin || post.user_id === user.id;

    return (
        <AppLayout>
            <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-sans relative overflow-x-hidden">
                {/* GLOBAL GRID */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                </div>

                <div className="max-w-[1600px] mx-auto px-6 py-12 relative z-10">
                    {/* BREADCRUMB / NAV */}
                    <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => navigate('/community')}
                            className="flex items-center gap-3 text-gray-500 hover:text-cyan-400 transition-colors group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-mono text-xs tracking-widest uppercase">[ RETURN_TO_GRID ]</span>
                        </motion.button>

                        <div className="flex items-center gap-4">
                            <span className="font-mono text-xs text-gray-600 uppercase tracking-widest">
                                SIGNAL_ID: {post.id.toString().padStart(6, '0')}
                            </span>
                            <div className="h-4 w-px bg-white/10" />
                            <span className={clsx(
                                "text-[10px] px-2 py-0.5 border uppercase tracking-wider font-mono",
                                CATEGORIES.find(c => c.id === post.category)?.color || CATEGORIES[0].color
                            )}>
                                {CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* LEFT: AUTHOR PROFILE (LANDSCAPE SIDEBAR) */}
                        <div className="lg:col-span-3 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                {/* Author Card - Cyberpunk Style */}
                                <div className="bg-zinc-900/50 border border-white/10 p-6 relative overflow-hidden backdrop-blur-sm group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent" />
                                    <div className="absolute -right-12 -top-12 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-colors" />

                                    <div className="flex flex-col items-center text-center">
                                        <div className="mb-6 relative">
                                            <AvatarWithBorder
                                                url={post.author_avatar}
                                                name={post.author_name}
                                                border={post.author_border}
                                                size="xl"
                                                className="w-32 h-32"
                                            />
                                            {post.author_tier === 'admin' && (
                                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 text-black text-[10px] font-black uppercase tracking-widest border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] whitespace-nowrap z-10 clip-path-badge min-w-[100px]">
                                                    SECTOR_ADMIN
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                                            {post.author_name}
                                        </h2>

                                        <div className="flex flex-col items-center gap-1 mb-6 w-full">
                                            {post.author_tier === 'admin' ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.2em] w-full text-center">
                                                        SYSTEM_OVERLORD
                                                    </span>
                                                    <span className="text-[9px] font-mono text-gray-500 uppercase">
                                                        AUTHOR / SECTOR CONTROLLER
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.2em]">
                                                    {post.author_tier ? post.author_tier.toUpperCase() : 'NETWORK_USER'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="w-full grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-500 border-t border-white/5 pt-4">
                                            <div className="flex flex-col border-r border-white/5">
                                                <span className="text-white font-bold block mb-1">JOINED</span>
                                                {new Date(post.author_joined || Date.now()).toLocaleDateString()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold block mb-1">STATUS</span>
                                                <span className="text-green-500 animate-pulse">ONLINE</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT: CONTENT (WIDE) */}
                        <div className="lg:col-span-9">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col h-full"
                            >
                                {/* MAIN POST */}
                                <div className="bg-black border border-white/10 relative overflow-hidden mb-12 min-h-[400px]">
                                    {/* HUD CORNERS */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500" />
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500" />

                                    {/* HEADER */}
                                    <div className="p-8 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Terminal size={14} className="text-cyan-500" />
                                                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">
                                                    INCOMING_TRANSMISSION
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-600">
                                                    // {formatDate(post.created_at)}
                                                </span>
                                            </div>

                                            {isEditingPost ? (
                                                <input
                                                    type="text"
                                                    value={editPostTitle}
                                                    onChange={(e) => setEditPostTitle(e.target.value)}
                                                    className="w-full bg-zinc-900 border border-white/20 p-4 text-2xl font-bold text-white font-mono focus:border-cyan-500 outline-none"
                                                />
                                            ) : (
                                                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-tight max-w-4xl">
                                                    {post.title}
                                                </h1>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {canEditPost && !isEditingPost && (
                                                <button onClick={() => setIsEditingPost(true)} aria-label="Edit post" className="p-2 text-gray-500 hover:text-white transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {canDeletePost && (
                                                <button onClick={handleDeletePost} aria-label="Delete post" className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* BODY */}
                                    <div className="p-8 md:p-12">
                                        {isEditingPost ? (
                                            <>
                                                <textarea
                                                    value={editPostContent}
                                                    onChange={(e) => setEditPostContent(e.target.value)}
                                                    rows={12}
                                                    className="w-full bg-zinc-900 border border-white/20 p-6 text-sm text-gray-300 font-mono focus:border-cyan-500 outline-none resize-none mb-4 leading-relaxed"
                                                />
                                                <div className="flex justify-end gap-4">
                                                    <button onClick={() => setIsEditingPost(false)} className="text-xs font-mono text-gray-500 hover:text-white">CANCEL</button>
                                                    <button onClick={handleUpdatePost} className="px-6 py-2 bg-cyan-500 text-black text-xs font-bold uppercase hover:bg-cyan-400 transition-colors">SAVE_CHANGES</button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="prose prose-invert prose-p:font-mono prose-headings:font-black prose-a:text-cyan-400 max-w-none break-words">
                                                {post.content.split('\n').map((paragraph, idx) => (
                                                    <p key={idx} className="mb-6 text-gray-300 text-lg leading-relaxed font-sans font-light">
                                                        {renderContent(paragraph)}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* FOOTER ACTIONS */}
                                    <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleLike}
                                                className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 transition-all uppercase tracking-wider text-[10px] font-bold text-white clip-path-slanted"
                                            >
                                                <ThumbsUp size={14} className={post.likes > 0 ? "text-cyan-400" : "text-gray-500"} />
                                                ACKNOWLEDGE ({post.likes || 0})
                                            </button>
                                            <button className="flex items-center gap-3 px-6 py-3 bg-transparent border border-white/10 hover:border-white/30 transition-all uppercase tracking-wider text-[10px] font-bold text-gray-400">
                                                <Share2 size={14} />
                                                SHARE_LINK
                                            </button>
                                        </div>
                                    </div>
                                </div>


                                {/* REPLIES LOG */}
                                <div className="space-y-8 relative">
                                    <div className="flex items-center gap-4 mb-8">
                                        <Terminal size={16} className="text-purple-500" />
                                        <h3 className="text-sm font-black text-purple-400 uppercase tracking-[0.2em]">
                                            LINKED_SIGNALS ({replies.length})
                                        </h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
                                    </div>

                                    <div className="space-y-6 pl-0 md:pl-8 border-l border-white/5">
                                        {replies.map((reply) => {
                                            const canEditReply = reply.user_id === user.id;
                                            const canDeleteReply = isAdmin || reply.user_id === user.id;
                                            const isEditingThis = editingReplyId === reply.id;

                                            return (
                                                <motion.div
                                                    key={reply.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    className="group relative"
                                                >
                                                    <div className="absolute -left-[37px] top-6 w-3 h-3 bg-black border border-white/20 rounded-full z-10 hidden md:block group-hover:border-purple-500 transition-colors" />

                                                    <div className="bg-zinc-900/30 border border-white/5 p-6 hover:border-purple-500/30 transition-all">
                                                        <div className="flex items-start gap-4 mb-4">
                                                            <AvatarWithBorder
                                                                url={reply.author_avatar}
                                                                name={reply.author_name}
                                                                border={reply.author_border}
                                                                size="sm"
                                                                className="w-10 h-10"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-baseline gap-3 min-w-0">
                                                                        <span className="text-sm font-bold text-white uppercase tracking-tight">
                                                                            @{reply.author_name}
                                                                        </span>
                                                                        {reply.author_tier === 'admin' && (
                                                                            <span className="text-[9px] text-red-500 font-black tracking-widest">[ADMIN]</span>
                                                                        )}
                                                                        <span className="text-[10px] font-mono text-gray-600">
                                                                            {formatDate(reply.created_at)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        {canEditReply && !isEditingThis && (
                                                                            <button onClick={() => { setEditingReplyId(reply.id); setEditReplyContent(reply.content); }} aria-label="Edit reply" className="text-gray-500 hover:text-white"><Edit2 size={12} /></button>
                                                                        )}
                                                                        {canDeleteReply && !isEditingThis && (
                                                                            <button onClick={() => handleDeleteReply(reply.id)} aria-label="Delete reply" className="text-gray-500 hover:text-red-500"><Trash2 size={12} /></button>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {isEditingThis ? (
                                                                    <div className="mt-4 space-y-3">
                                                                        <textarea
                                                                            value={editReplyContent}
                                                                            onChange={(e) => setEditReplyContent(e.target.value)}
                                                                            className="w-full bg-black border border-white/20 p-4 text-sm text-white font-mono"
                                                                            rows={4}
                                                                        />
                                                                        <div className="flex justify-end gap-3">
                                                                            <button onClick={() => setEditingReplyId(null)} className="text-[10px] text-gray-500">CANCEL</button>
                                                                            <button onClick={() => handleUpdateReply(reply.id)} className="text-[10px] bg-cyan-500 text-black px-3 py-1 font-bold rounded-md">UPDATE</button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="mt-2 text-gray-400 font-mono text-sm leading-relaxed break-words">
                                                                        {renderContent(reply.content)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* FIXED REPLY BAR - CYBER DECK CONSOLE */}
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl pointer-events-none">
                        {/* Status Label (Top Left of Deck) */}
                        <div className="absolute -top-5 left-4 flex items-center gap-2 pointer-events-auto">
                            <div className="bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-t-lg">
                                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                                    TRANSMISSION_LINK_ESTABLISHED
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#050505]/95 backdrop-blur-2xl border border-white/10 rounded-xl p-1 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] pointer-events-auto relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                            {/* Cyber Corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-cyan-500/50 transition-colors rounded-tl-sm" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-cyan-500/50 transition-colors rounded-tr-sm" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-cyan-500/50 transition-colors rounded-bl-sm" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-cyan-500/50 transition-colors rounded-br-sm" />

                            {/* Inner Deck */}
                            <div className="bg-zinc-900/50 rounded-lg border border-white/5 flex items-center gap-2 p-2 pl-4">
                                <form onSubmit={handleReply} className="flex-1 flex items-center gap-4">
                                    <div className="flex-1">
                                        <textarea
                                            ref={replyRef}
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="WRITE_REPLY //..."
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleReply(e);
                                                }
                                            }}
                                            className="w-full bg-transparent border-none py-2 text-sm text-white font-mono placeholder-zinc-600 focus:ring-0 focus:outline-none transition-all resize-none leading-relaxed min-h-[40px] pt-2.5 max-h-[200px]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || !replyContent.trim()}
                                        className="h-9 px-4 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all disabled:opacity-30 rounded-md flex items-center gap-2"
                                    >
                                        <span>SEND</span>
                                        <CornerDownRight size={12} strokeWidth={3} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="h-24" /> {/* Spacer for fixed bar */}
                </div>
            </div>

            <style>{`
                .clip-path-badge {
                    clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
                }
                .clip-path-slanted {
                    clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%);
                }
            `}</style>

            {/* DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {deleteConfig.open && (
                    <ConfirmModal
                        type={deleteConfig.type}
                        onConfirm={confirmDelete}
                        onCancel={() => setDeleteConfig({ open: false, type: null, id: null })}
                    />
                )}
            </AnimatePresence>
        </AppLayout>
    );
}

function ConfirmModal({ type, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-zinc-950 border border-red-500/50 p-8 relative overflow-hidden"
            >
                {/* HUD Elements */}
                <div className="absolute top-0 right-0 p-2 opacity-20">
                    <ShieldAlert size={40} className="text-red-500" />
                </div>
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500" />

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4 text-red-500 mb-2">
                        <Terminal size={18} />
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em]">System_Constraint_Alert</span>
                    </div>

                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                        Confirm_Data_Erasure?
                    </h3>

                    <p className="text-zinc-500 font-mono text-sm leading-relaxed">
                        &gt; TARGET_{type.toUpperCase()}_LOG detected. <br />
                        &gt; This action will permanently overwrite the sector. <br />
                        &gt; Recovery is statistically impossible.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 border border-white/10 text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            [ ABORT_PROCESS ]
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-6 py-3 bg-red-600 text-white font-black text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                        >
                            EXECUTE_PURGE
                        </button>
                    </div>
                </div>

                {/* Scanning line */}
                <div className="absolute inset-x-0 h-[2px] bg-red-500/20 top-0 animate-[scan_2s_linear_infinite]" />
            </motion.div>
        </div>
    );
}
