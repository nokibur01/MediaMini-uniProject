const mysql = require("mysql2");

const db = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "",
    database : "social_media_mini"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Database connected successfully!");
    }
});

module.exports = db;