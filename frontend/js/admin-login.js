function adminLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        document.getElementById("message").innerText = "All fields are required";
        return;
    }

    fetch("http://localhost:3000/user/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        const msg = document.getElementById("message");
        msg.innerText = data.message;
        msg.className = data.success ? "message success" : "message";
        if (data.success) {
            localStorage.setItem("adminId", data.admin.admin_id);
            localStorage.setItem("adminUsername", data.admin.username);
            window.location.href = "admin.html";
        }
    })
    .catch(err => console.error(err));
}