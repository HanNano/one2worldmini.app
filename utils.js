const $ = (id) => document.getElementById(id);


export function toast(msg, ms = 2000) {
const t = $("toast");
t.textContent = msg;
t.hidden = false;
setTimeout(() => (t.hidden = true), ms);
}


// Extract username/handle from full links
export function normalizeUser(input, platform) {
if (!input) return "";
const s = input.trim();
if (!s) return "";
// remove protocol & domain
try {
const url = new URL(s);
const path = url.pathname.replace(/^\//, "");
if (platform === "tiktok") return path.replace(/^@/, "");
if (platform === "youtube") {
// allow @handle or channel/<id>
if (path.startsWith("@")) return path.slice(1);
return path;
}
return path; // fb/ig/tg typical username path
} catch (_) {
// not a URL
return s.replace(/^@/, "");
}
}


export function debounce(fn, wait = 300) {
let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}
