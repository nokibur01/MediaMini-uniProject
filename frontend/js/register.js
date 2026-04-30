// ── Image preview 
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

// ── Register 
function register() {
    const username   = document.getElementById("username").value;
    const email      = document.getElementById("email").value;
    const password   = document.getElementById("password").value;
    const fullName   = document.getElementById("fullName").value;
    const dob        = document.getElementById("dob").value;
    const gender     = document.getElementById("gender").value;
    const phone      = document.getElementById("phone").value;
    const city       = document.getElementById("city").value;
    const profilePic = document.getElementById("profilePic").files[0];

    if (!username || !email || !password) {
        document.getElementById("message").innerText = "Username, email and password are required";
        return;
    }

    // Use FormData because we are sending a file
    const formData = new FormData();
    formData.append("username",   username);
    formData.append("email",      email);
    formData.append("password",   password);
    formData.append("fullName",   fullName);
    formData.append("dob",        dob);
    formData.append("gender",     gender);
    formData.append("phone",      phone);
    formData.append("city",       city);

    if (profilePic) {
        formData.append("profilePic", profilePic);
    }

    fetch("http://localhost:3000/user/register", {
        method: "POST",
        body: formData
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