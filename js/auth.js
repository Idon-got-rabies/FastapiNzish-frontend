function logout(){
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    window.location.href = "../login.html"
}

function isTokenExpired(token){
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp && payload.exp < currentTime;
    }catch{
        return true;
    }

}

function checkAuth(isAdminPage= false){
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("is_admin") === "true";

    if (!token || isTokenExpired(token)){
        logout();
        return;
    }
    if (isAdminPage && !isAdmin){
        logout();
        return;
    }

    setInterval(()=>{
        fetch(`${BASE_URL}/login/auth/me/`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res=>{
            if(res.status === 401){
                logout();
            }
        })
        .catch(() => {
            logout();
        });
    }, 60 * 60 * 1000);
}

async function authCheck(url, options = {}){
    const token = localStorage.getItem("token");
    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };
    const res = await fetch(url, {...options, headers});
    if (res.status === 401){
        logout();
        throw new Error("Unauthorized");
    }
    return res;
}


