const express = require("express");
const router  = express.Router();
const db      = require("../db");
const multer  = require("multer");
const path    = require("path");

// ── Multer setup for profile pictures ────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../frontend/images/profiles"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ── REGISTER ──────────────────────────────────────────
router.post("/register", upload.single("profilePic"), (req, res) => {
    const { username, email, password, fullName, dob, gender, phone, city } = req.body;
    const profilePic = req.file ? "/images/profiles/" + req.file.filename : "";

    if (!username || !email || !password) {
        return res.json({ success: false, message: "Username, email and password are required" });
    }

    db.query("SELECT 1 FROM USERS WHERE email = ?", [email], (err, result) => {
        if (result.length > 0) {
            return res.json({ success: false, message: "Email already exists" });
        }

        db.query("SELECT 1 FROM USERS WHERE username = ?", [username], (err, result) => {
            if (result.length > 0) {
                return res.json({ success: false, message: "Username already taken" });
            }

            db.query(`INSERT INTO USERS 
                (username, email, password, full_name, dob, gender, phone, city, profile_pic) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [username, email, password, fullName, dob, gender, phone, city, profilePic],
                (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.json({ success: false, message: "Registration failed" });
                    }
                    res.json({ success: true, message: "Registration successful" });
                }
            );
        });
    });
});

// ── LOGIN ─────────────────────────────────────────────
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "All fields are required" });
    }

    db.query("SELECT * FROM USERS WHERE email = ? AND password = ?",
        [email, password],
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Login failed" });
            }
            if (result.length > 0) {
                const user = result[0];
                res.json({
                    success    : true,
                    message    : "Login successful",
                    userId     : user.user_id,
                    username   : user.username,
                    profilePic : user.profile_pic
                });
            } else {
                res.json({ success: false, message: "Invalid email or password" });
            }
        }
    );
});

// ── GET USER ──────────────────────────────────────────
router.get("/profile", (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.json({ success: false, message: "userId is required" });
    }

    db.query(`SELECT user_id, username, email, bio, profile_pic, 
              full_name, dob, gender, phone, city, created_at 
              FROM USERS WHERE user_id = ?`,
        [userId],
        (err, result) => {
            if (err) {
                return res.json({ success: false, message: "Failed to get user" });
            }
            if (result.length > 0) {
                res.json({ success: true, user: result[0] });
            } else {
                res.json({ success: false, message: "User not found" });
            }
        }
    );
});

// ── UPDATE PROFILE ────────────────────────────────────
router.post("/update", upload.single("profilePic"), (req, res) => {
    const { userId, bio } = req.body;
    const profilePic = req.file ? "/images/profiles/" + req.file.filename : null;

    if (!userId) {
        return res.json({ success: false, message: "userId is required" });
    }

    if (profilePic) {
        db.query("UPDATE USERS SET bio = ?, profile_pic = ? WHERE user_id = ?",
            [bio, profilePic, userId],
            (err) => {
                if (err) return res.json({ success: false, message: "Update failed" });
                res.json({ success: true, message: "Profile updated" });
            }
        );
    } else {
        db.query("UPDATE USERS SET bio = ? WHERE user_id = ?",
            [bio, userId],
            (err) => {
                if (err) return res.json({ success: false, message: "Update failed" });
                res.json({ success: true, message: "Profile updated" });
            }
        );
    }
});

// ── GET ALL USERS ─────────────────────────────────────
router.get("/all", (req, res) => {
    db.query("SELECT user_id, username, profile_pic, bio FROM USERS",
        (err, results) => {
            if (err) return res.json({ success: false, message: "Failed" });
            res.json({ success: true, users: results });
        }
    );
});

// ── GET SUGGESTED USERS ───────────────────────────────
router.get("/suggestions", (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.json({ success: false, message: "userId is required" });
    }

    db.query(`
        SELECT user_id, username, bio, profile_pic
        FROM USERS
        WHERE user_id != ?
        AND user_id NOT IN (
            SELECT following_id FROM FOLLOWS WHERE follower_id = ?
        )
        LIMIT 5`,
        [userId, userId],
        (err, results) => {
            if (err) return res.json({ success: false, message: "Failed" });
            res.json({ success: true, users: results });
        }
    );
});

module.exports = router;