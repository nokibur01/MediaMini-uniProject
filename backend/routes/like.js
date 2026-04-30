const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── TOGGLE LIKE (like / unlike)
router.post("/toggle", (req, res) => {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
        return res.json({ success: false, message: "All fields are required" });
    }

    // Check if already liked
    db.query("SELECT 1 FROM LIKES WHERE user_id = ? AND post_id = ?",
        [userId, postId],
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Failed" });
            }

            if (result.length > 0) {
                // Already liked → unlike
                db.query("DELETE FROM LIKES WHERE user_id = ? AND post_id = ?",
                    [userId, postId],
                    (err) => {
                        if (err) return res.json({ success: false, message: "Unlike failed" });
                        res.json({ success: true, message: "Unliked" });
                    }
                );
            } else {
                // Not liked → like
                db.query("INSERT INTO LIKES (user_id, post_id) VALUES (?, ?)",
                    [userId, postId],
                    (err) => {
                        if (err) return res.json({ success: false, message: "Like failed" });
                        res.json({ success: true, message: "Liked" });
                    }
                );
            }
        }
    );
});

// ── GET LIKE COUNT 
router.get("/count", (req, res) => {
    const { postId } = req.query;

    db.query("SELECT COUNT(*) AS like_count FROM LIKES WHERE post_id = ?",
        [postId],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Failed" });
            res.json({ success: true, like_count: result[0].like_count });
        }
    );
});

module.exports = router;