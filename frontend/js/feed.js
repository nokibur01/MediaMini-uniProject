const userId   = localStorage.getItem("userId");
const username = localStorage.getItem("username");

if (!userId) {
    window.location.href = "login.html";
}

document.getElementById("welcomeUser").innerText = "Hi, " + username;

// Image helper 
function getImage(src) {
    if (!src || src === "") return "../images/default.png";
    if (src.startsWith("data:")) return src;
    if (src.startsWith("http")) return src;
    return "http://localhost:3000" + src;
}

// Image preview 
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

// Logout
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

// Create post
function createPost() {
    const content   = document.getElementById("postContent").value;
    const imageFile = document.getElementById("postImage").files[0];

    if (!content) {
        alert("Please write something!");
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            sendPost(content, e.target.result);
        };
        reader.readAsDataURL(imageFile);
    } else {
        sendPost(content, "");
    }
}

function sendPost(content, imageUrl) {
    fetch("http://localhost:3000/post/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content, imageUrl })
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

// Load posts
function loadPosts() {
    fetch("http://localhost:3000/post/feed?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        const postsDiv = document.getElementById("posts");
        postsDiv.innerHTML = "";

        if (data.posts.length === 0) {
            postsDiv.innerHTML = "<p style='text-align:center; color:#b2bec3; margin-top:20px;'>No posts yet. Follow someone!</p>";
            return;
        }

        data.posts.forEach(post => {
            const isOwnPost = post.user_id == userId;

            postsDiv.innerHTML += `
                <div class="post-card" id="post-${post.post_id}">
                    <div class="post-header">
                        <img src="${getImage(post.profile_pic)}" class="post-avatar">
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
                        </button>` : `
                        <button class="edit-btn" onclick="editPost(${post.post_id}, \`${post.content}\`)">
                            Edit
                        </button>`}
                    </div>
                    <div class="post-content">${post.content}</div>
                    ${post.image_url ? `<img src="${getImage(post.image_url)}" class="post-image">` : ""}
                    <div class="post-actions">
                        <button onclick="likePost(${post.post_id})">
                            Like ${post.like_count > 0 ? '(' + post.like_count + ')' : ''}
                        </button>
                        <button onclick="toggleComments(${post.post_id})">
                            Comments ${post.comment_count > 0 ? '(' + post.comment_count + ')' : ''}
                        </button>
                    </div>

                    <div class="comments-section" id="comments-${post.post_id}" style="display:none;">
                        <div class="comments-list" id="comments-list-${post.post_id}"></div>
                        <div class="comment-input-row">
                            <input type="text" id="commentInput-${post.post_id}"
                                   placeholder="Write a comment...">
                            <button class="comment-submit-btn"
                                    onclick="submitComment(${post.post_id})">
                                Post
                            </button>
                        </div>
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

// Toggle comments
function toggleComments(postId) {
    const section = document.getElementById("comments-" + postId);
    if (section.style.display === "none") {
        section.style.display = "block";
        loadComments(postId);
    } else {
        section.style.display = "none";
    }
}

// Load comments
function loadComments(postId) {
    fetch("http://localhost:3000/comment/get?postId=" + postId)
    .then(res => res.json())
    .then(data => {
        const list = document.getElementById("comments-list-" + postId);
        list.innerHTML = "";

        if (data.comments.length === 0) {
            list.innerHTML = "<p class='no-comments'>No comments yet. Be the first!</p>";
            return;
        }

        data.comments.forEach(comment => {
            list.innerHTML += `
                <div class="comment-item">
                    <span class="comment-author">${comment.username}</span>
                    <span class="comment-text">${comment.text}</span>
                    <span class="comment-date">${new Date(comment.created_at).toLocaleString()}</span>
                </div>
            `;
        });
    });
}

// Submit comment
function submitComment(postId) {
    const input = document.getElementById("commentInput-" + postId);
    const text  = input.value.trim();

    if (!text) return;

    fetch("http://localhost:3000/comment/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, postId, text })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            input.value = "";
            loadComments(postId);
            loadPosts();
        }
    });
}

// Like post
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

// Edit post
function editPost(postId, currentContent) {
    const newContent = prompt("Edit your post:", currentContent);
    if (!newContent || newContent === currentContent) return;

    fetch("http://localhost:3000/post/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId, content: newContent })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) loadPosts();
        else alert(data.message);
    });
}

// Check follow status
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

// Toggle follow
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

// Load suggestions
function loadSuggestions() {
    fetch("http://localhost:3000/user/suggestions?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("suggestions");
        div.innerHTML = "";

        if (data.users.length === 0) {
            div.innerHTML = "<p style='color:#b2bec3; font-size:13px; margin-top:8px;'>You are following everyone!</p>";
            return;
        }

        data.users.forEach(user => {
            div.innerHTML += `
                <div class="suggestion-user" id="sug-${user.user_id}">
                    <div class="suggestion-left">
                        <img src="${getImage(user.profile_pic)}">
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

// Follow from suggestion
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

// Load everything on page load
loadPosts();
loadSuggestions();