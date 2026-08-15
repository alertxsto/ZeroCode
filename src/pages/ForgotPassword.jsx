import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthProvider';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { requestPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email) {
            setError('Please enter your email');
            setIsLoading(false);
            return;
        }

        try {
            const result = await requestPasswordReset(email);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/reset-password', { state: { email } });
                }, 2000);
            } else {
                setError(result.error || 'Failed to send reset email');
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
                    <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
                    <p className="text-gray-400">We sent a reset code to {email}</p>
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
                    <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-gray-400">Enter your email to receive a reset code</p>
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all text-white placeholder-gray-500"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-cyan-500 text-black rounded-md font-semibold hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="mt-8 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
