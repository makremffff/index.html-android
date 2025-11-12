(async function(){
  const status = document.getElementById("status");
  const pointsEl = document.getElementById("points");
  const usdtEl = document.getElementById("usdt");
  const refCountEl = document.getElementById("refCount");
  const loader = document.getElementById("loader");
  const refLinkEl = document.getElementById("refLink");
  const LS_KEY = "tg_user_id";
  const BOT_USERNAME = "Game_win_usdtBot";

  function getBaseUrl(){ return window.location.origin; }

  async function api(action, params={}) {
    const base = getBaseUrl();
    const query = new URLSearchParams({ action, ...params });
    const res = await fetch(`${base}/api/index?${query}`);
    return res.json();
  }

  async function registerUser(userID, ref){
    const data = await api("registerUser", { userID, ref });
    if(data.success) status.textContent = "✅ تم التسجيل بنجاح";
  }

  async function getProfile(userID){
    const data = await api("getProfile", { userID });
    if(data.success && data.data){
      const u=data.data;
      pointsEl.textContent = u.points || 0;
      usdtEl.textContent = (u.usdt || 0).toFixed(2);
      refCountEl.textContent = u.referrals || 0;
      const refLink = `https://t.me/${BOT_USERNAME}/earn?startapp=ref_${userID}`;
      refLinkEl.textContent = refLink;
      loader.style.display = "none";
    }
  }

  async function swap(userID){
    const d = await api("swap", { userID });
    alert(d.message);
    await getProfile(userID);
  }

  async function withdraw(userID){
    const amt = prompt("ادخل المبلغ المراد سحبه:");
    if(!amt) return;
    const d = await api("withdraw", { userID, amount: amt });
    alert(d.message);
    await getProfile(userID);
  }

  async function openTask(userID){
    const d = await api("openTask", { userID });
    if(d.success && d.data){
      refCountEl.textContent = d.data.referrals || 0;
    }
  }

  function getTelegramUserID(){
    try {
      return window.Telegram.WebApp.initDataUnsafe?.user?.id;
    } catch(e){ return null; }
  }

  let ref = null;
  try {
    ref = window.Telegram?.WebApp?.initDataUnsafe?.start_param?.replace("ref_","") || null;
    if(!ref) ref = new URLSearchParams(window.location.search).get("ref");
  } catch(e){
    ref = new URLSearchParams(window.location.search).get("ref");
  }

  const userID = getTelegramUserID() || localStorage.getItem(LS_KEY);
  if(!userID){
    loader.style.display = "none";
    status.textContent = "⚠️ افتح داخل Telegram WebApp.";
    return;
  }

  localStorage.setItem(LS_KEY, userID);
  await registerUser(userID, ref);
  await getProfile(userID);

  // 🔹 زر نسخ الدعوة (copyRef2 فقط)
  document.getElementById("copyRef2").onclick = () => {
    const link = refLinkEl.textContent.trim();
    if (!link) {
      alert("⚠️ رابط الإحالة غير متوفر بعد!");
      return;
    }
    navigator.clipboard.writeText(link)
      .then(() => alert("✅ تم نسخ رابط الإحالة!"))
      .catch(() => alert("❌ حدث خطأ أثناء النسخ"));
  };

  document.getElementById("swapBtn").onclick = ()=> swap(userID);
  document.getElementById("withdrawBtn").onclick = ()=> withdraw(userID);
  document.getElementById("openTask").onclick = async ()=>{
    await openTask(userID);
    document.getElementById("taskOverlay").style.display="flex";
  };
})();