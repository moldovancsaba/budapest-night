#!/usr/bin/env node
/** Build account-es/it/he/ar from account-en with translated UI strings (canonical filter keys unchanged). */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../src/messages");
const en = JSON.parse(fs.readFileSync(path.join(ROOT, "account-en.json"), "utf8"));

const T = {
  es: {
    page: { title: "Mi cuenta", subtitle: "Locales guardados, plan nocturno y preferencias." },
    nav: ["Guardados", "Plan nocturno", "Preferencias", "Mi distrito", "Alertas"],
    saved: {
      title: "Locales y círculos guardados",
      subtitle: "Todo lo que has guardado en un solo lugar.",
      viewAllCta: "Ver todos",
      chips: ["Todos", "Eventos", "Fiestas", "Restaurantes", "Cafés", "Cultura"],
      emptyMessage: "Aún no hay elementos guardados en esta categoría.",
      card: { viewCta: "Ver", shareCta: "Compartir", addToPlanCta: "Añadir al presupuesto", removeCta: "Quitar" },
      toastAddedToPlan: "{name} añadido al plan",
      toastRemoved: "{name} eliminado",
      toastSampleRemove: "Guarda lugares desde Explorar para gestionarlos aquí.",
      priceUnits: { class: "entrada", week: "cover", party: "persona", visit: "visita" },
    },
    plan: {
      title: "Mi plan nocturno",
      subtitle: "Estima tu gasto total de la velada.",
      emptyMessage: "Añade locales desde Explorar al presupuesto para verlos aquí.",
      estimatedTotalLabel: "Total estimado",
      viewFullCta: "Ver plan completo",
      clearCta: "Borrar plan",
    },
    prefs: {
      title: "Tus preferencias",
      subtitle: "Ajusta lo que quieres ver en Budapest.",
      editCta: "Editar preferencias",
      savedToast: "Preferencias guardadas",
      sections: ["Público y ambiente", "Intereses", "Horarios preferidos"],
    },
    neighborhood: {
      title: "Mi distrito",
      subtitle: "Tu base para las noches en Budapest.",
      detectedLabelPrefix: "Tu zona:",
      updateAddressCtaLabel: "Actualizar dirección",
      nearbySectionLabel: "Barrios cercanos",
      browseCtaLabel: "Explorar cerca de mí",
      updateAddressToast: "Actualización de dirección próximamente",
    },
    alerts: {
      title: "Alertas y correo",
      subtitle: "Elige de qué quieres enterarte.",
      emailSectionLabel: "Alertas por email",
      options: [
        "Selección semanal por distrito",
        "Nuevos eventos cerca",
        "Actualizaciones de fiestas y clubs",
        "Aperturas de restaurantes",
        "Cultura de fin de semana",
        "Nuevos círculos culturales",
        "Actualizaciones de guardados",
      ],
      frequencySectionLabel: "Frecuencia de email",
      frequencyChoices: ["Semanal", "Solo importantes", "Pausar emails"],
      saveCta: "Guardar ajustes",
      savedToast: "Ajustes guardados",
    },
    privacy: {
      headline: "Respetamos tu privacidad. No compartimos tu información.",
      supportTextBefore: "¿Preguntas? Escríbenos a",
    },
  },
  it: {
    page: { title: "Il mio account", subtitle: "Locali salvati, piano serale e preferenze." },
    nav: ["Salvati", "Piano serale", "Preferenze", "Il mio quartiere", "Avvisi"],
    saved: {
      title: "Locali e circoli salvati",
      subtitle: "Tutto ciò che hai salvato in un posto.",
      viewAllCta: "Vedi tutti",
      chips: ["Tutti", "Eventi", "Feste", "Ristoranti", "Caffè", "Cultura"],
      emptyMessage: "Nessun elemento salvato in questa categoria.",
      card: { viewCta: "Vedi", shareCta: "Condividi", addToPlanCta: "Aggiungi al budget", removeCta: "Rimuovi" },
      toastAddedToPlan: "{name} aggiunto al piano",
      toastRemoved: "{name} rimosso",
      toastSampleRemove: "Salva locali da Scopri per gestirli qui.",
      priceUnits: { class: "biglietto", week: "cover", party: "persona", visit: "visita" },
    },
    plan: {
      title: "Il mio piano serale",
      subtitle: "Stima la spesa totale della serata.",
      emptyMessage: "Aggiungi locali dal budget in Scopri per vederli qui.",
      estimatedTotalLabel: "Totale stimato",
      viewFullCta: "Piano completo",
      clearCta: "Svuota piano",
    },
    prefs: {
      title: "Le tue preferenze",
      subtitle: "Scegli cosa vedere a Budapest.",
      editCta: "Modifica preferenze",
      savedToast: "Preferenze salvate",
      sections: ["Pubblico e atmosfera", "Interessi", "Orari preferiti"],
    },
    neighborhood: {
      title: "Il mio quartiere",
      subtitle: "La tua base per le serate a Budapest.",
      detectedLabelPrefix: "La tua zona:",
      updateAddressCtaLabel: "Aggiorna indirizzo",
      nearbySectionLabel: "Zone vicine",
      browseCtaLabel: "Esplora vicino a me",
      updateAddressToast: "Aggiornamento indirizzo in arrivo",
    },
    alerts: {
      title: "Avvisi ed email",
      subtitle: "Scegli di cosa vuoi essere informato.",
      emailSectionLabel: "Avvisi email",
      options: [
        "Scelte settimanali per quartiere",
        "Nuovi eventi vicino a te",
        "Aggiornamenti party e club",
        "Aperture ristoranti",
        "Cultura del weekend",
        "Nuovi circoli culturali",
        "Aggiornamenti dai salvati",
      ],
      frequencySectionLabel: "Frequenza email",
      frequencyChoices: ["Settimanale", "Solo importanti", "Metti in pausa"],
      saveCta: "Salva impostazioni",
      savedToast: "Impostazioni salvate",
    },
    privacy: {
      headline: "Rispettiamo la tua privacy. Non conmotioniamo i tuoi dati.",
      supportTextBefore: "Domande? Scrivici a",
    },
  },
  he: {
    page: { title: "החשבון שלי", subtitle: "מקומות שמורים, תוכנית לילה והעדפות." },
    nav: ["שמורים", "תוכנית לילה", "העדפות", "המחוז שלי", "התראות"],
    saved: {
      title: "מקומות ומעגלים שמורים",
      subtitle: "כל מה ששמרת במקום אחד.",
      viewAllCta: "הצג הכל",
      chips: ["הכל", "אירועים", "מסיבות", "מסעדות", "בתי קפה", "תרבות"],
      emptyMessage: "אין פריטים שמורים בקטגוריה זו.",
      card: { viewCta: "צפייה", shareCta: "שיתוף", addToPlanCta: "הוסף לתקציב", removeCta: "הסר" },
      toastAddedToPlan: "{name} נוסף לתוכנית",
      toastRemoved: "{name} הוסר",
      toastSampleRemove: "שמור מקומות מגלו כדי לנהל אותם כאן.",
      priceUnits: { class: "כרטיס", week: "כניסה", party: "אדם", visit: "ביקור" },
    },
    plan: {
      title: "תוכנית הלילה שלי",
      subtitle: "העריך את ההוצאה הכוללת לערב.",
      emptyMessage: "הוסף מקומות מהתקציב בגלו כדי לראות אותם כאן.",
      estimatedTotalLabel: "סה״כ משוער",
      viewFullCta: "תוכנית מלאה",
      clearCta: "נקה תוכנית",
    },
    prefs: {
      title: "ההעדפות שלך",
      subtitle: "כוונן מה תרצה לראות בבודפשט.",
      editCta: "ערוך העדפות",
      savedToast: "העדפות נשמרו",
      sections: ["קהל ואווירה", "תחומי עניין", "זמנים מועדפים"],
    },
    neighborhood: {
      title: "המחוז שלי",
      subtitle: "הבסיס שלך ללילות בבודפשט.",
      detectedLabelPrefix: "האזור שלך:",
      updateAddressCtaLabel: "עדכן כתובת",
      nearbySectionLabel: "שכונות קרובות",
      browseCtaLabel: "גלו לידי",
      updateAddressToast: "עדכון כתובת בקרוב",
    },
    alerts: {
      title: "התראות ואימייל",
      subtitle: "בחר על מה לשמוע.",
      emailSectionLabel: "התראות אימייל",
      options: [
        "בחירות שבועיות למחוז",
        "אירועים חדשים בקרבתי",
        "עדכוני מסיבות ומועדונים",
        "פתיחות מסעדות",
        "תרבות בסוף השבוע",
        "מעגלי תרבות חדשים",
        "עדכונים משמורים",
      ],
      frequencySectionLabel: "תדירות אימייל",
      frequencyChoices: ["שבועי", "רק חשובים", "השהה אימיילים"],
      saveCta: "שמור הגדרות",
      savedToast: "הגדרות נשמרו",
    },
    privacy: {
      headline: "אנחנו מכבדים את הפרטיות שלך. המידע לא משותף.",
      supportTextBefore: "שאלות? כתוב ל",
    },
  },
  ar: {
    page: { title: "حسابي", subtitle: "أماكن محفوظة وخطة ليلية وتفضيلات." },
    nav: ["محفوظ", "خطة الليلة", "التفضيلات", "منطقتي", "التنبيهات"],
    saved: {
      title: "أماكن ودوائر محفوظة",
      subtitle: "كل ما حفظته في مكان واحد.",
      viewAllCta: "عرض الكل",
      chips: ["الكل", "فعاليات", "حفلات", "مطاعم", "مقاهٍ", "ثقافة"],
      emptyMessage: "لا عناصر محفوظة في هذه الفئة بعد.",
      card: { viewCta: "عرض", shareCta: "مشاركة", addToPlanCta: "أضف للميزانية", removeCta: "إزالة" },
      toastAddedToPlan: "أُضيف {name} إلى الخطة",
      toastRemoved: "أُزيل {name}",
      toastSampleRemove: "احفظ أماكن من اكتشف لإدارتها هنا.",
      priceUnits: { class: "تذكرة", week: "دخول", party: "شخص", visit: "زيارة" },
    },
    plan: {
      title: "خطة ليلتي",
      subtitle: "قدّر إجمالي إنفاقك للسهرة.",
      emptyMessage: "أضف أماكن من الميزانية في اكتشف لرؤيتها هنا.",
      estimatedTotalLabel: "الإجمالي التقديري",
      viewFullCta: "الخطة الكاملة",
      clearCta: "مسح الخطة",
    },
    prefs: {
      title: "تفضيلاتك",
      subtitle: "اضبط ما تريد رؤيته في بودابست.",
      editCta: "تعديل التفضيلات",
      savedToast: "تم حفظ التفضيلات",
      sections: ["الجمهور والأجواء", "الاهتمامات", "الأوقات المفضلة"],
    },
    neighborhood: {
      title: "منطقتي",
      subtitle: "قاعدتك لسهرات بودابست.",
      detectedLabelPrefix: "منطقتك:",
      updateAddressCtaLabel: "تحديث العنوان",
      nearbySectionLabel: "أحياء قريبة",
      browseCtaLabel: "استكشف بالقرب مني",
      updateAddressToast: "تحديث العنوان قريباً",
    },
    alerts: {
      title: "التنبيهات والبريد",
      subtitle: "اختر ما تريد معرفته.",
      emailSectionLabel: "تنبيهات البريد",
      options: [
        "اختيارات أسبوعية للمنطقة",
        "فعاليات جديدة قريبة",
        "تحديثات الحفلات والنوادٍ",
        "افتتاح مطاعم",
        "ثقافة نهاية الأسبوع",
        "دوائر ثقافية جديدة",
        "تحديثات المحفوظات",
      ],
      frequencySectionLabel: "تكرار البريد",
      frequencyChoices: ["أسبوعي", "المهم فقط", "إيقاف البريد"],
      saveCta: "حفظ الإعدادات",
      savedToast: "تم حفظ الإعدادات",
    },
    privacy: {
      headline: "نحترم خصوصيتك. لا نشارك معلوماتك.",
      supportTextBefore: "أسئلة؟ راسلنا على",
    },
  },
};

