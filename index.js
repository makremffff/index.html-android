(async function(){
  const status         = document.getElementById("status");
  const profileEl      = document.getElementById("profile");
  const refBtn         = document.getElementById("copyRef");
  const refLinkEl      = document.getElementById("refLink");
  const pointsEl       = document.getElementById("points");
  const usdtEl         = document.getElementById("usdt");
  const refCountEl     = document.getElementById("refCount");
  const loader         = document.getElementById("loader");
  const LS_KEY         = "tg_user_id";
  const BOT_USERNAME   = "Game_win_usdtBot";

  function getBaseUrl(){return window.location.origin;}

  /* ---------- helpers ---------- */
  async function registerUser(userID, ref){
    const base = getBaseUrl();
    const url = `${base}/api/index?action=registerUser&userID=${encodeURIComponent(userID)}${ref?`&ref=${encodeURIComponent(ref)}`:""}`;
    const res = await fetch(url);
    const data = await res.json();
    if(data.success) status.textContent="✅ تم التسجيل بنجاح";
  }

  async function getProfile(userID){
    const base=getBaseUrl();
    const url=`${base}/api/index?action=getProfile&userID=${encodeURIComponent(userID)}`;
    const res=await fetch(url);
    const data=await res.json();
    if(data.success && data.data){
      const u=data.data;
      /* 1) fill top bar */
      pointsEl.textContent = u.points || 0;
      usdtEl.textContent   = (u.usdt || 0).toFixed(2);

      /* 2) fill task overlay */
      refCountEl.textContent = u.referrals || 0;

      /* 3) build referral link */
      const refLink=`https://t.me/${BOT_USERNAME}/earn?startapp=ref_${userID}`;
      refLinkEl.textContent = refLink;
      refBtn.style.display  = "inline-block";

      /* 4) hide loader */
      loader.style.display = "none";
    }
  }

  function getTelegramUserID(){
    try{
      if(window.Telegram&&window.Telegram.WebApp){
        return window.Telegram.WebApp.initDataUnsafe?.user?.id;
      }
    }catch(e){}
    return null;
  }

  /* ---------- bootstrap ---------- */
  let ref=null;
  try{
    ref=window.Telegram?.WebApp?.initDataUnsafe?.start_param?.replace("ref_","")||null;
    if(!ref) ref=new URLSearchParams(window.location.search).get("ref");
  }catch(e){
    ref=new URLSearchParams(window.location.search).get("ref");
  }

  const userID=getTelegramUserID()||localStorage.getItem(LS_KEY);

  if(userID){
    localStorage.setItem(LS_KEY,userID);
    await registerUser(userID,ref);
    await getProfile(userID);

    /* copy referral link */
    refBtn.addEventListener("click",()=>{
      navigator.clipboard.writeText(refLinkEl.textContent);
      alert("✅ تم نسخ رابط الإحالة!");
    });
  }else{
    loader.style.display="none";
    status.textContent="⚠️ افتح داخل Telegram WebApp.";
  }
})();
