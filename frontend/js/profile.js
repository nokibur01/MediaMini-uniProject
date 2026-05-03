const userId   = localStorage.getItem("userId");
const username = localStorage.getItem("username");

if (!userId) {
    window.location.href = "login.html";
}

// ── Load profile
function loadProfile() {
    fetch("http://localhost:3000/user/profile?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const user = data.user;

            document.getElementById("profileUsername").innerText = user.username;
            document.getElementById("profileBio").innerText      = user.bio || "No bio yet";
            document.getElementById("profileFullName").innerText = user.full_name || "";
            document.getElementById("profileCity").innerText     = user.city ? "📍 " + user.city : "";
            document.getElementById("profileGender").innerText   = user.gender ? "👤 " + user.gender : "";
            document.getElementById("editBio").value             = user.bio || "";

            // Profile picture
            const pic = document.getElementById("profilePic");
            if (user.profile_pic) {
                pic.src = "http://localhost:3000" + user.profile_pic;
            } else {
                pic.src = "../images/default.png";
            }
        }
    });
}

// ── Load follower/following counts
function loadCounts() {
    fetch("http://localhost:3000/follow/followers?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        document.getElementById("followerCount").innerText = data.followers.length;
    });

    fetch("http://localhost:3000/follow/following?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        document.getElementById("followingCount").innerText = data.following.length;
    });
}

// ── Load user posts
function loadUserPosts() {
    fetch("http://localhost:3000/post/user?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        document.getElementById("postCount").innerText = data.posts.length;
        const div = document.getElementById("userPosts");
        div.innerHTML = "";

        if (data.posts.length === 0) {
            div.innerHTML = "<p style='color:#999;'>No posts yet.</p>";
            return;
        }

        data.posts.forEach(post => {
            div.innerHTML += `
                <div class="post-card">
                    <div class="post-content">${post.content}</div>
                    ${post.image_url ? `<img src="http://localhost:3000${post.image_url}" class="post-image">` : ""}
                    <div class="post-date">${new Date(post.created_at).toLocaleString()}</div>
                </div>
            `;
        });
    });
}

// ── Load user albums
function loadUserAlbums() {
    fetch("http://localhost:3000/album/user?userId=" + userId)
    .then(res => res.json())
    .then(data => {
        const div = document.getElementById("userAlbums");
        div.innerHTML = "";

        if (data.albums.length === 0) {
            div.innerHTML = "<p style='color:#999;'>No albums yet.</p>";
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

// ── Toggle edit form 
function toggleEditForm() {
    const form = document.getElementById("editForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

function updateProfile() {
    const bio     = document.getElementById("editBio").value;
    const picFile = document.getElementById("editProfilePic").files[0];

    if (picFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            sendUpdate(bio, e.target.result);
        };
        reader.readAsDataURL(picFile);
    } else {
        sendUpdate(bio, "");
    }
}

function sendUpdate(bio, profilePic) {
    fetch("http://localhost:3000/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, bio, profilePic })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("editMessage").innerText = data.message;
        if (data.success) {
            loadProfile();
            toggleEditForm();
        }
    });
}

// ── Toggle album form
function toggleAlbumForm() {
    const form = document.getElementById("albumForm");
    form.style.display = form.style.display === "none" ? "block" : "none";
}

// ── Create album
function createAlbum() {
    const title       = document.getElementById("albumTitle").value;
    const description = document.getElementById("albumDesc").value;

    if (!title) {
        document.getElementById("albumMessage").innerText = "Title is required";
        return;
    }

    fetch("http://localhost:3000/album/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, description })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("albumMessage").innerText = data.message;
        if (data.success) {
            document.getElementById("albumTitle").value = "";
            document.getElementById("albumDesc").value  = "";
            loadUserAlbums();
        }
    });
}

// ── Logout 
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

// ── Load everything on page load 
loadProfile();
loadCounts();
loadUserPosts();
loadUserAlbums();