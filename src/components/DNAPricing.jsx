import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiVipCrownFill, RiCpuLine, RiTerminalBoxLine } from 'react-icons/ri';
import clsx from 'clsx';
import RealisticDNA from './RealisticDNA';

// DNA Component Extracted to ./RealisticDNA.jsx

function PricingCard({ plan, planKey, index, onSelect, user }) {
    const isPopular = plan.popular;
    const isLeft = index % 2 === 0;

    // Theme Logic
    const themeColor = isPopular ? 'purple' : 'cyan';
    const borderColor = isPopular ? 'border-purple-500' : 'border-cyan-500';
    const textColor = isPopular ? 'text-purple-400' : 'text-cyan-400';
    const bgColor = isPopular ? 'bg-purple-500' : 'bg-cyan-500';
    const glowColor = isPopular ? 'shadow-purple-500/20' : 'shadow-cyan-500/20';

    return (
        <div className={clsx(
            "relative z-10 w-full mb-32 md:mb-16 flex items-center",
            !isLeft ? "justify-start md:pl-[8%]" : "justify-end md:pr-[8%]"
        )}>
            {/* TECH CONNECTION LINE */}
            <div className={clsx(
                "hidden md:block absolute top-[45px] pointer-events-none",
                !isLeft ? "left-[50%] w-[calc(58%)]" : "right-[50%] w-[calc(58%)]"
            )}>
                <div className={clsx(
                    "h-[2px] w-full bg-gradient-to-r opacity-50 relative",
                    !isLeft ? "from-transparent to-cyan-500" : "from-purple-500 to-transparent"
                )}>
                    {/* Data Pulse */}
                    <div className={clsx(
                        "absolute top-0 bottom-0 w-20 bg-white blur-[4px] animate-[pulse_3s_ease-in-out_infinite]",
                        !isLeft ? "right-0" : "left-0"
                    )} />
                </div>
                {/* Connector Node */}
                <div className={clsx(
                    "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-black border-2 rotate-45 z-10",
                    borderColor,
                    !isLeft ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
                )} />
            </div>

            {/* CYBERPUNK CARD */}
            <div className={clsx(
                "relative w-full max-w-[400px] group transition-all duration-300 hover:scale-[1.02]",
                "bg-[#09090b]/95 backdrop-blur-md", // Dark glass background for contrast
                "border border-white/10"
            )}
                style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 88%, 92% 100%, 0 100%)" // Angled bottom-right corner
                }}
            >
                {/* Neon Glow Border */}
                <div className={clsx(
                    "absolute inset-0 opacity-40 transition-opacity group-hover:opacity-100 pointer-events-none",
                    "border", borderColor,
                    "shadow-[0_0_50px_-10px]", glowColor
                )} style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 88%, 92% 100%, 0 100%)",
                }} />

                {/* Top Accent Line */}
                <div className={clsx(
                    "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                    isPopular ? "from-purple-600 via-fuchsia-500 to-purple-600" : "from-cyan-600 via-blue-500 to-cyan-600"
                )} />

                <div className="relative p-7 pt-9">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className={clsx("text-[10px] font-mono uppercase tracking-[0.2em] mb-2 opacity-80", textColor)}>
                                // {isPopular ? 'RECOMMENDED_LOADOUT' : 'STANDARD_ACCESS'}
                            </div>
                            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                                {plan.name}
                            </h3>
                        </div>
                        <div className={clsx(
                            "p-2.5 bg-white/5 border border-white/5",
                            textColor
                        )} style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)" }}>
                            {isPopular ? <RiVipCrownFill size={20} /> : <RiTerminalBoxLine size={20} />}
                        </div>
                    </div>

                    {/* Price - HUD Style */}
                    <div className="mb-8 relative border-t border-b border-white/5 py-4 bg-white/[0.02]">
                        <div className="flex items-baseline gap-3">
                            <span className="text-5xl font-black text-white font-mono tracking-tighter">
                                {(plan.price / 1000).toFixed(0)}
                                <span className={clsx("text-3xl", textColor)}>K</span>
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1 flex justify-between">
                            <span>{plan.courseCount} COURSES</span>
                            <span className="line-through opacity-50">{(plan.originalPrice / 1000).toFixed(0)}K</span>
                        </div>
                        {/* Decorative HUD Lines */}
                        <div className={clsx("absolute top-0 left-0 h-2 w-[1px]", bgColor)} />
                        <div className={clsx("absolute bottom-0 right-0 h-2 w-[1px]", bgColor)} />
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 group/item">
                                <div className={clsx(
                                    "mt-1 w-1.5 h-1.5 transform rotate-45 transition-colors duration-300",
                                    bgColor,
                                    "group-hover/item:bg-white"
                                )} />
                                <span className="text-sm font-medium text-gray-400 font-mono leading-snug group-hover/item:text-gray-200 transition-colors">
                                    {feature}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Button */}
                    <button
                        onClick={() => onSelect(planKey)}
                        className={clsx(
                            "w-full py-4 text-xs font-bold uppercase tracking-[0.2em] relative overflow-hidden group/btn transition-all duration-300",
                            "bg-white/5 hover:bg-white/10 text-white border-t border-white/10"
                        )}
                        style={{
                            clipPath: "polygon(0 0, 100% 0, 100% 70%, 95% 100%, 0 100%)"
                        }}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            <span className={clsx("w-1 h-4", bgColor)} />
                            {user ? 'INITIALIZE' : 'DEPLOY'}
                        </span>
                        {/* Hover Glitch Effect */}
                        <div className={clsx(
                            "absolute inset-0 opacity-0 group-hover/btn:opacity-10 transition-opacity transform translate-x-full group-hover/btn:translate-x-0 duration-300",
                            bgColor
                        )} />
                    </button>

                    {/* Decorative Footer */}
                    <div className="absolute bottom-2 right-3 text-[9px] text-white/10 font-mono">
                        SYS.V.2.0 // {index < 9 ? `0${index + 1}` : index + 1}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DNAPricing({ pricing, onSelectPlan, user }) {
    const plans = [
        { key: 'starter', data: pricing.starter },
        { key: 'developer', data: pricing.developer },
        { key: 'professional', data: pricing.professional },
        { key: 'master', data: pricing.master }
    ];

    return (
        <div className="relative w-full py-24 md:py-32">
            <RealisticDNA />

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="text-center mb-32">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-sm rounded-none skew-x-[-10deg]">
                        <div className="w-1.5 h-1.5 bg-cyan-400 animate-pulse" />
                        <span className="text-cyan-400 text-xs font-mono tracking-widest uppercase skew-x-[10deg]">
                            System Upgrade Available
                        </span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase">
                        Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Access</span>
                    </h2>
                    <p className="text-gray-500 max-w-lg mx-auto font-mono text-sm leading-relaxed">
                        &lt;Select_Augmentation_Level /&gt;<br />
                        Enhance your cognitive capabilities with our premium neural pathways.
                    </p>
                </div>

                <div className="flex flex-col gap-8 md:gap-0">
                    {plans.map((plan, index) => (
                        <PricingCard
                            key={plan.key}
                            plan={plan.data}
                            planKey={plan.key}
                            index={index}
                            onSelect={onSelectPlan}
                            user={user}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
