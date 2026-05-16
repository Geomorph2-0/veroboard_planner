import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace;background:#0a0704;color:#f0ddb8;text-align:center;padding:24px">
      <div>
        <div style="font-size:32px;margin-bottom:16px">⬛</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:8px">Configuration missing</div>
        <div style="font-size:12px;color:#b07840">VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.<br>Add them in Vercel → Settings → Environment Variables.</div>
      </div>
    </div>`;
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(url, key);
