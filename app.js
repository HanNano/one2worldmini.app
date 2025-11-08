import { debounce, normalizeUser, toast } from "./utils.js";


async function reload() {
setLoading(true, "အချက်အလက်များ ခေါ်ယူနေပါသည်...");
try {
const res = await sheetGetAll();
if (res.status === "success") { buildHostMap(res.data); toast(`✅ Loaded ${Object.keys(state.hosts).length}`); }
else toast("❌ Load failed");
} catch (e) { console.error(e); toast("❌ Network error"); }
finally { setLoading(false); }
}


function doSearch() {
const q = (searchInput.value || "").trim().toLowerCase().replace("@", "");
hostResult.hidden = true; noResult.hidden = true;
if (!q) { noResult.hidden = false; return; }
const entries = Object.entries(state.hosts);
let found = null;
for (const [id, h] of entries) {
if (id === q || id.includes(q) ||
(h.name||"").toLowerCase().includes(q) ||
(h.facebook||"").toLowerCase().includes(q) ||
(h.instagram||"").toLowerCase().includes(q) ||
(h.tiktok||"").toLowerCase().includes(q) ||
(h.telegram||"").toLowerCase().includes(q) ||
(h.youtube||"").toLowerCase().includes(q)) { found = h; break; }
}
if (found) renderHost(found); else noResult.hidden = false;
}


// Upload avatar to Cloudinary on select
avatarInput.addEventListener("change", async (e) => {
const file = e.target.files?.[0]; if (!file) return;
setLoading(true, "Uploading photo...");
try {
const r = await cloudinaryUpload(file);
state.avatarUrl = r.secure_url;
avatarPreview.src = state.avatarUrl; avatarPreview.hidden = false; removePhoto.hidden = false;
toast("✅ Photo uploaded");
} catch (err) { console.error(err); toast("❌ Upload failed"); }
finally { setLoading(false); }
});


removePhoto.addEventListener("click", () => { state.avatarUrl = ""; avatarPreview.hidden = true; removePhoto.hidden = true; avatarPreview.src = ""; avatarInput.value = ""; });


submitForm.addEventListener("click", async () => {
const name = fName.value.trim(); const bigo = fBigo.value.trim().toLowerCase();
if (!name || !bigo) { toast("❗ Name + BIGO ID required"); return; }
const payload = {
exists: !!state.hosts[bigo],
name,
bigo_id: bigo,
facebook: normalizeUser(fFacebook.value, "fb") || "none",
instagram: normalizeUser(fInstagram.value, "ig") || "none",
tiktok: normalizeUser(fTiktok.value, "tiktok") || "none",
telegram: normalizeUser(fTelegram.value, "tg") || "none",
youtube: normalizeUser(fYoutube.value, "youtube") || "none",
avatar: state.avatarUrl || defaultAvatar(),
};
setLoading(true, payload.exists ? "Updating..." : "Saving...");
try {
const r = await sheetAddOrUpdate(payload);
if (r.status === "success") {
state.hosts[bigo] = { name, bigoId: bigo, facebook: payload.facebook, instagram: payload.instagram, tiktok: payload.tiktok, telegram: payload.telegram, youtube: payload.youtube, avatar: payload.avatar };
toast(payload.exists ? "✅ Updated" : "✅ Added");
hideForm();
searchInput.value = bigo; doSearch();
} else if (r.status === "auth_failed") {
toast("🔒 Auth failed — open via Telegram");
} else {
toast("❌ Save failed");
}
} catch (e) { console.error(e); toast("❌ Network error"); }
finally { setLoading(false); }
});


cancelForm.addEventListener("click", () => { hideForm(); clearForm(); });
addBtn.addEventListener("click", () => openForm());
addFromNoResult.addEventListener("click", () => openForm({ bigoId: (searchInput.value||"").trim().toLowerCase() }));
searchBtn.addEventListener("click", doSearch);
searchInput.addEventListener("keypress", (e) => e.key === "Enter" && doSearch());
reloadBtn.addEventListener("click", reload);


function prefillFromTelegram() {
const u = tg?.initDataUnsafe?.user;
if (u) {
// optional UX: show current user somewhere or prefill name
if (!fName.value) fName.value = [u.first_name, u.last_name].filter(Boolean).join(" ");
if (!fTelegram.value) fTelegram.value = u.username || "";
}
}


(async function init(){
renderSamples();
await reload();
prefillFromTelegram();
})();
