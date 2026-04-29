const userId   = localStorage.getItem("userId");
const username = localStorage.getItem("username");

if (!userId) {
    window.location.href = "login.html";
}

document.getElementById("welcomeUser").innerText = "Hi, " + username;

// ── Image preview ─────────────────────────────────────
document.getElementById("postImage").addEventListener("change", function () {
    const file    = this.files[0];
    const preview = document.getElementById("postImagePreview");
    const name    = document.getElementById("imageName");

    if (file) {
        name.innerText = file.name;
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// ── Logout ────────────────────────────────────────────
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

// ── Create post ───────────────────────────────────────
function createPost() {
    const content   = document.getElementById("postContent").value;
    const imageFile = document.getElementById("postImage").files[0];

    if (!content) {
        alert("Please write something!");
        return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("content", content);
    if (imageFile) {
        formData.append("image", imageFile);
    }

    fetch("http://localhost:3000/post/create", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById("postContent").value          = "";
            document.getElementById("postImagePreview").innerHTML = "";
            document.getElementById("imageName").innerText        = "";
            document.getElementById("postImage").value            = "";
            loadPosts();
        }
    })
    .catch(err => console.error(err));
}

// ── Load posts ────────────────────────────────────────
function loadPosts() {
    fetch("http://localhost:3000/post/feed?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        const postsDiv = document.getElementById("posts");
        postsDiv.innerHTML = "";

        if (data.posts.length === 0) {
            postsDiv.innerHTML = "<p style='text-align:center; color:#999; margin-top:20px;'>No posts yet. Follow someone!</p>";
            return;
        }

        data.posts.forEach(post => {
            const isOwnPost = post.user_id == userId;

            postsDiv.innerHTML += `
                <div class="post-card">
                    <div class="post-header">
                        <img src="${post.profile_pic
                            ? 'http://localhost:3000' + post.profile_pic
                            : '../images/default.png'}"
                             class="post-avatar">
                        <div class="post-header-info">
                            <div class="post-author">
                                <a href="user.html?userId=${post.user_id}">${post.username}</a>
                            </div>
                            <div class="post-date">${new Date(post.created_at).toLocaleString()}</div>
                        </div>
                        ${!isOwnPost ? `
                        <button class="follow-btn" id="followBtn-${post.user_id}"
                                onclick="toggleFollow(${post.user_id})">
                            Follow
                        </button>` : ""}
                    </div>
                    <div class="post-content">${post.content}</div>
                    ${post.image_url
                        ? `<img src="http://localhost:3000${post.image_url}" class="post-image">`
                        : ""}
                    <div class="post-actions">
                        <button onclick="likePost(${post.post_id})">👍 ${post.like_count} Likes</button>
                        <button onclick="commentPost(${post.post_id})">💬 ${post.comment_count} Comments</button>
                    </div>
                </div>
            `;

            if (!isOwnPost) {
                checkFollow(post.user_id);
            }
        });
    })
    .catch(err => console.error(err));
}

// ── Like post ─────────────────────────────────────────
function likePost(postId) {
    fetch("http://localhost:3000/like/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, postId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) loadPosts();
    });
}

// ── Comment post ──────────────────────────────────────
function commentPost(postId) {
    const text = prompt("Write a comment:");
    if (!text) return;

    fetch("http://localhost:3000/comment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, postId, text })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) loadPosts();
    });
}

// ── Check follow status ───────────────────────────────
function checkFollow(targetId) {
    fetch(`http://localhost:3000/follow/check?followerId=${userId}&followingId=${targetId}`)
    .then(res => res.json())
    .then(data => {
        const btn = document.getElementById("followBtn-" + targetId);
        if (btn) {
            if (data.isFollowing) {
                btn.innerText = "Following";
                btn.classList.add("following");
            } else {
                btn.innerText = "Follow";
                btn.classList.remove("following");
            }
        }
    });
}

// ── Toggle follow ─────────────────────────────────────
function toggleFollow(targetId) {
    fetch("http://localhost:3000/follow/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: userId, followingId: targetId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            checkFollow(targetId);
            loadPosts();
            loadSuggestions();
        }
    });
}

// ── Load suggestions ──────────────────────────────────
function loadSuggestions() {
    fetch("http://localhost:3000/user/suggestions?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("suggestions");
        div.innerHTML = "";

        if (data.users.length === 0) {
            div.innerHTML = "<p style='color:#999; font-size:13px; margin-top:8px;'>You're following everyone! 🎉</p>";
            return;
        }

        data.users.forEach(user => {
            div.innerHTML += `
                <div class="suggestion-user" id="sug-${user.user_id}">
                    <div class="suggestion-left">
                        <img src="${user.profile_pic
                            ? 'http://localhost:3000' + user.profile_pic
                            : '../images/default.png'}">
                        <div>
                            <a href="user.html?userId=${user.user_id}">${user.username}</a>
                            <p>${user.bio || ""}</p>
                        </div>
                    </div>
                    <button onclick="followSuggestion(${user.user_id})">Follow</button>
                </div>
            `;
        });
    });
}

// ── Follow from suggestion ────────────────────────────
function followSuggestion(targetId) {
    fetch("http://localhost:3000/follow/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: userId, followingId: targetId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const sug = document.getElementById("sug-" + targetId);
            if (sug) sug.remove();
            loadPosts();
            loadSuggestions();
        }
    });
}

// ── Load everything on page load ──────────────────────
loadPosts();
loadSuggestions();