import { sql } from '../shared/_lib/db.js';
import { requireUser } from '../shared/_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const user = await requireUser(req, res);
    if (!user) return;

    const { resource, id } = req.query || {};
    const body = req.body || {};

    // GET /api/vault?resource=folders — list folders for user
    // GET /api/vault?resource=notes — list notes for user
    if (req.method === 'GET') {
        try {
            if (resource === 'folders') {
                const folders = await sql`
                    SELECT * FROM user_folders WHERE user_id = ${user.id} ORDER BY name ASC
                `;
                return res.status(200).json({ success: true, folders });
            }
            if (resource === 'notes') {
                const notes = await sql`
                    SELECT * FROM user_notes WHERE user_id = ${user.id} ORDER BY last_modified DESC
                `;
                return res.status(200).json({ success: true, notes });
            }
            return res.status(400).json({ success: false, error: 'Invalid resource' });
        } catch (error) {
            console.error('Vault load error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // POST /api/vault?resource=folders — create folder { name, parentId }
    // POST /api/vault?resource=notes — create note { title, content, folderId }
    if (req.method === 'POST') {
        try {
            if (resource === 'folders') {
                const { name, parentId } = body;
                if (!name) return res.status(400).json({ success: false, error: 'Missing name' });
                const [folder] = await sql`
                    INSERT INTO user_folders (user_id, name, parent_id)
                    VALUES (${user.id}, ${name}, ${parentId ?? null})
                    RETURNING *
                `;
                return res.status(201).json({ success: true, folder });
            }
            if (resource === 'notes') {
                const { title, content, folderId } = body;
                if (!title) return res.status(400).json({ success: false, error: 'Missing title' });
                const [note] = await sql`
                    INSERT INTO user_notes (user_id, title, content, folder_id)
                    VALUES (${user.id}, ${title}, ${content || ''}, ${folderId ?? null})
                    RETURNING *
                `;
                return res.status(201).json({ success: true, note });
            }
            return res.status(400).json({ success: false, error: 'Invalid resource' });
        } catch (error) {
            console.error('Vault create error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // PATCH /api/vault?resource=folders&id=X — rename folder { name }
    // PATCH /api/vault?resource=notes&id=X — update note { title, content, folderId }
    if (req.method === 'PATCH') {
        if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
        try {
            if (resource === 'folders') {
                const { name } = body;
                if (!name) return res.status(400).json({ success: false, error: 'Missing name' });
                const [updated] = await sql`
                    UPDATE user_folders
                    SET name = ${name}
                    WHERE id = ${id} AND user_id = ${user.id}
                    RETURNING *
                `;
                if (!updated) return res.status(404).json({ success: false, error: 'Folder not found' });
                return res.status(200).json({ success: true, folder: updated });
            }
            if (resource === 'notes') {
                const { title, content, folderId } = body;
                const [updated] = await sql`
                    UPDATE user_notes
                    SET title = ${title ?? undefined},
                        content = ${content ?? undefined},
                        folder_id = ${folderId ?? undefined},
                        last_modified = CURRENT_TIMESTAMP
                    WHERE id = ${id} AND user_id = ${user.id}
                    RETURNING *
                `;
                if (!updated) return res.status(404).json({ success: false, error: 'Note not found' });
                return res.status(200).json({ success: true, note: updated });
            }
            return res.status(400).json({ success: false, error: 'Invalid resource' });
        } catch (error) {
            console.error('Vault update error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE /api/vault?resource=folders&id=X — delete folder
    // DELETE /api/vault?resource=notes&id=X — delete note
    if (req.method === 'DELETE') {
        if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
        try {
            if (resource === 'folders') {
                await sql`DELETE FROM user_folders WHERE id = ${id} AND user_id = ${user.id}`;
                return res.status(200).json({ success: true });
            }
            if (resource === 'notes') {
                await sql`DELETE FROM user_notes WHERE id = ${id} AND user_id = ${user.id}`;
                return res.status(200).json({ success: true });
            }
            return res.status(400).json({ success: false, error: 'Invalid resource' });
        } catch (error) {
            console.error('Vault delete error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}
