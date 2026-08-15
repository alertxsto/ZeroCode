import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import { Mail, Code2, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailVerification() {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, resendVerificationCode } = useAuth();
    
    const email = location.state?.email || '';
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!code || code.length !== 6) {
            setError('Please enter a 6-digit code');
            setIsLoading(false);
            return;
        }

        try {
            const result = await verifyEmail(email, code);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            } else {
                setError(result.error || 'Verification failed');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setResendMessage('');

        try {
            const result = await resendVerificationCode(email);

            if (result.success) {
                setResendMessage('Code sent! Check your email.');
                setTimeLeft(600);
                setCode('');
            } else {
                setError(result.error || 'Failed to resend code');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setResendLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Email Verified!</h1>
                    <p className="text-gray-400 mb-4">Redirecting to dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
                    <p className="text-gray-400">
                        We sent a code to<br />
                        <span className="text-white font-medium">{email}</span>
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                )}

                {/* Success Message */}
                {resendMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3"
                    >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-green-400 text-sm">{resendMessage}</p>
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Code Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Verification Code
                        </label>
                        <div className="relative">
                            <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength="6"
                                placeholder="000000"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all text-white placeholder-gray-500 text-center text-2xl tracking-widest font-mono"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Code expires in {formatTime(timeLeft)}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || code.length !== 6}
                        className="w-full py-3 bg-cyan-500 text-black rounded-md font-semibold hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                {/* Resend */}
                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm mb-3">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-white hover:text-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resendLoading ? 'Sending...' : 'Resend Code'}
                    </button>
                </div>

                {/* Back to Login */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        ← Back to Login
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
