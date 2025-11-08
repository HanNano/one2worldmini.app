import { toast } from "./utils.js";

// ====== CONFIG (You only edit here) ======
export const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec",
  CLOUD_NAME: "daa1ab71e",       // ✅ your Cloudinary cloud name
  UPLOAD_PRESET: "one2world",    // ✅ your unsigned upload preset
};

// Telegram context (do not change)
export const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand?.();
  tg.ready?.();
}

// ✅ Returns telegram auth initData to backend
export function getAuth() {
  return { initData: tg?.initData || "" };
}

// ✅ Upload to Cloudinary
export async function cloudinaryUpload(file) {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CONFIG.UPLOAD_PRESET);

  const cloudUrl = `https://api.cloudinary.com/v1_1/${CONFIG.CLOUD_NAME}/image/upload`;

  const res = await fetch(cloudUrl, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return data.secure_url; // <-- this returns usable URL
}

// ✅ Fetch all records from Google Sheet
export async function sheetGetAll() {
  const url = `${CONFIG.SCRIPT_URL}?action=getData`;

  const res = await fetch(url, {
    headers: { "x-tele-init": getAuth().initData },
  });

  return res.json();
}

// ✅ Add new OR update existing record
export async function sheetAddOrUpdate(payload) {
  const auth = getAuth();

  const body = new URLSearchParams({
    action: payload.exists ? "updateData" : "addData",
    ...payload,
  });

  const res = await fetch(CONFIG.SCRIPT_URL, {
    method: "POST",
    headers: { "x-tele-init": auth.initData },
    body,
  });

  return res.json();
}
