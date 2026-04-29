-- socail media mini database schema
CREATE DATABASE IF NOT EXISTS social_media_mini;
USE social_media_mini;

-- user table
CREATE TABLE USERS (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    bio         VARCHAR(300),
    profile_pic VARCHAR(255),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- post
CREATE TABLE POSTS (
    post_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    content    TEXT,
    image_url  VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- comment
CREATE TABLE COMMENTS (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id    INT          NOT NULL,
    user_id    INT          NOT NULL,
    text       VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES POSTS(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- likes
CREATE TABLE LIKES (
    like_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    post_id    INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES POSTS(post_id) ON DELETE CASCADE
);

-- follows
CREATE TABLE FOLLOWS (
    follower_id  INT NOT NULL,
    following_id INT NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id)  REFERENCES USERS(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- albums
CREATE TABLE ALBUMS (
    album_id   INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    title      VARCHAR(100) NOT NULL,
    description VARCHAR(300),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- album post
CREATE TABLE ALBUM_POSTS (
    album_id   INT NOT NULL,
    post_id    INT NOT NULL,
    added_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (album_id, post_id),
    FOREIGN KEY (album_id) REFERENCES ALBUMS(album_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id)  REFERENCES POSTS(post_id)   ON DELETE CASCADE
);

-- admins
CREATE TABLE ADMINS (
    admin_id   INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);