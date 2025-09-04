function showLoaderLogin() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "flex";
  }
}

function hideLoaderLogin() {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "none";
  }
}

function showLoader(loaderId){
    const loader = document.getElementById(`${loaderId}`);
    if (loader){
        loader.style.display = "flex";
    }
}

function hideLoader(loaderId){
    const loader = document.getElementById(`${loaderId}`);
    if (loader){
        loader.style.display = "none";
    }
}