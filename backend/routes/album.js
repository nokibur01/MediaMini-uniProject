const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── CREATE ALBUM
router.post("/create", (req, res) => {
    const { userId, title, description } = req.body;

    if (!userId || !title) {
        return res.json({ success: false, message: "userId and title are required" });
    }

    db.query("INSERT INTO ALBUMS (user_id, title, description) VALUES (?, ?, ?)",
        [userId, title, description],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Album creation failed" });
            res.json({ success: true, message: "Album created", albumId: result.insertId });
        }
    );
});

// ── GET USER ALBUMS
router.get("/user", (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.json({ success: false, message: "userId is required" });
    }

    db.query(`
        SELECT a.album_id, a.title, a.description, a.created_at,
               COUNT(ap.post_id) AS post_count
        FROM ALBUMS a
        LEFT JOIN ALBUM_POSTS ap ON a.album_id = ap.album_id
        WHERE a.user_id = ?
        GROUP BY a.album_id
        ORDER BY a.created_at DESC`,
        [userId],
        (err, results) => {
            if (err) return res.json({ success: false, message: "Failed to load albums" });
            res.json({ success: true, albums: results });
        }
    );
});

// ── ADD POST TO ALBUM 
router.post("/addpost", (req, res) => {
    const { albumId, postId } = req.body;

    if (!albumId || !postId) {
        return res.json({ success: false, message: "albumId and postId are required" });
    }

    db.query("INSERT INTO ALBUM_POSTS (album_id, post_id) VALUES (?, ?)",
        [albumId, postId],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Failed to add post to album" });
            res.json({ success: true, message: "Post added to album" });
        }
    );
});

// ── GET POSTS IN ALBUM 
router.get("/posts", (req, res) => {
    const { albumId } = req.query;

    if (!albumId) {
        return res.json({ success: false, message: "albumId is required" });
    }

    db.query(`
        SELECT p.post_id, p.content, p.created_at,
               u.username
        FROM ALBUM_POSTS ap
        JOIN POSTS p ON ap.post_id = p.post_id
        JOIN USERS u ON p.user_id = u.user_id
        WHERE ap.album_id = ?
        ORDER BY ap.added_at DESC`,
        [albumId],
        (err, results) => {
            if (err) return res.json({ success: false, message: "Failed to load album posts" });
            res.json({ success: true, posts: results });
        }
    );
});

// ── DELETE ALBUM
router.delete("/delete", (req, res) => {
    const { albumId, userId } = req.body;

    if (!albumId || !userId) {
        return res.json({ success: false, message: "All fields are required" });
    }

    db.query("DELETE FROM ALBUMS WHERE album_id = ? AND user_id = ?",
        [albumId, userId],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Delete failed" });
            res.json({ success: true, message: "Album deleted" });
        }
    );
});

module.exports = router;