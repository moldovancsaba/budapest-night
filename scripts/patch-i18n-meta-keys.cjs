#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../src/messages");
const LOCALES = ["en", "es", "it", "hu", "he", "ar"];

const BADGE = {
  en: { featured: "Featured", popular: "Popular", new: "New", staffPick: "Staff Pick", hiddenGem: "Hidden Gem", weekendVibes: "Weekend Vibes" },
  es: { featured: "Destacado", popular: "Popular", new: "Nuevo", staffPick: "Selección del equipo", hiddenGem: "Joyita oculta", weekendVibes: "Vibes de finde" },
  it: { featured: "In evidenza", popular: "Popolare", new: "Nuovo", staffPick: "Scelta del team", hiddenGem: "Perla nascosta", weekendVibes: "Vibes weekend" },
  hu: { featured: "Kiemelt", popular: "Népszerű", new: "Új", staffPick: "Csapat választása", hiddenGem: "Rejtett gyöngyszem", weekendVibes: "Hétvégi hangulat" },
  he: { featured: "מומלץ", popular: "פופולרי", new: "חדש", staffPick: "בחירת הצוות", hiddenGem: "פנינה נסתרת", weekendVibes: "אווירת סוף שבוע" },
  ar: { featured: "مميز", popular: "شائع", new: "جديد", staffPick: "اختيار الفريق", hiddenGem: "جوهرة مخفية", weekendVibes: "أجواء نهاية الأسبوع" },
};

const MEETUP_GT = {
  en: { artGallery: "Art & Gallery", liveCulture: "Live Culture", foodWine: "Food & Wine Circle", nightlifeCrew: "Nightlife Crew", localCreators: "Local Creators" },
  es: { artGallery: "Arte y galería", liveCulture: "Cultura en vivo", foodWine: "Círculo gastronómico", nightlifeCrew: "Equipo nocturno", localCreators: "Creadores locales" },
  it: { artGallery: "Arte e galleria", liveCulture: "Cultura dal vivo", foodWine: "Cerchio enogastronomico", nightlifeCrew: "Crew nightlife", localCreators: "Creatori locali" },
  hu: { artGallery: "Művészet és galéria", liveCulture: "Élő kultúra", foodWine: "Gasztro kör", nightlifeCrew: "Éjszakai csapat", localCreators: "Helyi alkotók" },
  he: { artGallery: "אמנות וגלריה", liveCulture: "תרבות חיה", foodWine: "מעגל אוכל ויין", nightlifeCrew: "צוות לילה", localCreators: "יוצרים מקומיים" },
  ar: { artGallery: "فن ومعرض", liveCulture: "ثقافة حية", foodWine: "دائرة طعام ونبيذ", nightlifeCrew: "طاقم السهر", localCreators: "مبدعون محليون" },
};

const MEETUP_CAD = {
  en: { weekly: "Weekly", monthly: "Monthly", weekend: "Weekend", popup: "Pop-up" },
  es: { weekly: "Semanal", monthly: "Mensual", weekend: "Fin de semana", popup: "Pop-up" },
  it: { weekly: "Settimanale", monthly: "Mensile", weekend: "Weekend", popup: "Pop-up" },
  hu: { weekly: "Heti", monthly: "Havi", weekend: "Hétvége", popup: "Pop-up" },
  he: { weekly: "שבועי", monthly: "חודשי", weekend: "סוף שבוע", popup: "חד-פעמי" },
  ar: { weekly: "أسبوعي", monthly: "شهري", weekend: "نهاية الأسبوع", popup: "مؤقت" },
};

const VENUE_EXTRA = {
  en: { copyLink: "Copy link", photoCounter: "{current} / {total}", reviewsCount: "({count} reviews)", connectVenue: "Connect with this venue", savedGroup: "Group saved", removeGroupSaved: "Removed from saved", saveGroup: "Save group" },
  es: { copyLink: "Copiar enlace", photoCounter: "{current} / {total}", reviewsCount: "({count} reseñas)", connectVenue: "Contactar con este local", savedGroup: "Grupo guardado", removeGroupSaved: "Eliminado de guardados", saveGroup: "Guardar grupo" },
  it: { copyLink: "Copia link", photoCounter: "{current} / {total}", reviewsCount: "({count} recensioni)", connectVenue: "Contatta questo locale", savedGroup: "Gruppo salvato", removeGroupSaved: "Rimosso dai salvati", saveGroup: "Salva gruppo" },
  hu: { copyLink: "Link másolása", photoCounter: "{current} / {total}", reviewsCount: "({count} értékelés)", connectVenue: "Kapcsolat a hellyel", savedGroup: "Kör mentve", removeGroupSaved: "Eltávolítva", saveGroup: "Kör mentése" },
  he: { copyLink: "העתק קישור", photoCounter: "{current} / {total}", reviewsCount: "({count} ביקורות)", connectVenue: "צור קשר עם המקום", savedGroup: "הקבוצה נשמרה", removeGroupSaved: "הוסר מהשמורים", saveGroup: "שמור קבוצה" },
  ar: { copyLink: "نسخ الرابط", photoCounter: "{current} / {total}", reviewsCount: "({count} مراجعات)", connectVenue: "تواصل مع هذا المكان", savedGroup: "تم حفظ المجموعة", removeGroupSaved: "أُزيل من المحفوظات", saveGroup: "حفظ المجموعة" },
};

for (const locale of LOCALES) {
  const fp = path.join(ROOT, `${locale}.json`);
  const j = JSON.parse(fs.readFileSync(fp, "utf8"));
  j.badge = BADGE[locale];
  j.meetup = j.meetup || {};
  j.meetup.groupType = MEETUP_GT[locale];
  j.meetup.cadence = MEETUP_CAD[locale];
  Object.assign(j.venue, VENUE_EXTRA[locale]);
  fs.writeFileSync(fp, `${JSON.stringify(j, null, 2)}\n`);
  console.log("patched meta", locale);
}
