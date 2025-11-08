import { toast } from "./utils.js";


// ====== CONFIG ======
export const CONFIG = {
SCRIPT_URL: "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec",
CLOUD_NAME: "YOUR_CLOUD_NAME",
UPLOAD_PRESET: "YOUR_UPLOAD_PRESET", // unsigned preset restricted to a folder
};


// Telegram context
export const tg = window.Telegram?.WebApp;
if (tg) { tg.expand?.(); tg.ready?.(); }


export function getAuth() {
// we will send initData to server for verification
return { initData: tg?.initData || "" };
}


export async function cloudinaryUpload(file) {
const form = new FormData();
form.append("file", file);
form.append("upload_preset", CONFIG.UPLOAD_PRESET);


const res = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG.CLOUD_NAME}/image/upload`, {
method: "POST",
body: form,
});
if (!res.ok) throw new Error("Cloudinary upload failed");
return res.json(); // { secure_url }
}


export async function sheetGetAll() {
const url = `${CONFIG.SCRIPT_URL}?action=getData`;
const res = await fetch(url, { headers: { "x-tele-init": getAuth().initData } });
return res.json();
}


export async function sheetAddOrUpdate(payload) {
const auth = getAuth();
const body = new URLSearchParams({ action: payload.exists ? "updateData" : "addData", ...payload });
const res = await fetch(CONFIG.SCRIPT_URL, { method: "POST", headers: { "x-tele-init": auth.initData }, body });
return res.json();
}
