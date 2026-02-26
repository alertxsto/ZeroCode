import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import {
    RiUser3Fill, RiMailFill, RiLockPasswordFill, RiEyeFill,
    RiEyeOffFill, RiUserAddFill, RiArrowLeftLine, RiFlashlightFill
} from 'react-icons/ri';
import { VscCode } from 'react-icons/vsc';
import RealisticDNA from '../components/RealisticDNA';

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                studentId: 'N/A',
                major: 'Not specified'
            }, formData.password);

            if (result.success) {
                navigate('/dashboard');
            } else {
                console.error("Registration failed with reason:", result.error);
                setError(result.error || 'Registration failed due to a server error. Please check the console.');
            }
        } catch (err) {
            console.error("Unexpected error in Register component:", err);
            setError(`An unexpected error occurred during registration: ${err.message || 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-black overflow-hidden font-sans selection:bg-purple-500/30">
            {/* LEFT SIDE: Visuals & Benefits */}
            <div className="hidden lg:flex w-[55%] relative flex-col justify-center items-center overflow-hidden bg-black border-r border-white/5">
                {/* DNA Background */}
                <div className="absolute inset-0 z-0 opacity-50 mix-blend-screen pointer-events-none">
                    <RealisticDNA />
                </div>

                {/* Overlay Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_120%)] z-10" />

                <div className="relative z-20 px-16 max-w-2xl text-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-20 h-20 mx-auto bg-black border border-purple-500/50 rounded-sm flex items-center justify-center mb-8 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] relative group">
                            <div className="absolute inset-0 bg-purple-500/10 animate-pulse" />
                            <RiUserAddFill className="w-10 h-10 text-purple-400 relative z-10" />
                            {/* Tech corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-purple-500" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-purple-500" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-purple-500" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-purple-500" />
                        </div>

                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-6">
                            INITIALIZE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-pink-400 animate-pulse-slow">PROTOCOL</span>
                        </h1>

                        <div className="grid grid-cols-2 gap-4 mt-12 text-left">
                            <div className="p-4 bg-zinc-900/50 border border-white/10 rounded-sm hover:border-purple-500/50 transition-colors group">
                                <VscCode className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" size={20} />
                                <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Elite Curriculum</h3>
                                <p className="text-gray-500 text-[10px] font-mono leading-relaxed">Full-stack mastery from zero to architect.</p>
                            </div>
                            <div className="p-4 bg-zinc-900/50 border border-white/10 rounded-sm hover:border-purple-500/50 transition-colors group">
                                <RiFlashlightFill className="text-amber-400 mb-2 group-hover:scale-110 transition-transform" size={20} />
                                <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Terminal Access</h3>
                                <p className="text-gray-500 text-[10px] font-mono leading-relaxed">Execute code directly in the browser.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className="w-full lg:w-[45%] h-full flex flex-col relative bg-black border-l border-white/5">
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

                {/* Back Button */}
                <div className="absolute top-8 left-8 z-20">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors text-[10px] font-mono font-bold uppercase tracking-widest group"
                    >
                        <RiArrowLeftLine size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Return_To_Base
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 sm:p-12 overflow-y-auto custom-scrollbar relative z-10">
                    <div className="w-full max-w-md space-y-8">
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="w-12 h-12 mx-auto bg-purple-900/20 border border-purple-500/30 rounded-sm flex items-center justify-center mb-4 text-purple-400">
                                <RiUserAddFill size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">New Operative</h2>
                        </div>

                        <div className="text-center lg:text-left">
                            <h2 className="hidden lg:block text-3xl font-black text-white mb-2 uppercase tracking-tighter">
                                Create Identity
                            </h2>
                            <p className="text-gray-500 text-xs font-mono tracking-wide">Join the network and begin your training.</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center gap-3">
                                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                                <p className="text-red-400 text-xs font-mono">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Grid to save vertical space */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Operative_Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-600 group-focus-within:text-purple-400 transition-colors border-r border-white/5 bg-white/5">
                                            <RiUser3Fill size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-14 pr-4 py-3 bg-black border border-white/10 focus:border-purple-500/50 focus:bg-purple-900/10 focus:outline-none transition-all text-white placeholder-gray-700 font-mono text-sm rounded-sm"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Email_Frequency</label>
                                    <div className="relative group">
                                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-600 group-focus-within:text-purple-400 transition-colors border-r border-white/5 bg-white/5">
                                            <RiMailFill size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-14 pr-4 py-3 bg-black border border-white/10 focus:border-purple-500/50 focus:bg-purple-900/10 focus:outline-none transition-all text-white placeholder-gray-700 font-mono text-sm rounded-sm"
                                            placeholder="email@zero.dev"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Set_Passkey</label>
                                    <div className="relative group">
                                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-600 group-focus-within:text-purple-400 transition-colors border-r border-white/5 bg-white/5">
                                            <RiLockPasswordFill size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-14 pr-10 py-3 bg-black border border-white/10 focus:border-purple-500/50 focus:bg-purple-900/10 focus:outline-none transition-all text-white placeholder-gray-700 font-mono text-sm rounded-sm"
                                            placeholder="Min 6 chars"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Verify_Key</label>
                                    <div className="relative group">
                                        <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-600 group-focus-within:text-purple-400 transition-colors border-r border-white/5 bg-white/5">
                                            <RiLockPasswordFill size={16} />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full pl-14 pr-10 py-3 bg-black border border-white/10 focus:border-purple-500/50 focus:bg-purple-900/10 focus:outline-none transition-all text-white placeholder-gray-700 font-mono text-sm rounded-sm"
                                            placeholder="Repeat key"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 py-2">
                                <input
                                    type="checkbox"
                                    required
                                    className="w-4 h-4 mt-0.5 rounded-sm border-gray-700 bg-black text-purple-500 focus:ring-offset-0 focus:ring-0 checked:bg-purple-500 checked:border-purple-500 transition-colors"
                                />
                                <label className="text-[10px] text-gray-500 font-mono">
                                    I verify that I accept the <Link to="/terms" className="text-white hover:underline decoration-purple-500">Terms of Service</Link> and <Link to="/privacy" className="text-white hover:underline decoration-purple-500">Privacy Policy</Link>.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-purple-400 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-xs relative overflow-hidden group"
                                style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                        <span>INITIALIZING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="absolute inset-0 bg-white group-hover:bg-purple-400 transition-colors duration-300"></span>
                                        <span className="relative z-10 flex items-center gap-2">
                                            <RiUserAddFill size={16} />
                                            <span>CREATE IDENTITY</span>
                                        </span>
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="text-center text-gray-600 text-xs font-mono pt-4 group">
                            Already_Operative?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-white transition-colors font-bold uppercase tracking-wide">
                                Authenticate →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
