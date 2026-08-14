import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiTimeLine, RiCloseLine, RiBookOpenLine, RiCodeBoxLine, RiQuestionLine, RiFolderLine } from 'react-icons/ri';
import { SiHtml5, SiCss, SiJavascript, SiReact, SiNodedotjs, SiPostgresql, SiVuedotjs, SiGit, SiTailwindcss, SiTypescript, SiMongodb, SiPython, SiNextdotjs, SiPhp, SiMysql } from 'react-icons/si';
import { useProgress } from '../../contexts/ProgressProvider';
import { apiFetch } from '../../lib/apiClient';
import { getCourseWithContent } from '../../data/courses/index.js';
import clsx from 'clsx';

const SKILL_MAP = {
    'html5': { name: 'HTML5', icon: SiHtml5, color: '#E44D26' },
    'css3': { name: 'CSS3', icon: SiCss, color: '#1572B6' },
    'tailwind': { name: 'Tailwind', icon: SiTailwindcss, color: '#38B2AC' },
    'js-basics': { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
    'js-es6': { name: 'ES6+', icon: SiJavascript, color: '#F7DF1E' },
    'typescript': { name: 'TypeScript', icon: SiTypescript, color: '#3178C6' },
    'python': { name: 'Python', icon: SiPython, color: '#3776AB' },
    'react': { name: 'React', icon: SiReact, color: '#61DAFB' },
    'vue': { name: 'Vue.js', icon: SiVuedotjs, color: '#4FC08D' },
    'node': { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
    'php': { name: 'PHP', icon: SiPhp, color: '#777BB4' },
    'nextjs': { name: 'Next.js', icon: SiNextdotjs, color: '#FFFFFF' },
    'mysql': { name: 'MySQL', icon: SiMysql, color: '#4479A1' },
    'mongodb': { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
    'postgresql': { name: 'PostgreSQL', icon: SiPostgresql, color: '#336791' },
    'git': { name: 'Git', icon: SiGit, color: '#F05032' }
};

const formatTime = (minutes) => {
    if (!minutes || minutes <= 0) return '0m';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

export default function FocusDetailModal({ isOpen, onClose }) {
    const { userStats } = useProgress();
    const [focusData, setFocusData] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load focus data from database
    useEffect(() => {
        if (!isOpen) return;

        const loadFocusData = async () => {
            setLoading(true);
            try {
                // Per-course breakdown scoped to the authenticated user (server-side)
                const data = await apiFetch('/api/stats/focus');
                const result = data.focusLog || [];

                // Group by course
                const courseMap = {};
                result.forEach(row => {
                    if (!courseMap[row.course_id]) {
                        courseMap[row.course_id] = { units: {}, total: 0 };
                    }
                    courseMap[row.course_id].total += row.total_minutes || 0;

                    if (row.unit_id) {
                        if (!courseMap[row.course_id].units[row.unit_id]) {
                            courseMap[row.course_id].units[row.unit_id] = { doc: 0, lab: 0, quiz: 0, project: 0, total: 0 };
                        }
                        courseMap[row.course_id].units[row.unit_id][row.content_type] = row.total_minutes || 0;
                        courseMap[row.course_id].units[row.unit_id].total += row.total_minutes || 0;
                    }
                });

                // Convert to array with course metadata
                const courses = Object.entries(courseMap).map(([courseId, data]) => {
                    const meta = SKILL_MAP[courseId] || { name: courseId, icon: RiFolderLine, color: '#888' };
                    const course = getCourseWithContent(courseId);
                    return {
                        id: courseId,
                        ...meta,
                        totalMinutes: data.total,
                        units: Object.entries(data.units).map(([unitId, unitData]) => {
                            const unit = course?.units?.find(u => u.id === unitId);
                            return {
                                id: unitId,
                                title: unit?.title || unitId,
                                ...unitData
                            };
                        })
                    };
                }).sort((a, b) => b.totalMinutes - a.totalMinutes);

                setFocusData(courses);
                if (courses.length > 0 && !selectedCourseId) {
                    setSelectedCourseId(courses[0].id);
                }
            } catch {
                console.warn('Could not load focus log, using global stats');
                // Fallback to global stats
            }
            setLoading(false);
        };

        loadFocusData();
    }, [isOpen]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const selectedCourse = focusData.find(c => c.id === selectedCourseId);
    const breakdown = userStats?.focusBreakdown || { doc: 0, lab: 0, quiz: 0, project: 0 };
    const totalFocus = userStats?.totalFocusMinutes || 0;

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] bg-zinc-950/70 backdrop-blur-xl flex items-center justify-center p-4 lg:p-10"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full h-full max-w-6xl bg-zinc-950/95 border border-amber-500/20 relative flex flex-col shadow-[0_0_100px_rgba(245,158,11,0.1)] overflow-hidden rounded-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800 bg-zinc-950/80 shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-24 h-[1px] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-sm">
                                <RiTimeLine size={22} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black text-white font-mono uppercase tracking-[0.1em] leading-none">FOCUS_ANALYTICS</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                    <p className="text-[10px] text-amber-500/60 font-mono tracking-widest uppercase italic">// TIME_BREAKDOWN</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/5 text-zinc-400 hover:text-red-500 transition-all font-mono text-xs font-black uppercase tracking-widest group rounded-sm"
                        >
                            <RiCloseLine size={18} className="group-hover:rotate-90 transition-transform" />
                            <span>CLOSE</span>
                        </button>
                    </div>

                    {/* 3-Pane Body */}
                    <div className="flex-1 flex overflow-hidden lg:grid lg:grid-cols-[280px_1fr_320px] divide-x divide-zinc-800/50 bg-black/40 shadow-inner">

                        {/* LEFT: Course List */}
                        <div className="hidden lg:flex flex-col bg-zinc-900/20 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800 bg-black/20">
                                <h3 className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest">// COURSE_BREAKDOWN</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {loading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="animate-spin w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full" />
                                    </div>
                                ) : focusData.length === 0 ? (
                                    <div className="text-center py-8">
                                        <RiTimeLine size={32} className="mx-auto text-zinc-700 mb-2" />
                                        <p className="text-xs text-zinc-600 font-mono">NO_DATA_YET</p>
                                        <p className="text-[10px] text-zinc-700 mt-1">Start learning to see focus analytics</p>
                                    </div>
                                ) : (
                                    focusData.map(course => {
                                        const Icon = course.icon;
                                        return (
                                            <button
                                                key={course.id}
                                                onClick={() => setSelectedCourseId(course.id)}
                                                className={clsx(
                                                    "w-full p-4 rounded-sm border transition-all duration-300 text-left relative group/node overflow-hidden",
                                                    selectedCourseId === course.id
                                                        ? "bg-amber-500/10 border-amber-500/40 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                                        : "border-transparent text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                                                )}
                                            >
                                                {selectedCourseId === course.id && (
                                                    <motion.div layoutId="focus-active" className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)] z-20" />
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <Icon size={18} style={{ color: course.color }} />
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-xs font-bold font-mono tracking-tight">{course.name}</span>
                                                        <div className="text-amber-400 text-[10px] font-mono">{formatTime(course.totalMinutes)}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* CENTER: Detailed Overview */}
                        <div className="flex-1 flex flex-col p-6 lg:p-8 relative overflow-y-auto bg-black/20">
                            {/* Background Grid */}
                            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(245,158,11,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.4)_1px,transparent_1px)] bg-[size:32px_32px]" />

                            <div className="relative z-20 space-y-6">
                                {/* Top Stats Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Total Focus Time */}
                                    <div className="p-5 bg-zinc-900/60 border border-amber-500/30 rounded-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-12 h-[2px] bg-amber-500" />
                                        <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-amber-500/50" />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mb-1">TOTAL_FOCUS</div>
                                                <div className="text-3xl font-black font-mono text-white" style={{ textShadow: '0 0 20px rgba(245,158,11,0.4)' }}>
                                                    {formatTime(totalFocus)}
                                                </div>
                                            </div>
                                            <RiTimeLine size={32} className="text-amber-500/30" />
                                        </div>
                                    </div>

                                    {/* Courses Tracked */}
                                    <div className="p-5 bg-zinc-900/60 border border-zinc-700 rounded-sm relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-12 h-[2px] bg-zinc-600" />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">COURSES_ACTIVE</div>
                                                <div className="text-3xl font-black font-mono text-white">
                                                    {focusData.length}
                                                </div>
                                            </div>
                                            <RiFolderLine size={32} className="text-zinc-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Type Breakdown - Visual Bars */}
                                <div className="p-5 bg-zinc-900/40 border border-zinc-800 rounded-sm">
                                    <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        CONTENT_TYPE_BREAKDOWN
                                    </h3>

                                    <div className="space-y-4">
                                        {/* DOC */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <RiBookOpenLine size={14} className="text-cyan-400" />
                                                    <span className="text-xs font-mono text-zinc-400">Documentation</span>
                                                </div>
                                                <span className="text-xs font-bold font-mono text-cyan-400">{formatTime(breakdown.doc)}</span>
                                            </div>
                                            <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-cyan-500/20">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: totalFocus > 0 ? `${(breakdown.doc / totalFocus) * 100}%` : '0%' }}
                                                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
                                                    style={{ boxShadow: '0 0 10px rgba(6,182,212,0.5)' }}
                                                />
                                            </div>
                                            <div className="text-[9px] font-mono text-zinc-600 mt-1">
                                                {totalFocus > 0 ? Math.round((breakdown.doc / totalFocus) * 100) : 0}% of total focus
                                            </div>
                                        </div>

                                        {/* LAB */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <RiCodeBoxLine size={14} className="text-amber-400" />
                                                    <span className="text-xs font-mono text-zinc-400">Labs & Practice</span>
                                                </div>
                                                <span className="text-xs font-bold font-mono text-amber-400">{formatTime(breakdown.lab)}</span>
                                            </div>
                                            <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-amber-500/20">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: totalFocus > 0 ? `${(breakdown.lab / totalFocus) * 100}%` : '0%' }}
                                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                                                    style={{ boxShadow: '0 0 10px rgba(245,158,11,0.5)' }}
                                                />
                                            </div>
                                            <div className="text-[9px] font-mono text-zinc-600 mt-1">
                                                {totalFocus > 0 ? Math.round((breakdown.lab / totalFocus) * 100) : 0}% of total focus
                                            </div>
                                        </div>

                                        {/* QUIZ */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <RiQuestionLine size={14} className="text-emerald-400" />
                                                    <span className="text-xs font-mono text-zinc-400">Quizzes</span>
                                                </div>
                                                <span className="text-xs font-bold font-mono text-emerald-400">{formatTime(breakdown.quiz)}</span>
                                            </div>
                                            <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-emerald-500/20">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: totalFocus > 0 ? `${(breakdown.quiz / totalFocus) * 100}%` : '0%' }}
                                                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                                    style={{ boxShadow: '0 0 10px rgba(16,185,129,0.5)' }}
                                                />
                                            </div>
                                            <div className="text-[9px] font-mono text-zinc-600 mt-1">
                                                {totalFocus > 0 ? Math.round((breakdown.quiz / totalFocus) * 100) : 0}% of total focus
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Course Highlight */}
                                {focusData.length > 0 && (() => {
                                    const topCourse = focusData[0];
                                    const Icon = topCourse.icon;
                                    return (
                                        <div className="p-5 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30 rounded-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
                                            <h3 className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                MOST_ACTIVE_COURSE
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 flex items-center justify-center bg-black/50 border border-amber-500/30 rounded-sm">
                                                    <Icon size={28} style={{ color: topCourse.color }} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-lg font-black font-mono text-white uppercase tracking-tight">{topCourse.name}</div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-sm font-bold text-amber-400 font-mono">{formatTime(topCourse.totalMinutes)}</span>
                                                        <span className="text-[10px] text-zinc-500">•</span>
                                                        <span className="text-[10px] text-zinc-500 font-mono">{topCourse.units.length} units tracked</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Quick Info */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-sm text-center">
                                        <div className="text-lg font-bold font-mono text-white">{focusData.reduce((acc, c) => acc + c.units.length, 0)}</div>
                                        <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Units Logged</div>
                                    </div>
                                    <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-sm text-center">
                                        <div className="text-lg font-bold font-mono text-white">
                                            {totalFocus > 0 && focusData.length > 0 ? formatTime(Math.round(totalFocus / focusData.length)) : '0m'}
                                        </div>
                                        <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Avg/Course</div>
                                    </div>
                                    <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-sm text-center">
                                        <div className="text-lg font-bold font-mono text-white">
                                            {(() => {
                                                const max = Math.max(breakdown.doc, breakdown.lab, breakdown.quiz);
                                                if (max === 0) return '-';
                                                if (max === breakdown.lab) return 'LAB';
                                                if (max === breakdown.doc) return 'DOC';
                                                return 'QUIZ';
                                            })()}
                                        </div>
                                        <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Top Type</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Unit Breakdown */}
                        <div className="hidden lg:flex flex-col bg-zinc-900/20 overflow-hidden">
                            <div className="p-4 border-b border-zinc-800 bg-black/20">
                                <h3 className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-widest">// UNIT_DETAILS</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/10">
                                {selectedCourse && selectedCourse.units.length > 0 ? (
                                    selectedCourse.units.map((unit, i) => (
                                        <motion.div
                                            key={unit.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="p-4 bg-zinc-950/40 border border-zinc-800 hover:border-amber-500/30 transition-all rounded-sm"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col">
                                                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">UNIT_{String(i + 1).padStart(2, '0')}</p>
                                                    <h4 className="text-[12px] font-black text-white uppercase tracking-tight leading-tight mt-1">{unit.title}</h4>
                                                </div>
                                                <div className="px-2 py-1 bg-amber-950/40 border border-amber-500/30 rounded-sm">
                                                    <span className="text-xs font-black font-mono text-amber-400">{formatTime(unit.total)}</span>
                                                </div>
                                            </div>
                                            {/* Type breakdown for unit */}
                                            <div className="flex gap-2 mt-2">
                                                {unit.doc > 0 && (
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-sm">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                                        <span className="text-[8px] font-mono text-cyan-400">{formatTime(unit.doc)}</span>
                                                    </div>
                                                )}
                                                {unit.lab > 0 && (
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        <span className="text-[8px] font-mono text-amber-400">{formatTime(unit.lab)}</span>
                                                    </div>
                                                )}
                                                {unit.quiz > 0 && (
                                                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span className="text-[8px] font-mono text-emerald-400">{formatTime(unit.quiz)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center">
                                        <RiTimeLine size={32} className="text-zinc-700 mb-2" />
                                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">SELECT_COURSE</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
