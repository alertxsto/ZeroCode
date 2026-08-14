import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RiGitBranchLine, RiShieldFlashLine, RiCheckboxCircleFill,
    RiNodeTree, RiPulseLine, RiArrowLeftSLine,
    RiHtml5Fill, RiCss3Fill, RiDatabase2Line,
    RiTerminalBoxLine, RiCodeLine, RiServerLine,
    RiBracesLine, RiDatabaseLine,
    RiStackLine, RiCloudLine, RiLayout4Fill,
    RiCodeSSlashLine, RiTerminalLine, RiCpuLine, RiGlobalLine,
    RiWifiLine, RiBatteryChargeLine, RiMenuLine, RiFocus3Line,
    RiTimeLine, RiAwardLine, RiFileList3Line, RiCloseLine
} from 'react-icons/ri';
import AppLayout from '../components/layout/AppLayout';
import { useProgress } from '../contexts/ProgressProvider';
import { useAuth } from '../contexts/AuthProvider';
import { courses, checkPrerequisites } from '../data/curriculumStructure';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import NeuralConnections3D from '../components/specializations/NeuralConnections3D';
import DataStreamBackground from '../components/layout/DataStreamBackground';

// --- CONFIGURATION ---
const LAYERS = [
    { id: 'foundation', label: 'Layer_01 [SEC]', courses: ['html5', 'css3', 'git', 'tailwind', 'postgresql'] },
    { id: 'core_logic', label: 'Layer_02 [LOG]', courses: ['js-basics'] },
    { id: 'systems', label: 'Layer_03 [SYS]', courses: ['dom', 'js-es6', 'php', 'python'] },
    { id: 'architect', label: 'Layer_04 [ARC]', courses: ['react', 'vue', 'typescript', 'node', 'mysql'] },
    { id: 'elite', label: 'Layer_05 [ELI]', courses: ['nextjs', 'mongodb', 'cicd'] }
];

const ICON_MAP = {
    'html5': RiHtml5Fill, 'css3': RiCss3Fill, 'git': RiGitBranchLine, 'tailwind': RiLayout4Fill,
    'postgresql': RiDatabase2Line, 'js-basics': RiCodeSSlashLine, 'dom': RiCodeLine, 'js-es6': RiBracesLine,
    'php': RiServerLine, 'python': RiCodeSSlashLine, 'mysql': RiDatabaseLine, 'react': RiCodeLine,
    'vue': RiStackLine, 'typescript': RiBracesLine, 'node': RiTerminalLine, 'express': RiTerminalBoxLine,
    'mongodb': RiDatabaseLine, 'nextjs': RiStackLine, 'cicd': RiCloudLine
};

const PATHS = {
    FRONTEND: {
        id: 'frontend', label: 'FRONTEND PROTOCOL',
        desc: 'INTERFACE :: UX SYSTEMS',
        color: 'text-cyan-400', border: 'border-cyan-500', shadow: 'shadow-cyan-500/50',
        bg: 'bg-cyan-950', accent: 'cyan',
        courses: ['html5', 'css3', 'git', 'tailwind', 'js-basics', 'dom', 'js-es6', 'react', 'vue', 'typescript', 'nextjs'],
        meta: {
            time: '120 HRS',
            projects: '5 OPS',
            reward: 'INTERFACE_ARCHITECT',
            skills: ['REACT_CORE', 'THREE.JS', 'TAILWIND_CSS', 'TYPESCRIPT']
        }
    },
    BACKEND: {
        id: 'backend', label: 'BACKEND PROTOCOL',
        desc: 'SERVER LOGIC :: ENCRYPTION',
        color: 'text-emerald-400', border: 'border-emerald-500', shadow: 'shadow-emerald-500/50',
        bg: 'bg-emerald-950', accent: 'emerald',
        courses: ['git', 'js-basics', 'js-es6', 'php', 'mysql', 'python', 'node', 'express', 'mongodb', 'cicd', 'postgresql'],
        meta: {
            time: '150 HRS',
            projects: '6 OPS',
            reward: 'SYSTEM_ADMIN',
            skills: ['NODE.JS', 'POSTGRESQL', 'DOCKER', 'PYTHON_SCRIPTING']
        }
    },
    FULLSTACK: {
        id: 'fullstack', label: 'FULLSTACK OPERATIVE',
        desc: 'MASTER KEY :: OVERRIDE',
        color: 'text-amber-400', border: 'border-amber-500', shadow: 'shadow-amber-500/50',
        bg: 'bg-amber-950', accent: 'amber',
        courses: ['html5', 'css3', 'git', 'tailwind', 'js-basics', 'dom', 'js-es6', 'react', 'typescript', 'node', 'express', 'postgresql', 'nextjs', 'mongodb', 'cicd'],
        meta: {
            time: '280 HRS',
            projects: '12 OPS',
            reward: 'MASTER_OPERATIVE',
            skills: ['MERN_STACK', 'SYSTEM_DESIGN', 'DEVOPS', 'NEXT.JS']
        }
    }
};

