const userId   = localStorage.getItem("userId");
const username = localStorage.getItem("username");

if (!userId) {
    window.location.href = "login.html";
}

// ── Logout ────────────────────────────────────────────
function logout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

// ── Search users ──────────────────────────────────────
function searchUsers() {
    const query = document.getElementById("searchInput").value.trim();

    fetch("http://localhost:3000/user/all")
    .then(res => res.json())
    .then(data => {
        const resultsDiv = document.getElementById("searchResults");
        resultsDiv.innerHTML = "";

        // Filter users by search query
        let users = data.users.filter(u => u.user_id != userId);

        if (query) {
            users = users.filter(u =>
                u.username.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (users.length === 0) {
            resultsDiv.innerHTML = "<p style='text-align:center; color:#999;'>No users found.</p>";
            return;
        }

        users.forEach(user => {
            resultsDiv.innerHTML += `
                <div class="user-card" id="card-${user.user_id}">
                    <div class="user-card-left">
                        <img src="${user.profile_pic ? 'http://localhost:3000' + user.profile_pic : '../images/default.png'}">
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

            // Check if already following
            checkFollow(user.user_id);
        });
    });
}

// ── Check follow status ───────────────────────────────
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
        }
    });
}

// ── Load all users on page load ───────────────────────
searchUsers();