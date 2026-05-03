function login() {
    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        const msg = document.getElementById("message");
        msg.innerText = data.message;
        msg.className = data.success ? "message success" : "message";
        if (data.success) {
            localStorage.setItem("userId",   data.userId);
            localStorage.setItem("username", data.username);
            window.location.href = "feed.html";
        }
    })
    .catch(err => console.error(err));
}

function togglePassword() {
    const input = document.getElementById("password");
    const btn   = document.getElementById("toggleBtn");
    if (input.type === "password") {
        input.type = "text";
        btn.innerText = "Hide";
    } else {
        input.type = "password";
        btn.innerText = "Show";
    }
}