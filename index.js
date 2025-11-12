(async function(){
  const status = document.getElementById("status");
  const profileEl = document.getElementById("profile");
  const refBtn = document.getElementById("copyRef");
  const refLinkEl = document.getElementById("refLink");
  const LS_KEY = "tg_user_id";
  const BOT_USERNAME = "Game_win_usdtBot";

  function getBaseUrl(){ return window.location.origin; }

  async function registerUser(userID, ref) {
    const base = getBaseUrl();
    const url = `${base}/api/index?action=registerUser&userID=${encodeURIComponent(userID)}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    if(data.success) status.textContent = "✅ تم التسجيل بنجاح";
  }

  async function getProfile(userID) {
    const base = getBaseUrl();
    const url = `${base}/api/index?action=getProfile&userID=${encodeURIComponent(userID)}`;
    const res = await fetch(url);
    const data = await res.json();
    if(data.success && data.data){
      const u = data.data;
      profileEl.innerHTML = `💰 الرصيد: ${u.usdt || 0} USDT<br>⭐ النقاط: ${u.points || 0}<br>👥 الإحالات: ${u.referrals || 0}`;
    }
  }

  function getTelegramUserID(){
    try{
      if(window.Telegram && window.Telegram.WebApp){
        return window.Telegram.WebApp.initDataUnsafe?.user?.id;
      }
    }catch(e){}
    return null;
  }

  const userID = getTelegramUserID() || localStorage.getItem(LS_KEY);
  const ref = new URLSearchParams(window.location.search).get("ref");

  if(userID){
    localStorage.setItem(LS_KEY, userID);
    await registerUser(userID, ref);
    await getProfile(userID);

    const refLink = `https://t.me/${BOT_USERNAME}/earn?startapp=ref_${userID}`;
    refBtn.style.display = "inline-block";
    refLinkEl.textContent = refLink;
    refBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(refLink);
      alert("✅ تم نسخ رابط الإحالة!");
    });
  }else{
    status.textContent = "⚠️ افتح داخل Telegram WebApp.";
  }
})();