const TechBorder = ({ color }) => (
    <>
        <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${color}`} />
        <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${color}`} />
    </>
);

const TacticalBriefing = ({ path, onClose }) => {
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-[64px] right-0 bottom-0 w-full md:w-[400px] bg-[#050508]/95 backdrop-blur-xl border-l border-white/10 z-40 flex flex-col shadow-2xl"
        >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-3">
                    <RiFileList3Line className={`text-${path.accent}-400`} />
                    <span className="font-bold text-white uppercase tracking-widest text-sm">Mission Briefing</span>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <RiCloseLine size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {/* ID CARD */}
                <div className="bg-white/5 border border-white/10 p-6 relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full bg-${path.accent}-500`} />
                    <div className="mb-2 text-[10px] text-zinc-500 uppercase tracking-widest">Protocol Identifier</div>
                    <div className={`text-2xl font-black uppercase italic ${path.color} leading-none mb-1`}>{path.label}</div>
                    <div className="text-xs text-zinc-400 font-mono">// {path.desc}</div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-white/5 p-4">
                        <div className="flex items-center gap-2 mb-2 text-zinc-500">
                            <RiTimeLine size={14} />
                            <span className="text-[9px] uppercase tracking-widest">Est. Time</span>
                        </div>
                        <div className="text-xl font-bold text-white">{path.meta.time}</div>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-4">
                        <div className="flex items-center gap-2 mb-2 text-zinc-500">
                            <RiStackLine size={14} />
                            <span className="text-[9px] uppercase tracking-widest">Operations</span>
                        </div>
                        <div className="text-xl font-bold text-white">{path.meta.projects}</div>
                    </div>
                </div>

                {/* SKILLS */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`w-2 h-2 rounded-full bg-${path.accent}-500`} />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Core Competencies</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {path.meta.skills.map(skill => (
                            <span key={skill} className={`text-[10px] font-mono px-3 py-1 bg-${path.accent}-500/10 border border-${path.accent}-500/30 text-${path.accent}-400 uppercase`}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* CERTIFICATION */}
                <div className="border border-zinc-800 bg-zinc-900/30 p-6 flex items-center gap-6">
                    <RiAwardLine size={32} className={`text-${path.accent}-500`} />
                    <div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Clearance Reward</div>
                        <div className="text-sm font-bold text-white uppercase tracking-wide">{path.meta.reward}</div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-black/40">
                <button onClick={onClose} className={`w-full py-3 bg-${path.accent}-600 hover:bg-${path.accent}-500 text-black font-black uppercase tracking-widest transition-colors`}>
                    Acknowledge Intel
                </button>
            </div>
        </motion.div>
    );
};

export default function Specializations() {
    const navigate = useNavigate();
    const { completedCourses } = useProgress();
    const { user } = useAuth();
    const [selectedPath, setSelectedPath] = useState(null);
    const [showBriefing, setShowBriefing] = useState(false);
    const containerRef = useRef(null);
    const [connections, setConnections] = useState([]);

    // --- NEURAL LOGIC (PRESERVED) ---
    const getLayers = () => {
        if (!selectedPath) return [];
        const allowedCourses = PATHS[selectedPath.toUpperCase()].courses;
        return LAYERS.map(layer => ({
            ...layer,
            courses: layer.courses.filter(c => allowedCourses.includes(c))
        })).filter(layer => layer.courses.length > 0);
    };

    const currentLayers = getLayers();

    useEffect(() => {
        if (!selectedPath) {
            setShowBriefing(false);
            return;
        }
        // Auto-show briefing on first select? Maybe annoying. Let's keep it manual or user preference.
        // For now, let's just let user click.

        const calculateConnections = () => {
            // ... (Logic preserved same as before)
            const newConnections = [];
            const nodes = {};
            const pathData = PATHS[selectedPath.toUpperCase()];
            const allowedCourses = pathData.courses;
            document.querySelectorAll('[data-course-id]').forEach(el => {
                const id = el.getAttribute('data-course-id');
                const rect = el.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                nodes[id] = { x: rect.left + rect.width / 2 - containerRect.left, y: rect.top + rect.height / 2 - containerRect.top };
            });
            Object.values(courses).forEach(course => {
                if (!allowedCourses.includes(course.id)) return;
                course.prerequisites.forEach(prereq => {
                    if (nodes[course.id] && nodes[prereq] && allowedCourses.includes(prereq)) {
                        newConnections.push({ from: nodes[prereq], to: nodes[course.id], active: completedCourses.includes(prereq), type: 'synapse' });
                    }
                });
            });
            const layers = getLayers();
            for (let i = 0; i < layers.length; i++) {
                const currentLayer = layers[i];
                const nextLayer = layers[i + 1];
                for (let j = 0; j < currentLayer.courses.length - 1; j++) {
                    const c1 = currentLayer.courses[j]; const c2 = currentLayer.courses[j + 1];
                    if (nodes[c1] && nodes[c2]) newConnections.push({ from: nodes[c1], to: nodes[c2], active: completedCourses.includes(c1) && completedCourses.includes(c2), type: 'horizontal' });
                }
                if (nextLayer) {
                    currentLayer.courses.forEach(cId => {
                        const cIdx = allowedCourses.indexOf(cId);
                        nextLayer.courses.forEach(nId => {
                            const nIdx = allowedCourses.indexOf(nId);
                            if (nodes[cId] && nodes[nId] && (nIdx > cIdx || (currentLayer.id === 'foundation' && nextLayer.id === 'core_logic'))) {
                                newConnections.push({ from: nodes[cId], to: nodes[nId], active: completedCourses.includes(cId), type: 'bridge' });
                            }
                        });
                    });
                }
            }
            setConnections(newConnections);
        };
        const timer = setTimeout(calculateConnections, 200);
        const observer = new ResizeObserver(calculateConnections);
        if (containerRef.current) observer.observe(containerRef.current);
        window.addEventListener('resize', calculateConnections);
        return () => { clearTimeout(timer); observer.disconnect(); window.removeEventListener('resize', calculateConnections); };
    }, [completedCourses, selectedPath]);


    return (
        <AppLayout>
            <div className="relative min-h-screen pt-24 pb-40 overflow-hidden font-mono bg-[#020205]" ref={containerRef}>
                <DataStreamBackground />

                {/* 3D Neural Layer */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {selectedPath && <NeuralConnections3D connections={connections} />}
                </div>

                <AnimatePresence>
                    {showBriefing && selectedPath && (
                        <TacticalBriefing path={PATHS[selectedPath.toUpperCase()]} onClose={() => setShowBriefing(false)} />
                    )}
                </AnimatePresence>

                {/* --- PATH SELECTION MODE --- */}
                {!selectedPath ? (
                    <div className="relative z-20 max-w-7xl mx-auto px-6">
                        {/* TACTICAL HUD HEADER */}
                        <header className="mb-20 flex flex-col md:flex-row items-end gap-12 border-b border-white/10 pb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-cyan-500 animate-pulse" />
                                    <span className="text-xs tracking-[0.3em] text-cyan-500 font-bold uppercase">System_Ver_5.0</span>
                                </div>
                                <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
                                    Specializations
                                </h1>
                            </div>

                            <div className="flex-1 flex justify-end items-center gap-8 opacity-60">
                                <div className="text-right hidden md:block">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Status</div>
                                    <div className="text-sm font-bold text-white uppercase">[ ONLINE ]</div>
                                </div>
                                <div className="text-right hidden md:block">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Clearance</div>
                                    <div className="text-sm font-bold text-white uppercase">[ CLASS_A ]</div>
                                </div>
                                <RiFocus3Line size={48} className="text-white/20" />
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {Object.values(PATHS).map((path) => {
                                const totalCourses = path.courses.length;
                                const completedCount = path.courses.filter(c => completedCourses.includes(c)).length;
                                const progress = Math.round((completedCount / totalCourses) * 100);

                                return (
                                    <button
                                        key={path.id}
                                        onClick={() => setSelectedPath(path.id)}
                                        className="group relative h-[450px] bg-[#050510]/80 border border-white/10 p-0 flex flex-col transition-all duration-300 hover:border-white/40 hover:bg-[#080815] overflow-hidden"
                                    >
                                        <div className="w-full h-1 bg-zinc-900">
                                            <div className={`h-full bg-${path.accent}-500 w-1/4 group-hover:w-full transition-all duration-500`} />
                                        </div>

                                        <div className="flex-1 p-8 flex flex-col justify-center relative">
                                            <div className="mb-6 opacity-50 font-mono text-xs uppercase tracking-widest border-l-2 border-white/20 pl-4 py-1">
                                                ID: {path.id}
                                            </div>

                                            <h3 className="text-4xl font-black text-white mb-4 uppercase leading-none">
                                                [{path.label.split(' ')[0]}]<br />
                                                <span className={`text-${path.accent}-400`}>
                                                    {path.label.split(' ')[1]}
                                                </span>
                                            </h3>

                                            <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-8">
                                                // {path.desc}
                                            </p>

                                            <div className="w-12 h-1 bg-white/20 group-hover:w-24 transition-all" />
                                        </div>

                                        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-2">
                                                <RiGlobalLine size={14} className="text-zinc-600" />
                                                <span className="text-zinc-400 font-bold uppercase tracking-wider">NET_LOC</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-600 uppercase tracking-widest">SYNC_RATE</span>
                                                <span className={`font-black text-${path.accent}-400`}>{progress}%</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* --- ACTIVE TRACK UI --- */
                    <div className="relative z-20">
                        {/* TACTICAL TOP HUD */}
                        <div className="fixed top-[64px] left-0 right-0 z-50 bg-[#020205]/95 backdrop-blur-md border-b border-white/10 h-16 flex items-center justify-between px-6 lg:px-12 shadow-2xl">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setSelectedPath(null)}
                                    className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group px-4 py-1.5 border border-transparent hover:border-white/20 bg-white/5 hover:bg-white/10"
                                >
                                    <RiArrowLeftSLine className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">ABORT</span>
                                </button>

                                <div className="hidden md:flex items-center gap-4">
                                    <div className="h-4 w-px bg-zinc-700" />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mb-1">ACTIVE PROTOCOL</span>
                                        <span className={`text-sm font-black uppercase ${PATHS[selectedPath.toUpperCase()].color} leading-none tracking-wide`}>
                                            {PATHS[selectedPath.toUpperCase()].label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                {/* BRIEFING TOGGLE BUTTON */}
                                <button
                                    onClick={() => setShowBriefing(!showBriefing)}
                                    className={`hidden md:flex items-center gap-2 px-4 py-1.5 border border-${PATHS[selectedPath.toUpperCase()].accent}-500/50 hover:bg-${PATHS[selectedPath.toUpperCase()].accent}-500/10 text-${PATHS[selectedPath.toUpperCase()].accent}-400 transition-all`}
                                >
                                    <RiFileList3Line size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">View Intel</span>
                                </button>

                                <div className="text-right">
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Modules</div>
                                    <div className="text-lg font-black text-white leading-none">{PATHS[selectedPath.toUpperCase()].courses.length}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Completion</div>
                                    <div className={`text-lg font-black ${PATHS[selectedPath.toUpperCase()].color} leading-none`}>
                                        {Math.round((PATHS[selectedPath.toUpperCase()].courses.filter(c => completedCourses.includes(c)).length / PATHS[selectedPath.toUpperCase()].courses.length) * 100)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Grid */}
                        <div className="max-w-7xl mx-auto space-y-40 pt-32 px-6">
                            {currentLayers.map((layer) => (
                                <div key={layer.id} className="relative">
                                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
                                        <div className="h-8 w-px bg-gradient-to-t from-white/20 to-transparent" />
                                        <span className="text-[10px] uppercase tracking-[0.4em] text-white font-black bg-black px-4 py-2 border border-white/10">
                                            {layer.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-24 relative z-10">
                                        {layer.courses.map(courseId => {
                                            const course = courses[courseId];
                                            const isCompleted = completedCourses.includes(courseId);
                                            const isAvailable = checkPrerequisites(courseId, completedCourses);
                                            const isLocked = !isAvailable;
                                            const Icon = ICON_MAP[courseId] || RiCodeLine;
                                            const accent = PATHS[selectedPath.toUpperCase()].accent;
                                            const colorClass = PATHS[selectedPath.toUpperCase()].color;

                                            return (
                                                <div key={courseId} className="relative group perspective-[1000px]">
                                                    <button
                                                        data-course-id={courseId}
                                                        onClick={() => !isLocked && navigate(`/course/${courseId}`)}
                                                        className={clsx(
                                                            "relative w-32 h-36 flex items-center justify-center transition-all duration-300 transform-style-3d",
                                                            isCompleted
                                                                ? `text-${accent}-400 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]`
                                                                : isLocked
                                                                    ? "text-zinc-800 opacity-40 cursor-not-allowed grayscale"
                                                                    : "text-zinc-500 hover:text-white hover:scale-110"
                                                        )}
                                                        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} // HEXAGON
                                                    >
                                                        {/* Hex Background */}
                                                        <div className={clsx(
                                                            "absolute inset-0 transition-colors duration-300",
                                                            isCompleted ? `bg-${accent}-900/40` : "bg-black"
                                                        )} />

                                                        {/* Hex Border */}
                                                        <div className={clsx(
                                                            "absolute inset-0.5 transition-all duration-300",
                                                            isCompleted ? `bg-${accent}-500` : isLocked ? "bg-zinc-900" : "bg-zinc-800 group-hover:bg-white"
                                                        )} style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                                                            {/* Inner Content Area */}
                                                            <div className="absolute inset-[1px] bg-[#020205] flex items-center justify-center flex-col gap-2" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                                                                <Icon size={28} className="relative z-10" />
                                                                {isCompleted && <RiCheckboxCircleFill size={10} className={colorClass} />}
                                                            </div>
                                                        </div>
                                                    </button>

                                                    {/* Tactical Tooltip */}
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover:translate-y-0 w-48 z-40">
                                                        <div className="bg-[#050510] border-l-2 border-r-2 border-white/20 p-3 shadow-2xl relative">
                                                            <div className="absolute top-0 left-0 w-full h-px bg-white/20" />
                                                            <div className="absolute bottom-0 left-0 w-full h-px bg-white/20" />

                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-[8px] text-zinc-500 uppercase font-mono tracking-widest">ID_NODE</span>
                                                                <span className={`text-[8px] uppercase font-bold tracking-widest ${isCompleted ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                                                    {isCompleted ? 'SYNCED' : 'OFFLINE'}
                                                                </span>
                                                            </div>
                                                            <div className="text-white font-bold text-xs uppercase tracking-wider">{course.title}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
