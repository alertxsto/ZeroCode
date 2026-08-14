import { sql } from './_lib/db.js';
import { requireUser } from './_lib/auth.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { resource, id } = req.query || {};
    const body = req.body || {};

    // Public reads (posts list, post detail, replies) — no auth required
    if (req.method === 'GET') {
        try {
            if (resource === 'posts' && !id) {
                const sortBy = req.query.sortBy || 'latest';
                let orderClause = 'ORDER BY p.created_at DESC';
                if (sortBy === 'top') orderClause = 'ORDER BY p.likes DESC';
                if (sortBy === 'active') orderClause = 'ORDER BY reply_count DESC';

                const posts = await sql`
                    SELECT 
                        p.id, p.title, p.content, p.category, p.likes, p.created_at, p.user_id,
                        u.name as author_name,
                        u.avatar as author_avatar,
                        u.border as author_border,
                        u.subscription_tier as author_tier,
                        u.created_at as author_joined,
                        (SELECT COUNT(*) FROM forum_replies WHERE post_id = p.id) as reply_count
                    FROM forum_posts p
                    JOIN users u ON p.user_id = u.id
                    ${sql.unsafe(orderClause)}
                `;
                return res.status(200).json({ success: true, posts });
            }

            if (resource === 'posts' && id) {
                const posts = await sql`
                    SELECT 
                        p.*,
                        u.name as author_name,
                        u.avatar as author_avatar,
                        u.border as author_border,
                        u.subscription_tier as author_tier,
                        u.created_at as author_joined
                    FROM forum_posts p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.id = ${id}
                `;
                if (posts.length === 0) {
                    return res.status(404).json({ success: false, error: 'Post not found' });
                }
                return res.status(200).json({ success: true, post: posts[0] });
            }

            if (resource === 'replies') {
                const replies = await sql`
                    SELECT 
                        r.*,
                        u.name as author_name,
                        u.avatar as author_avatar,
                        u.border as author_border,
                        u.subscription_tier as author_tier,
                        u.created_at as author_joined
                    FROM forum_replies r
                    JOIN users u ON r.user_id = u.id
                    WHERE r.post_id = ${id}
                    ORDER BY r.created_at ASC
                `;
                return res.status(200).json({ success: true, replies });
            }

            if (resource === 'liked' && id) {
                const user = await requireUser(req, res);
                if (!user) return;
                const existing = await sql`
                    SELECT id FROM forum_likes WHERE post_id = ${id} AND user_id = ${user.id}
                `;
                return res.status(200).json({ success: true, liked: existing.length > 0 });
            }

            return res.status(400).json({ success: false, error: 'Invalid resource' });
        } catch (error) {
            console.error('Forum load error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // Everything below requires auth
    const user = await requireUser(req, res);
    if (!user) return;

    // POST /api/forum?resource=posts — create post { title, content, category }
    // POST /api/forum?resource=replies — reply to post { postId, content }
    // POST /api/forum?resource=likes&id=postId — toggle like
    if (req.method === 'POST') {
        try {
            if (resource === 'posts') {
                const { title, content, category } = body;
                if (!title || !content) {
                    return res.status(400).json({ success: false, error: 'Missing title or content' });
                }
                const [post] = await sql`
                    INSERT INTO forum_posts (user_id, title, content, category)
                    VALUES (${user.id}, ${title}, ${content}, ${category || 'general'})
                    RETURNING *
                `;
                return res.status(201).json({ success: true, post });
            }

            if (resource === 'replies') {
                const { postId, content } = body;
                if (!postId || !content) {
                    return res.status(400).json({ success: false, error: 'Missing postId or content' });
                }
                const [reply] = await sql`
                    INSERT INTO forum_replies (post_id, user_id, content)
                    VALUES (${postId}, ${user.id}, ${content})
                    RETURNING *
                `;
                return res.status(201).json({ success: true, reply });
            }

            if (resource === 'likes' && id) {
                const existing = await sql`
                    SELECT id FROM forum_likes WHERE post_id = ${id} AND user_id = ${user.id}
                `;
                if (existing.length > 0) {
                    await sql`DELETE FROM forum_likes WHERE post_id = ${id} AND user_id = ${user.id}`;
                    await sql`UPDATE forum_posts SET likes = likes - 1 WHERE id = ${id}`;
                    return res.status(200).json({ success: true, liked: false });
                } else {
                    await sql`INSERT INTO forum_likes (post_id, user_id) VALUES (${id}, ${user.id})`;
                    await sql`UPDATE forum_posts SET likes = likes + 1 WHERE id = ${id}`;
                    return res.status(200).json({ success: true, liked: true });
                }
            }

            return res.status(400).json({ success: false, error: 'Invalid resource' });
        } catch (error) {
            console.error('Forum create error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // PATCH /api/forum?resource=posts&id=X — edit own post { title, content }
    // PATCH /api/forum?resource=replies&id=X — edit own reply { content }
    if (req.method === 'PATCH') {
        if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
        try {
            if (resource === 'posts') {
                const { title, content } = body;
                const result = await sql`
                    UPDATE forum_posts 
                    SET title = ${title ?? undefined}, content = ${content ?? undefined}
                    WHERE id = ${id} AND user_id = ${user.id}
                    RETURNING *
                `;
                if (result.length === 0) {
                    return res.status(403).json({ success: false, error: 'Not authorized to edit this post' });
                }
                return res.status(200).json({ success: true, post: result[0] });
            }

            if (resource === 'replies') {
                const { content } = body;
                const result = await sql`
                    UPDATE forum_replies
                    SET content = ${content ?? undefined}
                    WHERE id = ${id} AND user_id = ${user.id}
                    RETURNING *
                `;
                if (result.length === 0) {
                    return res.status(403).json({ success: false, error: 'Not authorized to edit this reply' });
                }
                return res.status(200).json({ success: true, reply: result[0] });
            }

            return res.status(400).json({ success: false, error: 'Invalid resource' });
        } catch (error) {
            console.error('Forum update error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE /api/forum?resource=posts&id=X — delete own post (or admin)
    // DELETE /api/forum?resource=replies&id=X — delete own reply (or admin)
    if (req.method === 'DELETE') {
        if (!id) return res.status(400).json({ success: false, error: 'Missing id' });
        try {
            if (resource === 'posts') {
                const target = await sql`SELECT user_id FROM forum_posts WHERE id = ${id}`;
                if (target.length === 0) return res.status(404).json({ success: false, error: 'Post not found' });
                if (target[0].user_id !== user.id && !user.is_admin) {
                    return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
                }
                await sql`DELETE FROM forum_replies WHERE post_id = ${id}`;
                await sql`DELETE FROM forum_likes WHERE post_id = ${id}`;
                await sql`DELETE FROM forum_posts WHERE id = ${id}`;
                return res.status(200).json({ success: true });
            }

            if (resource === 'replies') {
                const target = await sql`SELECT user_id FROM forum_replies WHERE id = ${id}`;
                if (target.length === 0) return res.status(404).json({ success: false, error: 'Reply not found' });
                if (target[0].user_id !== user.id && !user.is_admin) {
                    return res.status(403).json({ success: false, error: 'Not authorized to delete this reply' });
                }
                await sql`DELETE FROM forum_replies WHERE id = ${id}`;
                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ success: false, error: 'Invalid resource' });
        } catch (error) {
            console.error('Forum delete error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
}
