import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaRocket, FaNodeJs, FaReact, FaCheckCircle, FaArrowLeft,
    FaGem, FaBug, FaCode, FaRobot, FaDatabase, FaShieldAlt
} from 'react-icons/fa';
import { SiTailwindcss, SiTypescript } from 'react-icons/si';
import AppLayout from '../components/layout/AppLayout';

// Changelog Page Component
const Changelog = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('last_viewed_update', '2.8.0-beta.1');
    }, []);

    const updates = [
        {
            version: "2.8.0-beta.1",
            date: "Aug 15, 2026",
            type: "major",
            title: "Security Hardening & Performance",
            icon: <FaShieldAlt className="text-emerald-400 text-xl" />,
            color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
            changes: [
                "Full Backend Serverization: all DB queries moved from browser to serverless API with opaque session tokens.",
                "Server-side authorization on every endpoint (userId from token, not request body).",
                "Admin access enforced server-side; admin secret code no longer exposed to client.",
                "Rate limiting on all auth endpoints (login, register, verify, reset).",
                "Google & GitHub OAuth verified server-side.",
                "Removed /migrate route that could drop tables.",
                "Fixed auth hang bug (504): rate limit helpers now return booleans.",
                "Fixed blank landing page (WHATSAPP_NUMBER ReferenceError).",
                "Fixed undefined version bug in course completion.",
                "Error Boundary: one page crash no longer blanks the whole app.",
                "Code Splitting: main bundle 6.7MB → 3.8MB. Monaco/mermaid/3D load on demand.",
                "Consistent pricing across landing, admin, and AI assistant (Starter 50K / Developer 75K / Professional 80K / Master 164K).",
                "SEO: sitemap.xml, robots.txt, og:image, canonical, locale id_ID.",
                "Dependency security: nodemailer 7→9 (6 advisories fixed), framer-motion 13, lucide-react 1.31.",
                "Testing: Vitest suite (15 tests) for rate limiter, token hashing, and pricing.",
                "Removed dead code: Groq aiService (unified on Gemini), supabase, resend."
            ]
        },
        {
            version: "2.7.0-beta.1",
            date: "Aug 10, 2026",
            type: "major",
            title: "Cyberpunk Authentication Protocol",
            icon: <FaShieldAlt className="text-purple-400 text-xl" />,
            color: "border-purple-500/50 bg-purple-500/10 text-purple-400",
            changes: [
                "New Login/Register Experience: 'Neural Handshake' DNA Interface.",
                "Global Aesthetic Refinement: Darker backgrounds and sharper contrasts.",
                "Syllabus Update: Enhanced DNA Background visibility and 'Data Panel' containers.",
                "Security: Visual enhancements for authentication terminals."
            ]
        },
        {
            version: "2.6.0-beta.1",
            date: "Aug 1, 2026",
            type: "major",
            title: "Cyberpunk Evolution & Beta Launch",
            icon: <FaRocket className="text-cyan-400 text-xl" />,
            color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
            changes: [
                "OFFICIAL BETA RELEASE: ZeroCode Platform is now in Public Beta.",
                "New 'Neural Access' DNA Pricing Engine: 3D Canvas Helix with Infinite Scroll.",
                "Landing Page Overhaul: Cyberpunk HUD Navbar & 'Code Evolution' Hero.",
                "Visual Upgrade: Neon Grid Systems, Glitch Typography, and Holo-Terminal Previews.",
                "Performance: Optimized Canvas rendering for smooth 60fps animations."
            ]
        },
        {
            version: "2.5.5",
            date: "Jul 25, 2026",
            type: "minor",
            title: "Identity Refresh & Stability",
            icon: <FaGem className="text-pink-400 text-xl" />,
            color: "border-pink-500/50 bg-pink-500/10 text-pink-400",
            changes: [
                "New Brand Identity: 'Rocket Z0' Logo integration.",
                "Fixed Critical Crash in Learning Navigation.",
                "Resolved key collision in CSS Curriculum.",
                "Optimized asset rendering for transparent logos."
            ]
        },
        {
            version: "2.5.0",
            date: "Dec 22, 2025",
            type: "major",
            title: "The Elegant Intelligence Update",
            icon: <FaRobot className="text-indigo-400 text-xl" />,
            color: "border-indigo-500/50 bg-indigo-500/10 text-indigo-400",
            changes: [
                "New AI Learning Assistant with context-aware code help.",
                "Complete Rebranding: 'ZeroCode' with High Contrast Identity.",
                "Forum 2.0: Elegant Dark UI, Visual Tagging, and Editing.",
                "Redesigned Navigation with Syllabus-based progress tracking.",
                "Fixed 'Get Unstuck' and optimized performance."
            ]
        },
        {
            version: "2.2.0",
            date: "Dec 21, 2025",
            type: "major",
            title: "The Node.js Expansion",
            icon: <FaNodeJs className="text-green-400 text-xl" />,
            color: "border-green-500/50 bg-green-500/10 text-green-400",
            changes: [
                "Expanded Node.js course from 1 to 12 Units (Elite Standard).",
                "Added 'Deep Dive' informational modules for V8 and Event Loop.",
                "New Units: Authentication (JWT/Bcrypt), Real-time (Socket.io).",
                "Implemented Clustering & Deployment labs."
            ]
        },
        {
            version: "2.1.5",
            date: "Dec 21, 2025",
            type: "feature",
            title: "Visual Identity System",
            icon: <FaGem className="text-cyan-400 text-xl" />,
            color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
            changes: [
                "New Holographic Logo implementation.",
                "Redesigned Navigation Header with glassmorphism.",
                "Added 'Updates' and 'Notification' system.",
                "Improved Dashboard responsive layout."
            ]
        },
        {
            version: "2.1.0",
            date: "Dec 20, 2025",
            type: "major",
            title: "React.js Reconstruction",
            icon: <FaReact className="text-blue-400 text-xl" />,
            color: "border-blue-500/50 bg-blue-500/10 text-blue-400",
            changes: [
                "Refactored entire React curriculum to Elite Standard.",
                "Added 16 Units covering modern Hooks and Patterns.",
                "New Capstone Project: E-Commerce Dashboard.",
                "Fixed syntax highlighting in code runners."
            ]
        },
        {
            version: "2.0.8",
            date: "Dec 18, 2025",
            type: "minor",
            title: "CSS & Styling Audit",
            icon: <SiTailwindcss className="text-sky-400 text-xl" />,
            color: "border-sky-500/50 bg-sky-500/10 text-sky-400",
            changes: [
                "Refactored Tailwind CSS units for better clarity.",
                "Added 'Dark Mode' specific labs.",
                "Fixed validation regex for CSS Grid challenges."
            ]
        },
        {
            version: "2.0.0",
            date: "Dec 15, 2025",
            type: "major",
            title: "ZeroCode AI Integration",
            icon: <FaRobot className="text-purple-400 text-xl" />,
            color: "border-purple-500/50 bg-purple-500/10 text-purple-400",
            changes: [
                "launched 'Nebula' AI Tutor Assistant.",
                "Context-aware help button in every lesson.",
                "Automated code review and hint system.",
                "Personality matrix updated for friendlier responses."
            ]
        },
        {
            version: "1.5.0",
            date: "Nov 30, 2025",
            type: "feature",
            title: "Authentication Layer",
            icon: <FaShieldAlt className="text-yellow-400 text-xl" />,
            color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
            changes: [
                "Added Role-Based Access Control (RBAC).",
                "Admin Dashboard for curriculum management.",
                "Secure JWT token handling.",
                "Email verification workflow."
            ]
        },
        {
            version: "1.0.0",
            date: "Oct 1, 2025",
            type: "release",
            title: "Genesis Launch",
            icon: <FaRocket className="text-pink-400 text-xl" />,
            color: "border-pink-500/50 bg-pink-500/10 text-pink-400",
            changes: [
                "Initial release of ZeroCode Platform.",
                "Basic JavaScript and HTML courses.",
                "Interactive Web-based IDE.",
                "User Progress Tracking."
            ]
        }
    ];

    return (
        <AppLayout>
            <div className="relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-4xl mx-auto relative z-10">
                    <header className="mb-16">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center text-slate-400 hover:text-white mb-8 transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 mr-3 transition-all">
                                <FaArrowLeft />
                            </div>
                            <span className="font-mono text-sm tracking-wider">RETURN TO BASE</span>
                        </button>

                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                                    SYSTEM LOGS
                                </h1>
                                <p className="text-slate-400 font-mono text-lg">
                                    // Tracking protocol evolution
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="px-4 py-2 border border-slate-700 rounded-lg bg-slate-900/50 text-right">
                                    <p className="text-xs text-slate-500 font-mono uppercase">Current Version</p>
                                    <p className="text-xl font-bold text-cyan-400 font-mono">v2.8.0-beta.1</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="relative border-l-2 border-slate-800 ml-4 md:ml-10 space-y-12 pb-20">
                        {updates.map((update, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative pl-8 md:pl-12"
                            >
                                {/* Timeline Node */}
                                <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-[#050511] ${update.type === 'major' ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-slate-600'}`} />

                                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-slate-800/40 hover:border-white/10 transition-all group backdrop-blur-sm">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl border ${update.color} shadow-lg shadow-black/20`}>
                                                {update.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h2 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                                                        {update.title}
                                                    </h2>
                                                    {update.type === 'major' && (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-pink-500/20 text-pink-400 border border-pink-500/20">
                                                            Major
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-400 text-sm font-mono flex items-center gap-2">
                                                    <span>v{update.version}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                    <span>{update.date}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {update.changes.map((change, i) => (
                                            <li key={i} className="flex items-start text-slate-300 text-sm group/item">
                                                <span className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-sm bg-indigo-500 group-hover/item:bg-cyan-400 transition-colors" />
                                                <span className="leading-relaxed">{change}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Changelog;
