const localeEntry = (name, short, long, slug) => ({ name, short, long, slug });

const COV_EVENT_I18N = {
  'prov-cov-pesti-vigado-vaci': {
    hu: localeEntry(
      "Pesti Vigadó",
      "Történelmi koncertterem a Vigadó téren, klasszikus, jazz- és gálaműsorokkal a Duna partján.",
      "A Pesti Vigadó 19. századi koncerthelyszín a Vigadó ter 2. alatt, a pesti rakparton, a Váci utca közelében. Műsorán szimfonikus koncertek, operettaelőadások és jazzestek szerepelnek a reprezentatív termeiben. A program és a jegypénztár nyitvatartása a vigado.hu oldalon található.",
      "pesti-vigado-hu"
    ),
    es: localeEntry(
      "Pesti Vigadó",
      "Sala de conciertos historica en Vigado ter, con musica clasica, jazz y galas frente al Danubio.",
      "Pesti Vigado es una sala de conciertos del siglo XIX en Vigado ter 2, junto al muelle de Pest y cerca de Vaci utca. La programacion incluye conciertos sinfonicos, opereta y jazz en sus grandes salones. Consulta el calendario y los horarios de taquilla en vigado.hu.",
      "vigado-pesti-es"
    ),
    it: localeEntry(
      "Pesti Vigadó",
      "Storica sala da concerto in Vigado ter, con classica, jazz e serate di gala affacciate sul Danubio.",
      "Pesti Vigado e una sala da concerto del XIX secolo in Vigado ter 2, lungo il lungodanubio di Pest vicino a Vaci utca. Il programma comprende concerti sinfonici, operetta e jazz nelle sale principali. Calendario e orari della biglietteria sono disponibili su vigado.hu.",
      "vigado-pesti-it"
    ),
    he: localeEntry(
      "Pesti Vigadó",
      "אולם קונצרטים היסטורי בכיכר ויגאדו, עם מוזיקה קלאסית, ג׳אז ומופעי גאלה מול הדנובה.",
      "Pesti Vigado הוא אולם קונצרטים מהמאה ה-19 ב-Vigado ter 2, על גדת פשט סמוך ל-Vaci utca. התוכנית כוללת קונצרטים סימפוניים, אופרטה וג׳אז באולמות המפוארים. את לוח המופעים ושעות הקופה אפשר לבדוק ב-vigado.hu.",
      "pesti-vigado-he"
    ),
    ar: localeEntry(
      "Pesti Vigadó",
      "قاعة حفلات تاريخية في ساحة فيغادو تقدم الموسيقى الكلاسيكية والجاز وعروض الغالا على ضفة الدانوب.",
      "يعد Pesti Vigado قاعة حفلات من القرن التاسع عشر في Vigado ter 2 على كورنيش بيشت قرب Vaci utca. يشمل البرنامج حفلات سيمفونية وأوبريت وأمسيات جاز في القاعات الكبرى. يمكن الاطلاع على البرنامج وساعات شباك التذاكر عبر vigado.hu.",
      "pesti-vigado-ar"
    ),
  },
  'prov-cov-parliament-visitor': {
    hu: localeEntry(
      "Országház Látogatóközpont",
      "Vezetett séták a neogótikus Országházban, a koronázási ereklyékkel és a Duna felőli termeivel a Kossuth téren.",
      "Az Országház Látogatóközpont időponthoz kötött vezetéseket kínál a Duna-parti épületegyüttesben a Kossuth Lajos téren. A látogatók megnézhetik a kupolacsarnokot, a koronázási ereklyeket és az üléstermeket többnyelvű vezetéssel. Jegyet a hivatalos parlament.hu oldalon lehet foglalni.",
      "orszaghaz-latogatokozpont-hu"
    ),
    es: localeEntry(
      "Centro de Visitantes del Parlamento Hungaro",
      "Visitas guiadas por el Parlamento neogotico, con las joyas de la corona y salones junto al Danubio en Kossuth ter.",
      "El Centro de Visitantes del Parlamento Hungaro ofrece recorridos con horario fijo por el edificio junto al rio en Kossuth Lajos ter. Los visitantes ven la Sala de la Cupula, las joyas de la corona y las salas parlamentarias con guias multilingues. Las entradas se reservan en la web oficial parlament.hu.",
      "parlamento-budapest-es"
    ),
    it: localeEntry(
      "Centro Visitatori del Parlamento Ungherese",
      "Visite guidate nel Parlamento neogotico, con i gioielli della corona e sale sul lungofiume accanto a Kossuth ter.",
      "Il Centro Visitatori del Parlamento Ungherese propone visite a orario nel palazzo sul fiume di Kossuth Lajos ter. I visitatori vedono la Sala della Cupola, i gioielli della corona e le sale delle sedute con guide multilingue. I biglietti si prenotano sul sito ufficiale parlament.hu.",
      "parlamento-budapest-it"
    ),
    he: localeEntry(
      "מרכז המבקרים של הפרלמנט ההונגרי",
      "סיורים מודרכים בפרלמנט הנאו-גותי, עם תכשיטי הכתר ואולמות על שפת הנהר ליד כיכר קושוט.",
      "מרכז המבקרים של הפרלמנט ההונגרי מציע סיורים בשעות קבועות בבניין שעל שפת הנהר בכיכר קושוט לאיוש. המבקרים רואים את אולם הכיפה, את תכשיטי הכתר ואת אולמות הדיונים עם מדריכים רב-לשוניים. כרטיסים מזמינים באתר הרשמי parlament.hu.",
      "hungarian-parliament-he"
    ),
    ar: localeEntry(
      "مركز زوار البرلمان المجري",
      "جولات مرافقة داخل البرلمان القوطي الجديد مع جواهر التاج والقاعات المطلة على النهر بجوار ساحة كوشوت.",
      "يوفر مركز زوار البرلمان المجري جولات بمواعيد محددة داخل المبنى النهري في Kossuth Lajos ter. يشاهد الزوار قاعة القبة وجواهر التاج وقاعات الجلسات مع مرشدين متعددَي اللغات. يمكن حجز التذاكر عبر الموقع الرسمي parlament.hu.",
      "hungarian-parliament-ar"
    ),
  },
  'prov-cov-danube-palace-prom': {
    hu: localeEntry(
      "Duna Palota",
      "Népzenei és klasszikus estek helyszínén a Duna-korzonal, esti előadásokkal a folyó parti sétány közelében.",
      "A Duna Palota a Zrínyi utca 5. alatt magyar nepi együtteseknek és szalonkoncerteknek ad otthont, pár lépésre a pesti rakpart sétányatol. A szokásos műsorcsomagok tobb rövid produkciót foglalnak magukba a történelmi bálteremben. Foglalás a danubepalace.hu oldalon.",
      "duna-palota-hu"
    ),
    es: localeEntry(
      "Palacio del Danubio",
      "Sede de espectaculos folkloricos y clasicos en el paseo del Danubio, con funciones nocturnas cerca del rio.",
      "Danube Palace, en Zrinyi utca 5, acoge conjuntos folcloricos hungaros y conciertos de salon a pocos pasos del paseo del muelle de Pest. Los paquetes habituales incluyen varios actos breves en el historico salon de baile. Reserva en danubepalace.hu.",
      "palacio-del-danubio-es"
    ),
    it: localeEntry(
      "Palazzo del Danubio",
      "Sala per spettacoli folk e classici sul lungodanubio, con esibizioni serali vicino alla passeggiata sul fiume.",
      "Il Danube Palace in Zrinyi utca 5 ospita ensemble folk ungheresi e concerti da salotto a pochi passi dalla passeggiata sul lungofiume di Pest. I pacchetti standard includono piu numeri brevi nello storico salone da ballo. Prenotazioni su danubepalace.hu.",
      "palazzo-del-danubio-it"
    ),
    he: localeEntry(
      "ארמון הדנובה",
      "מקום למופעי פולקלור ומוזיקה קלאסית בטיילת הדנובה, עם הופעות ערב סמוך להליכה על הנהר.",
      "Danube Palace ב-Zrinyi utca 5 מארח הרכבי פולקלור הונגריים וקונצרטים סלוניים במרחק צעדים מטיילת הגדה של פשט. חבילות המופע הרגילות כוללות כמה קטעים קצרים באולם הנשפים ההיסטורי. הזמנות ב-danubepalace.hu.",
      "danube-palace-he"
    ),
    ar: localeEntry(
      "قصر الدانوب",
      "مكان لعروض الفولكلور والموسيقى الكلاسيكية على ممشى الدانوب مع عروض مسائية قرب الواجهة النهرية.",
      "يستضيف Danube Palace في Zrinyi utca 5 فرق الفولكلور المجري وحفلات الصالون على بعد خطوات من ممشى ضفة بيشت. تشمل باقات العروض المعتادة عدة فقرات قصيرة داخل قاعة الرقص التاريخية. الحجز عبر danubepalace.hu.",
      "danube-palace-ar"
    ),
  },
  'prov-cov-basilica-inner': {
    hu: localeEntry(
      "Szent István-bazilika koncertek",
      "Orgona- és klasszikus koncertek a Szent István-bazilikában, az Inner City ikonikus kupolaja alatt.",
      "A Szent István-bazilika jegyes orgona- és kamarazenei koncerteket rendez a kupola alatt a Szent István téren. A látogatók egy toronylatogatast is osszekapcsolhatnak egy esti hangversennyel a belváros sziveben. A menetrend és a jegyek a bazilika.biz oldalon elérhetőek el.",
      "bazilika-koncertek-hu"
    ),
    es: localeEntry(
      "Conciertos de la Basilica de San Esteban",
      "Conciertos de organo y musica clasica dentro de la Basilica de San Esteban, bajo su cupula emblemática del centro.",
      "La Basilica de San Esteban ofrece conciertos de organo y de camara bajo la cupula en Szent Istvan ter. Los visitantes pueden combinar la subida a la torre con un recital nocturno en pleno centro. Horarios y entradas se venden en bazilika.biz.",
      "basilica-san-esteban-es"
    ),
    it: localeEntry(
      "Concerti della Basilica di Santo Stefano",
      "Concerti d organo e musica classica nella Basilica di Santo Stefano, sotto la cupola simbolo del centro.",
      "La Basilica di Santo Stefano ospita concerti a pagamento di organo e musica da camera sotto la cupola in Szent Istvan ter. I visitatori possono abbinare la visita alla torre a un recital serale nel cuore del centro. Orari e biglietti sono disponibili su bazilika.biz.",
      "basilica-santo-stefano-it"
    ),
    he: localeEntry(
      "קונצרטים בבזיליקת אישטוון הקדוש",
      "קונצרטי עוגב ומוזיקה קלאסית בתוך בזיליקת אישטוון הקדוש, מתחת לכיפה האיקונית של מרכז העיר.",
      "בזיליקת אישטוון הקדוש מארחת קונצרטי עוגב ומוזיקה קאמרית בתשלום מתחת לכיפה שב-Szent Istvan ter. אפשר לשלב ביקור במגדל עם רסיטל ערב בלב העיר הפנימית. לוחות זמנים וכרטיסים זמינים דרך bazilika.biz.",
      "st-stephen-basilica-he"
    ),
    ar: localeEntry(
      "حفلات بازيليك القديس إسطفان",
      "حفلات أورغن وموسيقى كلاسيكية داخل بازيليك القديس إسطفان تحت القبة الشهيرة في قلب المدينة.",
      "تستضيف بازيليك القديس إسطفان حفلات أورغن وموسيقى حجرة مدفوعة التذاكر تحت القبة في Szent Istvan ter. يمكن للزوار الجمع بين صعود البرج وأمسية موسيقية في قلب المدينة الداخلية. المواعيد والتذاكر متاحة عبر bazilika.biz.",
      "st-stephen-basilica-ar"
    ),
  },
  'prov-cov-operetta-andrassy': {
    hu: localeEntry(
      "Budapesti Operettszínház",
      "Nagy operettszínház az Andrássy uton, musicalekkel, operettekkel és gala-premierekkel az UNESCO-sugaruton.",
      "A Budapesti Operettszínház az Andrássy ut 17. alatt magyar és nemzetközi musicalprodukciokat játssza egy díszes 19. századi teremben. Elhelyezkedese az Oktogon és az Opera metróállomás között van az avenue tengelyen. Jegyek és évadfüzet az operettszínház.hu oldalon.",
      "budapesti-operettszinhaz-hu"
    ),
    es: localeEntry(
      "Teatro de Opereta de Budapest",
      "Gran teatro de opereta en Andrassy ut, con musicales, operetas y estrenos de gala en una avenida UNESCO.",
      "El Teatro de Opereta de Budapest, en Andrassy ut 17, presenta producciones musicales hungaras e internacionales en una elegante sala del siglo XIX. Su ubicacion queda entre Oktogon y la estacion de Opera. Entradas y programa de temporada en operettszinhaz.hu.",
      "teatro-opereta-budapest-es"
    ),
    it: localeEntry(
      "Teatro dell Operetta di Budapest",
      "Grande teatro dell operetta su Andrassy ut, con musical, operette e prime di gala in un viale UNESCO.",
      "Il Teatro dell Operetta di Budapest, in Andrassy ut 17, mette in scena produzioni musicali ungheresi e internazionali in un elegante salone del XIX secolo. Si trova tra Oktogon e la fermata metro Opera. Biglietti e brochure di stagione su operettszinhaz.hu.",
      "operetta-andrassy-it"
    ),
    he: localeEntry(
      "תיאטרון האופרטה של בודפשט",
      "בית אופרטה מפואר בשדרת אנדראשי, עם מחזות זמר, אופרטות והפקות גאלה בשדרה המוכרת על ידי אונסקו.",
      "תיאטרון האופרטה של בודפשט ב-Andrassy ut 17 מעלה הפקות מוזיקליות הונגריות ובינלאומיות באולם מעוטר מהמאה ה-19. המיקום שלו נמצא בין אוקטוגון לתחנת המטרו Opera. כרטיסים וחוברות עונה זמינים ב-operettszinhaz.hu.",
      "budapest-operetta-he"
    ),
    ar: localeEntry(
      "مسرح الأوبريت في بودابست",
      "مسرح أوبريت كبير على Andrassy ut يقدم المسرحيات الغنائية والأوبريتات والعروض الافتتاحية الاحتفالية في شارع مدرج لدى اليونسكو.",
      "يقدم مسرح الأوبريت في بودابست في Andrassy ut 17 إنتاجات موسيقية مجرية ودولية داخل قاعة مزخرفة من القرن التاسع عشر. يقع بين Oktogon ومحطة مترو Opera. التذاكر وكتيبات الموسم متاحة عبر operettszinhaz.hu.",
      "budapest-operetta-ar"
    ),
  },
  'prov-cov-orkeny-oktogon': {
    hu: localeEntry(
      "Örkény Színház",
      "Kamaraszínház az Oktogon közelében, kortárs drámákkal és kabare-előadásokkal a Nagykörút csomópontja mellett.",
      "Az Örkény Színház a Madách Imre téren éles hangvételű magyar kortárs darabokat és kisebb léptékű előadásokat mutat be az Oktogon közelében. Az intim néző ter közeli ralátást ad a színpadra. Program és jegyek az orkeny.hu oldalon.",
      "orkeny-szinhaz-hu"
    ),
    es: localeEntry(
      "Teatro Orkeny",
      "Teatro de camara junto a Oktogon, con drama contemporaneo y cabaret a pasos del cruce del Gran Bulevar.",
      "El Teatro Orkeny, en Madach Imre ter, presenta teatro hungaro contemporaneo y producciones de pequeno formato junto al nudo de Oktogon. La sala intima mantiene una vision muy cercana del escenario. Programa y entradas en orkeny.hu.",
      "teatro-orkeny-es"
    ),
    it: localeEntry(
      "Teatro Orkeny",
      "Teatro da camera presso Oktogon, con dramma contemporaneo e cabaret a pochi passi dall incrocio del Gran Boulevard.",
      "Il Teatro Orkeny in Madach Imre ter propone taglienti opere contemporanee ungheresi e produzioni di piccola scala accanto al nodo di Oktogon. La sala intima garantisce una visuale ravvicinata del palco. Programma e biglietti su orkeny.hu.",
      "teatro-orkeny-it"
    ),
    he: localeEntry(
      "תיאטרון אורקני",
      "תיאטרון קאמרי ליד אוקטוגון, עם דרמה עכשווית וקברט במרחק צעדים מצומת השדרה הגדולה.",
      "תיאטרון אורקני ב-Madach Imre ter מעלה מחזות הונגריים עכשוויים חדים והפקות בקנה מידה קטן ליד צומת Oktogon. האולם האינטימי שומר על קו ראייה קרוב לבמה. התוכנית והכרטיסים באתר orkeny.hu.",
      "orkeny-theatre-he"
    ),
    ar: localeEntry(
      "مسرح أوركيني",
      "مسرح حميم قرب Oktogon يقدم الدراما المعاصرة والكباريه على بعد خطوات من تقاطع الجادة الكبرى.",
      "يقدم مسرح أوركيني في Madach Imre ter أعمالا مجرية معاصرة حادة وإنتاجات صغيرة الحجم بجوار عقدة Oktogon. تحافظ القاعة الحميمة على رؤية قريبة من الخشبة. البرنامج والتذاكر على orkeny.hu.",
      "orkeny-theatre-ar"
    ),
  },
  'prov-cov-kuplung-kiraly': {
    hu: localeEntry(
      "Kuplung",
      "Indie koncertbar a Király utcaban, eméleti galeriaval és bulinegyedi koncertnaptárral.",
      "A Kuplung a Király utca 46. alatt egy pincebeli előzenei helyszint egyesit egy eméleti galerias barral. A programban magyar indie zenekarok és tematikus klubbulik szerepelnek, a Király utca éjszakai életének közepén. A fellistasok a kuplung.hu oldalon találhatók.",
      "kuplung-hu"
    ),
    es: localeEntry(
      "Kuplung",
      "Bar de conciertos indie en Kiraly utca, con galeria arriba y agenda de directos en el distrito de fiesta.",
      "Kuplung, en Kiraly utca 46, combina una sala de musica en vivo en el sotano con un bar-galeria en la planta superior. El programa incluye bandas indie hungaras y noches de club tematicas en pleno ambiente nocturno de Kiraly utca. Cartelera en kuplung.hu.",
      "kuplung-es"
    ),
    it: localeEntry(
      "Kuplung",
      "Bar da concerti indie in Kiraly utca, con galleria al piano superiore e calendario live nel quartiere della movida.",
      "Kuplung, in Kiraly utca 46, unisce un locale di musica dal vivo nel seminterrato a un bar-galleria al piano superiore. Il programma propone band indie ungheresi e serate club a tema nel cuore della nightlife di Kiraly utca. Programmazione su kuplung.hu.",
      "kuplung-it"
    ),
    he: localeEntry(
      "Kuplung",
      "בר הופעות אינדי ברחוב Kiraly, עם גלריה בקומה העליונה ולוח הופעות בלב אזור הבילויים.",
      "Kuplung ב-Kiraly utca 46 משלב אולם מוזיקה חיה במרתף עם בר-גלריה בקומה העליונה. התוכנית כוללת להקות אינדי הונגריות ולילות מועדון נושאיים במרכז חיי הלילה של Kiraly utca. הרשימות מופיעות ב-kuplung.hu.",
      "kuplung-he"
    ),
    ar: localeEntry(
      "Kuplung",
      "بار حفلات إندي في Kiraly utca مع غاليري في الطابق العلوي وجدول عروض في قلب منطقة السهر.",
      "يجمع Kuplung في Kiraly utca 46 بين مساحة موسيقى حية في القبو وبار-غاليري في الطابق العلوي. يتضمن البرنامج فرقا إندي مجرية وليالي نادٍ ذات طابع خاص في قلب الحياة الليلية لشارع Kiraly. قائمة الفعاليات على kuplung.hu.",
      "kuplung-ar"
    ),
  },
  'prov-cov-liszt-academy': {
    hu: localeEntry(
      "Liszt Ferenc Zeneművészeti Egyetem",
      "Szecessziós koncertakademia a Liszt Ferenc téren, klasszikus recitalokkal és mesterkurzusok termeivel.",
      "A Liszt Ferenc Akademia koncertkozpontja a Liszt Ferenc ter 8. alatt hallgatoi és professzionalis klasszikus előadásoknak ad otthont egy ikonikus szecesszios teremben. Előadások elott a külső ter éttermek teraszaival telik meg. A naptár a liszacademy.hu oldalon van.",
      "liszt-akademia-hu"
    ),
    es: localeEntry(
      "Academia Ferenc Liszt",
      "Academia de conciertos art nouveau en Liszt Ferenc ter, con recitales clasicos y actos en salas de masterclasses.",
      "El Centro de Conciertos de la Academia Ferenc Liszt, en Liszt Ferenc ter 8, acoge actuaciones clasicas de estudiantes y profesionales en una sala art nouveau emblemática. Antes de las funciones, la plaza se llena de terrazas de restaurantes. Calendario en liszacademy.hu.",
      "academia-liszt-es"
    ),
    it: localeEntry(
      "Accademia Ferenc Liszt",
      "Accademia concertistica art nouveau in Liszt Ferenc ter, con recital classici e eventi nelle sale delle masterclass.",
      "Il Centro Concerti dell Accademia Ferenc Liszt, in Liszt Ferenc ter 8, ospita esibizioni classiche di studenti e professionisti in una storica sala art nouveau. Prima degli spettacoli la piazza si riempie di tavoli all aperto. Calendario su liszacademy.hu.",
      "accademia-liszt-it"
    ),
    he: localeEntry(
      "אקדמיית פרנץ ליסט",
      "אקדמיית קונצרטים בסגנון אר נובו בכיכר ליסט פרנץ, עם רסיטלים קלאסיים ואירועים באולמות מאסטרקלאס.",
      "מרכז הקונצרטים של אקדמיית פרנץ ליסט ב-Liszt Ferenc ter 8 מארח הופעות קלאסיות של סטודנטים ומקצוענים באולם אר נובו מפורסם. הכיכר בחוץ מתמלאת טרסות מסעדות לפני תחילת המופע. לוח האירועים נמצא ב-liszacademy.hu.",
      "liszt-academy-he"
    ),
    ar: localeEntry(
      "أكاديمية فرانتس ليست",
      "أكاديمية حفلات على طراز الآرت نوفو في Liszt Ferenc ter تقدم ريسيتالات كلاسيكية وفعاليات في قاعات الدروس المتقدمة.",
      "يستضيف مركز الحفلات في أكاديمية فرانتس ليست في Liszt Ferenc ter 8 عروضاً كلاسيكية لطلاب ومحترفين داخل قاعة آرت نوفو شهيرة. تمتلئ الساحة الخارجية بشرفات المطاعم قبل بدء العرض. الجدول متاح على liszacademy.hu.",
      "liszt-academy-ar"
    ),
  },
  'prov-cov-dohany-jewish-q': {
    hu: localeEntry(
      "Dohány utcai Zsinagóga",
      "Europa legnagyobb zsinagogaja, koncertekkel, vezetett sétákkal és zsidónegyedi örökséggel a Dohany utcaban.",
      "A Dohány utcai Zsinagóga együttes kulturális eseményeknek, orgonahangversenyeknek és múzeumlatogatasoknak ad helyet a zsidónegyed sziveben. A mór stílusú epület kozel van a Kazinczy utca éjszakai életehez. Jegyek a jewishmuseum.hu oldalon.",
      "dohany-zsinagoga-hu"
    ),
    es: localeEntry(
      "Sinagoga de la calle Dohany",
      "La sinagoga mas grande de Europa, con conciertos, visitas guiadas y patrimonio judio en Dohany utca.",
      "El complejo de la Sinagoga de la calle Dohany acoge eventos culturales, recitales de organo y visitas al museo en pleno barrio judio. El edificio de estilo neomudejar se alza junto a la vida nocturna de Kazinczy utca. Entradas en jewishmuseum.hu.",
      "sinagoga-dohany-es"
    ),
    it: localeEntry(
      "Sinagoga di via Dohany",
      "La piu grande sinagoga d Europa, con concerti, visite guidate e patrimonio del quartiere ebraico in Dohany utca.",
      "Il complesso della Sinagoga di via Dohany ospita eventi culturali, recital d organo e visite museali nel cuore del quartiere ebraico. L edificio in stile moresco dialoga con la vita notturna vicina di Kazinczy utca. Biglietti su jewishmuseum.hu.",
      "sinagoga-dohany-it"
    ),
    he: localeEntry(
      "בית הכנסת ברחוב דוהאני",
      "בית הכנסת הגדול באירופה, עם קונצרטים, סיורים מודרכים ומורשת הרובע היהודי ברחוב דוהאני.",
      "מתחם בית הכנסת ברחוב דוהאני מארח אירועי תרבות, רסיטלי עוגב וביקורי מוזיאון בלב הרובע היהודי. המבנה בסגנון התחייה המורית ניצב סמוך לחיי הלילה של Kazinczy utca. כרטיסים דרך jewishmuseum.hu.",
      "dohany-synagogue-he"
    ),
    ar: localeEntry(
      "كنيس شارع دوهاني",
      "أكبر كنيس في أوروبا مع حفلات موسيقية وجولات مرافقة وتراث الحي اليهودي في Dohany utca.",
      "يستضيف مجمع كنيس شارع دوهاني فعاليات ثقافية وحفلات أورغن وزيارات للمتحف في قلب الحي اليهودي. يرسخ المبنى ذي الطراز الموريسكي الجديد حضورَه بجوار الحياة الليلية في Kazinczy utca. التذاكر عبر jewishmuseum.hu.",
      "dohany-synagogue-ar"
    ),
  },
  'prov-cov-gozsdu-events': {
    hu: localeEntry(
      "Gozsdu Udvar",
      "Összekapcsolt udvarok a Király utca és a Dob utca között, piacokkal, pop-upokkal és hétvégi eseményekkel.",
      "A Gozsdu Udvar het egymasba nyilo udvart kot ossze barokkal, designboltokkal és szezonális fesztiválokkal a zsidónegyed fo utvonalai között. Hetvegen kézműves vásárok és elo zenei szettek toltik meg a gyalogos atjarot. Az eseménynaptár a gozsduudvar.hu oldalon van.",
      "gozsdu-udvar-hu"
    ),
    es: localeEntry(
      "Gozsdu Udvar",
      "Patios conectados entre Kiraly utca y Dob utca, con mercados, pop-ups y eventos de fin de semana.",
      "Gozsdu Udvar enlaza siete patios con bares, tiendas de diseno y festivales de temporada entre las arterias del barrio judio. Los fines de semana el pasaje peatonal se llena de ferias artesanales y sesiones en vivo. Calendario en gozsduudvar.hu.",
      "gozsdu-udvar-es"
    ),
    it: localeEntry(
      "Gozsdu Udvar",
      "Cortili collegati tra Kiraly utca e Dob utca, con mercati, pop-up ed eventi del weekend.",
      "Gozsdu Udvar collega sette cortili con bar, negozi di design e festival stagionali tra le arterie del quartiere ebraico. Nei fine settimana il passaggio pedonale si riempie di mercatini artigianali e set live. Calendario su gozsduudvar.hu.",
      "gozsdu-udvar-it"
    ),
    he: localeEntry(
      "Gozsdu Udvar",
      "חצרות מחוברות בין Kiraly utca ל-Dob utca, עם שווקים, פופ-אפים ואירועי סוף שבוע.",
      "Gozsdu Udvar מחבר שבע חצרות עם ברים, חנויות עיצוב ופסטיבלים עונתיים בין הצירים של הרובע היהודי. בסופי שבוע המעבר הולכי הרגל מתמלא בירידי מלאכה ובסטים חיים. לוח האירועים באתר gozsduudvar.hu.",
      "gozsdu-udvar-he"
    ),
    ar: localeEntry(
      "Gozsdu Udvar",
      "ساحات مترابطة بين Kiraly utca وDob utca تضم أسواقاً ومبادرات مؤقتة وفعاليات نهاية الأسبوع.",
      "يربط Gozsdu Udvar سبع ساحات تضم بارات ومتاجر تصميم ومهرجانات موسمية بين شرايين الحي اليهودي. تمتلئ الممرات المخصصة للمشاة في عطلات نهاية الأسبوع بأسواق الحرف والعروض الحية. الجدول على gozsduudvar.hu.",
      "gozsdu-udvar-ar"
    ),
  },
  'prov-cov-ellato-kazinczy': {
    hu: localeEntry(
      "Ellato Kert",
      "Nyitott romkerti helyszin a Kazinczy utcaban, koncertekkel, BBQ-val és nyári fesztiválokkal a bulifolyóson.",
      "Az Ellato Kert a Kazinczy utca 48. alatt szezonális romkert, ahol elo zenekarok, food truckok és tematikus bulik varjak a vendegeket. A kert meleg hetvegeken megtelik a Szimpla és az Instant között. A programok az ellatokert.hu oldalon vannak.",
      "ellato-kert-hu"
    ),
    es: localeEntry(
      "Ellato Kert",
      "Jardin ruin al aire libre en Kazinczy utca, con conciertos, BBQ y festivales de verano en el corredor de fiesta.",
      "Ellato Kert, en Kazinczy utca 48, es un ruin garden estacional con bandas en vivo, food trucks y fiestas tematicas. El patio se llena los fines de semana calidos entre Szimpla e Instant. Cartelera en ellatokert.hu.",
      "ellato-kert-es"
    ),
    it: localeEntry(
      "Ellato Kert",
      "Ruin garden all aperto in Kazinczy utca, con concerti, barbecue e festival estivi nel corridoio della movida.",
      "Ellato Kert, in Kazinczy utca 48, e un ruin garden stagionale che ospita band dal vivo, food truck e feste a tema. Il cortile si riempie nei weekend caldi tra Szimpla e Instant. Programmazione su ellatokert.hu.",
      "ellato-kert-it"
    ),
    he: localeEntry(
      "Ellato Kert",
      "גן חורבות פתוח ברחוב Kazinczy, עם הופעות, ברביקיו ופסטיבלי קיץ במסדרון הבילויים.",
      "Ellato Kert ב-Kazinczy utca 48 הוא גן חורבות עונתי עם להקות חיות, פוד טראקס ומסיבות נושא. החצר מתמלאת בסופי שבוע חמים בין Szimpla ל-Instant. הרשימות באתר ellatokert.hu.",
      "ellato-kert-he"
    ),
    ar: localeEntry(
      "Ellato Kert",
      "حديقة روين مفتوحة في Kazinczy utca مع حفلات موسيقية وشواء ومهرجانات صيفية في ممر السهر.",
      "يعد Ellato Kert في Kazinczy utca 48 حديقة روين موسمية تستضيف فرقاً حية وشاحنات طعام وحفلات ذات طابع خاص. يمتلئ الفناء في عطلات نهاية الأسبوع الدافئة بين Szimpla وInstant. الفعاليات على ellatokert.hu.",
      "ellato-kert-ar"
    ),
  },
  'prov-cov-durer-wessel': {
    hu: localeEntry(
      "Durer Kert",
      "Szabadteri koncertkert a Wesselényi utcaban, indie, elektronikus és fesztiválprogramokkal Erzsébetvárosban.",
      "A Durer Kert a Wesselényi utca 52. alatt alaphelyszin a magyar és nemzetközi indie és elektronikus eloadok szamara. A nyári fesztiválok a kert színpadát és a kisebb termeket is hasznaljak. Jegyek a durerkert.com oldalon.",
      "durer-kert-hu"
    ),
    es: localeEntry(
      "Durer Kert",
      "Jardin de conciertos al aire libre en Wesselenyi utca, con indie, electronica y carteles de festival en Erzsebetvaros.",
      "Durer Kert, en Wesselenyi utca 52, es un referente al aire libre para artistas indie y electronicos hungaros e internacionales. Los festivales de verano usan el escenario del jardin y las salas laterales. Entradas en durerkert.com.",
      "durer-kert-es"
    ),
    it: localeEntry(
      "Durer Kert",
      "Giardino concerti all aperto in Wesselenyi utca, con indie, elettronica e festival a Erzsebetvaros.",
      "Durer Kert, in Wesselenyi utca 52, e un punto fermo open-air per artisti indie ed elettronici ungheresi e internazionali. I festival estivi utilizzano il palco del giardino e le sale laterali. Biglietti su durerkert.com.",
      "durer-kert-it"
    ),
    he: localeEntry(
      "Durer Kert",
      "גן הופעות פתוח ברחוב Wesselenyi, עם אינדי, אלקטרוניקה ופסטיבלים בארז׳בטווארוש.",
      "Durer Kert ב-Wesselenyi utca 52 הוא מקום פתוח מרכזי לאמני אינדי ואלקטרוניקה מהונגריה ומהעולם. פסטיבלי הקיץ משתמשים בבמת הגן ובחדרים הצדדיים. כרטיסים באתר durerkert.com.",
      "durer-kert-he"
    ),
    ar: localeEntry(
      "Durer Kert",
      "حديقة حفلات مفتوحة في Wesselenyi utca تقدم برامج إندي وإلكترونية ومهرجانات في إرجيبيتفاروش.",
      "يشكل Durer Kert في Wesselenyi utca 52 موقعاً مفتوحاً أساسياً للعروض الإندية والإلكترونية المجرية والدولية. تستخدم المهرجانات الصيفية منصة الحديقة والقاعات الجانبية. التذاكر على durerkert.com.",
      "durer-kert-ar"
    ),
  },
  'prov-cov-apollo-rakoczi': {
    hu: localeEntry(
      "Apollo Mozi",
      "Művészmozi a Nagykörúton, fesztiválokkal, premierjeivel és kultvetítésekkel a Rákóczi ter közelében.",
      "Az Apollo Mozi az Erzsébet körúton művészfilmeket, rendező-találkozókat és fesztiválszekciokat kínál a Rákóczi ter közlekedési csomópontja mellett. A felújított termek Erzsébetváros filmes kultúráját erősítik. Műsor az apollomozi.hu oldalon.",
      "apollo-mozi-hu"
    ),
    es: localeEntry(
      "Cine Apollo",
      "Cine de arte y ensayo en el Gran Bulevar, con festivales, estrenos y sesiones de culto cerca de Rakoczi ter.",
      "Apollo Cinema, en Erzsebet korut, programa cine de autor, coloquios con directores y secciones de festivales junto a los enlaces de transporte de Rakoczi ter. Las salas renovadas sostienen la cultura cinematografica de Erzsebetvaros. Horarios en apollomozi.hu.",
      "cine-apollo-es"
    ),
    it: localeEntry(
      "Cinema Apollo",
      "Cinema d essai sul Grande Boulevard, con festival, anteprime e proiezioni cult vicino a Rakoczi ter.",
      "Apollo Cinema su Erzsebet korut propone film d autore, incontri con i registi e sezioni festival accanto ai collegamenti di Rakoczi ter. Le sale rinnovate rafforzano la cultura cinematografica di Erzsebetvaros. Programma su apollomozi.hu.",
      "cinema-apollo-it"
    ),
    he: localeEntry(
      "קולנוע אפולו",
      "קולנוע ארט-האוס בשדרה הגדולה, עם פסטיבלים, בכורות והקרנות פולחן ליד Rakoczi ter.",
      "Apollo Cinema ב-Erzsebet korut מציג סרטי ארט-האוס, מפגשי שאלות ותשובות עם במאים ומשבצות פסטיבל ליד מוקד התחבורה של Rakoczi ter. האולמות המחודשים מעגנים את תרבות הקולנוע של Erzsebetvaros. לוח ההקרנות ב-apollomozi.hu.",
      "apollo-cinema-he"
    ),
    ar: localeEntry(
      "سينما أبولو",
      "سينما فنية على الجادة الكبرى تستضيف مهرجانات وعروضاً أولى وعروضاً كلاسيكية قرب Rakoczi ter.",
      "تعرض Apollo Cinema على Erzsebet korut أفلام الفن المستقل وجلسات مع المخرجين وبرامج المهرجانات بجوار عقدة النقل في Rakoczi ter. تدعم القاعات المجددة ثقافة السينما في Erzsebetvaros. الجدول على apollomozi.hu.",
      "apollo-cinema-ar"
    ),
  },
  'prov-cov-corvin-cinema': {
    hu: localeEntry(
      "Corvin Mozi",
      "Multiplex és fesztiválvetítések a Corvin-negyedben, modern mozitermeivel a negyed üzleti-kereskedelmi tere mellett.",
      "A Corvin Mozi a Corvin kozben a Corvin-negyed szórakoztató zona kozpontja mainstream és fesztiválvetítésekkel. A kornyezo passzazsok barokhoz és éttermekhez kapcsolódnak a megujult negyedben. A műsor a corvinmozi.hu oldalon van.",
      "corvin-mozi-hu"
    ),
    es: localeEntry(
      "Cine Corvin",
      "Multiplex y proyecciones de festival en Corvin-negyed, con salas modernas junto a las plazas comerciales del barrio.",
      "Corvin Cinema, en Corvin koz, articula la zona de ocio de Corvin-negyed con sesiones comerciales y de festival. Los pasajes cercanos conectan con bares y restaurantes del barrio renovado. Cartelera en corvinmozi.hu.",
      "cine-corvin-es"
    ),
    it: localeEntry(
      "Cinema Corvin",
      "Multisala e proiezioni festivaliere a Corvin-negyed, con cinema moderni accanto alle piazze commerciali del quartiere.",
      "Corvin Cinema in Corvin koz e il fulcro della zona entertainment di Corvin-negyed con proiezioni mainstream e festivaliere. I passaggi circostanti conducono a bar e ristoranti del quartiere rinnovato. Programmazione su corvinmozi.hu.",
      "cinema-corvin-it"
    ),
    he: localeEntry(
      "קולנוע קורבין",
      "מולטיפלקס והקרנות פסטיבל ב-Corvin-negyed, עם אולמות מודרניים לצד רחבות המסחר של הרובע.",
      "Corvin Cinema ב-Corvin koz הוא עוגן אזור הבילוי של Corvin-negyed עם הקרנות מסחריות ופסטיבלים. המעברים סביבו מחברים לברים ולמסעדות ברובע המחודש. לוח ההקרנות באתר corvinmozi.hu.",
      "corvin-cinema-he"
    ),
    ar: localeEntry(
      "سينما كورفين",
      "مجمع سينمائي متعدد القاعات وعروض مهرجانات في Corvin-negyed مع صالات حديثة قرب الساحات التجارية في الحي.",
      "تشكل Corvin Cinema في Corvin koz محور منطقة الترفيه في Corvin-negyed بعروض تجارية ومهرجانية. تربط الممرات المحيطة بها الحانات والمطاعم في الحي المجدد. البرنامج على corvinmozi.hu.",
      "corvin-cinema-ar"
    ),
  },
  'prov-cov-ferenc-nagy': {
    hu: localeEntry(
      "Ferencvárosi Római Katolikus Plébánia kulturális eseményei",
      "Koncertek és orgonaestek a Ferenciek téren, barokk templomi programokkal a Nagytemplom utca közelében.",
      "A Ferenciek teri bazilika környéke klasszikus koncerteknek és szezonális egyházzenei esteknek ad otthont, pár lépésre a Nagytemplom utcától, belső Ferencvárosban. Az építészet-bemutatok kiegészítik a jegyes recitalokat. A programok a ferenciektere.hu oldalon vannak.",
      "ferenciek-tere-hu"
    ),
    es: localeEntry(
      "Eventos culturales de la parroquia catolica romana de Ferenc",
      "Conciertos y recitales de organo en Ferenciek tere, con actos barrocos de iglesia cerca de Nagytemplom utca.",
      "La zona basilical de Ferenciek tere acoge conciertos clasicos y musica liturgica de temporada a pocos pasos de Nagytemplom utca, en el interior de Ferencvaros. Las visitas arquitectonicas complementan los recitales con entrada. Horarios en ferenciektere.hu.",
      "ferenciek-tere-es"
    ),
    it: localeEntry(
      "Eventi culturali della parrocchia cattolica romana di Ferenc",
      "Concerti e recital d organo a Ferenciek tere, con eventi barocchi in chiesa vicino a Nagytemplom utca.",
      "L area della basilica di Ferenciek tere ospita concerti classici e musica liturgica stagionale a pochi passi da Nagytemplom utca, nel cuore di Ferencvaros. Le visite architettoniche completano i recital a pagamento. Programma su ferenciektere.hu.",
      "ferenciek-tere-it"
    ),
    he: localeEntry(
      "אירועי התרבות של הקהילה הקתולית הרומית פרנץ",
      "קונצרטים ורסיטלי עוגב ב-Ferenciek tere, עם אירועי כנסייה בארוקיים ליד Nagytemplom utca.",
      "אזור הבזיליקה של Ferenciek tere מארח קונצרטים קלאסיים ומוזיקה ליטורגית עונתית במרחק צעדים מ-Nagytemplom utca בפנים Ferencvaros. סיורי האדריכלות משלימים את הרסיטלים בתשלום. לוחות זמנים דרך ferenciektere.hu.",
      "ferenciek-tere-he"
    ),
    ar: localeEntry(
      "الفعاليات الثقافية لرعية فرينتس الكاثوليكية الرومانية",
      "حفلات موسيقية وأمسيات أورغن في Ferenciek tere مع فعاليات كنسية باروكية قرب Nagytemplom utca.",
      "تستضيف منطقة البازيليكا في Ferenciek tere حفلات كلاسيكية وموسيقى ليتورجية موسمية على بعد خطوات من Nagytemplom utca في قلب Ferencvaros. تكمل الجولات المعمارية الأمسيات الموسيقية المدفوعة. المواعيد عبر ferenciektere.hu.",
      "ferenciek-tere-ar"
    ),
  },
  'prov-cov-balna-events': {
    hu: localeEntry(
      "Bálna Budapest",
      "Bálna alakú kulturális központ a Duna partján, designvásárokkal, koncertekkel és piacokkal a Boráros ternel.",
      "A Bálna Budapest a Fővám téren folyóparti, bálna formájú csarnok, ahol designpiacok, borfesztiválok és bérelt koncertek valtoznak egymast. A sétány a Boráros ter villamosait a Nagyvásárcsarnokkal koti ossze. A naptár a bálnabudapest.hu oldalon van.",
      "balna-budapest-hu"
    ),
    es: localeEntry(
      "Balna Budapest",
      "Centro cultural con forma de ballena junto al Danubio, con ferias de diseno, conciertos y mercados en Boraros ter.",
      "Balna Budapest, en Fovam ter, es un recinto ribereno con forma de ballena que acoge mercados de diseno, festivales de vino y conciertos alquilados. El paseo enlaza los tranvias de Boraros ter con el Gran Mercado Central. Calendario en balnabudapest.hu.",
      "balna-budapest-es"
    ),
    it: localeEntry(
      "Balna Budapest",
      "Centro culturale a forma di balena sul Danubio, con fiere di design, concerti e mercati a Boraros ter.",
      "Balna Budapest a Fovam ter e una hall sul lungofiume a forma di balena che ospita mercati di design, festival del vino e concerti in affitto. La passeggiata collega i tram di Boraros ter al Mercato Coperto Centrale. Calendario su balnabudapest.hu.",
      "balna-budapest-it"
    ),
    he: localeEntry(
      "Balna Budapest",
      "מרכז תרבות בצורת לווייתן על הדנובה, עם ירידי עיצוב, קונצרטים ושווקים ב-Boraros ter.",
      "Balna Budapest ב-Fovam ter הוא אולם נהר בצורת לווייתן שמארח שווקי עיצוב, פסטיבלי יין ואירועי קונצרט מושכרים. הטיילת מחברת בין החשמליות של Boraros ter לשוק המקורה הגדול. לוח האירועים באתר balnabudapest.hu.",
      "balna-budapest-he"
    ),
    ar: localeEntry(
      "Balna Budapest",
      "مركز ثقافي على شكل حوت على ضفة الدانوب مع معارض تصميم وحفلات وأسواق في Boraros ter.",
      "يعد Balna Budapest في Fovam ter قاعة نهرية على شكل حوت تستضيف أسواق التصميم ومهرجانات النبيذ وحفلات مؤجرة. يربط الممشى ترام Boraros ter بسوق المدينة الكبير. الجدول على balnabudapest.hu.",
      "balna-budapest-ar"
    ),
  },
  'prov-cov-citadella-gellert': {
    hu: localeEntry(
      "Citadella események",
      "Szabadteri koncertek és vásárok a Citadellanal, a Szabadság-szobor panorámájával a Gellért-hegyen.",
      "A Citadella erődje a Gellért-hegyen szezonális koncerteknek, kézműves vásároknak és panorámás teraszoknak ad helyet. Naplementekor sokan a Szabadság-szobornal gyűlnek ossze, mielőtt kigyulladnak a varos fenyei. Eseményinfo a citadella.hu oldalon.",
      "citadella-esemenyek-hu"
    ),
    es: localeEntry(
      "Eventos de la Citadella",
      "Conciertos y ferias al aire libre en la Citadella, con vistas a la Estatua de la Libertad sobre la colina Gellert.",
      "La fortaleza de la Citadella en la colina Gellert acoge conciertos de temporada, ferias artesanales y terrazas panoramicas. Al atardecer la gente se reune junto a la Estatua de la Libertad antes de que aparezcan las luces de la ciudad. Informacion en citadella.hu.",
      "citadella-eventos-es"
    ),
    it: localeEntry(
      "Eventi della Citadella",
      "Concerti e fiere all aperto alla Citadella, con vista sulla Statua della Liberta sopra la collina Gellert.",
      "La fortezza della Citadella sul colle Gellert ospita concerti stagionali, fiere artigianali e terrazze panoramiche. Al tramonto il pubblico si raduna presso la Statua della Liberta prima che si accendano le luci della citta. Informazioni su citadella.hu.",
      "citadella-eventi-it"
    ),
    he: localeEntry(
      "אירועי הסיטדלה",
      "קונצרטים וירידים פתוחים בסיטדלה, עם תצפית לפסל החירות מעל גבעת גלרט.",
      "מבצר הסיטדלה על גבעת גלרט מארח קונצרטים עונתיים, ירידי מלאכה ומרפסות תצפית פנורמיות. בשקיעה קהל רב מתכנס ליד פסל החירות לפני שאורות העיר נדלקים. מידע על האירועים ב-citadella.hu.",
      "citadella-events-he"
    ),
    ar: localeEntry(
      "فعاليات سيتاديلا",
      "حفلات وأسواق مفتوحة في سيتاديلا مع إطلالات تمثال الحرية فوق تلة غيليرت.",
      "تستضيف قلعة سيتاديلا على تلة غيليرت حفلات موسمية وأسواق حرفية وشرفات بانورامية. عند الغروب يتجمع الزوار قرب تمثال الحرية قبل ظهور أضواء المدينة. معلومات الفعاليات على citadella.hu.",
      "citadella-events-ar"
    ),
  },
  'prov-cov-gloriett-rozsadomb': {
    hu: localeEntry(
      "Gloriett események",
      "Domboldali borkóstolók és jazzestek Rózsadombon, kilatassal a budai villakra.",
      "A Gloriett a Török utcaban borvacsorákat és akusztikus koncerteket rendez a Rózsadomb oldalan, varosi panoramaval. A villakörnyezet idealis zártkörű eseményekhez és nyári teraszokhoz. Foglalás a gloriett.hu oldalon.",
      "gloriett-rozsadomb-hu"
    ),
    es: localeEntry(
      "Eventos Gloriett",
      "Eventos de vino en la ladera de Rozsadomb, con catas y jazz sobre las villas de Buda.",
      "Gloriett, en Torok utca, organiza cenas maridaje y conciertos acusticos en la ladera de Rozsadomb con vistas a la ciudad. El entorno de villa resulta ideal para eventos privados y terrazas de verano. Reservas en gloriett.hu.",
      "gloriett-rozsadomb-es"
    ),
    it: localeEntry(
      "Eventi Gloriett",
      "Eventi enologici sulla collina di Rozsadomb, con degustazioni e jazz affacciati sulle ville di Buda.",
      "Gloriett in Torok utca ospita cene con vini e concerti acustici sul fianco di Rozsadomb con vista sulla citta. L ambiente da villa si presta a eventi privati e terrazze estive. Prenotazioni su gloriett.hu.",
      "gloriett-rozsadomb-it"
    ),
    he: localeEntry(
      "אירועי Gloriett",
      "אירועי יין על מדרון רוז׳אדומב, עם טעימות וג׳אז מול וילות בודה.",
      "Gloriett ב-Torok utca מארח ארוחות יין וקונצרטים אקוסטיים במדרון Rózsadomb עם נוף עירוני. סביבת הווילה מתאימה לאירועים פרטיים ולמרפסות קיץ. הזמנות באתר gloriett.hu.",
      "gloriett-rozsadomb-he"
    ),
    ar: localeEntry(
      "فعاليات Gloriett",
      "فعاليات نبيذ على سفح روزشادومب مع جلسات تذوق وجاز تطل على فيلات بودا.",
      "ينظم Gloriett في Torok utca عشاءات نبيذ وحفلات أكوستيك على سفح Rózsadomb مع إطلالات على المدينة. يناسب طابع الفيلا الفعاليات الخاصة والشرفات الصيفية. الحجوزات عبر gloriett.hu.",
      "gloriett-rozsadomb-ar"
    ),
  },
  'prov-cov-gellert-spa-events': {
    hu: localeEntry(
      "Gellért fürdő kulturális csarnok",
      "Szecessziós fürdőkoncertek a Gellértnel, termalfürdővel és alkalmi elo zenes programokkal a Szent Gellért téren.",
      "A Gellért Fürdő a Szent Gellért téren termalfürdőzest kapcsol ossze szezonális koncertekkel a szalloda szecesszios termeiben. A hullammedencek és szaunak Buda folyóparti wellnesskulturajanak alaphelyei. Jegyek a gellertspa.hu oldalon.",
      "gellert-furdo-hu"
    ),
    es: localeEntry(
      "Sala Cultural del Balneario Gellert",
      "Conciertos spa art nouveau en Gellert, con banos termales y musica en directo ocasional en Szent Gellert ter.",
      "El Balneario Gellert en Szent Gellert ter combina el bano termal con conciertos de temporada en las salas art nouveau del hotel. Las piscinas de olas y las saunas son parte central de la cultura wellness ribereña de Buda. Entradas en gellertspa.hu.",
      "balneario-gellert-es"
    ),
    it: localeEntry(
      "Sala culturale delle terme Gellert",
      "Concerti spa art nouveau al Gellert, con terme e musica dal vivo occasionale in Szent Gellert ter.",
      "Le Terme Gellert a Szent Gellert ter uniscono il bagno termale a concerti stagionali nelle sale art nouveau dell hotel. Piscina a onde e saune sono un pilastro della cultura benessere sul lungofiume di Buda. Biglietti su gellertspa.hu.",
      "terme-gellert-it"
    ),
    he: localeEntry(
      "האולם התרבותי של מרחצאות גלרט",
      "קונצרטי ספא בסגנון אר נובו בגלרט, עם מרחצאות תרמיים ומוזיקה חיה מזדמנת בכיכר Szent Gellert.",
      "מרחצאות גלרט ב-Szent Gellert ter משלבים רחצה תרמית עם קונצרטים עונתיים באולמות האר נובו של המלון. בריכת הגלים והסאונות הן חלק מרכזי מתרבות הוולנס שעל גדת הנהר בבודה. כרטיסים באתר gellertspa.hu.",
      "gellert-spa-he"
    ),
    ar: localeEntry(
      "القاعة الثقافية لحمام غيليرت",
      "حفلات سبا على طراز الآرت نوفو في غيليرت مع حمامات حرارية وموسيقى حية بين حين وآخر في Szent Gellert ter.",
      "يجمع حمام غيليرت في Szent Gellert ter بين الاستحمام الحراري وحفلات موسمية داخل قاعات الفندق ذات طراز الآرت نوفو. تشكل برك الأمواج والساونا جزءاً أساسياً من ثقافة العافية على ضفة بودا. التذاكر على gellertspa.hu.",
      "gellert-spa-ar"
    ),
  },
  'prov-cov-aquincum-museum': {
    hu: localeEntry(
      "Aquincumi Múzeum",
      "Római régészeti park Aquincumban, szabadtari romokkal, múzeummal és nyári történelmi fesztiválokkal.",
      "Az Aquincumi Múzeum a római Budapest emlékeit őrzi fedett kiállítótérrel és szabadtéri romkerttel a Szentendrei úton. Nyáron csaladi történelmi fesztiválok élesztik meg a légiós életet Óbudán. Jegyek az aquincum.hu oldalon.",
      "aquincumi-muzeum-hu"
    ),
    es: localeEntry(
      "Museo Aquincum",
      "Parque arqueologico romano en Aquincum, con ruinas al aire libre, museo y festivales historicos de verano.",
      "El Museo Aquincum conserva la Budapest romana con exposiciones interiores y jardines de ruinas al aire libre en Szentendrei ut. En verano, los festivales recrean la vida legionaria para familias en el distrito de Obuda. Entradas en aquincum.hu.",
      "museo-aquincum-es"
    ),
    it: localeEntry(
      "Museo Aquincum",
      "Parco archeologico romano ad Aquincum, con rovine all aperto, museo e festival storici estivi.",
      "Il Museo Aquincum conserva la Budapest romana con mostre interne e giardini di rovine all aperto su Szentendrei ut. In estate i festival ricreano la vita delle legioni per le famiglie nel distretto di Obuda. Biglietti su aquincum.hu.",
      "museo-aquincum-it"
    ),
    he: localeEntry(
      "מוזיאון אקווינקום",
      "פארק ארכאולוגי רומי באקווינקום, עם חורבות פתוחות, מוזיאון ופסטיבלי היסטוריה בקיץ.",
      "מוזיאון אקווינקום משמר את בודפשט הרומית עם תצוגות מקורות וגני חורבות פתוחים על Szentendrei ut. בקיץ פסטיבלים משחזרים את חיי הלגיונרים עבור משפחות ברובע Obuda. כרטיסים באתר aquincum.hu.",
      "aquincum-museum-he"
    ),
    ar: localeEntry(
      "متحف أكوينكوم",
      "منتزه أثري روماني في أكوينكوم مع أطلال مكشوفة ومتحف ومهرجانات تاريخية صيفية.",
      "يحفظ متحف أكوينكوم إرث بودابست الروماني عبر معارض داخلية وحدائق أطلال مفتوحة على Szentendrei ut. تعيد المهرجانات الصيفية تمثيل حياة الفيلق الروماني للعائلات في حي Obuda. التذاكر على aquincum.hu.",
      "aquincum-museum-ar"
    ),
  },
  'prov-cov-obudai-kolosy': {
    hu: localeEntry(
      "Óbudai Kulturális Központ",
      "Kerületi művelődési haz a Kolosy ter közelében, koncertekkel, színházzal és közössegi fesztiválokkal Óbudán.",
      "Az Óbudai Kulturális Központ színházi és zenei programokat szervez a Kolosy ter környékén, a Kiscelli utca közelében. Az önkormányzati rendezvények köze karácsonyi vásárok és nyári szabadtéri színpadok is tartoznak. A naptár az obuda.hu oldalon elérhető.",
      "obudai-kulturkozpont-hu"
    ),
    es: localeEntry(
      "Centro Cultural de Obuda",
      "Sala cultural de distrito cerca de Kolosy ter, con conciertos, teatro y festivales comunitarios en Obuda.",
      "El Centro Cultural de Obuda programa teatro y musica para el entorno de Kolosy ter, alrededor de Kiscelli utca. Los eventos municipales incluyen mercados navidenos y escenarios al aire libre en verano. Calendario en obuda.hu.",
      "centro-cultural-obuda-es"
    ),
    it: localeEntry(
      "Centro culturale di Obuda",
      "Sala culturale di quartiere vicino a Kolosy ter, con concerti, teatro e festival di comunita a Obuda.",
      "Il Centro culturale di Obuda propone teatro e musica per il quartiere di Kolosy ter intorno a Kiscelli utca. Gli eventi municipali comprendono mercatini natalizi e palchi estivi all aperto. Calendario su obuda.hu.",
      "centro-culturale-obuda-it"
    ),
    he: localeEntry(
      "מרכז התרבות של אובודה",
      "אולם תרבות רובעי ליד Kolosy ter, עם קונצרטים, תיאטרון ופסטיבלים קהילתיים באובודה.",
      "מרכז התרבות של אובודה מציג תיאטרון ומוזיקה לשכונת Kolosy ter סביב Kiscelli utca. האירועים העירוניים כוללים שווקי חג מולד ובמות קיץ פתוחות. לוח האירועים באתר obuda.hu.",
      "obuda-cultural-centre-he"
    ),
    ar: localeEntry(
      "المركز الثقافي لأوبودا",
      "قاعة ثقافية محلية قرب Kolosy ter تستضيف حفلات ومسرحاً ومهرجانات مجتمعية في أوبودا.",
      "يقدم المركز الثقافي لأوبودا برامج مسرحية وموسيقية لمنطقة Kolosy ter حول Kiscelli utca. تشمل الفعاليات البلدية أسواق عيد الميلاد ومسارح صيفية مفتوحة. الجدول على obuda.hu.",
      "obuda-cultural-centre-ar"
    ),
  },
  'prov-cov-obuda-becsi-events': {
    hu: localeEntry(
      "Óbudai-sziget Kulturális Ház",
      "Közösségi koncertek a Becsi uton, kerületi rendezvényekkel Óbudán a fo vásárlofolyóso menten.",
      "Az Óbudai-sziget Kulturális Ház a Becsi uton önkormányzati koncerteket, tanceelőadásokat és ünnepi programokat rendez Eszak-Buda lakoinak. Az avenu elhelyezkedes a Kolosy teret a Duna-kanyarral kotja ossze. A műsor az obudaisziget.hu oldalon van.",
      "obudai-sziget-kulturhaz-hu"
    ),
    es: localeEntry(
      "Sala Cultural Obudai-sziget",
      "Conciertos comunitarios en Becsi ut, con eventos distritales de Obuda a lo largo del principal eje comercial.",
      "La Sala Cultural Obudai-sziget en Becsi ut acoge conciertos municipales, recitales de danza y programas festivos para el norte de Buda. Su ubicacion conecta Kolosy ter con el recodo del Danubio. Horarios en obudaisziget.hu.",
      "obudai-sziget-es"
    ),
    it: localeEntry(
      "Sala culturale Obudai-sziget",
      "Concerti di comunita su Becsi ut, con eventi distrettuali di Obuda lungo l asse commerciale principale.",
      "La Sala culturale Obudai-sziget su Becsi ut ospita concerti comunali, saggi di danza e programmi festivi per la Buda settentrionale. La sua posizione collega Kolosy ter alla curva del Danubio. Programma su obudaisziget.hu.",
      "obudai-sziget-it"
    ),
    he: localeEntry(
      "האולם התרבותי אובודאי-סיגט",
      "קונצרטים קהילתיים ב-Becsi ut, עם אירועי רובע של אובודה לאורך ציר הקניות הראשי.",
      "האולם התרבותי אובודאי-סיגט ב-Becsi ut מארח קונצרטים עירוניים, רסיטלי מחול ותוכניות חג עבור צפון בודה. המיקום שעל השדרה מחבר בין Kolosy ter לעיקול הדנובה. לוח הזמנים באתר obudaisziget.hu.",
      "obudai-sziget-he"
    ),
    ar: localeEntry(
      "القاعة الثقافية أوبوداي-سيغيت",
      "حفلات مجتمعية على Becsi ut مع فعاليات منطقة أوبودا على طول محور التسوق الرئيسي.",
      "تستضيف القاعة الثقافية أوبوداي-سيغيت على Becsi ut حفلات بلدية وعروض رقص وبرامج الأعياد لسكان شمال بودا. يربط موقعها على الشارع الرئيسي بين Kolosy ter وانحناءة الدانوب. البرنامج على obudaisziget.hu.",
      "obudai-sziget-ar"
    ),
  },
  'prov-cov-bartok-moricz': {
    hu: localeEntry(
      "Béla Bartók Nemzeti Hangversenyterem",
      "Szimfonikus hangversenyterem a Moricz korter vonzasaban, világszínvonalú akusztikaval a Mupa Budapestben.",
      "A Béla Bartók Nemzeti Hangversenyterem a Mupa Budapestben a Magyar Nemzeti Filharmonikusokat és turnéző zenekarokat fogadja a Moricz Zsigmond korter villamoscsomópontja közelében. Az építészeti tura kiegészítheti a koncertjegyet. Program a mupa.hu oldalon.",
      "bartok-hangversenyterem-hu"
    ),
    es: localeEntry(
      "Sala Nacional de Conciertos Bela Bartok",
      "Sala sinfonica en el corredor de Moricz korter, con acustica de primer nivel dentro del complejo Mupa Budapest.",
      "La Sala Nacional de Conciertos Bela Bartok, en Mupa Budapest, recibe a la Filarmonica Nacional Hungara y a orquestas de gira cerca del nodo de tranvias de Moricz Zsigmond korter. Las visitas arquitectonicas complementan la entrada del concierto. Programa en mupa.hu.",
      "sala-bartok-es"
    ),
    it: localeEntry(
      "Sala Nazionale dei Concerti Bela Bartok",
      "Sala sinfonica nel corridoio di Moricz korter, con acustica di livello mondiale nel complesso Mupa Budapest.",
      "La Sala Nazionale dei Concerti Bela Bartok, nel Mupa Budapest, ospita la Filarmonica Nazionale Ungherese e orchestre in tour vicino al nodo tramviario di Moricz Zsigmond korter. Le visite architettoniche completano il biglietto del concerto. Programma su mupa.hu.",
      "sala-bartok-it"
    ),
    he: localeEntry(
      "היכל הקונצרטים הלאומי בלה ברטוק",
      "אולם סימפוני בציר Moricz korter עם אקוסטיקה ברמה עולמית בתוך מתחם Mupa Budapest.",
      "היכל הקונצרטים הלאומי בלה ברטוק במתחם Mupa Budapest מארח את הפילהרמונית הלאומית ההונגרית ותזמורות אורחות ליד מרכז החשמליות של Moricz Zsigmond korter. סיורי אדריכלות משלימים את כרטיס הקונצרט. התוכנית באתר mupa.hu.",
      "bartok-concert-hall-he"
    ),
    ar: localeEntry(
      "قاعة بيلا بارتوك الوطنية للحفلات",
      "قاعة سيمفونية في محور Moricz korter مع صوتيات عالمية المستوى داخل مجمع Mupa Budapest.",
      "تستضيف قاعة بيلا بارتوك الوطنية للحفلات في Mupa Budapest الأوركسترا الفيلهارمونية الوطنية المجرية والأوركسترات الزائرة قرب عقدة ترام Moricz Zsigmond korter. تكمل الجولات المعمارية تذكرة الحفل. البرنامج على mupa.hu.",
      "bartok-concert-hall-ar"
    ),
  },
  'prov-cov-gellert-events-ujbuda': {
    hu: localeEntry(
      "Gellért fürdőpalota események",
      "Fürdőkoncertek és wellnessprogramok a Gellértnel, szecesszios medencekkel a Gellért fürdőkörnyékén.",
      "A Gellért Fürdő a Kelenhegyi uton szezonális zenei és wellness-eseményeket rendez a szecesszios fürdőkoplexumon belul. A napijegy termálmedenceket, szaunakat és napozóteraszokat is tartalmaz a Gellért fürdőkörnyékén. Menetrend a gellertspa.hu/events oldalon.",
      "gellert-furdopalota-hu"
    ),
    es: localeEntry(
      "Eventos del Palacio de Banos Gellert",
      "Conciertos de spa y eventos wellness en Gellert, con piscinas art nouveau en la zona de los banos Gellert.",
      "El Balneario Gellert en Kelenhegyi ut ofrece eventos musicales y de bienestar de temporada dentro del complejo termal art nouveau. La entrada diaria incluye piscinas termales, saunas y terrazas para tomar el sol en la zona de los banos Gellert. Horario en gellertspa.hu/events.",
      "eventos-gellert-es"
    ),
    it: localeEntry(
      "Eventi del Palazzo termale Gellert",
      "Concerti spa ed eventi wellness al Gellert, con piscine art nouveau nella zona dei bagni Gellert.",
      "Le Terme Gellert su Kelenhegyi ut ospitano eventi stagionali di musica e benessere all interno del complesso termale art nouveau. Il biglietto giornaliero comprende piscine termali, saune e terrazze solarium nella zona dei Bagni Gellert. Orari su gellertspa.hu/events.",
      "eventi-gellert-it"
    ),
    he: localeEntry(
      "אירועי ארמון המרחצאות גלרט",
      "קונצרטי ספא ואירועי וולנס בגלרט, עם בריכות אר נובו באזור מרחצאות גלרט.",
      "מרחצאות גלרט ב-Kelenhegyi ut מארחים אירועי מוזיקה ובריאות עונתיים בתוך מתחם הרחצה הארט-נובואי. כרטיס יומי כולל בריכות תרמיות, סאונות ומרפסות שמש באזור מרחצאות גלרט. לוח הזמנים באתר gellertspa.hu/events.",
      "gellert-bath-palace-he"
    ),
    ar: localeEntry(
      "فعاليات قصر حمام غيليرت",
      "حفلات سبا وفعاليات عافية في غيليرت مع برك آرت نوفو في منطقة حمامات غيليرت.",
      "يستضيف حمام غيليرت على Kelenhegyi ut فعاليات موسيقية وعافية موسمية داخل مجمع الحمامات الحرارية بطراز الآرت نوفو. تشمل تذكرة اليوم بركاً حرارية وساونا وشرفات شمسية في منطقة حمامات غيليرت. الجدول على gellertspa.hu/events.",
      "gellert-bath-palace-ar"
    ),
  },
  'prov-cov-bikas-expo': {
    hu: localeEntry(
      "Budapest Expo események",
      "Vásárok és expók a Bikas park közelében, konferenciacsarnokkal az Albertirsai uton Újbudan.",
      "A Budapest Expo a Bikas park közelében szakvásároknak, autóipari kiállításoknak és nyilvános rendezvényeknek ad helyet dél-Újbudan. A csarnokok az M4-es metróhoz kapcsolódnak, és egész évben vállalati eseményeket is fogadnak. A naptár a budapestexpo.hu oldalon van.",
      "budapest-expo-hu"
    ),
    es: localeEntry(
      "Eventos Budapest Expo",
      "Ferias y exposiciones junto a Bikas park, con pabellones de convenciones en Albertirsai ut en Ujbuda.",
      "Budapest Expo, cerca de Bikas park, acoge ferias sectoriales, exposiciones de coches y eventos abiertos al publico en el sur de Ujbuda. Los pabellones conectan con la linea 4 del metro y reciben eventos corporativos durante todo el ano. Calendario en budapestexpo.hu.",
      "budapest-expo-es"
    ),
    it: localeEntry(
      "Eventi Budapest Expo",
      "Fiere ed esposizioni vicino a Bikas park, con padiglioni congressuali su Albertirsai ut a Ujbuda.",
      "Budapest Expo, vicino a Bikas park, ospita fiere di settore, esposizioni automobilistiche e manifestazioni aperte al pubblico nella parte sud di Ujbuda. I padiglioni sono collegati alla linea 4 della metro e accolgono eventi aziendali tutto l anno. Calendario su budapestexpo.hu.",
      "budapest-expo-it"
    ),
    he: localeEntry(
      "אירועי Budapest Expo",
      "ירידים ותערוכות ליד Bikas park, עם אולמות כנסים ב-Albertirsai ut באויבודה.",
      "Budapest Expo ליד Bikas park מארח תערוכות מקצועיות, תערוכות רכב וירידים פתוחים לקהל בדרום Ujbuda. האולמות מחוברים לקו מטרו 4 ומשרתים גם אירועים עסקיים לאורך כל השנה. לוח האירועים באתר budapestexpo.hu.",
      "budapest-expo-he"
    ),
    ar: localeEntry(
      "فعاليات Budapest Expo",
      "معارض وملتقيات قرب Bikas park مع قاعات مؤتمرات على Albertirsai ut في أويبودا.",
      "يستضيف Budapest Expo قرب Bikas park معارض تجارية ومعارض سيارات وفعاليات عامة في جنوب Ujbuda. ترتبط القاعات بخط المترو 4 وتستقبل فعاليات الشركات طوال العام. الجدول على budapestexpo.hu.",
      "budapest-expo-ar"
    ),
  },
};

module.exports = { COV_EVENT_I18N };
