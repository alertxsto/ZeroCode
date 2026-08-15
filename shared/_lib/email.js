import nodemailer from 'nodemailer';

// Shared server-side email sender.
// Uses Gmail SMTP via nodemailer; EMAIL_USER / EMAIL_PASSWORD are server env vars.

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const getEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <tr>
                        <td style="padding: 30px 40px; border-bottom: 1px solid #f3f4f6;">
                            <h1 style="margin: 0; color: #4F46E5; font-size: 24px; font-weight: 700; text-align: center; letter-spacing: -0.5px;">ZeroCode</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 40px;">
                            ${content}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; text-align: center;">
                            <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.5;">
                                © ${new Date().getFullYear()} ZeroCode Learning Platform.<br>
                                If you ignore this email, nothing will happen.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export async function sendVerificationEmail(email, code) {
    const content = `
        <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">Verify your email</h2>
        <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
            Welcome to ZeroCode! Please use the verification code below to confirm your email address and get started.
        </p>
        <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="display: block; color: #6B7280; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</span>
            <span style="display: block; color: #4F46E5; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">${code}</span>
        </div>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
            This code will expire in 10 minutes.
        </p>
    `;

    return transporter.sendMail({
        from: `"ZeroCode Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'ZeroCode - Email Verification',
        html: getEmailTemplate('Email Verification', content)
    });
}

export async function sendPasswordResetEmail(email, code) {
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const resetLink = `${appUrl}/reset-password?code=${code}&email=${encodeURIComponent(email)}`;

    const content = `
        <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">Password Reset</h2>
        <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Use the code below to create a new password.
        </p>
        <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="display: block; color: #6B7280; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Your reset code</span>
            <span style="display: block; color: #4F46E5; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">${code}</span>
        </div>
        <p style="margin: 0 0 16px 0; color: #6B7280; font-size: 14px;">
            This code will expire in 15 minutes.
        </p>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
            Or open: <a href="${resetLink}" style="color: #4F46E5;">${resetLink}</a>
        </p>
    `;

    return transporter.sendMail({
        from: `"ZeroCode Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'ZeroCode - Password Reset',
        html: getEmailTemplate('Password Reset', content)
    });
}

export async function sendWelcomeEmail(email, name) {
    const content = `
        <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">Welcome to ZeroCode${name ? `, ${name}` : ''}!</h2>
        <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
            Your email has been verified. You are now ready to start your journey from Zero to Full-Stack Hero.
        </p>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">
            Head over to the dashboard to begin your first course.
        </p>
    `;

    return transporter.sendMail({
        from: `"ZeroCode Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to ZeroCode!',
        html: getEmailTemplate('Welcome to ZeroCode', content)
    });
}
