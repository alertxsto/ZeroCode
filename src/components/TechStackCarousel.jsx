import React from 'react';
import {
    SiHtml5, SiCss, SiJavascript, SiTypescript, SiReact, SiVuedotjs,
    SiNextdotjs, SiNodedotjs, SiExpress, SiPostgresql, SiMongodb,
    SiPython, SiTailwindcss, SiGit, SiDocker, SiRedis, SiGraphql,
    SiPhp, SiLinux, SiNginx
} from 'react-icons/si';
import clsx from 'clsx';

const TECH_STACK = [
    { name: 'HTML5', icon: SiHtml5, color: 'text-orange-500' },
    { name: 'CSS3', icon: SiCss, color: 'text-blue-500' },
    { name: 'JavaScript', icon: SiJavascript, color: 'text-yellow-400' },
    { name: 'TypeScript', icon: SiTypescript, color: 'text-blue-400' },
    { name: 'React', icon: SiReact, color: 'text-cyan-400' },
    { name: 'Vue.js', icon: SiVuedotjs, color: 'text-green-500' },
    { name: 'Next.js', icon: SiNextdotjs, color: 'text-white' },
    { name: 'Node.js', icon: SiNodedotjs, color: 'text-green-600' },
    { name: 'Express', icon: SiExpress, color: 'text-white' },
    { name: 'PostgreSQL', icon: SiPostgresql, color: 'text-blue-300' },
    { name: 'MongoDB', icon: SiMongodb, color: 'text-green-500' },
    { name: 'Python', icon: SiPython, color: 'text-yellow-300' },
    { name: 'Tailwind', icon: SiTailwindcss, color: 'text-cyan-300' },
    { name: 'Git', icon: SiGit, color: 'text-red-500' },
    { name: 'Docker', icon: SiDocker, color: 'text-blue-400' },
    { name: 'Redis', icon: SiRedis, color: 'text-red-600' },
    { name: 'GraphQL', icon: SiGraphql, color: 'text-pink-400' },
    { name: 'PHP', icon: SiPhp, color: 'text-indigo-400' },
    { name: 'Linux', icon: SiLinux, color: 'text-yellow-100' },
    { name: 'Nginx', icon: SiNginx, color: 'text-green-500' },
];

export default function TechStackCarousel() {
    return (
        <section className="relative py-12 border-y border-white/5 bg-black/50 overflow-hidden group">
            {/* Cyberpunk Accents */}
            <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10" />

            <div className="absolute mb-8 left-1/2 -translate-x-1/2 -top-3 px-4 py-1 bg-black border border-white/10 rounded-full z-20">
                <span className="text-[9px] font-mono text-gray-500 tracking-[0.3em] uppercase">
                    &gt; DETECTED_PROTOCOLS_V.19
                </span>
            </div>

            <div className="flex w-max animate-scroll hover:[animation-play-state:paused]">
                {/* Loop 1 */}
                <div className="flex items-center gap-16 px-8">
                    {TECH_STACK.map((tech, i) => (
                        <div key={`tech-1-${i}`} className="flex flex-col items-center gap-3 group/item cursor-pointer">
                            <div className={clsx(
                                "p-3 rounded-lg bg-white/5 border border-white/5 transition-all duration-300",
                                "group-hover/item:border-cyan-500/50 group-hover/item:bg-cyan-500/10 group-hover/item:shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)]"
                            )}>
                                <tech.icon size={32} className={clsx(
                                    "transition-colors duration-300 grayscale group-hover/item:grayscale-0 opacity-50 group-hover/item:opacity-100",
                                    tech.color
                                )} />
                            </div>
                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider group-hover/item:text-cyan-400 transition-colors">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Loop 2 (Duplicate for continuous scroll) */}
                <div className="flex items-center gap-16 px-8">
                    {TECH_STACK.map((tech, i) => (
                        <div key={`tech-2-${i}`} className="flex flex-col items-center gap-3 group/item cursor-pointer">
                            <div className={clsx(
                                "p-3 rounded-lg bg-white/5 border border-white/5 transition-all duration-300",
                                "group-hover/item:border-cyan-500/50 group-hover/item:bg-cyan-500/10 group-hover/item:shadow-[0_0_15px_-3px_rgba(34,211,238,0.3)]"
                            )}>
                                <tech.icon size={32} className={clsx(
                                    "transition-colors duration-300 grayscale group-hover/item:grayscale-0 opacity-50 group-hover/item:opacity-100",
                                    tech.color
                                )} />
                            </div>
                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider group-hover/item:text-cyan-400 transition-colors">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
            `}</style>
        </section>
    );
}
