/** Per-provider locale blocks for Events category (hu, es, it, he, ar). A38 uses budapest-a38.json. */
const S = (urls) => urls;

const LOCALES_BY_ID = {
  "prov-operetta-terezvaros": {
    hu: {
      name: "Budapesti Operettszínház",
      shortDescription:
        "Történelmi operett- és musicalszínház a Nagymező utcán — nagytermi előadások egész évben.",
      longDescription:
        "A Budapesti Operettszínház 1923 óta működik a Nagymező utca 17. szám alatt, az 1894-es Fellner–Helmer épületben. A felújított terem 901 főt fogad operettekkel, musicalokkal és családi előadásokkal. Jegyek az operett.hu-n vagy a helyszíni pénztárban (H–P 10:00–19:00, Szo–V 13:00–19:00). Egyes előadások dinamikus árazásúak — ellenőrizd az online jegypénztárat.\n\n" +
        S("Sources: https://operett.hu/en https://operett.hu/en/the-budapest-operetta--musical-theatre https://operett.hu/en/contact https://operett.hu/en/program"),
      slug: "budapesti-operettszinhaz",
      announcementTitle: "Nézd meg a mai műsort",
      announcementDescription: "Operettek, musicalok, családi előadások — foglalj a hivatalos oldalon.",
      announcementBadge: "Élő kultúra",
    },
    es: {
      name: "Teatro de Opereta y Musical de Budapest",
      shortDescription:
        "Teatro histórico de opereta y musical en Nagymező — gran sala y cartelera durante todo el año.",
      longDescription:
        "El Teatro de Opereta y Musical de Budapest (Budapesti Operettszínház) está en Nagymező utca 17 desde 1923, en un edificio Fellner & Helmer de 1894. La sala restaurada tiene 901 butacas para operetas, musicales y producciones familiares. Entradas en operett.hu o taquilla (lun–vie 10:00–19:00, sáb–dom 13:00–19:00). Algunas funciones usan precios dinámicos — consulta la taquilla online.\n\n" +
        S("Sources: https://operett.hu/en https://operett.hu/en/the-budapest-operetta--musical-theatre https://operett.hu/en/contact https://operett.hu/en/program"),
      slug: "teatro-operetta-budapest",
      announcementTitle: "Consulta el programa de hoy",
      announcementDescription: "Operetas, musicales y espectáculos familiares — reserva en la web oficial.",
      announcementBadge: "Cultura en vivo",
    },
    it: {
      name: "Teatro dell'Operetta e Musical di Budapest",
      shortDescription:
        "Storico teatro di operetta e musical in Nagymező — grande sala e programmazione tutto l'anno.",
      longDescription:
        "Il Teatro dell'Operetta e Musical di Budapest (Budapesti Operettszínház) è in Nagymező utca 17 dal 1923, in un edificio Fellner & Helmer del 1894. La sala restaurata ospita 901 posti per operette, musical e spettacoli per famiglie. Biglietti su operett.hu o in biglietteria (lun–ven 10:00–19:00, sab–dom 13:00–19:00). Alcuni spettacoli hanno prezzi dinamici — controlla la biglietteria online.\n\n" +
        S("Sources: https://operett.hu/en https://operett.hu/en/the-budapest-operetta--musical-theatre https://operett.hu/en/contact https://operett.hu/en/program"),
      slug: "teatro-operetta-budapest-it",
      announcementTitle: "Programma di stasera",
      announcementDescription: "Operette, musical e spettacoli per famiglie — prenota sul sito ufficiale.",
      announcementBadge: "Cultura dal vivo",
    },
    he: {
      name: "תיאטרון האופרטה והמחזמר בודפשט",
      shortDescription:
        "תיאטרון אופרטה ומחזמר היסטורי ברחוב נאגימזו — אולם גדול ומופעים לאורך כל השנה.",
      longDescription:
        "תיאטרון האופרטה והמחזמר בבודפשט (Budapesti Operettszínház) נמצא ברחוב נאגימזו 17 מאז 1923, בבניין Fellner & Helmer מ-1894. האולם המשוחזר מכיל 901 מקומות לאופרטות, מחזמרים והפקות משפחתיות. כרטיסים ב-operett.hu או בקופה (ב׳–ו׳ 10:00–19:00, ש׳–א׳ 13:00–19:00). חלק מהמופעים במחיר דינמי — בדקו בקופה המקוונת.\n\n" +
        S("Sources: https://operett.hu/en https://operett.hu/en/the-budapest-operetta--musical-theatre https://operett.hu/en/contact https://operett.hu/en/program"),
      slug: "teatron-operetta-budapest",
      announcementTitle: "בדקו את המופע הערב",
      announcementDescription: "אופרטות, מחזמרים ומופעי משפחה — הזמינו באתר הרשמי.",
      announcementBadge: "תרבות חיה",
    },
    ar: {
      name: "مسرح الأوبريت والموسيقى في بودابست",
      shortDescription:
        "مسرح أوبريت وموسيقى تاريخي في شارع ناغيميزو — قاعة كبرى وعروض على مدار العام.",
      longDescription:
        "يقع مسرح الأوبريت والموسيقى في بودابست (Budapesti Operettszínház) في ناغيميزو 17 منذ 1923، في مبنى Fellner & Helmer عام 1894. تتسع القاعة المرممة لـ901 مقعداً لعروض الأوبريت والمسرحيات الموسيقية والعائلة. التذاكر عبر operett.hu أو شباك التذاكر (الإثنين–الجمعة 10:00–19:00، السبت–الأحد 13:00–19:00). بعض العروض بأسعار ديناميكية — راجع شباك التذاكر الإلكتروني.\n\n" +
        S("Sources: https://operett.hu/en https://operett.hu/en/the-budapest-operetta--musical-theatre https://operett.hu/en/contact https://operett.hu/en/program"),
      slug: "masrah-al-operetta-budapest",
      announcementTitle: "اطلع على برنامج الليلة",
      announcementDescription: "أوبريتات ومسرحيات موسيقية وعروض عائلية — احجز من الموقع الرسمي.",
      announcementBadge: "ثقافة حية",
    },
  },

  "prov-rudas-buda": {
    hu: {
      name: "Rudas Gyógyfürdő",
      shortDescription:
        "16. századi török kupolás fürdő a Gellért-hegy alatt — wellness, szaunavilág és éjszakai fürdőzés a Dunánál.",
      longDescription:
        "A Rudas Gyógyfürdő a Döbrentei tér 9. szám alatt, a Gellért-hegy lábánál álló történelmi török fürdő. A komplexumban török és wellness zónák, szaunavilág, ivócsarnok, valamint péntek–szombat éjjeli fürdőzés (22:00–03:00) a tetőn. Hétköznap reggelig a török részleg nemenkénti — nézd meg a hivatalos nyitvatartást. Felnőtt jegy minden zónára hétfőtől csütörtökig 12 000 Ft-tól, péntektől vasárnapig 15 000 Ft (2026, rudasfurdo.hu/arak); online: tickets.rudasfurdo.hu.\n\n" +
        S("Sources: https://www.rudasfurdo.hu/en https://www.rudasfurdo.hu/en/opening-hours https://www.rudasfurdo.hu/arak"),
      slug: "rudas-gyogyfurdo",
      announcementTitle: "Éjszakai fürdőzés hétvégén",
      announcementDescription: "Tetőmedencék péntek–szombat 22:00–03:00 — nyitvatartás a hivatalos oldalon.",
      announcementBadge: "Késő esti",
    },
    es: {
      name: "Baños Termales Rudas",
      shortDescription:
        "Baños turcos del siglo XVI bajo la colina Gellért — wellness, saunas y baño nocturno con vistas al Danubio.",
      longDescription:
        "Rudas Gyógyfürdő (Baños Termales Rudas) en Döbrentei tér 9 es un baño histórico otomano al pie de Gellért. Incluye zonas turcas y wellness, mundo sauna, sala de bebidas y baño nocturno viernes–sábado (22:00–03:00) en la azotea. Entre semana el baño turco es por género hasta media mañana — consulta horarios oficiales. Entrada adulto todas las zonas desde 12 000 HUF lun–jue y 15 000 HUF vie–dom (2026, rudasfurdo.hu/arak); online: tickets.rudasfurdo.hu.\n\n" +
        S("Sources: https://www.rudasfurdo.hu/en https://www.rudasfurdo.hu/en/opening-hours https://www.rudasfurdo.hu/arak"),
      slug: "banos-rudas",
      announcementTitle: "Baño nocturno los fines de semana",
      announcementDescription: "Piscinas en la azotea vie–sáb 22:00–03:00 — horarios en la web oficial.",
      announcementBadge: "Noche tardía",
    },
    it: {
      name: "Terme Rudas",
      shortDescription:
        "Bagni turchi del XVI secolo sotto Gellért — wellness, saune e bagno notturno sul Danubio.",
      longDescription:
        "Rudas Gyógyfürdő (Terme Rudas) in Döbrentei tér 9 è un bagno storico ottomano ai piedi di Gellért. Comprende zone turche e wellness, mondo sauna, sala bevande e bagno notturno ven–sab (22:00–03:00) sul tetto. Nei giorni feriali il bagno turco è segregato per genere fino a metà mattina — controlla gli orari ufficiali. Biglietto adulto tutte le zone da 12 000 HUF lun–gio e 15 000 HUF ven–dom (2026, rudasfurdo.hu/arak); online: tickets.rudasfurdo.hu.\n\n" +
        S("Sources: https://www.rudasfurdo.hu/en https://www.rudasfurdo.hu/en/opening-hours https://www.rudasfurdo.hu/arak"),
      slug: "terme-rudas",
      announcementTitle: "Bagno notturno nel weekend",
      announcementDescription: "Piscine sul tetto ven–sab 22:00–03:00 — orari sul sito ufficiale.",
      announcementBadge: "Tarda notte",
    },
    he: {
      name: "מרחצאות רודאש",
      shortDescription:
        "מרחצאות טורקיים מהמאה ה-16 מתחת לגבעת גלרט — בריאות, סאונות ורחצה לילית עם נוף לדנובה.",
      longDescription:
        "רודאש (Rudas Gyógyfürdő) בכיכר דברנטי 9 הוא מרחץ עות'מאני היסטורי למרגלות גלרט. המתחם כולל אזורי טורקי ו-wellness, עולם סאונה, אולם שתייה ורחצה לילית שישי–שבת (22:00–03:00) על הגג. בימי חול הגישה הטורקית מופרדת לפי מגדר עד אמצע הבוקר — בדקו שעות פתיחה רשמיות. כרטיס מבוגר לכל האזורים מ-12 000 פורינט ב׳–ה׳ ו-15 000 פורינט ו׳–א׳ (2026, rudasfurdo.hu/arak); אונליין: tickets.rudasfurdo.hu.\n\n" +
        S("Sources: https://www.rudasfurdo.hu/en https://www.rudasfurdo.hu/en/opening-hours https://www.rudasfurdo.hu/arak"),
      slug: "merhatzot-rudas",
      announcementTitle: "רחצה לילית בסופי שבוע",
      announcementDescription: "בריכות על הגג ו׳–ש׳ 22:00–03:00 — שעות באתר הרשמי.",
      announcementBadge: "לילה מאוחר",
    },
    ar: {
      name: "حمام روداس الحراري",
      shortDescription:
        "حمامات تركية من القرن السادس عشر تحت تل جيليرت — عافية وساونا واستحمام ليلي مطل على الدانوب.",
      longDescription:
        "روداس (Rudas Gyógyfürdő) في ساحة دوبرنتي 9 حمام عثماني تاريخي عند سفح جيليرت. يشمل أقساماً تركية وعافية وعالماً للساونا وقاعة شرب واستحمام ليلي الجمعة–السبت (22:00–03:00) على السطح. أيام الأسبوع القسم التركي منفصل حسب الجنس حتى منتصف الصباح — راجع مواعيد العمل الرسمية. تذكرة بالغ لكل المناطق من 12,000 فورنت الإثنين–الخميس و15,000 الجمعة–الأحد (2026، rudasfurdo.hu/arak); أونلاين: tickets.rudasfurdo.hu.\n\n" +
        S("Sources: https://www.rudasfurdo.hu/en https://www.rudasfurdo.hu/en/opening-hours https://www.rudasfurdo.hu/arak"),
      slug: "hamam-rudas",
      announcementTitle: "استحمام ليلي في عطلة نهاية الأسبوع",
      announcementDescription: "مسابح على السطح جمعة–سبت 22:00–03:00 — المواعيد على الموقع الرسمي.",
      announcementBadge: "وقت متأخر",
    },
  },

  "prov-budapest-park-ferencvaros": {
    hu: {
      name: "Budapest Park",
      shortDescription:
        "Dél-Pest nyílt légi koncertpark a Fábián Juli téren — aréna, teraszok, nyári szezon.",
      longDescription:
        "A Budapest Park szezonális szabadtéri helyszín dél-Pesten (Ferencváros, 1095 Budapest, Fábián Juli tér 1.), nem az óbudai Hajógyári-szigeten. Áprilistól október elejéig koncertek, DJ estek és ételárusok. Kapunyitás, ruhatár (499 Ft) és közlekedés (4/6-os villamos, H7) show-nként a budapestpark.hu oldalon.\n\n" +
        S("Sources: https://www.budapestpark.hu/en/park"),
      slug: "budapest-park",
    },
    es: {
      name: "Budapest Park",
      shortDescription:
        "Parque de conciertos al aire libre en el sur de Pest, plaza Fábián Juli — arena y terrazas.",
      longDescription:
        "Budapest Park es un recinto estacional al aire libre en el sur de Pest (Ferencváros, 1095 Budapest, Fábián Juli tér 1), no en la isla de Óbuda. Abierto aproximadamente de abril a principios de octubre. Entradas y horarios en budapestpark.hu.\n\n" +
        S("Sources: https://www.budapestpark.hu/en/park"),
      slug: "budapest-park-es",
    },
    it: {
      name: "Budapest Park",
      shortDescription:
        "Parco concerti all'aperto a Pest sud, piazza Fábián Juli — arena e terrazze.",
      longDescription:
        "Budapest Park è una venue stagionale all'aperto a Pest sud (Ferencváros, 1095 Budapest, Fábián Juli tér 1), non sull'isola di Óbuda. Aperta circa da aprile a inizio ottobre. Biglietti su budapestpark.hu.\n\n" +
        S("Sources: https://www.budapestpark.hu/en/park"),
      slug: "budapest-park-it",
    },
    he: {
      name: "בודפשט פארק",
      shortDescription:
        "פארק הופעות בחוץ בדרום פשט, כיכר פביאן יולי — זירה וטרסות.",
      longDescription:
        "בודפשט פארק הוא מתחם עונתי בחוץ בדרום פשט (Ferencváros, 1095 Budapest, Fábián Juli tér 1), לא באי אובודה. פתוח בערך מאפריל עד תחילת אוקטובר. כרטיסים ב-budapestpark.hu.\n\n" +
        S("Sources: https://www.budapestpark.hu/en/park"),
      slug: "budapest-park-he",
    },
    ar: {
      name: "بودابست بارك",
      shortDescription:
        "حديقة حفلات في الهواء الطلق جنوب بودابست، ساحة فابيان جولي.",
      longDescription:
        "بودابست بارك مكان موسمي في الهواء الطلق في جنوب بودابست (Ferencváros، 1095 Budapest، Fábián Juli tér 1) وليس في جزيرة أوبودا. مفتوح تقريباً من أبريل حتى أوائل أكتوبر. التذاكر على budapestpark.hu.\n\n" +
        S("Sources: https://www.budapestpark.hu/en/park"),
      slug: "budapest-park-ar",
    },
  },

  "prov-mng-castle-buda": {
    hu: {
      name: "Magyar Nemzeti Galéria",
      shortDescription:
        "Országos képzőművészeti múzeum a Budai Várban — állandó gyűjtemények, kupola és váltó kiállítások.",
      longDescription:
        "A Magyar Nemzeti Galéria a Budai Várban, a Szent György tér 2. szám alatt. Általános nyitvatartás: kedd–vasárnap 10:00–18:00 (pénztár 17:00-ig; utolsó belépés 17:00). A kupola időjárásfüggően nyithat. Aktuális kiállítások és jegyek: en.mng.hu.\n\n" +
        S("Sources: https://en.mng.hu/"),
      slug: "magyar-nemzeti-galeria",
    },
    es: {
      name: "Galería Nacional Húngara",
      shortDescription:
        "Museo nacional de arte en el Castillo de Buda — colecciones permanentes, cúpula y exposiciones temporales.",
      longDescription:
        "La Galería Nacional Húngara (Magyar Nemzeti Galéria) ocupa el Castillo de Buda en Szent György tér 2. Horario general: martes–domingo 10:00–18:00 (taquilla hasta 17:00; última entrada 17:00). La cúpula puede abrir según el tiempo. Exposiciones y entradas en en.mng.hu.\n\n" +
        S("Sources: https://en.mng.hu/"),
      slug: "galeria-nacional-hungara",
    },
    it: {
      name: "Galleria Nazionale Ungherese",
      shortDescription:
        "Museo nazionale d'arte al Castello di Buda — collezioni permanenti, cupola e mostre temporanee.",
      longDescription:
        "La Galleria Nazionale Ungherese (Magyar Nemzeti Galéria) occupa il Castello di Buda in Szent György tér 2. Orari: martedì–domenica 10:00–18:00 (biglietteria fino alle 17:00; ultimo ingresso 17:00). La cupola può aprire in base al meteo. Mostre e biglietti su en.mng.hu.\n\n" +
        S("Sources: https://en.mng.hu/"),
      slug: "galleria-nazionale-ungherese",
    },
    he: {
      name: "הגלריה הלאומית ההונגרית",
      shortDescription:
        "מוזיאון האמנות הלאומי בטירת בודה — אוספים קבועים, כיפה ותערוכות מתחלפות.",
      longDescription:
        "הגלריה הלאומית ההונגרית (Magyar Nemzeti Galéria) בטירת בודה, כיכר סנט גיורגי 2. שעות כלליות: שלישי–ראשון 10:00–18:00 (קופה עד 17:00; כניסה אחרונה 17:00). הכיפה עשויה להיפתח לפי מזג האוויר. תערוכות וכרטיסים ב-en.mng.hu.\n\n" +
        S("Sources: https://en.mng.hu/"),
      slug: "galeria-leumit-hungria",
    },
    ar: {
      name: "المعرض الوطني المجري",
      shortDescription:
        "المتحف الوطني للفنون في قلعة بودا — مجموعات دائمة وقبة ومعارض متناوبة.",
      longDescription:
        "يشغل المعرض الوطني المجري (Magyar Nemzeti Galéria) مجمع قلعة بودا في ساحة سانت جيورجي 2. المواعيد العامة: الثلاثاء–الأحد 10:00–18:00 (شباك التذاكر حتى 17:00؛ آخر دخول 17:00). قد تفتح القبة حسب الطقس. المعارض والتذاكر على en.mng.hu.\n\n" +
        S("Sources: https://en.mng.hu/"),
      slug: "al-maarid-al-watani-al-majari",
    },
  },

  "prov-akvarium-belvaros": {
    hu: {
      name: "Akvárium Klub",
      shortDescription:
        "Belvárosi klub az Erzsébet tér alatt — beltéri terem és kerti koncertek a Deák tértől pár lépésre.",
      longDescription:
        "Az Akvárium Klub régóta koncert- és klubhelyszín az Erzsébet tér 12. szám alatt, a Deák Ferenc tér közelében. Magyar és nemzetközi élőzenés, klubestek a főcsarnokban és a kertben. Naptár és jegyek: akvariumklub.hu.\n\n" +
        S("Sources: https://akvariumklub.hu/"),
      slug: "akvarium-klub",
    },
    es: {
      name: "Akvárium Klub",
      shortDescription:
        "Club céntrico bajo Erzsébet tér — sala interior y conciertos en el jardín junto a Deák Ferenc tér.",
      longDescription:
        "Akvárium Klub es un local de conciertos y club en Erzsébet tér 12, cerca de Deák Ferenc tér. Programa de actos en vivo húngaros e internacionales y noches de club en la sala principal y el jardín. Calendario y entradas en akvariumklub.hu.\n\n" +
        S("Sources: https://akvariumklub.hu/"),
      slug: "akvarium-klub-es",
    },
    it: {
      name: "Akvárium Klub",
      shortDescription:
        "Club nel centro sotto Erzsébet tér — sala indoor e concerti in giardino vicino a Deák Ferenc tér.",
      longDescription:
        "Akvárium Klub è una venue storica in Erzsébet tér 12, vicino a Deák Ferenc tér. Live ungheresi e internazionali e serate club nella sala principale e nel giardino. Calendario e biglietti su akvariumklub.hu.\n\n" +
        S("Sources: https://akvariumklub.hu/"),
      slug: "akvarium-klub-it",
    },
    he: {
      name: "אקווריום קלאב",
      shortDescription:
        "מועדון מרכזי מתחת לכיכר ארז'בט — אולם וחצר הופעות צעדים מדיאק פרנץ.",
      longDescription:
        "אקווריום קלאב הוא מקום הופעות ומועדון ותיק בכיכר ארז'בט 12 ליד דיאק פרנץ. תוכנית של להקות חיות הונגריות ובינלאומיות ולילות מועדון באולם הראשי ובגינה. לוח הופעות וכרטיסים ב-akvariumklub.hu.\n\n" +
        S("Sources: https://akvariumklub.hu/"),
      slug: "akvarium-klub-he",
    },
    ar: {
      name: "نادي أكفاريوم",
      shortDescription:
        "نادٍ وسط المدينة تحت ساحة إرزسيبيت — قاعة داخلية وحفلات في الحديقة قرب دياك فيرينك.",
      longDescription:
        "أكفاريوم كلوب مكان حفلات ونادٍ عريق في إرزسيبيت 12 قرب دياك فيرينك. برنامج من فرق حية مجارية ودولية وليالي نادي في القاعة الرئيسية والحديقة. التقويم والتذاكر على akvariumklub.hu.\n\n" +
        S("Sources: https://akvariumklub.hu/"),
      slug: "akvarium-klub-ar",
    },
  },

  "prov-fono-ujbuda": {
    hu: {
      name: "Fonó Budai Zene Ház",
      shortDescription:
        "Folk-, világ- és jazzklub Újbudán — esti koncertek és a Budapesti Táncház Fesztivál központja.",
      longDescription:
        "A Fonó Budai Zene Ház a Sztregova utca 3. szám alatt Budapest egyik legfontosabb folk-, world- és jazzhelyszíne, beleértve a Budapesti Táncház Fesztivál programját is. Koncertek, jegyárak, asztalfoglalás: fono.hu.\n\n" +
        S("Sources: https://fono.hu/"),
      slug: "fono-budai-zene-haz",
    },
    es: {
      name: "Fonó Budai Zene Ház",
      shortDescription:
        "Club de folk, world y jazz en Újbuda — conciertos nocturnos y sede del Festival Folk de Budapest.",
      longDescription:
        "Fonó Budai Zene Ház en Sztregova utca 3 es una de las salas clave de Budapest para folk, world y jazz, incluido el programa del Budapest Folk Festival. Fechas, precios y reservas de mesa en fono.hu.\n\n" +
        S("Sources: https://fono.hu/"),
      slug: "fono-budai-zene-haz-es",
    },
    it: {
      name: "Fonó Budai Zene Ház",
      shortDescription:
        "Club folk, world e jazz a Újbuda — concerti serali e hub del Budapest Folk Festival.",
      longDescription:
        "Fonó Budai Zene Ház in Sztregova utca 3 è una delle venue principali di Budapest per folk, world e jazz, incluso il programma del Budapest Folk Festival. Date, prezzi e prenotazioni tavoli su fono.hu.\n\n" +
        S("Sources: https://fono.hu/"),
      slug: "fono-budai-zene-haz-it",
    },
    he: {
      name: "פונו בודאי זנה האז",
      shortDescription:
        "מועדון פולק, וורלד וג'אז באוג'בודה — קונצרטים ערב ומרכז פסטיבל הפולק של בודפשט.",
      longDescription:
        "פונו בודאי זנה האז ברחוב סזטרגובה 3 הוא אחד ממוקדי הפולק, הוורלד והג'אז בבודפשט, כולל תוכנית פסטיבל הפולק. תאריכים, מחירים והזמנת שולחן ב-fono.hu.\n\n" +
        S("Sources: https://fono.hu/"),
      slug: "fono-budai-zene-haz-he",
    },
    ar: {
      name: "فونو بوداي زيني هاز",
      shortDescription:
        "نادٍ للفولك والموسيقى العالمية والجاز في أوجبودا — حفلات مسائية ومركز مهرجان الفولك في بودابست.",
      longDescription:
        "فونو بوداي زيني هاز في شارع سزتريغوفا 3 من أهم أماكن الفولك والعالمي والجاز في بودابست، بما في ذلك برنامج مهرجان الفولك. مواعيد وأسعار وحجز طاولات على fono.hu.\n\n" +
        S("Sources: https://fono.hu/"),
      slug: "fono-budai-zene-haz-ar",
    },
  },

  "prov-trafo-ferencvaros": {
    hu: {
      name: "Trafó Kortárs Művészeti Központ",
      shortDescription:
        "Kortárs színház, tánc és zene egykori transzformátorállomásban a Rákóczi tér közelében.",
      longDescription:
        "A Trafó Kortárs Művészeti Központ a Liliom utca 41. szám alatt kísérleti színházat, táncot, koncerteket és DJ programokat kínál. Szezon és jegyek: trafo.hu.\n\n" +
        S("Sources: https://trafo.hu/"),
      slug: "trafo-kortars",
    },
    es: {
      name: "Trafó House of Contemporary Arts",
      shortDescription:
        "Teatro, danza y música contemporáneos en una antigua subestación cerca de Rákóczi tér.",
      longDescription:
        "Trafó Kortárs Művészeti Központ (Trafó House of Contemporary Arts) en Liliom utca 41 presenta teatro experimental, danza, conciertos y programas DJ. Temporada y entradas en trafo.hu.\n\n" +
        S("Sources: https://trafo.hu/"),
      slug: "trafo-casa-artes",
    },
    it: {
      name: "Trafó House of Contemporary Arts",
      shortDescription:
        "Teatro, danza e musica contemporanei in un'ex sottostazione vicino a Rákóczi tér.",
      longDescription:
        "Trafó Kortárs Művészeti Központ in Liliom utca 41 propone teatro sperimentale, danza, concerti e DJ set. Programma e biglietti su trafo.hu.\n\n" +
        S("Sources: https://trafo.hu/"),
      slug: "trafo-arti-contemporanee",
    },
    he: {
      name: "בית טרפו לאמנויות עכשוויות",
      shortDescription:
        "תיאטרון, מחול ומוזיקה עכשוויים בתחנת שנאים לשעבר ליד כיכר ראקוצ'י.",
      longDescription:
        "מרכז טרפו (Trafó) ברחוב ליליום 41 מציג תיאטרון ניסיוני, מחול, קונצרטים ותוכניות DJ. עונה וכרטיסים ב-trafo.hu.\n\n" +
        S("Sources: https://trafo.hu/"),
      slug: "trafo-omanuyot-akhshavit",
    },
    ar: {
      name: "ترافو بيت الفنون المعاصرة",
      shortDescription:
        "مسرح ورقص وموسيقى معاصرة في محطة محولات سابقة قرب ساحة راكوتشي.",
      longDescription:
        "مركز ترافو (Trafó) في ليليوم 41 يقدم مسرحاً تجريبياً ورقصاً وحفلات وبرامج DJ. الموسم والتذاكر على trafo.hu.\n\n" +
        S("Sources: https://trafo.hu/"),
      slug: "trafo-funun-muasira",
    },
  },

  "prov-opera-terezvaros": {
    hu: {
      name: "Magyar Állami Operaház",
      shortDescription:
        "Neoreneszánsz operaház az Andrássy úton — opera, balett és épületbemutató túrák.",
      longDescription:
        "A Magyar Állami Operaház az Andrássy út 22. szám alatt Budapest opera- és balettközpontja. Előadások és épületi túrák: opera.hu.\n\n" +
        S("Sources: https://www.opera.hu/"),
      slug: "magyar-allami-operahaz",
    },
    es: {
      name: "Ópera Estatal Húngara",
      shortDescription:
        "Ópera neorrenacentista en Andrássy út — ópera, ballet y visitas guiadas al edificio.",
      longDescription:
        "La Ópera Estatal Húngara (Magyar Állami Operaház) en Andrássy út 22 es la casa histórica de ópera y ballet en Budapest. Funciones y visitas en opera.hu.\n\n" +
        S("Sources: https://www.opera.hu/"),
      slug: "opera-estatal-hungara",
    },
    it: {
      name: "Opera di Stato Ungherese",
      shortDescription:
        "Teatro dell'opera neorinascimentale su Andrássy út — opera, balletto e visite guidate.",
      longDescription:
        "L'Opera di Stato Ungherese (Magyar Állami Operaház) in Andrássy út 22 è la sede storica di opera e balletto a Budapest. Spettacoli e visite su opera.hu.\n\n" +
        S("Sources: https://www.opera.hu/"),
      slug: "opera-stato-ungherese",
    },
    he: {
      name: "האופרה הממלכתית ההונגרית",
      shortDescription:
        "בית אופרה ניאו-רנסנס ברחוב אנדרסי — אופרה, בלט וסיורים מודרכים בבניין.",
      longDescription:
        "האופרה הממלכתית ההונגרית (Magyar Állami Operaház) באנדרסי 22 היא בית האופרה והבלט ההיסטורי בבודפשט. הופעות וסיורים ב-opera.hu.\n\n" +
        S("Sources: https://www.opera.hu/"),
      slug: "ha-opera-ha-mamlakhtit",
    },
    ar: {
      name: "الأوبرا الحكومية المجرية",
      shortDescription:
        "دار أوبرا نيوكلاسيكية في شارع أندراسي — أوبرا وباليه وجولات في المبنى.",
      longDescription:
        "الأوبرا الحكومية المجرية (Magyar Állami Operaház) في أندراسي 22 هي موطن الأوبرا والباليه التاريخي في بودابست. العروض والجولات على opera.hu.\n\n" +
        S("Sources: https://www.opera.hu/"),
      slug: "al-opera-al-hukumiya",
    },
  },

  "prov-momkult-ujbuda": {
    hu: {
      name: "MOM Kulturális Központ",
      shortDescription:
        "Bauhaus kulturális központ a budai hegyekben — színház, koncertek és udvari programok.",
      longDescription:
        "A MOM Kulturális Központ a Csörsz utca 18. szám alatt védett Bauhaus épület 650 fős színházzal, kupolateremmel és szabadtéri színpaddal. Jegyiroda és programok: momkult.hu; jegyek: jegy@momkult.hu.\n\n" +
        S("Sources: https://momkult.hu/"),
      slug: "mom-kulturalis-kozpont",
    },
    es: {
      name: "Centro Cultural MOM",
      shortDescription:
        "Centro cultural Bauhaus en las colinas de Buda — teatro, conciertos y eventos en el patio.",
      longDescription:
        "MOM Kulturális Központ (Centro Cultural MOM) en Csörsz utca 18 es un edificio Bauhaus protegido con teatro de 650 plazas, sala cúpula y escenario exterior. Taquilla y programación en momkult.hu; entradas: jegy@momkult.hu.\n\n" +
        S("Sources: https://momkult.hu/"),
      slug: "centro-cultural-mom",
    },
    it: {
      name: "Centro Culturale MOM",
      shortDescription:
        "Centro culturale Bauhaus sulle colline di Buda — teatro, concerti ed eventi nel cortile.",
      longDescription:
        "MOM Kulturális Központ in Csörsz utca 18 è un edificio Bauhaus tutelato con teatro da 650 posti, sala cupola e palco esterno. Biglietteria e programma su momkult.hu; biglietti: jegy@momkult.hu.\n\n" +
        S("Sources: https://momkult.hu/"),
      slug: "centro-culturale-mom",
    },
    he: {
      name: "מרכז תרבות MOM",
      shortDescription:
        "מרכז תרבות באוהאוס גבעות בודה — תיאטרון, קונצרטים ואירועים בחצר.",
      longDescription:
        "מרכז MOM (MOM Kulturális Központ) ברחוב צ'ורס 18 הוא מבנה באוהאוס מוגן עם תיאטרון ל-650 מושבים, אולם כיפה ובמה חיצונית. שעות קופה ותוכנית ב-momkult.hu; כרטיסים: jegy@momkult.hu.\n\n" +
        S("Sources: https://momkult.hu/"),
      slug: "merkaz-tarbut-mom",
    },
    ar: {
      name: "مركز MOM الثقافي",
      shortDescription:
        "مركز ثقافي باوهاوس في تلال بودا — مسرح وحفلات وفعاليات في الفناء.",
      longDescription:
        "مركز MOM الثقافي (MOM Kulturális Központ) في تشورس 18 مبنى باوهاوس محمي بمسرح 650 مقعداً وقاعة قبة ومسرح خارجي. شباك التذاكر والبرنامج على momkult.hu؛ التذاكر: jegy@momkult.hu.\n\n" +
        S("Sources: https://momkult.hu/"),
      slug: "markaz-mom-althaqafi",
    },
  },

  "prov-barba-negra-ujbuda": {
    hu: {
      name: "Barba Negra Live Club",
      shortDescription:
        "Nagy kapacitású koncertcsarnok a Duna partján — rock, metal és pop turnék, jegyek 3 990 Ft-tól.",
      longDescription:
        "A Barba Negra Live Club a Neumann János utca 4. szám alatt nagyobb magyar és nemzetközi turnékat fogad. A nyilvános program show-nkénti jegyárakat listáz (sok 3 990 Ft-tól a barbanegra.hu-n). A pricePerClass a legalacsonyabb feltüntetett belépőt jelzi.\n\n" +
        S("Sources: https://www.barbanegra.hu/"),
      slug: "barba-negra-live",
    },
    es: {
      name: "Barba Negra Live Club",
      shortDescription:
        "Sala de conciertos de gran capacidad junto al Danubio — giras rock, metal y pop, entradas desde 3 990 HUF.",
      longDescription:
        "Barba Negra Live Club en Neumann János utca 4 acoge giras importantes húngaras e internacionales. El programa público lista precios por función (muchos desde 3 990 HUF en barbanegra.hu). pricePerClass usa la entrada mínima publicada.\n\n" +
        S("Sources: https://www.barbanegra.hu/"),
      slug: "barba-negra-live-es",
    },
    it: {
      name: "Barba Negra Live Club",
      shortDescription:
        "Sala concerti di grande capacità sul Danubio — tour rock, metal e pop, biglietti da 3 990 HUF.",
      longDescription:
        "Barba Negra Live Club in Neumann János utca 4 ospita grandi tour ungheresi e internazionali. Il programma elenca prezzi per show (molti da 3 990 HUF su barbanegra.hu). pricePerClass indica il prezzo minimo pubblicato.\n\n" +
        S("Sources: https://www.barbanegra.hu/"),
      slug: "barba-negra-live-it",
    },
    he: {
      name: "ברבה נגרה לייב קלאב",
      shortDescription:
        "אולם הופעות גדול על הדנובה — סיבובי רוק, מטאל ופופ, כרטיסים מ-3,990 פורינט.",
      longDescription:
        "ברבה נגרה לייב קלאב ברחוב נוימן יאנוש 4 מארח סיבובי הופעות גדולים בהונגריה ובחו\"ל. התוכנית הציבורית מפרטת מחירים לפי מופע (רבים מ-3,990 פורינט ב-barbanegra.hu). pricePerClass משקף את מחיר הכניסה המינימלי המפורסם.\n\n" +
        S("Sources: https://www.barbanegra.hu/"),
      slug: "barba-negra-live-he",
    },
    ar: {
      name: "باربا نيغرا لايف كلوب",
      shortDescription:
        "قاعة حفلات كبيرة على الدانوب — جولات روك وميتال وبوب، تذاكر من 3,990 فورنت.",
      longDescription:
        "باربا نيغرا لايف كلوب في نيومان يانوش 4 تستضيف جولات كبرى محلية ودولية. البرنامج العام يسعر كل عرض (كثير منها من 3,990 فورنت على barbanegra.hu). pricePerClass يعكس أقل سعر دخول مدرج.\n\n" +
        S("Sources: https://www.barbanegra.hu/"),
      slug: "barba-negra-live-ar",
    },
  },

  "prov-okk-obuda": {
    hu: {
      name: "Óbudai Kulturális Központ",
      shortDescription:
        "Kerületi kulturális központ Óbudán — színház, koncertek és közösségi programok több helyszínen.",
      longDescription:
        "Az Óbudai Kulturális Központ a San Marco utca 81. szám alatt színházi, zenei és családi programokat szervez Óbudán és partnerhelyszíneken. Jegyek: kulturkozpont.hu; iroda (06-1) 388-7370 hétköznap 9:00–17:00.\n\n" +
        S("Sources: https://kulturkozpont.hu/"),
      slug: "obudai-kulturalis-kozpont",
    },
    es: {
      name: "Centro Cultural de Óbuda",
      shortDescription:
        "Centro cultural distrital en Óbuda — teatro, conciertos y programas comunitarios en varios espacios.",
      longDescription:
        "Óbudai Kulturális Központ (Centro Cultural de Óbuda) en San Marco utca 81 programa teatro, música y eventos familiares en Óbuda y sedes asociadas. Entradas en kulturkozpont.hu; oficina (06-1) 388-7370 lun–vie 9:00–17:00.\n\n" +
        S("Sources: https://kulturkozpont.hu/"),
      slug: "centro-cultural-obuda",
    },
    it: {
      name: "Centro Culturale di Óbuda",
      shortDescription:
        "Centro culturale di quartiere a Óbuda — teatro, concerti e programmi comunitari in più sedi.",
      longDescription:
        "Óbudai Kulturális Központ in San Marco utca 81 organizza teatro, musica ed eventi per famiglie a Óbuda e in sedi partner. Biglietti su kulturkozpont.hu; ufficio (06-1) 388-7370 lun–ven 9:00–17:00.\n\n" +
        S("Sources: https://kulturkozpont.hu/"),
      slug: "centro-culturale-obuda",
    },
    he: {
      name: "מרכז התרבות של אובודה",
      shortDescription:
        "מרכז תרבות מחוזי באובודה — תיאטרון, קונצרטים ותוכניות קהילתיות במספר מיקומים.",
      longDescription:
        "מרכז אובודה (Óbudai Kulturális Központ) ברחוב סן מרקו 81 מתכנן תיאטרון, מוזיקה ואירועי משפחה באובודה ובבתי שותף. כרטיסים ב-kulturkozpont.hu; משרד (06-1) 388-7370 ב׳–ה׳ 9:00–17:00.\n\n" +
        S("Sources: https://kulturkozpont.hu/"),
      slug: "merkaz-tarbut-obuda",
    },
    ar: {
      name: "المركز الثقافي في أوبودا",
      shortDescription:
        "مركز ثقافي حي في أوبودا — مسرح وحفلات وبرامج مجتمعية في عدة مواقع.",
      longDescription:
        "المركز الثقافي في أوبودا (Óbudai Kulturális Központ) في سان ماركو 81 يبرمج مسرحاً وموسيقى وفعاليات عائلية في أوبودا وشركاء. التذاكر على kulturkozpont.hu؛ المكتب (06-1) 388-7370 الإثنين–الجمعة 9:00–17:00.\n\n" +
        S("Sources: https://kulturkozpont.hu/"),
      slug: "al-markaz-althaqafi-obuda",
    },
  },

  "prov-mupa-ferencvaros": {
    hu: {
      name: "MÜPA Budapest",
      shortDescription:
        "Művészetek Palotája a Dunán — Bartók Nemzeti Koncertterem, Ludwig Múzeum és fesztiválprogramok.",
      longDescription:
        "A MÜPA Budapest a Komor Marcell utca 1. szám alatt klasszikus, jazz, world, tánc és kortárs programokat kínál a Bartók Nemzeti Koncertteremben és más termekben, valamint a Ludwig Múzeumban. Jegyek és műsor: mupa.hu.\n\n" +
        S("Sources: https://www.mupa.hu/en"),
      slug: "mupa-budapest",
    },
    es: {
      name: "MÜPA Budapest",
      shortDescription:
        "Palacio de las Artes en el Danubio — sala Bartók, Museo Ludwig y festivales.",
      longDescription:
        "MÜPA Budapest (Palacio de las Artes) en Komor Marcell utca 1 acoge programas clásicos, jazz, world, danza y contemporáneos en la Sala Nacional de Conciertos Bartók y otras salas, además del Museo Ludwig. Entradas y cartelera en mupa.hu.\n\n" +
        S("Sources: https://www.mupa.hu/en"),
      slug: "mupa-budapest-es",
    },
    it: {
      name: "MÜPA Budapest",
      shortDescription:
        "Palazzo delle Arti sul Danubio — sala Bartók, Museo Ludwig e festival.",
      longDescription:
        "MÜPA Budapest in Komor Marcell utca 1 ospita classica, jazz, world, danza e contemporaneo nella Sala Nazionale Bartók e altre sale, oltre al Museo Ludwig. Biglietti e programma su mupa.hu.\n\n" +
        S("Sources: https://www.mupa.hu/en"),
      slug: "mupa-budapest-it",
    },
    he: {
      name: "מופה בודפשט",
      shortDescription:
        "ארמון האמנויות על הדנובה — אולם בארטוק, מוזיאון לודוויג ופסטיבלים.",
      longDescription:
        "מופה בודפשט (MÜPA) ברחוב קומור מרסל 1 מציע קלאסי, ג'אז, world, מחול ותוכניות עכשוויות באולם הקונצרטים הלאומי בארטוק ובאולמות נוספים, וכן במוזיאון לודוויג. כרטיסים ולוח הופעות ב-mupa.hu.\n\n" +
        S("Sources: https://www.mupa.hu/en"),
      slug: "mupa-budapest-he",
    },
    ar: {
      name: "موبا بودابست",
      shortDescription:
        "قصر الفنون على الدانوب — قاعة بارتوك ومتحف لودفيج ومهرجانات.",
      longDescription:
        "موبا بودابست (MÜPA) في كومور مارسيل 1 يستضيف برامج كلاسيكية وجاز وعالمية ورقصاً ومعاصرة في قاعة بارتوك الوطنية وقاعات أخرى، إضافة إلى متحف لودفيج. التذاكر والبرنامج على mupa.hu.\n\n" +
        S("Sources: https://www.mupa.hu/en"),
      slug: "mupa-budapest-ar",
    },
  },
};

module.exports = { LOCALES_BY_ID };
