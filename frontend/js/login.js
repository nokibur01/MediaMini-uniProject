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
        document.getElementById("message").innerText = data.message;
        if (data.success) {
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("username", data.username);
            window.location.href = "feed.html";
        }
    })
    .catch(err => console.error(err));
}