import { useState } from 'react';
import { motion } from 'framer-motion';
import { RiShieldStarLine, RiCpuLine, RiTerminalBoxLine, RiFileList3Line } from 'react-icons/ri';
import AppLayout from '../components/layout/AppLayout';
import WelcomeHero from '../components/dashboard/WelcomeHero';
import StatsOverview from '../components/dashboard/StatsOverview';
import CourseCard from '../components/dashboard/CourseCard';
import ResumeProtocol from '../components/dashboard/ResumeProtocol';
import ResourceMonitor from '../components/dashboard/ResourceMonitor';
import ArchivesWidget from '../components/dashboard/ArchivesWidget';
// import { SkillAnalyticsWidget } from '../components/dashboard/SkillAnalyticsWidget';
import NeuralTechTreeWidget from '../components/dashboard/NeuralTechTreeWidget';
import CyberDeckWidget from '../components/dashboard/CyberDeckWidget';

import { useProgress } from '../contexts/ProgressProvider';
import { useAuth } from '../contexts/AuthProvider';
import { LEVELS, getCoursesByLevel, getOverallProgress } from '../data/curriculumStructure';
import clsx from 'clsx';

export default function Dashboard() {
    const [selectedLevel, setSelectedLevel] = useState('all');
    const { completedCourses, loading, userStats } = useProgress();
    const { user, canAccessCourse, subscriptionTier } = useAuth();

    const progress = getOverallProgress(completedCourses);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 p-8">
                <div className="max-w-7xl mx-auto space-y-6" aria-busy="true" aria-label="Loading dashboard">
                    {/* Hero skeleton */}
                    <div className="h-40 bg-zinc-900/60 border border-white/5 rounded-lg animate-pulse" />
                    {/* Stats row skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-zinc-900/60 border border-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                    {/* Course cards skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-40 bg-zinc-900/60 border border-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const filteredLevels = selectedLevel === 'all'
        ? Object.values(LEVELS)
        : [LEVELS[selectedLevel.toUpperCase()]];

    return (
        <AppLayout fullWidth={true}>
            <div className="min-h-screen bg-[#050505] p-6 lg:p-8">

                <div className="w-full">

                    {/* COMMAND GRID LAYOUT (Main Top Section) */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">

                        {/* LEFT COLUMN: Tactical Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <ResourceMonitor />
                            {/* <SkillAnalyticsWidget /> */}
                            <NeuralTechTreeWidget />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2"><ArchivesWidget /></div>
                                <div className="col-span-2"><CyberDeckWidget /></div>
                            </div>
                        </div>

                        {/* CENTER/RIGHT COLUMN: Hero & Learning */}
                        <div className="lg:col-span-3 space-y-8">
                            {/* 1. Welcome Hero (Context) */}
                            <WelcomeHero user={user} subscriptionTier={subscriptionTier} />

                            {/* 2. Resume Protocol (High Priority) */}
                            <ResumeProtocol />

                            {/* 3. Stats Overview (Metrics) */}
                            <StatsOverview progress={progress} stats={userStats} />
                        </div>
                    </div>


                    {/* COURSE GIRD (The "Library") */}
                    <div className="space-y-8">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-4">
                            <span className="w-8 h-px bg-zinc-800" />
                            Curriculum_Database
                            <span className="flex-1 h-px bg-zinc-800" />
                        </h2>

                        {/* Filter Tabs - Cyberpunk Segmented Control */}
                        <div className="flex justify-start mb-10 overflow-x-auto pb-4 scrollbar-hide">
                            <div className="relative inline-flex items-center p-1 bg-black/80 border border-white/10 shadow-lg backdrop-blur-xl">
                                {/* Option: "All Levels" */}
                                <button
                                    onClick={() => setSelectedLevel('all')}
                                    className={clsx(
                                        "relative z-10 px-8 py-2 text-xs font-black font-mono uppercase tracking-widest transition-all duration-300",
                                        selectedLevel === 'all' ? "text-black" : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    {selectedLevel === 'all' && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">All_Sectors</span>
                                </button>

                                {/* Options: Dynamic Levels */}
                                {Object.values(LEVELS).map(level => (
                                    <button
                                        key={level.id}
                                        onClick={() => setSelectedLevel(level.id)}
                                        className={clsx(
                                            "relative z-10 px-8 py-2 text-xs font-black font-mono uppercase tracking-widest transition-all duration-300",
                                            selectedLevel === level.id ? "text-black" : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                    >
                                        {selectedLevel === level.id && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-white"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">
                                            {level.label.en}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Course Grid Content */}
                        <div className="space-y-12">
                            {filteredLevels.map((level) => {
                                const levelCourses = getCoursesByLevel(level.id);

                                return (
                                    <section key={level.id} className="animate-fade-in-up">
                                        <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-4 relative">
                                            <div className="absolute bottom-0 left-0 w-32 h-0.5 bg-gradient-to-r from-zinc-500 to-transparent" />
                                            <div>
                                                <h2 className="text-2xl font-black text-white flex items-center gap-3 font-mono uppercase tracking-tighter">
                                                    <span className={clsx("text-zinc-500")}>
                                                        {level.id === 'beginner' && <RiShieldStarLine size={24} />}
                                                        {level.id === 'intermediate' && <RiCpuLine size={24} />}
                                                        {level.id === 'advanced' && <RiTerminalBoxLine size={24} />}
                                                    </span>
                                                    <span>
                                                        {level.id === 'beginner' && "SECTOR_01: RECRUIT"}
                                                        {level.id === 'intermediate' && "SECTOR_02: ENGINEER"}
                                                        {level.id === 'advanced' && "SECTOR_03: ARCHITECT"}
                                                    </span>
                                                </h2>
                                                <p className="text-xs text-zinc-600 mt-1 font-mono tracking-[0.2em] flex items-center gap-2">
                                                    <span>// {level.tagline.en}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                            {levelCourses.map(course => {
                                                const isCompleted = completedCourses.includes(course.id);
                                                const hasAccess = canAccessCourse(course.id);

                                                return (
                                                    <CourseCard
                                                        key={course.id}
                                                        course={course}
                                                        isCompleted={isCompleted}
                                                        hasAccess={hasAccess}
                                                        isLocked={!hasAccess}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
