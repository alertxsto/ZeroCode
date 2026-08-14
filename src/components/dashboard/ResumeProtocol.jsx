import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiPlayCircleLine, RiArrowRightLine, RiFocus2Line, RiLoader4Line } from 'react-icons/ri';
import { SiHtml5, SiCss, SiJavascript, SiReact, SiNodedotjs, SiPostgresql, SiVuedotjs, SiExpress, SiGit, SiTailwindcss, SiTypescript, SiPython, SiNextdotjs, SiPhp, SiMysql, SiMongodb } from 'react-icons/si';
import { useProgress } from '../../contexts/ProgressProvider';
import { getCourse } from '../../data/curriculumStructure';

const ICON_MAP = {
    'html5': SiHtml5, 'css3': SiCss, 'tailwind': SiTailwindcss, 'js-basics': SiJavascript,
    'js-es6': SiJavascript, 'typescript': SiTypescript, 'python': SiPython, 'react': SiReact,
    'vue': SiVuedotjs, 'node': SiNodedotjs, 'express': SiExpress, 'php': SiPhp,
    'nextjs': SiNextdotjs, 'mysql': SiMysql, 'mongodb': SiMongodb, 'postgresql': SiPostgresql,
    'git': SiGit
};

export default function ResumeProtocol() {
    const navigate = useNavigate();
    const { recentActivity, completedItems, completedCourses } = useProgress();

    // Calculate actual active course from real data
    const activeCourse = useMemo(() => {
        if (!recentActivity || recentActivity.length === 0) return null;

        const sorted = [...recentActivity].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

        for (const activity of sorted) {
            const courseId = activity.courseId || activity.course_id;
            if (!courseId || completedCourses.includes(courseId)) continue;

            const courseData = getCourse(courseId);
            if (!courseData) continue;

            const allItemsInCourse = [];
            if (courseData.units) {
                Object.values(courseData.units).forEach(unit => {
                    if (unit.content) Object.keys(unit.content).forEach(itemId => allItemsInCourse.push(itemId));
                });
            }

            const totalItems = allItemsInCourse.length;
            const completedInCourse = allItemsInCourse.filter(itemId => completedItems.includes(itemId)).length;
            const progress = totalItems > 0 ? Math.round((completedInCourse / totalItems) * 100) : 0;

            const itemId = activity.itemId || activity.item_id;
            let currentModule = 'Getting Started';
            if (itemId && courseData.units) {
                for (const unit of Object.values(courseData.units)) {
                    if (unit.content && unit.content[itemId]) {
                        currentModule = unit.content[itemId].title || unit.title || 'In Progress';
                        break;
                    }
                }
            }

            return {
                id: courseId,
                title: courseData.title || courseId,
                progress: progress,
                currentModule: currentModule
            };
        }
        return null;
    }, [recentActivity, completedItems, completedCourses]);

    if (!activeCourse) return null;

    const CourseIcon = ICON_MAP[activeCourse.id] || RiFocus2Line;

    return (
        <div className="relative w-full h-20 bg-black border border-cyan-500/30 overflow-hidden group flex items-center shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-400/50 transition-all">

            {/* Background Tech Effects */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />

            {/* Left: Indicator & Icon */}
            <div className="h-full w-20 bg-cyan-950/20 border-r border-cyan-500/20 flex flex-col items-center justify-center relative shrink-0">
                <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                <CourseIcon size={24} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                <div className="mt-1 text-[8px] font-mono text-cyan-600">ACTIVE</div>
            </div>

            {/* Middle: Info */}
            <div className="flex-1 px-4 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Current Objective:</span>
                    <span className="text-xs font-bold text-white truncate">{activeCourse.currentModule}</span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-cyan-300 truncate opacity-70">{activeCourse.title}</span>

                    {/* Progress Bar */}
                    <div className="flex-1 max-w-[150px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-500 relative"
                            style={{ width: `${activeCourse.progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/30 animate-pulse" />
                        </div>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-500">{activeCourse.progress}%</span>
                </div>
            </div>

            {/* Right: Action */}
            <button
                onClick={() => navigate(`/course/${activeCourse.id}`)}
                className="h-full px-6 bg-cyan-500/10 hover:bg-cyan-500/20 border-l border-cyan-500/20 text-cyan-400 hover:text-white transition-all flex items-center gap-2 group/btn shrink-0"
            >
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-600 group-hover/btn:text-cyan-400">Resume</span>
                    <span className="text-sm font-bold tracking-wider">PROTOCOL</span>
                </div>
                <RiArrowRightLine size={18} className="transform group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {/* Scanline */}
            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
            <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
        </div>
    );
}
