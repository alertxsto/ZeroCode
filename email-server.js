import http from 'http';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !key.startsWith('#')) {
            process.env[key.trim()] = value.trim();
        }
    });
}

// Create Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Email server configuration error:', error);
    } else {
        console.log('✓ Email server is ready to take our messages');
    }
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
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px 40px; border-bottom: 1px solid #f3f4f6;">
                            <h1 style="margin: 0; color: #4F46E5; font-size: 24px; font-weight: 700; text-align: center; letter-spacing: -0.5px;">ZeroCode</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 40px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
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

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            if (!body) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Empty body' }));
                return;
            }

            const data = JSON.parse(body);
            const { email } = data;

            if (!email) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Email is required' }));
                return;
            }

            if (req.url === '/api/email/verification') {
                const { verificationCode } = data;
                console.log(`Sending verification email to ${email}...`);

                const content = `
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">Verify your email</h2>
                    <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                        Welcome to ZeroCode! Please use the verification code below to confirm your email address and get started.
                    </p>
                    <div style="background-color: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                        <span style="display: block; color: #6B7280; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Verification Code</span>
                        <span style="display: block; color: #4F46E5; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">${verificationCode}</span>
                    </div>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">
                        This code will expire in 10 minutes.
                    </p>
                `;

                const info = await transporter.sendMail({
                    from: `"ZeroCode" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Verify your email for ZeroCode',
                    html: getEmailTemplate('Email Verification', content)
                });

                console.log(`✓ Verification email sent: ${info.messageId}`);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, message: 'Verification email sent' }));

            } else if (req.url === '/api/email/password-reset') {
                const { resetCode, resetLink } = data;
                console.log(`Sending password reset email to ${email}...`);

                const content = `
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">Reset your password</h2>
                    <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to choose a new password.
                    </p>
                    <div style="text-align: center; margin-bottom: 30px;">
                        <a href="${resetLink}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Reset Password</a>
                    </div>
                    <div style="background-color: #F3F4F6; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
                         <span style="display: block; color: #6B7280; font-size: 12px; margin-bottom: 4px;">Or enter this code manually:</span>
                         <span style="color: #111827; font-size: 18px; font-weight: 600; font-family: monospace;">${resetCode}</span>
                    </div>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">
                        This link will expire in 15 minutes.
                    </p>
                `;

                const info = await transporter.sendMail({
                    from: `"ZeroCode" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Reset your ZeroCode password',
                    html: getEmailTemplate('Password Reset', content)
                });

                console.log(`✓ Password reset email sent: ${info.messageId}`);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, message: 'Password reset email sent' }));

            } else if (req.url === '/api/email/welcome') {
                const { name } = data;
                console.log(`Sending welcome email to ${email}...`);

                const content = `
                    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">Welcome to ZeroCode!</h2>
                    <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                        Hi ${name},
                    </p>
                    <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                        Thanks for joining! Your email has been verified and you're all set to start your learning journey.
                    </p>
                    <div style="text-align: center; margin-bottom: 30px;">
                        <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Go to Dashboard</a>
                    </div>
                    <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 16px; line-height: 1.6;">
                        We have a variety of courses ranging from web development basics to advanced full-stack concepts.
                    </p>
                    <p style="margin: 0; color: #6B7280; font-size: 14px;">
                        Happy coding,<br>The ZeroCode Team
                    </p>
                `;

                const info = await transporter.sendMail({
                    from: `"ZeroCode" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Welcome to ZeroCode!',
                    html: getEmailTemplate('Welcome', content)
                });

                console.log(`✓ Welcome email sent: ${info.messageId}`);
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, message: 'Welcome email sent' }));

            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
            }
        } catch (error) {
            console.error('❌ Server error:', error.message);
            console.error(error.stack);
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`📧 Email server running on http://localhost:${PORT}`);
});
