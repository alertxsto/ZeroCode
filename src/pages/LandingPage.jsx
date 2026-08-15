import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { ChevronRight, Terminal, Cpu, Shield, Zap } from 'lucide-react';
import { VscCode } from 'react-icons/vsc';
import { RiVipCrownFill, RiCheckFill, RiGithubFill } from 'react-icons/ri';
import clsx from 'clsx';
import DNAPricing from '../components/DNAPricing';
import TechStackCarousel from '../components/TechStackCarousel';
import { PRICING, WHATSAPP_NUMBER, buildPurchaseMessage, whatsappLink } from '../lib/pricing';

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleBuy = (tier) => {
        const message = buildPurchaseMessage(tier, user);
        window.open(whatsappLink(message), '_blank');
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden font-sans selection:bg-cyan-500/30">
            {/* GLOBAL CYBER GRID */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            </div>

            {/* CYBERPUNK NAVBAR */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
                    {/* Animated Nav Line */}
                    <div className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="relative w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-sm overflow-hidden group-hover:border-cyan-500/50 transition-colors">
                            <VscCode size={24} className="text-cyan-400 relative z-10" />
                            {/* Scanning effect */}
                            <div className="absolute inset-0 bg-cyan-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">ZEROCODE</span>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-mono text-gray-500 tracking-[0.2em] group-hover:text-cyan-500/70">SYSTEM_ONLINE</span>
                                <span className="text-[8px] font-bold bg-yellow-500/20 text-yellow-500 px-1 rounded border border-yellow-500/30 w-fit mt-0.5">BETA</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {/* Status Indicators */}
                        <div className="flex items-center gap-4 font-mono text-[10px] text-gray-500">
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 animate-pulse rounded-full" />
                                NET: SECURE
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                                VER: 2.8.0-beta.1
                            </span>
                        </div>
                    </div>

                    {user ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 bg-cyan-500 text-black font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                        >
                            Enter Dashboard
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 text-xs font-mono text-gray-400 hover:text-white border-r border-white/10 hover:bg-white/5 transition-colors"
                            >
                                [ LOGIN ]
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-6 py-2 bg-white/5 border border-white/10 text-cyan-400 font-mono text-xs hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all"
                            >
                                &lt; INITIALIZE /&gt;
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-40 pb-20 px-6">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16">

                        {/* LEFT: Text Content */}
                        <div className="flex-1 text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/20 border border-purple-500/30 rounded-none mb-8">
                                <RiVipCrownFill size={12} className="text-purple-400" />
                                <span className="text-[10px] font-mono text-purple-300 tracking-[0.2em] uppercase">
                                    Archive Access: Granted
                                </span>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter text-white">
                                CODE <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 glitch-text" data-text="EVOLUTION">
                                    EVOLUTION
                                </span>
                            </h1>

                            <p className="text-gray-400 font-mono text-sm md:text-base leading-relaxed max-w-lg mb-10 border-l-2 border-cyan-500/30 pl-6">
                                &gt; Initiating neural handshake... <br />
                                &gt; Loading 19 expert modules... <br />
                                &gt; Target: Full Stack Mastery. <br />
                                <span className="text-cyan-500">System ready. Awaiting input.</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-10 py-4 bg-cyan-500 text-black font-black text-sm uppercase tracking-widest hover:bg-cyan-400 hover:shadow-[0_0_30px_-5px_#22d3ee] transition-all"
                                    style={{ clipPath: "polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)" }}
                                >
                                    Start Sequence
                                </button>
                                <a
                                    href="#pricing"
                                    className="px-10 py-4 border border-white/20 text-white font-mono text-sm uppercase tracking-widest hover:bg-white/5 transition-colors"
                                >
                                    View Data
                                </a>
                            </div>

                            {/* Tech Specs */}
                            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">19</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Modules</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">133h</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Runtime</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">∞</div>
                                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Access</div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Visual Terminal */}
                        <div className="flex-1 w-full max-w-lg relative perspective-1000">
                            {/* Holo card effect */}
                            <div className="relative bg-[#0a0a0a] border border-white/10 p-2 rounded-sm transform rotate-y-[-10deg] rotate-x-[5deg] shadow-2xl shadow-cyan-900/20 group hover:transform-none transition-transform duration-700">

                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                        <span className="ml-2 text-[10px] font-mono text-gray-500">root@zerocode:~</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-cyan-500 animate-pulse">● LIVE</div>
                                </div>

                                {/* Body */}
                                <div className="p-6 font-mono text-xs md:text-sm h-[300px] overflow-hidden text-gray-400 relative">
                                    <div><span className="text-purple-400">const</span> <span className="text-blue-400">mastery</span> = <span className="text-yellow-400">new</span> Future();</div>
                                    <div className="mt-2 text-gray-600">// Loading core modules...</div>

                                    <div className="mt-4 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-500">✔</span> HTML5_Protocol <span className="text-gray-600">...loaded</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-500">✔</span> React_Engine_v18 <span className="text-gray-600">...loaded</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-500">✔</span> Py_Script_Engine <span className="text-gray-600">...loaded</span>
                                        </div>
                                        <div className="flex items-center gap-2 animate-pulse">
                                            <span className="text-cyan-500">➜</span> Neural_Admin_Panel <span className="text-cyan-500">...initializing</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-cyan-950/10 border border-cyan-500/20 rounded">
                                        <div className="text-cyan-400 mb-1">&gt; Deploying to production...</div>
                                        <div className="w-full h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-cyan-500 w-[75%] animate-[load_2s_ease-out_infinite]" />
                                        </div>
                                    </div>

                                    {/* Scanline overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[10px] w-full animate-scan pointer-events-none" />
                                </div>
                            </div>

                            {/* Decorative Elements behind */}
                            <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[100px]" />
                            <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 blur-[100px]" />
                        </div>
                    </div>
                </div>
            </section >



            {/* SEPARATOR */}
            < div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

            {/* TECH STACK CAROUSEL */}
            < TechStackCarousel />

            {/* SEPARATOR */}
            < div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

            {/* PRICING SECTION - PURE DNA ONLY */}
            < section id="pricing" className="relative" >
                <DNAPricing
                    pricing={PRICING}
                    onSelectPlan={(planKey) => user ? handleBuy(planKey) : navigate('/register')}
                    user={user}
                />
            </section >

            {/* FOOTER */}
            < footer className="relative border-t border-white/10 bg-black pt-16 pb-8" >
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-sm">
                                <VscCode size={20} className="text-black" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">ZEROCODE</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm font-mono">
                            Forging the next generation of digital architects.
                            ZeroCode provides the raw data and protocols needed to
                            construct the future.
                            <br /><br />
                            // END_TRANSMISSION
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Protocols</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-mono">
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">&gt; Documentation</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">&gt; API_Access</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">&gt; System_Status</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-widest">Connect</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-mono">
                            <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-cyan-400 transition-colors">&gt; Neural_Support</a></li>
                            <li><a href="#" className="hover:text-cyan-400 transition-colors">&gt; GitHub_Repo</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-600 font-mono uppercase tracking-wider">
                    <div>© 2024 ZeroCode Systems Inc. All rights reserved.</div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span>Privacy_Protocol</span>
                        <span>Terms_Of_Service</span>
                    </div>
                </div>
            </footer >
        </div >
    );
}

// Add global styles for keyframes
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes scan {
            0% { top: -20%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 120%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 3s linear infinite;
        }
        @keyframes load {
            0% { width: 0%; opacity: 0.5; }
            100% { width: 100%; opacity: 1; }
        }
    `;
    if (!document.head.querySelector('style[data-landing-animations]')) {
        style.setAttribute('data-landing-animations', 'true');
        document.head.appendChild(style);
    }
}

