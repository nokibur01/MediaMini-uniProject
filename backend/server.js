const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app = express();

// ── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve frontend files ──────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

// ── Serve uploaded images ─────────────────────────────
app.use("/images", express.static(path.join(__dirname, "../frontend/images")));

// ── Routes ────────────────────────────────────────────
app.use("/user",    require("./routes/user"));
app.use("/post",    require("./routes/post"));
app.use("/comment", require("./routes/comment"));
app.use("/like",    require("./routes/like"));
app.use("/follow",  require("./routes/follow"));
app.use("/album",   require("./routes/album"));

// ── Start server ──────────────────────────────────────
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});