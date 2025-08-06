// Dark mode toggle
const toggle = document.getElementById("theme-toggle");
toggle.addEventListener("click", () => {
  document.documentElement.toggleAttribute("data-theme", "dark");
});
