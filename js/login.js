document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm){
        loginForm.reset();
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const isAdmin = document.getElementById("isAdmin").checked;

        const endpoint = isAdmin
            ? `${BASE_URL}/login/admin`
            : `${BASE_URL}/login/`;

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    username: email,
                    password: password
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || "Login failed");

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("is_admin", isAdmin);
            window.location.href = "../dashboard.html";
        } catch (err) {
            document.getElementById("error-message").textContent = err.message;
        }
    });

});

