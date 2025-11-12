// index.js - frontend script for Telegram WebApp
(function(){
  const LS_KEY = "tg_user_id";
  const msg = document.getElementById("message");

  function getBaseUrl(){ return window.location.origin; }

  async function registerUser(userID) {
    const base = getBaseUrl();
    const url = `${base}/api/index?action=registerUser&userID=${encodeURIComponent(userID)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("Response:", data);
    } catch(e){
      console.error("API error", e);
    }
  }

  function getTelegramUserID() {
    try {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        return tg.initDataUnsafe?.user?.id;
      }
    } catch(e){ console.warn(e); }
    return null;
  }

  function init() {
    let userID = getTelegramUserID() || localStorage.getItem(LS_KEY);
    if (!userID) {
      msg.textContent = "افتح داخل Telegram WebApp.";
      msg.style.display = "block";
      return;
    }
    localStorage.setItem(LS_KEY, userID);
    registerUser(userID);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
