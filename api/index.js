// api/index.js - backend for Supabase registration
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

    if (action === "registerUser") {
      if (!userID) return res.status(400).json({ success:false, message:"Missing userID" });
      const selectUrl = `${SUPABASE_URL}/rest/v1/players?user_id=eq.${encodeURIComponent(userID)}&select=*`;
      const selectRes = await fetch(selectUrl, { headers: restHeaders() });
      const existing = await selectRes.json();

      if (Array.isArray(existing) && existing.length > 0) {
        return res.json({ success:true, message:"User already exists" });
      }

      const insertUrl = `${SUPABASE_URL}/rest/v1/players`;
      const body = JSON.stringify([{ user_id: userID, created_at: new Date().toISOString() }]);
      const insertRes = await fetch(insertUrl, { method: "POST", headers: restHeaders(), body });
      const inserted = await insertRes.json().catch(()=>null);
      return res.json({ success:true, message:"User registered", row: inserted });
    }

    return res.status(400).json({ success:false, message:"Invalid action" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ success:false, message:String(err) });
  }
};
