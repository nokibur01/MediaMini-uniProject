const myId     = localStorage.getItem("userId");
const params   = new URLSearchParams(window.location.search);
const targetId = params.get("userId");

if (!myId) {
    window.location.href = "login.html";
}

if (myId == targetId) {
    window.location.href = "profile.html";
}

// Image helper
function getImage(src) {
    if (!src || src === "") return "../images/default.png";
    if (src.startsWith("data:")) return src;
    if (src.startsWith("http")) return src;
    return "http://localhost:3000" + src;
}

// Load profile
function loadProfile() {
    fetch("http://localhost:3000/user/profile?userId=" + targetId)
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const user = data.user;
            document.getElementById("profileUsername").innerText = user.username;
            document.getElementById("profileBio").innerText      = user.bio || "No bio yet";
            document.getElementById("profileFullName").innerText = user.full_name || "";
            document.getElementById("profileCity").innerText     = user.city ? "📍 " + user.city : "";
            document.getElementById("profilePic").src            = getImage(user.profile_pic);
        }
    });
}

// Load counts
function loadCounts() {
    fetch("http://localhost:3000/follow/followers?userId=" + targetId)
    .then(res => res.json())
    .then(data => {
        document.getElementById("followerCount").innerText = data.followers.length;
    });

    fetch("http://localhost:3000/follow/following?userId=" + targetId)
    .then(res => res.json())
    .then(data => {
        document.getElementById("followingCount").innerText = data.following.length;
    });
}

// Load user posts
function loadUserPosts() {
    fetch("http://localhost:3000/post/user?userId=" + targetId)
    .then(res => res.json())
    .then(data => {
        document.getElementById("postCount").innerText = data.posts.length;
        const div = document.getElementById("userPosts");
        div.innerHTML = "";

        if (data.posts.length === 0) {
            div.innerHTML = "<p style='color:#b2bec3;'>No posts yet.</p>";
            return;
        }

        data.posts.forEach(post => {
            div.innerHTML += `
                <div class="post-card">
                    <div class="post-content">${post.content}</div>
                    ${post.image_url ? `<img src="${getImage(post.image_url)}" class="post-image">` : ""}
                    <div class="post-date">${new Date(post.created_at).toLocaleString()}</div>
                </div>
            `;
        });
    });
}

// Load user albums
function loadUserAlbums() {
    fetch("http://localhost:3000/album/user?userId=" + targetId)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("userAlbums");
        div.innerHTML = "";

        if (data.albums.length === 0) {
            div.innerHTML = "<p style='color:#b2bec3;'>No albums yet.</p>";
            return;
        }

        data.albums.forEach(album => {
            div.innerHTML += `
                <div class="album-card">
                    <h4>${album.title}</h4>
                    <p>${album.description || "No description"}</p>
                    <span>${album.post_count} posts</span>
                </div>
            `;
        });
    });
}

// Check follow
function checkFollow() {
    fetch(`http://localhost:3000/follow/check?followerId=${myId}&followingId=${targetId}`)
    .then(res => res.json())
    .then(data => {
        const btn = document.getElementById("followBtn");
        if (data.isFollowing) {
            btn.innerText = "Following";
            btn.classList.add("following");
        } else {
            btn.innerText = "Follow";
            btn.classList.remove("following");
        }
    });
}

// Toggle follow
function toggleFollow() {
    fetch("http://localhost:3000/follow/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: myId, followingId: targetId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            checkFollow();
            loadCounts();
        }
    });
}

// Logout
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

// Load everything 
loadProfile();
loadCounts();
loadUserPosts();
loadUserAlbums();
checkFollow();