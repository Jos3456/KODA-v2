import { App } from "./app/app";

window.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("app");
  if (root) {
    new App(root);
  }
});
