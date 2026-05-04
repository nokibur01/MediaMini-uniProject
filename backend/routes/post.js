const express = require("express");
const router  = express.Router();
const db      = require("../db");

// CREATE POST
router.post("/create", (req, res) => {
    const { userId, content, imageUrl } = req.body;

    if (!userId || !content) {
        return res.json({ success: false, message: "All fields are required" });
    }

    db.query("INSERT INTO POSTS (user_id, content, image_url) VALUES (?, ?, ?)",
        [userId, content, imageUrl || ""],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Post creation failed" });
            res.json({ success: true, message: "Post created" });
        }
    );
});

// GET FEED
router.get("/feed", (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.json({ success: false, message: "userId is required" });
    }

    const sql = `
        SELECT p.post_id, p.content, p.image_url, p.created_at,
               u.username, u.user_id, u.profile_pic,
               (SELECT COUNT(*) FROM LIKES    WHERE post_id = p.post_id) AS like_count,
               (SELECT COUNT(*) FROM COMMENTS WHERE post_id = p.post_id) AS comment_count
        FROM POSTS p
        JOIN USERS u ON p.user_id = u.user_id
        WHERE p.user_id = ?
        OR p.user_id IN (
            SELECT following_id FROM FOLLOWS WHERE follower_id = ?
        )
        ORDER BY p.created_at DESC
    `;

    db.query(sql, [userId, userId], (err, results) => {
        if (err) return res.json({ success: false, message: "Failed to load feed" });
        res.json({ success: true, posts: results });
    });
});

// GET USER POSTS
router.get("/user", (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.json({ success: false, message: "userId is required" });
    }

    db.query(`
        SELECT p.post_id, p.content, p.image_url, p.created_at,
               u.username,
               (SELECT COUNT(*) FROM LIKES WHERE post_id = p.post_id) AS like_count
        FROM POSTS p
        JOIN USERS u ON p.user_id = u.user_id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC`,
        [userId],
        (err, results) => {
            if (err) return res.json({ success: false, message: "Failed to load posts" });
            res.json({ success: true, posts: results });
        }
    );
});

// DELETE POST
router.delete("/delete", (req, res) => {
    const { postId, userId } = req.body;

    if (!postId || !userId) {
        return res.json({ success: false, message: "All fields are required" });
    }

    db.query("DELETE FROM POSTS WHERE post_id = ? AND user_id = ?",
        [postId, userId],
        (err) => {
            if (err) return res.json({ success: false, message: "Delete failed" });
            res.json({ success: true, message: "Post deleted" });
        }
    );
});

// EDIT POST
router.post("/edit", (req, res) => {
    const { postId, userId, content } = req.body;

    if (!postId || !userId || !content) {
        return res.json({ success: false, message: "All fields are required" });
    }

    db.query("UPDATE POSTS SET content = ? WHERE post_id = ? AND user_id = ?",
        [content, postId, userId],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Edit failed" });
            if (result.affectedRows === 0) {
                return res.json({ success: false, message: "Post not found" });
            }
            res.json({ success: true, message: "Post updated" });
        }
    );
});

// SEARCH POSTS
router.get("/search", (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.json({ success: false, message: "Query is required" });
    }

    db.query(`
        SELECT p.post_id, p.content, p.image_url, p.created_at,
               u.username, u.user_id, u.profile_pic,
               COUNT(DISTINCT l.like_id)    AS like_count,
               COUNT(DISTINCT c.comment_id) AS comment_count
        FROM POSTS p
        JOIN USERS u ON p.user_id = u.user_id
        LEFT JOIN LIKES l    ON l.post_id = p.post_id
        LEFT JOIN COMMENTS c ON c.post_id = p.post_id
        WHERE p.content LIKE ?
        GROUP BY p.post_id
        ORDER BY p.created_at DESC`,
        [`%${query}%`],
        (err, results) => {
            if (err) return res.json({ success: false, message: "Search failed" });
            res.json({ success: true, posts: results });
        }
    );
});

// POST STATS
router.get("/stats", (req, res) => {
    const sql = `
        SELECT
            p.post_id,
            p.content,
            u.username,
            COUNT(DISTINCT l.like_id)    AS total_likes,
            COUNT(DISTINCT c.comment_id) AS total_comments
        FROM POSTS p
        JOIN USERS u ON p.user_id = u.user_id
        LEFT JOIN LIKES l    ON l.post_id = p.post_id
        LEFT JOIN COMMENTS c ON c.post_id = p.post_id
        GROUP BY p.post_id, p.content, u.username
        ORDER BY total_likes DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.json({ success: false, message: "Failed" });
        res.json({ success: true, stats: results });
    });
});

// ADMIN GET ALL POSTS
router.get("/admin/posts", (req, res) => {
    db.query(`
        SELECT p.post_id, p.content, p.image_url, p.created_at,
               u.username,
               COUNT(DISTINCT l.like_id)    AS total_likes,
               COUNT(DISTINCT c.comment_id) AS total_comments
        FROM POSTS p
        JOIN USERS u ON p.user_id = u.user_id
        LEFT JOIN LIKES l    ON l.post_id = p.post_id
        LEFT JOIN COMMENTS c ON c.post_id = p.post_id
        GROUP BY p.post_id
        ORDER BY p.created_at DESC`,
        (err, results) => {
            if (err) return res.json({ success: false, message: "Failed" });
            res.json({ success: true, posts: results });
        }
    );
});

// ADMIN DELETE POST
router.delete("/admin/post/:id", (req, res) => {
    const postId = req.params.id;

    db.query("DELETE FROM POSTS WHERE post_id = ?",
        [postId],
        (err) => {
            if (err) return res.json({ success: false, message: "Delete failed" });
            res.json({ success: true, message: "Post deleted" });
        }
    );
});

module.exports = router;