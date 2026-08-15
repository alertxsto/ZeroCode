import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Code2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const { resetPassword } = useAuth();
    
    // Get email and code from URL params or location state
    const searchParams = new URLSearchParams(location.search);
    const urlEmail = searchParams.get('email') || '';
    const urlCode = searchParams.get('code') || '';
    
    const email = urlEmail || location.state?.email || '';
    const [code, setCode] = useState(urlCode);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!code || code.length !== 6) {
            setError('Please enter a valid 6-digit code');
            setIsLoading(false);
            return;
        }

        if (!newPassword || newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const result = await resetPassword(email, code, newPassword);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.error || 'Password reset failed');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
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
                    <h1 className="text-3xl font-bold text-white mb-2">Password Reset!</h1>
                    <p className="text-gray-400">Redirecting to login...</p>
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
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create New Password</h1>
                    <p className="text-gray-400">
                        Enter the code sent to<br />
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Code Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Reset Code
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
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            New Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gray-300 transition-colors" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all text-white placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gray-300 transition-colors" size={20} />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all text-white placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-cyan-500 text-black rounded-md font-semibold hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
