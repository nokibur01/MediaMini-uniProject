const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ── FOLLOW / UNFOLLOW ─────────────────────────────────
router.post("/toggle", (req, res) => {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
        return res.json({ success: false, message: "All fields are required" });
    }

    if (followerId === followingId) {
        return res.json({ success: false, message: "You cannot follow yourself" });
    }

    // Check if already following
    db.query("SELECT 1 FROM FOLLOWS WHERE follower_id = ? AND following_id = ?",
        [followerId, followingId],
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Failed" });
            }

            if (result.length > 0) {
                // Already following → unfollow
                db.query("DELETE FROM FOLLOWS WHERE follower_id = ? AND following_id = ?",
                    [followerId, followingId],
                    (err) => {
                        if (err) return res.json({ success: false, message: "Unfollow failed" });
                        res.json({ success: true, message: "Unfollowed" });
                    }
                );
            } else {
                // Not following → follow
                db.query("INSERT INTO FOLLOWS (follower_id, following_id) VALUES (?, ?)",
                    [followerId, followingId],
                    (err) => {
                        if (err) return res.json({ success: false, message: "Follow failed" });
                        res.json({ success: true, message: "Followed" });
                    }
                );
            }
        }
    );
});

// ── GET FOLLOWERS ─────────────────────────────────────
router.get("/followers", (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.json({ success: false, message: "userId is required" });
    }

    db.query(`
        SELECT u.user_id, u.username, u.profile_pic
        FROM FOLLOWS f
        JOIN USERS u ON f.follower_id = u.user_id
        WHERE f.following_id = ?`,
        [userId],
        (err, results) => {
            if (err) return res.json({ success: false, message: "Failed" });
            res.json({ success: true, followers: results });
        }
    );
});

// ── GET FOLLOWING ─────────────────────────────────────
router.get("/following", (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.json({ success: false, message: "userId is required" });
    }

    db.query(`
        SELECT u.user_id, u.username, u.profile_pic
        FROM FOLLOWS f
        JOIN USERS u ON f.following_id = u.user_id
        WHERE f.follower_id = ?`,
        [userId],
        (err, results) => {
            if (err) return res.json({ success: false, message: "Failed" });
            res.json({ success: true, following: results });
        }
    );
});

// ── CHECK IF FOLLOWING ────────────────────────────────
router.get("/check", (req, res) => {
    const { followerId, followingId } = req.query;

    db.query("SELECT 1 FROM FOLLOWS WHERE follower_id = ? AND following_id = ?",
        [followerId, followingId],
        (err, result) => {
            if (err) return res.json({ success: false, message: "Failed" });
            res.json({ success: true, isFollowing: result.length > 0 });
        }
    );
});

module.exports = router;