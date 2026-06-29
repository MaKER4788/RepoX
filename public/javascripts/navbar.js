const menu = document.getElementById("menuBtn");
const mobile = document.getElementById("mobileMenu");

if (menu && mobile) {
    menu.addEventListener("click", () => {
        mobile.classList.toggle("hidden");
    });
}