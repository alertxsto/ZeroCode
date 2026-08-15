import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import {
    RiMailFill, RiLockPasswordFill, RiEyeFill, RiEyeOffFill,
    RiLoginCircleFill, RiArrowLeftLine, RiGithubFill
} from 'react-icons/ri';
import { VscCode } from 'react-icons/vsc';
import RealisticDNA from '../components/RealisticDNA';

export default function Login() {
    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleClientId, setGoogleClientId] = useState('');

    useEffect(() => {
        setGoogleClientId(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
    }, []);

    const handleGoogleSuccess = async (tokenResponse) => {
        setError('');
        setIsLoading(true);

        try {
            // Pass the raw access token — the server verifies it with Google
            const result = await loginWithGoogle({ access_token: tokenResponse.access_token });

            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Google login failed');
            }
        } catch (err) {
            setError('An error occurred during Google login');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                navigate('/dashboard');
            } else {
                if (result.error === 'User not found' || result.error === 'Invalid password') {
                    setError('Invalid email or password');
                } else {
                    setError('Login failed. Please try again.');
                }
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex bg-black overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* LEFT SIDE: Visuals & Branding */}
            <div className="hidden lg:flex w-[55%] relative flex-col justify-center items-center overflow-hidden bg-black border-r border-white/5">
                {/* DNA Background */}
                <div className="absolute inset-0 z-0 opacity-50 mix-blend-screen pointer-events-none">
                    <RealisticDNA />
                </div>

                {/* Overlay Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_120%)] z-10" />

                {/* Content */}
                <div className="relative z-20 px-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <div className="w-20 h-20 mx-auto bg-black border border-cyan-500/50 rounded-sm flex items-center justify-center mb-8 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] relative group">
                            <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                            <VscCode className="w-10 h-10 text-cyan-400 relative z-10" />
                            {/* Tech corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-500" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-500" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-cyan-500" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-cyan-500" />
                        </div>

                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
                            SYSTEM <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400 animate-pulse-slow">A C C E S S</span>
                        </h1>
                        <p className="text-cyan-500/60 font-mono text-sm tracking-[0.2em] uppercase">
                            // Neural Handshake Protocol
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-8 mt-12 border-t border-white/10 pt-8 max-w-md mx-auto">
                        <div>
                            <div className="text-xl font-bold text-white font-mono">2.8.0</div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Version</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-emerald-500 font-mono">SECURE</div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Connection</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-cyan-400 font-mono">BETA</div>
                            <div className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Channel</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Form */}
            <div className="w-full lg:w-[45%] h-full flex flex-col relative bg-black border-l border-white/5">
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

                {/* Back Button */}
                <div className="absolute top-8 left-8 z-20">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors text-[10px] font-mono font-bold uppercase tracking-widest group"
                    >
                        <RiArrowLeftLine size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Return_To_Base
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 sm:p-12 overflow-y-auto custom-scrollbar relative z-10">
                    <div className="w-full max-w-sm space-y-8">
                        {/* Mobile Header */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="w-12 h-12 mx-auto bg-cyan-900/20 border border-cyan-500/30 rounded-sm flex items-center justify-center mb-4 text-cyan-400">
                                <VscCode className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Access</h2>
                        </div>

                        <div className="text-center lg:text-left">
                            <h2 className="hidden lg:block text-3xl font-black text-white mb-2 uppercase tracking-tighter">
                                Identify Yourself
                            </h2>
                            <p className="text-gray-500 text-xs font-mono tracking-wide">Enter credentials to decrypt workspace.</p>
                        </div>

                        {error && (
                            <motion.div
                                role="alert"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-3"
                            >
                                <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                                <p className="text-red-400 text-xs font-mono">{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Email_Address</label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-600 group-focus-within:text-cyan-400 transition-colors border-r border-white/5 bg-white/5">
                                        <RiMailFill size={16} />
                                    </div>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-14 pr-4 py-3 bg-black border border-white/10 focus:border-cyan-500/50 focus:bg-cyan-950/10 focus:outline-none transition-all text-white placeholder-gray-700 font-mono text-sm rounded-sm"
                                        placeholder="operative@zerocode.dev"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Passkey</label>
                                    <Link to="/forgot-password" className="text-[10px] text-cyan-500 hover:text-cyan-300 transition-colors font-mono uppercase tracking-wider">
                                        Reset_Key?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-gray-600 group-focus-within:text-cyan-400 transition-colors border-r border-white/5 bg-white/5">
                                        <RiLockPasswordFill size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-14 pr-12 py-3 bg-black border border-white/10 focus:border-cyan-500/50 focus:bg-cyan-950/10 focus:outline-none transition-all text-white placeholder-gray-700 font-mono text-sm rounded-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <RiEyeOffFill size={16} /> : <RiEyeFill size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-cyan-500 text-black font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-xs relative overflow-hidden group rounded-md"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                        <span>AUTHENTICATING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="absolute inset-0 bg-white group-hover:bg-cyan-400 transition-colors duration-300"></span>
                                        <span className="relative z-10 flex items-center gap-2">
                                            <RiLoginCircleFill size={16} />
                                            <span>AUTHENTICATE</span>
                                        </span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono font-bold">
                                <span className="px-3 bg-black text-gray-600">Or_Connect_With</span>
                            </div>
                        </div>

                        {googleClientId && (
                            <div className="space-y-3">
                                <GoogleOAuthProvider clientId={googleClientId}>
                                    <SocialLoginButtons
                                        onGoogleSuccess={handleGoogleSuccess}
                                        onGoogleError={handleGoogleError}
                                    />
                                </GoogleOAuthProvider>
                            </div>
                        )}

                        <p className="text-center text-gray-600 text-xs font-mono pt-4 group">
                            New_User?{' '}
                            <Link to="/register" className="text-white hover:text-cyan-400 transition-colors font-bold uppercase tracking-wide">
                                Initialize_Protocol →
                            </Link>
                        </p>
                    </div>
                </div >
            </div >
        </div >
    );
}

function SocialLoginButtons({ onGoogleSuccess, onGoogleError }) {
    const loginGoogle = useGoogleLogin({
        onSuccess: onGoogleSuccess,
        onError: onGoogleError,
    });

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* GOOGLE BUTTON */}
            <button
                type="button"
                onClick={() => loginGoogle()}
                className="relative group h-12 overflow-hidden rounded-md border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all duration-300 active:scale-[0.98]"
            >
                <div className="relative flex items-center justify-center gap-2 h-full">
                    <div className="p-1 bg-white rounded-full">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="G" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-200 group-hover:text-white transition-colors">
                        Google
                    </span>
                </div>
            </button>

            {/* GITHUB BUTTON */}
            <button
                type="button"
                onClick={() => {
                    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
                    if (!clientId) {
                        alert("GitHub Client ID not configured");
                        return;
                    }
                    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user user:email`;
                }}
                className="relative group h-12 overflow-hidden rounded-md border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all duration-300 active:scale-[0.98]"
            >
                <div className="relative flex items-center justify-center gap-2 h-full">
                    <RiGithubFill size={20} className="text-zinc-200 group-hover:text-white transition-colors" />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-200 group-hover:text-white transition-colors">
                        GitHub
                    </span>
                </div>
            </button>
        </div>
    );
}

