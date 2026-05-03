// ── Image preview ─────────────────────────────────────
document.getElementById("profilePic").addEventListener("change", function () {
    const file    = this.files[0];
    const preview = document.getElementById("imagePreview");

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// ── Register ──────────────────────────────────────────
function register() {
    const username   = document.getElementById("username").value;
    const email      = document.getElementById("email").value;
    const password   = document.getElementById("password").value;
    const fullName   = document.getElementById("fullName").value;
    const dob        = document.getElementById("dob").value;
    const gender     = document.getElementById("gender").value;
    const phone      = document.getElementById("phone").value;
    const city       = document.getElementById("city").value;
    const picFile    = document.getElementById("profilePic").files[0];

    if (!username || !email || !password) {
        document.getElementById("message").innerText = "Username, email and password are required";
        return;
    }

    // Convert image to Base64 then send
    if (picFile) {
        const reader = new FileReader();
        reader.onload = function (e) {
            sendRegister(username, email, password, fullName, dob, gender, phone, city, e.target.result);
        };
        reader.readAsDataURL(picFile);
    } else {
        sendRegister(username, email, password, fullName, dob, gender, phone, city, "");
    }
}

function sendRegister(username, email, password, fullName, dob, gender, phone, city, profilePic) {
    fetch("http://localhost:3000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, fullName, dob, gender, phone, city, profilePic })
    })
    .then(res => res.json())
    .then(data => {
        const msg = document.getElementById("message");
        msg.innerText = data.message;
        msg.className = data.success ? "message success" : "message";
        if (data.success) {
            window.location.href = "login.html";
        }
    })
    .catch(err => console.error(err));
}

// ── Show/hide password ────────────────────────────────
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