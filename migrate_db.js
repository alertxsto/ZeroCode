import { sql } from './shared/_lib/db.js';

const runMigration = async () => {
    try {
        console.log('Adding border column to users table...');
        await sql`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS border TEXT DEFAULT 'none';
        `;
        console.log('Migration successful: Added border column.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

runMigration();