function build(locale) {
  const s = JSON.parse(JSON.stringify(en.settings));
  const tr = T[locale];
  s.page = { ...s.page, ...tr.page };
  tr.nav.forEach((label, i) => {
    s.navTabs[i].label = label;
  });
  Object.assign(s.saved, tr.saved);
  s.saved.filterChips.forEach((c, i) => {
    c.label = tr.saved.chips[i];
  });
  Object.assign(s.activityPlan, tr.plan);
  s.activityPlan.priceUnits = { ...s.saved.priceUnits };
  Object.assign(s.familyPreferences, {
    title: tr.prefs.title,
    subtitle: tr.prefs.subtitle,
    editCta: tr.prefs.editCta,
    savedToast: tr.prefs.savedToast,
  });
  tr.prefs.sections.forEach((label, i) => {
    s.familyPreferences.sections[i].label = label;
  });
  Object.assign(s.neighborhood, tr.neighborhood);
  Object.assign(s.alerts, tr.alerts);
  Object.assign(s.privacy, tr.privacy);
  return { settings: s };
}

for (const locale of ["es", "it", "he", "ar"]) {
  const fp = path.join(ROOT, `account-${locale}.json`);
  fs.writeFileSync(fp, `${JSON.stringify(build(locale), null, 2)}\n`);
  console.log("wrote", fp);
}
