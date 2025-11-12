// api/index.js - Backend API with referral and balance support
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sgdeybwvsyvpifmewvgz.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "REPLACE_WITH_YOUR_ANON_KEY";

function restHeaders() {
  return {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": "Bearer " + SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
}

module.exports = async function (req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  try {
    const action = req.query.action;
    const userID = req.query.userID && String(req.query.userID).trim();
    const ref = req.query.ref && String(req.query.ref).trim();

    if (action === "registerUser") {
      if (!userID) return res.status(400).json({ success:false, message:"Missing userID" });

      const selectUrl = `${SUPABASE_URL}/rest/v1/players?user_id=eq.${encodeURIComponent(userID)}&select=*`;
      const selectRes = await fetch(selectUrl, { headers: restHeaders() });
      const existing = await selectRes.json();

      if (Array.isArray(existing) && existing.length > 0) {
        return res.json({ success:true, message:"User already exists" });
      }

      const insertUrl = `${SUPABASE_URL}/rest/v1/players?select=*`;
      const body = JSON.stringify([{ user_id: userID, referred_by: ref || null, points: 0, usdt: 0, referrals: 0 }]);
      const insertRes = await fetch(insertUrl, { method: "POST", headers: restHeaders(), body });
      const inserted = await insertRes.json().catch(()=>null);

      if (ref) {
        const rewardPts = 5000;
        const rewardUsdt = 0.25;
        const getRefUrl = `${SUPABASE_URL}/rest/v1/players?user_id=eq.${encodeURIComponent(ref)}&select=*`;
        const refRes = await fetch(getRefUrl, { headers: restHeaders() });
        const refData = await refRes.json();
        if (Array.isArray(refData) && refData.length > 0) {
          const current = refData[0];
          const updateUrl = `${SUPABASE_URL}/rest/v1/players?user_id=eq.${encodeURIComponent(ref)}`;
          const updateBody = JSON.stringify({
            referrals: current.referrals + 1,
            points: current.points + rewardPts,
            usdt: (parseFloat(current.usdt) || 0) + rewardUsdt
          });
          await fetch(updateUrl, {
            method: "PATCH",
            headers: restHeaders(),
            body: updateBody
          }).catch(()=>{});
        }
      }

      return res.json({ success:true, message:"User registered", row: inserted });
    }

    if (action === "getProfile") {
      const profileUrl = `${SUPABASE_URL}/rest/v1/players?user_id=eq.${encodeURIComponent(userID)}&select=*`;
      const resp = await fetch(profileUrl, { headers: restHeaders() });
      const data = await resp.json();
      return res.json({ success:true, data: data[0] || null });
    }

    return res.status(400).json({ success:false, message:"Invalid action" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ success:false, message:String(err) });
  }
};
