// Generate 6-digit verification code
export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Resolve the app origin — serverless functions run in Node, so use APP_URL env;
// browsers use window.location.origin.
const getAppUrl = () => {
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }
    // eslint-disable-next-line no-undef
    return (typeof process !== 'undefined' && process.env?.APP_URL) || 'http://localhost:5173';
};

// Send verification email via backend API
export const sendVerificationEmail = async (email, verificationCode) => {
    try {
        const response = await fetch('/api/email/verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, verificationCode })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email with link
export const sendPasswordResetEmail = async (email, resetCode) => {
    try {
        const resetLink = `${getAppUrl()}/reset-password?code=${resetCode}&email=${encodeURIComponent(email)}`;

        const response = await fetch('/api/email/password-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, resetCode, resetLink })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email via backend API
export const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await fetch('/api/email/welcome', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, name })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};
