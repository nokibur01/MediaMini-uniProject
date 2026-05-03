const adminId       = localStorage.getItem("adminId");
const adminUsername = localStorage.getItem("adminUsername");

if (!adminId) {
    window.location.href = "admin-login.html";
}

document.getElementById("adminName").innerText = "Welcome, " + adminUsername;

// ── Switch tab 
function switchTab(tab, btn) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (tab === "users") {
        document.getElementById("usersSection").style.display = "block";
        document.getElementById("postsSection").style.display = "none";
        loadUsers();
    } else {
        document.getElementById("usersSection").style.display = "none";
        document.getElementById("postsSection").style.display = "block";
        loadPosts();
    }
}

// ── Load users 
function loadUsers() {
    fetch("http://localhost:3000/user/admin/users")
    .then(res => res.json())
    .then(data => {
        document.getElementById("totalUsers").innerText = data.users.length;
        const tbody = document.getElementById("usersTable");
        tbody.innerHTML = "";

        data.users.forEach(user => {
            tbody.innerHTML += `
                <tr>
                    <td>${user.user_id}</td>
                    <td>${user.username}</td>
                    <td>${user.full_name || "-"}</td>
                    <td>${user.email}</td>
                    <td>${user.city || "-"}</td>
                    <td>${user.total_posts}</td>
                    <td>${user.total_followers}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteUser(${user.user_id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    });
}

// ── Load posts 
function loadPosts() {
    fetch("http://localhost:3000/post/admin/posts")
    .then(res => res.json())
    .then(data => {
        document.getElementById("totalPosts").innerText = data.posts.length;
        const tbody = document.getElementById("postsTable");
        tbody.innerHTML = "";

        data.posts.forEach(post => {
            tbody.innerHTML += `
                <tr>
                    <td>${post.post_id}</td>
                    <td>${post.username}</td>
                    <td class="post-preview">${post.content.substring(0, 60)}${post.content.length > 60 ? '...' : ''}</td>
                    <td>${post.total_likes}</td>
                    <td>${post.total_comments}</td>
                    <td>${new Date(post.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="delete-btn" onclick="deletePost(${post.post_id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    });
}

// ── Delete user
function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    fetch(`http://localhost:3000/user/admin/user/${userId}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) loadUsers();
        else alert(data.message);
    });
}

// ── Delete post 
function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    fetch(`http://localhost:3000/post/admin/post/${postId}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) loadPosts();
        else alert(data.message);
    });
}

// ── Logout 
function logout() {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUsername");
    window.location.href = "admin-login.html";
}

// ── Load on start 
loadUsers();