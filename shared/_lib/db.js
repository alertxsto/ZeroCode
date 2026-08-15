import { neon } from '@neondatabase/serverless';

// Server-side Neon connection.
// Uses the server-only NEON_DATABASE_URL, falling back to VITE_NEON_DATABASE_URL
// for environments where the legacy var is still set.
const connectionString = process.env.NEON_DATABASE_URL || process.env.VITE_NEON_DATABASE_URL;

if (!connectionString) {
    console.error('Missing NEON_DATABASE_URL environment variable');
}

export const sql = neon(connectionString);
