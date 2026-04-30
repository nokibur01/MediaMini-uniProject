const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── ADD COMMENT
router.post("/add", (req, res) => {
    const { userId, postId, text } = req.body;

    if (!userId || !postId || !text) {
        return res.json({ success: false, message: "All fields are required" });
    }

    db.query("INSERT INTO COMMENTS (user_id, post_id, text) VALUES (?, ?, ?)",
        [userId, postId, text],
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Comment failed" });
            }
            res.json({ success: true, message: "Comment added" });
        }
    );
});

// ── GET COMMENTS FOR A POST
router.get("/get", (req, res) => {
    const { postId } = req.query;

    if (!postId) {
        return res.json({ success: false, message: "postId is required" });
    }

    db.query(`
        SELECT c.comment_id, c.text, c.created_at,
               u.username
        FROM COMMENTS c
        JOIN USERS u ON c.user_id = u.user_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC`,
        [postId],
        (err, results) => {
            if (err) {
                return res.json({ success: false, message: "Failed to load comments" });
            }
            res.json({ success: true, comments: results });
        }
    );
});

// ── DELETE COMMENT
router.delete("/delete", (req, res) => {
    const { commentId, userId } = req.body;

    if (!commentId || !userId) {
        return res.json({ success: false, message: "All fields are required" });
    }

    db.query("DELETE FROM COMMENTS WHERE comment_id = ? AND user_id = ?",
        [commentId, userId],
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Delete failed" });
            }
            res.json({ success: true, message: "Comment deleted" });
        }
    );
});

module.exports = router;