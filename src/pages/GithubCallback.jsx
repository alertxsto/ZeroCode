import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { RiGithubFill, RiLoader4Line, RiErrorWarningLine } from 'react-icons/ri';

export default function GithubCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithGithub } = useAuth();
    const [status, setStatus] = useState('Initializing Handshake...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            setError('No authentication code received from GitHub.');
            return;
        }

        const handleCallback = async () => {
            try {
                setStatus('Exchanging Authorization Code...');

                // The server exchanges the code for a token and logs the user in
                // (client secret never touches the browser)
                const result = await loginWithGithub(code);

                if (result.success) {
                    navigate('/dashboard');
                } else {
                    throw new Error(result.error || 'GitHub login failed.');
                }

            } catch (err) {
                console.error('GitHub Auth Error:', err);
                setError(err.message);
            }
        };

        handleCallback();
    }, [searchParams, navigate, loginWithGithub]);

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center font-mono">
            <div className="max-w-md w-full p-8 border border-white/10 bg-white/5 backdrop-blur-md rounded-sm text-center">
                <div className="w-16 h-16 mx-auto bg-black border border-white/20 rounded-full flex items-center justify-center mb-6">
                    <RiGithubFill size={32} className="text-white" />
                </div>

                {error ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-red-500">
                            <RiErrorWarningLine size={20} />
                            <h2 className="text-lg font-bold uppercase tracking-widest">Auth Failed</h2>
                        </div>
                        <p className="text-sm text-gray-400 border border-red-900/30 bg-red-900/10 p-3 rounded">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors mt-4"
                        >
                            Return to Login
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-cyan-400 animate-pulse">
                            <RiLoader4Line size={20} className="animate-spin" />
                            <h2 className="text-lg font-bold uppercase tracking-widest">Authenticating</h2>
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{status}</p>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-4">
                            <div className="h-full bg-cyan-400 animate-progress-indeterminate"></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
