import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiOrganizationChart, RiExpandDiagonalLine, RiCloseLine, RiDatabase2Line, RiFocus2Line, RiCodeBoxLine, RiGitMergeLine, RiCheckDoubleLine, RiExpandUpDownLine, RiSubtractLine, RiFullscreenLine } from 'react-icons/ri';
import { SiHtml5, SiCss, SiJavascript, SiReact, SiNodedotjs, SiPostgresql, SiVuedotjs, SiExpress, SiGit, SiTailwindcss, SiTypescript, SiMongodb, SiPython, SiNextdotjs, SiPhp, SiMysql } from 'react-icons/si';
import { useProgress } from '../../contexts/ProgressProvider';
import { getCourseWithContent } from '../../data/courses/index.js';
import UpdateBadge from './UpdateBadge';
import clsx from 'clsx';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------

const SKILL_MAP = {
    'html5': { name: 'HTML5', icon: SiHtml5, color: '#E44D26', code: 'HTM' },
    'css3': { name: 'CSS3', icon: SiCss, color: '#1572B6', code: 'CSS' },
    'tailwind': { name: 'Tailwind', icon: SiTailwindcss, color: '#38B2AC', code: 'TWN' },
    'js-basics': { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E', code: 'JSB' },
    'js-es6': { name: 'ES6+', icon: SiJavascript, color: '#F7DF1E', code: 'JS6' },
    'typescript': { name: 'TypeScript', icon: SiTypescript, color: '#3178C6', code: 'TSC' },
    'python': { name: 'Python', icon: SiPython, color: '#3776AB', code: 'PYT' },
    'react': { name: 'React', icon: SiReact, color: '#61DAFB', code: 'RCT' },
    'vue': { name: 'Vue.js', icon: SiVuedotjs, color: '#4FC08D', code: 'VUE' },
    'node': { name: 'Node.js', icon: SiNodedotjs, color: '#339933', code: 'NOD' },
    'express': { name: 'Express', icon: SiExpress, color: '#FFFFFF', code: 'EXP' },
    'php': { name: 'PHP', icon: SiPhp, color: '#777BB4', code: 'PHP' },
    'nextjs': { name: 'Next.js', icon: SiNextdotjs, color: '#FFFFFF', code: 'NXT' },
    'mysql': { name: 'MySQL', icon: SiMysql, color: '#4479A1', code: 'SQL' },
    'mongodb': { name: 'MongoDB', icon: SiMongodb, color: '#47A248', code: 'MDB' },
    'postgresql': { name: 'PostgreSQL', icon: SiPostgresql, color: '#336791', code: 'PSG' },
    'git': { name: 'Git', icon: SiGit, color: '#F05032', code: 'GIT' }
};

const getRank = (percentage) => {
    if (percentage >= 100) return { label: 'MASTER DOJO', color: 'text-amber-400', border: 'border-amber-500/50' };
    if (percentage >= 80) return { label: 'SENIOR DEV', color: 'text-cyan-400', border: 'border-cyan-500/50' };
    if (percentage >= 60) return { label: 'MID-LEVEL', color: 'text-emerald-400', border: 'border-emerald-500/50' };
    if (percentage >= 40) return { label: 'JUNIOR', color: 'text-blue-400', border: 'border-blue-500/50' };
    return { label: 'TRAINEE', color: 'text-zinc-500', border: 'border-zinc-700' };
};


const UpdateBadgeWrapper = ({ unit, courseId }) => {
    const { checkUnitStatus } = useProgress();
    // Verify checkUnitStatus exists to prevent crashes if context is old
    if (!checkUnitStatus) return null;

    const status = checkUnitStatus(unit.id, unit.version, courseId);

    if (status === 'update_available') return <UpdateBadge />;
    return null;
};
export default function NeuralTechTreeWidget() {
    const { completedCourses, completedItems } = useProgress();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    // Dynamic Node Calculation (Graph View)
    const { nodes, stats } = useMemo(() => {
        const baseNodes = [
            { id: 'html', courseId: 'web-development-html', label: 'HTML', status: 'locked' },
            { id: 'css', courseId: 'web-development-css', label: 'CSS', status: 'locked' },
            { id: 'js', courseId: 'javascript-basics', label: 'JS', status: 'locked' },
            { id: 'react', courseId: 'react-fundamentals', label: 'REACT', status: 'locked' },
            { id: 'node', courseId: 'nodejs-fundamentals', label: 'NODE', status: 'locked' },
            { id: 'sql', courseId: 'postgresql-mastery', label: 'SQL', status: 'locked' }
        ];

        let masteredCount = 0;
        let activeUnlockedCount = 0;
        let lockedCount = 0;

        const updatedNodes = baseNodes.map(node => {
            const isCompleted = completedCourses.includes(node.courseId);
            if (isCompleted) {
                masteredCount++;
                return { ...node, status: 'mastered' };
            }
            if (node.id === 'html') {
                activeUnlockedCount++;
                return { ...node, status: 'active' };
            }
            lockedCount++;
            return node;
        });

        const mastery = Math.round((masteredCount / baseNodes.length) * 100);
        return {
            nodes: updatedNodes,
            stats: { mastery, active: activeUnlockedCount, mastered: masteredCount, total: baseNodes.length }
        };
    }, [completedCourses]);

    // Skill Analytics Calculation (Fullscreen View)
    const skillStats = useMemo(() => {
        const calculated = [];
        let totalItemsGlobal = 0;
        let completedItemsGlobal = 0;

        Object.entries(SKILL_MAP).forEach(([courseId, meta]) => {
            const course = getCourseWithContent(courseId);
            if (!course) return;

            const unitsData = [];
            let courseTotal = 0;
            let courseCompleted = 0;

            if (course.units) {
                course.units.forEach((unit, idx) => {
                    let unitTotal = 0;
                    let unitCompleted = 0;
                    if (unit.items) {
                        unit.items.forEach(item => {
                            unitTotal++;
                            courseTotal++;
                            if (completedItems.includes(item.id)) {
                                unitCompleted++;
                                courseCompleted++;
                            }
                        });
                    }
                    unitsData.push({ id: unit.id || `unit-${idx}`, title: unit.title || `Module ${idx + 1}`, total: unitTotal, completed: unitCompleted, progress: unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0 });
                });
            } else if (course.tasks) {
                let unitTotal = 0;
                let unitCompleted = 0;
                course.tasks.forEach(task => {
                    unitTotal++;
                    courseTotal++;
                    if (completedItems.includes(task.id)) {
                        unitCompleted++;
                        courseCompleted++;
                    }
                });
                unitsData.push({ id: 'tasks', title: 'Core Tasks', total: unitTotal, completed: unitCompleted, progress: unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0 });
            }

            const progress = courseTotal > 0 ? Math.round((courseCompleted / courseTotal) * 100) : 0;
            totalItemsGlobal += courseTotal;
            completedItemsGlobal += courseCompleted;

            calculated.push({ ...meta, id: courseId, progress, total: courseTotal, completed: courseCompleted, units: unitsData, rank: getRank(progress) });
        });

        return { overall: totalItemsGlobal > 0 ? Math.round((completedItemsGlobal / totalItemsGlobal) * 100) : 0, skills: calculated.sort((a, b) => b.progress - a.progress) };
    }, [completedItems]);

    useEffect(() => {
        if (isModalOpen && !selectedCourseId && skillStats.skills.length > 0) {
            setSelectedCourseId(skillStats.skills[0].id);
        }
    }, [isModalOpen, skillStats, selectedCourseId]);

    // --- EFFECT: BODY SCROLL LOCK ---
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isModalOpen]);

    const MiniStat = (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono">MASTERY</span>
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 border border-cyan-500/30 rounded bg-cyan-500/10">
                <span className="text-xs font-bold text-cyan-400">{stats.mastery}%</span>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_cyan] animate-pulse" />
            </div>
        </div>
    );

    return (
        <>
            <motion.div
                layout
                className={clsx(
                    "relative transition-all duration-300 group overflow-hidden",
                    !isSidebarOpen ? "bg-black" : "bg-zinc-950"
                )}
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}
            >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-500/30 z-30" />

                {/* Hardware Brackets */}
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/20 z-30 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/20 z-30 pointer-events-none" />

                <div className="absolute inset-0 border border-zinc-800/50 pointer-events-none" />
                <div className={clsx("absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 z-30", isSidebarOpen ? "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]" : "bg-zinc-800")} />

                <div onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full h-[72px] flex items-center justify-between px-4 relative z-20 cursor-pointer select-none">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Icon Tile - Cyber-Slat V3 */}
                        <div className={clsx("w-12 h-12 flex items-center justify-center transition-all duration-300 flex-shrink-0 relative overflow-hidden", !isSidebarOpen ? "bg-zinc-900 border border-zinc-800" : "bg-cyan-950/20 border border-cyan-500/40 shadow-[inset_0_0_20px_rgba(6,182,212,0.15)]")}>
                            {/* Hardware Corner Ticks */}
                            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-cyan-500/40" />
                            <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-cyan-500/40" />

                            {/* Scanline Animation Overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(6,182,212,1)_1px,rgba(6,182,212,1)_2px)] bg-[length:100%_2px]" />
                            <div
                                className="absolute inset-0 w-full h-[2px] bg-cyan-400/20 blur-[1px] z-10"
                                style={{ animation: 'scan 4s linear infinite' }}
                            />

                            {/* Radial Glow */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)]" />

                            <RiOrganizationChart size={24} className={clsx("transition-colors duration-300 relative z-20", isSidebarOpen ? "text-cyan-400" : "text-zinc-500")} />
                        </div>
                        <AnimatePresence mode="wait">
                            {isSidebarOpen ? (
                                <motion.div key="expanded" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col min-w-0">
                                    <h3 className="font-black font-mono text-[13px] uppercase text-white leading-none truncate">NEURAL_TREE</h3>
                                    <span className="text-[9px] font-mono uppercase text-cyan-500/60 mt-1 truncate">// NODE_OPS</span>
                                </motion.div>
                            ) : (
                                <motion.div key="collapsed" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col min-w-0">
                                    <h3 className="font-bold font-mono text-[10px] uppercase tracking-tighter text-white/50 leading-none truncate">NEURAL_TREE</h3>
                                    <div className="flex items-center gap-1.5 mt-1 border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md px-1.5 py-0.5 rounded-sm w-fit">
                                        <span className="text-[8px] font-mono text-cyan-500/70 uppercase font-bold">MASTERY</span>
                                        <span className="text-[10px] font-black text-cyan-400 leading-none">{stats.mastery}%</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="flex items-center gap-2">
                            {isSidebarOpen && (
                                <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-cyan-950/30 text-zinc-500 hover:text-cyan-400">
                                    <RiFullscreenLine size={16} />
                                </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }} className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:bg-cyan-950/30 text-zinc-500 hover:text-cyan-400">
                                {isSidebarOpen ? <RiSubtractLine size={16} /> : <RiExpandUpDownLine size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={clsx("relative transition-all duration-300 ease-in-out overflow-hidden bg-zinc-950", !isSidebarOpen ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100")}>
                    <div className="min-h-[200px] border-t border-zinc-900 relative">
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,rgba(6,182,212,1)_50%)] bg-[length:100%_4px]" />
                        <div className="p-6">
                            <div className="space-y-4 mb-4">
                                {skillStats.skills.slice(0, 5).map((skill, i) => {
                                    const Icon = skill.icon;
                                    return (
                                        <div key={skill.id} className="group/item flex items-center gap-4 p-3 rounded-sm bg-black border border-zinc-800 hover:border-cyan-500/50 transition-all">
                                            <div className={`p-1.5 rounded-sm bg-zinc-900 border ${skill.rank.border} flex-shrink-0`}>
                                                <Icon size={16} style={{ color: skill.color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold font-mono text-zinc-400 group-hover/item:text-white transition-colors">{skill.name}</span>
                                                    <span className="text-[10px] font-mono text-cyan-500">{skill.progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800/50">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${skill.progress}%` }} transition={{ delay: 0.05 * i }} className="h-full bg-cyan-600 shadow-[0_0_5px_cyan]" />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="w-full py-2 bg-cyan-950/20 border border-cyan-600/50 text-cyan-400 font-bold text-[10px] uppercase tracking-widest hover:text-white hover:bg-cyan-600 transition-all">ACCESS_MAP</button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {isModalOpen && createPortal(
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-zinc-950/50 backdrop-blur-3xl flex items-center justify-center p-4 lg:p-10 isolate"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full h-full max-w-7xl bg-zinc-950/90 border border-white/5 relative flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden rounded-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header - Tactical HUD Redesign */}
                            <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800 bg-zinc-950/80 shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-24 h-[1px] bg-cyan-500 shadow-[0_0_10px_cyan]" />
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-sm">
                                        <RiOrganizationChart size={22} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-xl font-black text-white font-mono uppercase tracking-[0.1em] leading-none">NEURAL_SYNAPSE</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                            <p className="text-[10px] text-cyan-500/60 font-mono tracking-widest uppercase italic">// FULL_BRAIN_MAP</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 text-zinc-400 hover:text-red-500 transition-all font-mono text-xs font-black uppercase tracking-widest group rounded-sm"
                                >
                                    <RiCloseLine size={18} className="group-hover:rotate-90 transition-transform" />
                                    <span>DISCONNECT</span>
                                </button>
                            </div>

                            {/* 3-Pane Body */}
                            <div className="flex-1 flex overflow-hidden lg:grid lg:grid-cols-[280px_1fr_320px] divide-x divide-zinc-800/50 bg-black/40 shadow-inner">

                                {/* 1. MODULE SELECTION (LEFT) */}
                                <div className="hidden lg:flex flex-col bg-zinc-900/20 overflow-hidden backdrop-blur-sm">
                                    <div className="p-4 border-b border-zinc-800 bg-black/20">
                                        <h3 className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest">// NODE_SELECTION</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                        {skillStats.skills.map(skill => (
                                            <button
                                                key={skill.id}
                                                onClick={() => setSelectedCourseId(skill.id)}
                                                className={clsx(
                                                    "w-full p-4 rounded-sm border transition-all duration-300 text-left relative group/node overflow-hidden",
                                                    selectedCourseId === skill.id
                                                        ? "bg-cyan-500/10 border-cyan-500/40 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                                        : "border-transparent text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                                                )}
                                            >
                                                {selectedCourseId === skill.id && (
                                                    <motion.div
                                                        layoutId="node-active-bg"
                                                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none"
                                                    />
                                                )}
                                                {selectedCourseId === skill.id && (
                                                    <motion.div layoutId="node-active" className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500 shadow-[0_0_12px_cyan] z-20" />
                                                )}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-black font-mono tracking-tighter uppercase">{skill.name}</span>
                                                    <span className={clsx("text-[10px] font-mono", skill.rank.color)}>{skill.rank.label}</span>
                                                </div>
                                                <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                                                    <div className={clsx("h-full transition-all duration-500", selectedCourseId === skill.id ? "bg-cyan-500 shadow-[0_0_5px_cyan]" : "bg-zinc-800")} style={{ width: `${skill.progress}%` }} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. CORE DIAGNOSTICS (CENTER) */}
                                <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-hidden bg-black/20">
                                    {/* Background Grid & Scanline */}
                                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(6,182,212,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.4)_1px,transparent_1px)] bg-[size:32px_32px]" />
                                    <div className="absolute inset-0 w-full h-[1px] bg-cyan-400/10 blur-[1px] z-10 animate-scan" style={{ animationDuration: '8s' }} />

                                    {selectedCourseId ? (() => {
                                        const skill = skillStats.skills.find(s => s.id === selectedCourseId);
                                        return (
                                            <motion.div
                                                key={selectedCourseId}
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative z-20 flex flex-col items-center text-center max-w-lg w-full"
                                            >
                                                {/* Large Icon Container */}
                                                <div className="relative mb-10">
                                                    <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full animate-pulse" />
                                                    <div className={clsx(
                                                        "w-40 h-40 flex items-center justify-center rounded-sm bg-black border-2 relative overflow-hidden",
                                                        skill.rank.border
                                                    )}>
                                                        {/* Corner Decorations */}
                                                        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-500/50" />
                                                        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-500/50" />

                                                        <skill.icon size={80} style={{ color: skill.color }} className="relative z-10 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]" />

                                                        {/* Frequency Lines Animation */}
                                                        <div className="absolute inset-0 pointer-events-none opacity-10">
                                                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                                <path d="M 0 50 Q 25 20, 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="text-6xl font-black text-white font-mono uppercase tracking-tighter mb-6 leading-none shadow-cyan-500/20 drop-shadow-lg">
                                                    {skill.name}
                                                </h3>

                                                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-sm mb-12 divide-x divide-zinc-800">
                                                    <div className="px-6 py-2.5 flex items-center gap-3">
                                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">MASTERY_LVL</span>
                                                        <span className="text-xl font-black text-cyan-400 font-mono tracking-tighter">{skill.progress}%</span>
                                                    </div>
                                                    <div className="px-6 py-2.5 flex items-center gap-3">
                                                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">OPERATOR_RANK</span>
                                                        <span className={clsx("text-xl font-black font-mono tracking-tighter", skill.rank.color)}>{skill.rank.label}</span>
                                                    </div>
                                                </div>

                                                <div className="w-full space-y-3 p-6 bg-zinc-900/40 border border-zinc-800 rounded-sm relative backdrop-blur-sm shadow-xl">
                                                    <div className="absolute top-0 left-0 w-10 h-[1px] bg-cyan-500" />
                                                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                                                        <span>SYNAPSE_CAPACITY</span>
                                                        <span className="text-cyan-500">{skill.completed} / {skill.total} UNITS</span>
                                                    </div>
                                                    <div className="h-3 bg-zinc-950 rounded-[2px] overflow-hidden border border-zinc-800/50 p-0.5 shadow-inner">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${skill.progress}%` }}
                                                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })() : (
                                        <div className="text-center opacity-30">
                                            <RiFocus2Line size={64} className="mx-auto mb-4 animate-spin-slow" />
                                            <p className="font-mono text-sm uppercase tracking-[0.3em]">Awaiting_Input</p>
                                        </div>
                                    )}
                                </div>

                                {/* 3. UNIT SEGMENTS (RIGHT) */}
                                <div className="hidden lg:flex flex-col bg-zinc-900/20 overflow-hidden backdrop-blur-sm">
                                    <div className="p-4 border-b border-zinc-800 bg-black/20">
                                        <h3 className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest">// UNIT_BREAKDOWN</h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/10">
                                        {selectedCourseId ? (() => {
                                            const skill = skillStats.skills.find(s => s.id === selectedCourseId);
                                            return skill.units.map((unit, i) => (
                                                <motion.div
                                                    key={unit.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="group/unit p-4 bg-zinc-950/40 border border-zinc-800 hover:border-cyan-500/30 transition-all rounded-sm shadow-sm"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">UNIT_{String(i + 1).padStart(2, '0')}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-[13px] font-black text-white transition-colors uppercase tracking-tight leading-none">{unit.title}</h4>
                                                                {/* Badge Injection */}
                                                                <UpdateBadgeWrapper unit={unit} courseId={selectedCourseId} />
                                                            </div>
                                                        </div>
                                                        <div className="px-2 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded-sm">
                                                            <span className="text-xs font-black font-mono text-cyan-400 tabular-nums">{unit.progress}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50 p-[1px] shadow-inner">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${unit.progress}%` }}
                                                            className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-700"
                                                        />
                                                    </div>
                                                </motion.div>
                                            ));
                                        })() : (
                                            <div className="h-full flex items-center justify-center">
                                                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">NO_MODULE_SELECTED</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
