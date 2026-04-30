const userId    = localStorage.getItem("userId");
let   activeTab = "users";

if (!userId) {
    window.location.href = "login.html";
}

// ── Logout 
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

// ── Switch tab 
function switchTab(tab, btn) {
    activeTab = tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("searchInput").placeholder = tab === "users"
        ? "Search users..."
        : "Search posts...";
    document.getElementById("searchResults").innerHTML = "";
    doSearch();
}

// ── Search 
function doSearch() {
    const query = document.getElementById("searchInput").value.trim();
    if (activeTab === "users") {
        searchUsers(query);
    } else {
        searchPosts(query);
    }
}

// ── Search users 
function searchUsers(query) {
    fetch("http://localhost:3000/user/all")
    .then(res => res.json())
    .then(data => {
        const resultsDiv = document.getElementById("searchResults");
        resultsDiv.innerHTML = "";

        let users = data.users.filter(u => u.user_id != userId);

        if (query) {
            users = users.filter(u =>
                u.username.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (users.length === 0) {
            resultsDiv.innerHTML = "<p style='text-align:center; color:#b2bec3; margin-top:20px;'>No users found.</p>";
            return;
        }

        users.forEach(user => {
            resultsDiv.innerHTML += `
                <div class="user-card" id="card-${user.user_id}">
                    <div class="user-card-left">
                        <img src="${user.profile_pic
                            ? 'http://localhost:3000' + user.profile_pic
                            : '../images/default.png'}">
                        <div>
                            <h4><a href="user.html?userId=${user.user_id}">${user.username}</a></h4>
                            <p>${user.bio || "No bio"}</p>
                        </div>
                    </div>
                    <button id="btn-${user.user_id}" onclick="toggleFollow(${user.user_id})">
                        Follow
                    </button>
                </div>
            `;
            checkFollow(user.user_id);
        });
    });
}

// ── Search posts
function searchPosts(query) {
    if (!query) {
        document.getElementById("searchResults").innerHTML = "<p style='text-align:center; color:#b2bec3; margin-top:20px;'>Type something to search posts.</p>";
        return;
    }

    fetch(`http://localhost:3000/post/search?query=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
        const resultsDiv = document.getElementById("searchResults");
        resultsDiv.innerHTML = "";

        if (data.posts.length === 0) {
            resultsDiv.innerHTML = "<p style='text-align:center; color:#b2bec3; margin-top:20px;'>No posts found.</p>";
            return;
        }

        data.posts.forEach(post => {
            resultsDiv.innerHTML += `
                <div class="user-card">
                    <div class="user-card-left">
                        <img src="${post.profile_pic
                            ? 'http://localhost:3000' + post.profile_pic
                            : '../images/default.png'}">
                        <div>
                            <h4><a href="user.html?userId=${post.user_id}">${post.username}</a></h4>
                            <p>${post.content}</p>
                        </div>
                    </div>
                    <div style="font-size:12px; color:#a29bfe; text-align:right; flex-shrink:0;">
                        👍 ${post.like_count}<br>
                        💬 ${post.comment_count}
                    </div>
                </div>
            `;
        });
    });
}

// ── Check follow
function checkFollow(targetId) {
    fetch(`http://localhost:3000/follow/check?followerId=${userId}&followingId=${targetId}`)
    .then(res => res.json())
    .then(data => {
        const btn = document.getElementById("btn-" + targetId);
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

// ── Toggle follow 
function toggleFollow(targetId) {
    fetch("http://localhost:3000/follow/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: userId, followingId: targetId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) checkFollow(targetId);
    });
}

// ── Add tab styles
doSearch();