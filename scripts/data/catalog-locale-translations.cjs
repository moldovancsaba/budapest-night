/** Locale blocks for Parties, Restaurants, Cafés providers (hu, es, it, he, ar). */
const S = (line) => line;

const LOCALES_BY_ID = {
  "prov-gerbeaud-belvaros": {
    hu: {
      name: "Gerbeaud",
      shortDescription:
        "Történelmi cukrászda a Vörösmarty téren — torták, kávé és terasz a belváros szívében.",
      longDescription:
        "A Gerbeaud a 19. század óta budapesti intézmény. Espresszó, klasszikus magyar sütemények és teraszon üldögélés a Vörösmarty téren, mielőtt a Váci utcát és a dunai sétányt fedeznéd fel.\n\n" +
        S("Sources: https://www.gerbeaud.hu"),
      slug: "gerbeaud-cukraszda",
    },
    es: {
      name: "Gerbeaud",
      shortDescription:
        "Pastelería histórica en Vörösmarty tér — pasteles, café y terraza en el corazón de Pest.",
      longDescription:
        "Gerbeaud es una institución budapestina desde el siglo XIX. Para espresso, pasteles húngaros clásicos y terraza en Vörösmarty tér antes de explorar Váci utca y el paseo del Danubio.\n\n" +
        S("Sources: https://www.gerbeaud.hu"),
      slug: "gerbeaud-pasteleria",
    },
    it: {
      name: "Gerbeaud",
      shortDescription:
        "Pasticceria storica in Vörösmarty tér — torte, caffè e terrazza nel cuore di Pest.",
      longDescription:
        "Gerbeaud è un'istituzione di Budapest dal XIX secolo. Espresso, pasticcini ungheresi classici e terrazza su Vörösmarty tér prima di esplorare Váci utca e il lungofiume.\n\n" +
        S("Sources: https://www.gerbeaud.hu"),
      slug: "gerbeaud-pasticceria",
    },
    he: {
      name: "גרבו",
      shortDescription:
        "קונדיטוריה היסטורית בכיכר ורושמרטי — עוגות, קפה וטרסה בלב פשט.",
      longDescription:
        "גרבו הוא מוסד בודפשטי מאז המאה ה-19. אספרסו, מאפים הונגריים קלאסיים וישיבה בטרסה בכיכר ורושמרטי לפני טיול ברחוב ואצי וטיילת הדנובה.\n\n" +
        S("Sources: https://www.gerbeaud.hu"),
      slug: "gerbeaud",
    },
    ar: {
      name: "جيربو",
      shortDescription:
        "حلويات تاريخية في ساحة فوروشمارتي — كعك وقهوة وتراس في قلب بودابست.",
      longDescription:
        "جيربو مؤسسة بودابستية منذ القرن التاسع عشر. قهوة وحلويات مجارية كلاسيكية وتراس في فوروشمارتي قبل استكشاف شارع فاتشي والواجهة النهرية.\n\n" +
        S("Sources: https://www.gerbeaud.hu"),
      slug: "gerbeaud",
    },
  },

  "prov-new-york-cafe-belvaros": {
    hu: {
      name: "New York Café",
      shortDescription:
        "Pazar kávéház-étterem a Boscolo szállóban — aranyozott terem és klasszikus budapesti kávéházi kultúra.",
      longDescription:
        "A New York Café az Anantara New York Palace Budapestben híres nagy békebeli étterméről, kávéjáról, süteményeiről és esti programjairól. Foglalj előre vacsorára vagy afternoon tea-re; csúcsidőben smart casual öltözék.\n\n" +
        S("Sources: https://www.newyorkcafe.hu"),
      slug: "new-york-kavehaz",
    },
    es: {
      name: "New York Café",
      shortDescription:
        "Café-restaurante opulento en el hotel Boscolo — interiores dorados y cultura clásica húngara.",
      longDescription:
        "El New York Café en el Anantara New York Palace Budapest es famoso por su gran comedor belle époque, café, pasteles y programas nocturnos. Reserva con antelación para cena o afternoon tea; vestimenta smart-casual en horas punta.\n\n" +
        S("Sources: https://www.newyorkcafe.hu"),
      slug: "new-york-cafe",
    },
    it: {
      name: "New York Café",
      shortDescription:
        "Caffè-ristorante sontuoso nel Boscolo Hotel — interni dorati e cultura del caffè ungherese.",
      longDescription:
        "Il New York Café nell'Anantara New York Palace Budapest è celebre per la sala belle époque, caffè, pasticcini e serate. Prenota per cena o afternoon tea; abbigliamento smart-casual nelle ore di punta.\n\n" +
        S("Sources: https://www.newyorkcafe.hu"),
      slug: "new-york-cafe-it",
    },
    he: {
      name: "קפה ניו יורק",
      shortDescription:
        "בית קפה-מסעדה מפואר במלון בוסקולו — אולמות מוזהבים ותרבות קפה הונגרית קלאסית.",
      longDescription:
        "קפה ניו יורק ב-Anantara New York Palace בודפשט מפורסם באולם האוכל הגדול, קפה, מאפים ותוכניות ערב. הזמינו מראש לארוחת ערב או תה אחר הצהריים; לבוש חכם-לא רשמי בשעות שיא.\n\n" +
        S("Sources: https://www.newyorkcafe.hu"),
      slug: "kafe-new-york",
    },
    ar: {
      name: "مقهى نيويورك",
      shortDescription:
        "مقهى ومطعم فخم في فندق بوسكولو — قاعات مذهبة وثقافة المقاهي المجرية الكلاسيكية.",
      longDescription:
        "مقهى نيويورك في أنانتارا نيويورك بالاس بودابست مشهور بقاعة الطعام الكبرى والقهوة والحلويات وبرامج المساء. احجز مسبقاً للعشاء أو شاي بعد الظهر؛ لباس أنيق غير رسمي في أوقات الذروة.\n\n" +
        S("Sources: https://www.newyorkcafe.hu"),
      slug: "muqha-new-york",
    },
  },

  "prov-szimpla-kert-erzsebetvaros": {
    hu: {
      name: "Szimpla Kert",
      shortDescription:
        "Ikonikus romkocsma a Zsidó negyedben — udvarok, élő zene és budapesti éjszakai hangulat.",
      longDescription:
        "A Szimpla Kert Budapest egyik leghíresebb romkocsmája a Kazinczy utcában. Színes helyiségek, street food, koncertek és zsúfolt hétvégi tömeg. Aktuális program és nyitvatartás: szimpla.hu.\n\n" +
        S("Sources: https://szimpla.hu"),
      slug: "szimpla-kert",
    },
    es: {
      name: "Szimpla Kert",
      shortDescription:
        "Ruin bar icónico en el Barrio Judío — patios, música en vivo y energía nocturna de Budapest.",
      longDescription:
        "Szimpla Kert es uno de los ruin bars más conocidos de Budapest en el Barrio Judío (Kazinczy utca). Salas eclécticas, street food, conciertos y multitud los fines de semana. Consulta szimpla.hu para eventos y horarios.\n\n" +
        S("Sources: https://szimpla.hu"),
      slug: "szimpla-kert-es",
    },
    it: {
      name: "Szimpla Kert",
      shortDescription:
        "Ruin bar iconico nel Quartiere Ebraico — cortili, live e nightlife di Budapest.",
      longDescription:
        "Szimpla Kert è uno dei ruin bar più famosi di Budapest in Kazinczy utca. Stanze eclettiche, street food, concerti e folla nel weekend. Eventi e orari su szimpla.hu.\n\n" +
        S("Sources: https://szimpla.hu"),
      slug: "szimpla-kert-it",
    },
    he: {
      name: "סימפלה קרט",
      shortDescription:
        "בר הריסות אייקוני ברובע היהודי — חצרות, מוזיקה חיה ואנרגיית לילה בבודפשט.",
      longDescription:
        "סימפלה קרט הוא אחד מבתי הבר הריסות המפורסמים בבודפשט ברובע היהודי (רחוב קזינצי). חדרים אקלקטיים, אוכל רחוב, הופעות וקהל עמוס בסופי שבוע. אירועים ושעות ב-szimpla.hu.\n\n" +
        S("Sources: https://szimpla.hu"),
      slug: "szimpla-kert-he",
    },
    ar: {
      name: "سيمبلا كيرت",
      shortDescription:
        "بار أنقاض أيقوني في الحي اليهودي — ساحات وموسيقى حية وحياة ليلية في بودابست.",
      longDescription:
        "سيمبلا كيرت من أشهر بارات الأنقاض في بودابست في الحي اليهودي (كازينتسي). غرف متنوعة وطعام شارع وحفلات وحشود في عطلة نهاية الأسبوع. الفعاليات والمواعيد على szimpla.hu.\n\n" +
        S("Sources: https://szimpla.hu"),
      slug: "szimpla-kert-ar",
    },
  },

  "prov-mazel-tov-erzsebetvaros": {
    hu: {
      name: "Mazel Tov",
      shortDescription:
        "Mediterrán kerthelyiség a Zsidó negyedben — nappali brunch, esti DJ-k és élő zene.",
      longDescription:
        "A Mazel Tov kerthelyiség és bár a régi Zsidó negyedben (Akácfa utca 47) mediterrán ételeket, koktélokat és borokat kínál. A konyha 22:00–22:30 körül zár; esténként DJ-k és közösségi programok. Foglalás: mazeltov.hu vagy +36 70 626 4280.\n\n" +
        S("Sources: https://mazeltov.hu/en"),
      slug: "mazel-tov",
    },
    es: {
      name: "Mazel Tov",
      shortDescription:
        "Restaurante jardín mediterráneo en el Barrio Judío — brunch de día, DJs y música en vivo por la noche.",
      longDescription:
        "Mazel Tov es restaurante y bar con jardín en el antiguo Barrio Judío (Akácfa utca 47) con platos mediterráneos, cócteles y vinos. Cocina hasta 22:00–22:30; por la noche DJs y eventos. Reservas: mazeltov.hu o +36 70 626 4280.\n\n" +
        S("Sources: https://mazeltov.hu/en"),
      slug: "mazel-tov-es",
    },
    it: {
      name: "Mazel Tov",
      shortDescription:
        "Ristorante-giardino mediterraneo nel Quartiere Ebraico — brunch di giorno, DJ e live la sera.",
      longDescription:
        "Mazel Tov è ristorante e bar con giardino nel vecchio Quartiere Ebraico (Akácfa utca 47) con piatti mediterranei, cocktail e vini. Cucina fino alle 22:00–22:30; la sera DJ ed eventi. Prenotazioni: mazeltov.hu o +36 70 626 4280.\n\n" +
        S("Sources: https://mazeltov.hu/en"),
      slug: "mazel-tov-it",
    },
    he: {
      name: "מזל טוב",
      shortDescription:
        "מסעדת גן ים תיכונית ברובע היהודי — בראנץ' ביום, DJ ומוזיקה חיה בערב.",
      longDescription:
        "מזל טוב הוא מסעדה ובר עם גן ברובע היהודי הישן (אקאצפה 47) עם מנות ים תיכוניות, קוקטיילים ויינות. המטבח נסגר סביב 22:00–22:30; בערב DJ ואירועים. הזמנות: mazeltov.hu או +36 70 626 4280.\n\n" +
        S("Sources: https://mazeltov.hu/en"),
      slug: "mazel-tov-he",
    },
    ar: {
      name: "مازل توف",
      shortDescription:
        "مطعم حديقة متوسطي في الحي اليهودي — برانش نهاراً ودي جاي وموسيقى حية مساءً.",
      longDescription:
        "مازل توف مطعم وبار بحديقة في الحي اليهودي القديم (أكاشفا 47) يقدم أطباقاً متوسطية وكوكتيلات ونبيذاً. المطبخ يغلق حوالي 22:00–22:30؛ مساءً دي جاي وفعاليات. الحجز: mazeltov.hu أو +36 70 626 4280.\n\n" +
        S("Sources: https://mazeltov.hu/en"),
      slug: "mazel-tov-ar",
    },
  },

  "prov-otkert-belvaros": {
    hu: {
      name: "Ötkert",
      shortDescription:
        "Basilica-környéki nightclub — két táncparkett, tetőterasz, szerda–szombat 23:00-tól.",
      longDescription:
        "Az Ötkert a Szent István-bazilika közelében, a Zrínyi utca 4/A alatt működik szerda–szombat 23:00–05:00 között több teremmel és kihúzható tetőterasszal. Standard belépő a hivatalos oldalon 4 000 Ft (pricePerClass tervezési összeg). VIP: reservation@otkert.hu vagy +36 70 330 8652.\n\n" +
        S("Sources: https://otkert.hu/en/ https://otkert.hu/en/contact/"),
      slug: "otkert",
    },
    es: {
      name: "Ötkert",
      shortDescription:
        "Discoteca junto a la Basílica — dos pistas, terraza en la azotea, mié–sáb desde las 23:00.",
      longDescription:
        "Ötkert es una discoteca céntrica cerca de la Basílica de San Esteban en Zrínyi utca 4/A, abierta miércoles a sábado 23:00–05:00 con varias salas y terraza retráctil. Entrada estándar 4 000 HUF en la web oficial (cifra de planificación en pricePerClass). VIP: reservation@otkert.hu o +36 70 330 8652.\n\n" +
        S("Sources: https://otkert.hu/en/ https://otkert.hu/en/contact/"),
      slug: "otkert-es",
    },
    it: {
      name: "Ötkert",
      shortDescription:
        "Discoteca zona Basilica — due piste, terrazza sul tetto, mer–sab dalle 23:00.",
      longDescription:
        "Ötkert è un nightclub centrale vicino alla Basilica di Santo Stefano in Zrínyi utca 4/A, aperto mer–sab 23:00–05:00 con più sale e terrazza retrattile. Ingresso standard 4 000 HUF sul sito ufficiale (cifra di pianificazione in pricePerClass). VIP: reservation@otkert.hu o +36 70 330 8652.\n\n" +
        S("Sources: https://otkert.hu/en/ https://otkert.hu/en/contact/"),
      slug: "otkert-it",
    },
    he: {
      name: "אוטקרט",
      shortDescription:
        "מועדון לילה ליד הבזיליקה — שתי רחבות ריקודים וגג, ד'–ש' מ-23:00.",
      longDescription:
        "אוטקרט הוא מועדון לילה מרכזי ליד בזיליקת סטפן הקדוש ברחוב זריני 4/א, פתוח ד'–ש' 23:00–05:00 עם חדרים וטרסת גג נשלפת. כניסה רגילה 4,000 פורינט באתר הרשמי (מספר תכנון ב-pricePerClass). VIP: reservation@otkert.hu או +36 70 330 8652.\n\n" +
        S("Sources: https://otkert.hu/en/ https://otkert.hu/en/contact/"),
      slug: "otkert-he",
    },
    ar: {
      name: "أوتكيرت",
      shortDescription:
        "نادٍ ليلي قرب البازيليكا — حارتان رقص وتراس سطح، أربعاء–سبت من 23:00.",
      longDescription:
        "أوتكيرت نادٍ ليلي مركزي قرب بازيليكا القديس استفان في زريني 4/أ، مفتوح أربعاء–سبت 23:00–05:00 بعدة قاعات وتراس سطح قابل للسحب. دخول قياسي 4,000 فورنت على الموقع الرسمي (رقم تخطيط في pricePerClass). VIP: reservation@otkert.hu أو +36 70 330 8652.\n\n" +
        S("Sources: https://otkert.hu/en/ https://otkert.hu/en/contact/"),
      slug: "otkert-ar",
    },
  },

  "prov-doboz-erzsebetvaros": {
    hu: {
      name: "Doboz",
      shortDescription:
        "Romkocsma 320 éves fával, kerti táncparkettel és két beltéri teremmel — szerda–szombat éjjel.",
      longDescription:
        "A Doboz romkocsma-klub a Klauzál utca 10. szám alatt beltéri termekkel és nagy kerti táncparkettel, szerda–szombat 18:00–06:00. Minimum 18 év. Kapcsolat: info@doboz.pm vagy +36 20 449 4801. Program és VIP: doboz.co.hu.\n\n" +
        S("Sources: https://doboz.co.hu/en/ https://doboz.co.hu/en/contact/"),
      slug: "doboz",
    },
    es: {
      name: "Doboz",
      shortDescription:
        "Ruin pub con árbol de 320 años, pista en el jardín y dos salas — noches mié–sáb.",
      longDescription:
        "Doboz es un ruin bar y club en Klauzál utca 10 con salas interiores y gran pista en el jardín, abierto miércoles–sábado 18:00–06:00. Edad mínima 18. Contacto: info@doboz.pm o +36 20 449 4801. Programas y VIP en doboz.co.hu.\n\n" +
        S("Sources: https://doboz.co.hu/en/ https://doboz.co.hu/en/contact/"),
      slug: "doboz-es",
    },
    it: {
      name: "Doboz",
      shortDescription:
        "Ruin pub con albero secolare, pista nel giardino e due sale — notti mer–sab.",
      longDescription:
        "Doboz è ruin bar e club in Klauzál utca 10 con sale interne e grande pista nel giardino, aperto mer–sab 18:00–06:00. Età minima 18. Contatto: info@doboz.pm o +36 20 449 4801. Programma e VIP su doboz.co.hu.\n\n" +
        S("Sources: https://doboz.co.hu/en/ https://doboz.co.hu/en/contact/"),
      slug: "doboz-it",
    },
    he: {
      name: "דובוז",
      shortDescription:
        "בר הריסות עם עץ בן 320 שנה, רחבת ריקודים בגינה ושתי חדרים — לילות ד'–ש'.",
      longDescription:
        "דובוז הוא בר הריסות ומועדון ברחוב קלאוזל 10 עם חדרים פנימיים ורחבת ריקודים גדולה בגינה, פתוח ד'–ש' 18:00–06:00. גיל מינימום 18. קשר: info@doboz.pm או +36 20 449 4801. תוכנית ו-VIP ב-doboz.co.hu.\n\n" +
        S("Sources: https://doboz.co.hu/en/ https://doboz.co.hu/en/contact/"),
      slug: "doboz-he",
    },
    ar: {
      name: "دوبوز",
      shortDescription:
        "حانة أنقاض بشجرة عمرها 320 عاماً وميدان رقص في الحديقة وغرفتان — ليالي أربعاء–سبت.",
      longDescription:
        "دوبوز حانة أنقاض ونادٍ في كلاوزال 10 بغرف داخلية وميدان رقص كبير في الحديقة، مفتوح أربعاء–سبت 18:00–06:00. الحد الأدنى للعمر 18. تواصل: info@doboz.pm أو +36 20 449 4801. البرنامج وVIP على doboz.co.hu.\n\n" +
        S("Sources: https://doboz.co.hu/en/ https://doboz.co.hu/en/contact/"),
      slug: "doboz-ar",
    },
  },

  "prov-instant-fogas-erzsebetvaros": {
    hu: {
      name: "Instant-Fogas",
      shortDescription:
        "Hétklubos romkomplexum az Akácfa utcán — Európa egyik legnagyobb buli labirintusa, naponta 18:00–06:00.",
      longDescription:
        "Az Instant-Fogas az Instant és a Fogasház romkocsmáit egyesíti az Akácfa utca 49-51. alatt: hét klub, több táncparkett és kert. A legtöbb estén ingyenes a belépés; egyes koncertek jegyesek az instant-fogas.com-on. Asztalfoglalás: +36 70 638 5040, info@instant-fogas.com.\n\n" +
        S("Sources: https://instant-fogas.com/ https://instant-fogas.com/contact/"),
      slug: "instant-fogas",
    },
    es: {
      name: "Instant-Fogas",
      shortDescription:
        "Complejo ruin de siete clubs en Akácfa utca — uno de los laberintos de fiesta más grandes de Europa, 18:00–06:00.",
      longDescription:
        "Instant-Fogas fusiona los ruin pubs Instant y Fogasház en Akácfa utca 49-51 con siete clubs, varias pistas y jardín. Muchas noches entrada gratis; algunos conciertos con entrada en instant-fogas.com. Reservas de mesa: +36 70 638 5040, info@instant-fogas.com.\n\n" +
        S("Sources: https://instant-fogas.com/ https://instant-fogas.com/contact/"),
      slug: "instant-fogas-es",
    },
    it: {
      name: "Instant-Fogas",
      shortDescription:
        "Complesso ruin a sette club in Akácfa utca — tra i labirinti party più grandi d'Europa, 18:00–06:00.",
      longDescription:
        "Instant-Fogas unisce i ruin pub Instant e Fogasház in Akácfa utca 49-51 con sette club, più piste e giardino. Molte serate ingresso libero; alcuni concerti a biglietto su instant-fogas.com. Tavoli: +36 70 638 5040, info@instant-fogas.com.\n\n" +
        S("Sources: https://instant-fogas.com/ https://instant-fogas.com/contact/"),
      slug: "instant-fogas-it",
    },
    he: {
      name: "אינסטנט-פוגאש",
      shortDescription:
        "מתחם הריסות בשבעה מועדונים ברחוב אקאצפה — מבוך המסיבות הגדול באירופה, 18:00–06:00.",
      longDescription:
        "אינסטנט-פוגאש מאחד את ברי ההריסות אינסטנט ופוגאש ברחוב אקאצפה 49-51 עם שבעה מועדונים, רחבות ריקודים וגינה. ברוב הלילות כניסה חינם; חלק מהקונצרטים בתשלום ב-instant-fogas.com. שולחנות: +36 70 638 5040, info@instant-fogas.com.\n\n" +
        S("Sources: https://instant-fogas.com/ https://instant-fogas.com/contact/"),
      slug: "instant-fogas-he",
    },
    ar: {
      name: "إنستانت-فوغاش",
      shortDescription:
        "مجمع أنقاض بسبعة نوادٍ في أكاشفا — من أكبر متاهات الحفلات في أوروبا، 18:00–06:00.",
      longDescription:
        "إنستانت-فوغاش يدمج حانتي الأنقاض إنستانت وفوغاش في أكاشفا 49-51 بسبعة نوادٍ ومساحات رقص وحديقة. معظم الليالي دخول مجاني؛ بعض الحفلات بتذاكر على instant-fogas.com. حجز طاولات: +36 70 638 5040، info@instant-fogas.com.\n\n" +
        S("Sources: https://instant-fogas.com/ https://instant-fogas.com/contact/"),
      slug: "instant-fogas-ar",
    },
  },

  "prov-corvin-club-ferencvaros": {
    hu: {
      name: "Corvin Club",
      shortDescription:
        "Techno intézmény a Corvin Plaza felett — beltéri termek és tetőterasz kilátással Pestre.",
      longDescription:
        "A Corvin Club elektronikus zenei helyszín a Corvin áruház 4. emeletén, a Blaha Lujza tér 1-2. alatt, több teremmel és tetőterasszal. Line-up és jegyek: corvinclub.hu.\n\n" +
        S("Sources: https://corvinclub.hu/"),
      slug: "corvin-club",
    },
    es: {
      name: "Corvin Club",
      shortDescription:
        "Institución techno sobre Corvin Plaza — salas interiores y terraza con vistas a Pest.",
      longDescription:
        "Corvin Club es una sala de música electrónica en la 4.ª planta del centro comercial Corvin en Blaha Lujza tér 1-2, con varias salas y terraza en la azotea. Cartelera y entradas en corvinclub.hu.\n\n" +
        S("Sources: https://corvinclub.hu/"),
      slug: "corvin-club-es",
    },
    it: {
      name: "Corvin Club",
      shortDescription:
        "Istituzione techno sopra Corvin Plaza — sale indoor e terrazza con vista su Pest.",
      longDescription:
        "Corvin Club è un locale di musica elettronica al 4° piano del Corvin in Blaha Lujza tér 1-2, con più sale e terrazza sul tetto. Line-up e biglietti su corvinclub.hu.\n\n" +
        S("Sources: https://corvinclub.hu/"),
      slug: "corvin-club-it",
    },
    he: {
      name: "קורבין קלאב",
      shortDescription:
        "מוסד טכנו מעל קורבין פלאזה — חדרים וטרסת גג עם נוף לפשט.",
      longDescription:
        "קורבין קלאב הוא מקום מוזיקה אלקטרונית בקומה הרביעית של קורבין בכיכר בלהה לוז'ה 1-2, עם חדרים וטרסת גג. ליינאפ וכרטיסים ב-corvinclub.hu.\n\n" +
        S("Sources: https://corvinclub.hu/"),
      slug: "corvin-club-he",
    },
    ar: {
      name: "كورفين كلوب",
      shortDescription:
        "مؤسسة تكنو فوق كورفين بلازا — قاعات داخلية وتراس بإطلالة على بست.",
      longDescription:
        "كورفين كلوب مكان موسيقى إلكترونية في الطابق الرابع من كورفين في بلاها لويزا 1-2، بعدة قاعات وتراس سطح. البرنامج والتذاكر على corvinclub.hu.\n\n" +
        S("Sources: https://corvinclub.hu/"),
      slug: "corvin-club-ar",
    },
  },

  "prov-central-market-ferencvaros": {
    hu: {
      name: "Nagy Vásárcsarnok",
      shortDescription:
        "1897-es Zsolnay-cserépes piaccsarnok — lángos, paprika, zöldség és ételstandok a Duna mellett.",
      longDescription:
        "A Nagy Vásárcsarnok a Vámház körút 1-3. szám alatt Budapest legnagyobb fedett piaca, 1897-ben nyílt, három szinten termelőkkel, magyar specialitásokkal és kész ételekkel. Nyitvatartás és árusok: piaconline.hu.\n\n" +
        S("Sources: https://piaconline.hu/"),
      slug: "nagy-vasarcsarnok",
    },
    es: {
      name: "Gran Mercado Cubierto",
      shortDescription:
        "Mercado de 1897 con azulejos Zsolnay — lángos, pimentón, productos y puestos junto al Danubio.",
      longDescription:
        "El Gran Mercado Cubierto (Nagy Vásárcsarnok) en Vámház körút 1-3 es el mayor mercado cubierto de Budapest, inaugurado en 1897 con tres plantas de productos, especialidades húngaras y comida preparada. Horarios e info en piaconline.hu.\n\n" +
        S("Sources: https://piaconline.hu/"),
      slug: "gran-mercado-budapest",
    },
    it: {
      name: "Grande Mercato Coperto",
      shortDescription:
        "Mercato del 1897 con piastrelle Zsolnay — lángos, paprika, prodotti e bancarelle sul Danubio.",
      longDescription:
        "Il Grande Mercato Coperto (Nagy Vásárcsarnok) in Vámház körút 1-3 è il più grande mercato coperto di Budapest, del 1897, con tre piani di prodotti, specialità ungheresi e street food. Orari su piaconline.hu.\n\n" +
        S("Sources: https://piaconline.hu/"),
      slug: "grande-mercato-budapest",
    },
    he: {
      name: "אולם השוק הגדול",
      shortDescription:
        "שוק מקורה מ-1897 עם אריחי Zsolnay — לאנגוש, פפריקה, תוצרת ודוכני אוכל ליד הדנובה.",
      longDescription:
        "אולם השוק הגדול (Nagy Vásárcsarnok) ברחוב ואמהאז 1-3 הוא שוק מקורה הגדול בבודפשט, נפתח ב-1897 עם שלוש קומות של תוצרת, מטעמים הונגריים ואוכל מוכן. שעות ומידע ב-piaconline.hu.\n\n" +
        S("Sources: https://piaconline.hu/"),
      slug: "ulam-ha-shuk-ha-gadol",
    },
    ar: {
      name: "سوق العظيم المغطى",
      shortDescription:
        "سوق 1897 ببلاط زولناي — لانغوش وبابريكا ومنتجات وأكشاك بجانب الدانوب.",
      longDescription:
        "سوق العظيم (Nagy Vásárcsarnok) في فامهاز 1-3 أكبر سوق مغطى في بودابست، افتُتح 1897 بثلاثة طوابق من المنتجات والتخصصات المجرية والطعام الجاهز. المواعيد على piaconline.hu.\n\n" +
        S("Sources: https://piaconline.hu/"),
      slug: "al-souq-al-kabir",
    },
  },

  "prov-espresso-embassy-belvaros": {
    hu: {
      name: "Espresso Embassy",
      shortDescription:
        "Úttörő specialty kávézó a Bazilika közelében — espresso, filter és sütemények 2012 óta.",
      longDescription:
        "Az Espresso Embassy az Arany János utca 15. szám alatt Budapest egyik korai harmadik generációs kávézója, espresso és kézi filter kávékkal, váltó pörkölőkkel. Italárak tervezési összegek; aktuális menü a helyszínen. Nyitvatartás a specialty.hu-n: H–P 07:30-tól, Szo–V 09:00-tól. Telefon: +36 20 445 0063.\n\n" +
        S("Sources: https://specialty.hu/en/venue/budapest/espresso-embassy"),
      slug: "espresso-embassy",
    },
    es: {
      name: "Espresso Embassy",
      shortDescription:
        "Café de especialidad pionero cerca de la Basílica — espresso, filtro y pasteles desde 2012.",
      longDescription:
        "Espresso Embassy en Arany János utca 15 es uno de los primeros cafés de tercera ola de Budapest, con espresso y métodos de filtro y tostadores rotativos. Precios orientativos; menú en local. Horarios en specialty.hu: lun–vie desde 07:30, sáb–dom desde 09:00. Tel. +36 20 445 0063.\n\n" +
        S("Sources: https://specialty.hu/en/venue/budapest/espresso-embassy"),
      slug: "espresso-embassy-es",
    },
    it: {
      name: "Espresso Embassy",
      shortDescription:
        "Caffè specialty pioniere vicino alla Basilica — espresso, filtro e pasticci dal 2012.",
      longDescription:
        "Espresso Embassy in Arany János utca 15 è tra i primi caffè third-wave di Budapest, con espresso e brew filtro e torrefazioni a rotazione. Prezzi indicativi; menu in sede. Orari su specialty.hu: lun–ven dalle 07:30, sab–dom dalle 09:00. Tel. +36 20 445 0063.\n\n" +
        S("Sources: https://specialty.hu/en/venue/budapest/espresso-embassy"),
      slug: "espresso-embassy-it",
    },
    he: {
      name: "אספרסו אמבסי",
      shortDescription:
        "בית קפה מיוחד חלוצי ליד הבזיליקה — אספרסו, פילטר ומאפים מאז 2012.",
      longDescription:
        "אספרסו אמבסי ברחוב ארניאי יאנוש 15 הוא בין בתי הקפה המוקדמים של גל שלישי בבודפשט, עם אספרסו וחליטות יד וקלייה מתחלפת. מחירים להערכה בלבד; תפריט בחנות. שעות ב-specialty.hu: ב׳–ו׳ מ-07:30, ש׳–א׳ מ-09:00. טל. +36 20 445 0063.\n\n" +
        S("Sources: https://specialty.hu/en/venue/budapest/espresso-embassy"),
      slug: "espresso-embassy-he",
    },
    ar: {
      name: "إسبريسو إمباسي",
      shortDescription:
        "مقهى مختص رائد قرب البازيليكا — إسبريسو وتصفية وحلويات منذ 2012.",
      longDescription:
        "إسبريسو إمباسي في أراني يانوش 15 من أوائل مقاهي الموجة الثالثة في بودابست، بإسبريسو وتحضير يدوي ومحامص متناوبة. الأسعار تقديرية؛ القائمة في المكان. المواعيد على specialty.hu: الإثنين–الجمعة من 07:30، السبت–الأحد من 09:00. هاتف +36 20 445 0063.\n\n" +
        S("Sources: https://specialty.hu/en/venue/budapest/espresso-embassy"),
      slug: "espresso-embassy-ar",
    },
  },

  "prov-360-bar-terezvaros": {
    hu: {
      name: "360 Bar",
      shortDescription:
        "Tetőteraszos koktélok az Andrássy úton — fűtött igloo kert télen, panoráma egész évben.",
      longDescription:
        "A 360 Bar az Andrássy út 39. szám alatt, az Oktogon felett koktélbár tetőterasszal; hidegebb hónapokban Igloo Garden sátrak. Nyitvatartás: H–Sze 14:00–00:00, Cs–Szo 14:00–02:00, V 14:00–00:00. Foglalás és események: info@360bar.hu, +36 30 360 3600.\n\n" +
        S("Sources: https://www.360bar.hu/"),
      slug: "360-bar",
    },
    es: {
      name: "360 Bar",
      shortDescription:
        "Cócteles en azotea en Andrássy út — jardín iglú climatizado en invierno, vistas todo el año.",
      longDescription:
        "360 Bar en Andrássy út 39 es un cocktail bar en la azotea sobre Oktogon con terraza; en invierno domos Igloo Garden. Horarios: lun–mié 14:00–00:00, jue–sáb 14:00–02:00, dom 14:00–00:00. Reservas: info@360bar.hu, +36 30 360 3600.\n\n" +
        S("Sources: https://www.360bar.hu/"),
      slug: "360-bar-es",
    },
    it: {
      name: "360 Bar",
      shortDescription:
        "Cocktail su rooftop su Andrássy út — giardino igloo riscaldato in inverno, skyline tutto l'anno.",
      longDescription:
        "360 Bar in Andrássy út 39 è un cocktail bar sul tetto sopra Oktogon; nei mesi freddi cupole Igloo Garden. Orari: lun–mer 14:00–00:00, gio–sab 14:00–02:00, dom 14:00–00:00. Prenotazioni: info@360bar.hu, +36 30 360 3600.\n\n" +
        S("Sources: https://www.360bar.hu/"),
      slug: "360-bar-it",
    },
    he: {
      name: "360 בר",
      shortDescription:
        "קוקטיילים על הגג באנדרסי — גן איגלו מחומם בחורף ונוף לכל העיר.",
      longDescription:
        "360 בר באנדרסי 39 הוא בר קוקטיילים על הגג מעל אוקטוגון; בחורף כיפות Igloo Garden. שעות: ב׳–ד׳ 14:00–00:00, ה׳–ש׳ 14:00–02:00, א׳ 14:00–00:00. הזמנות: info@360bar.hu, +36 30 360 3600.\n\n" +
        S("Sources: https://www.360bar.hu/"),
      slug: "360-bar-he",
    },
    ar: {
      name: "360 بار",
      shortDescription:
        "كوكتيلات على السطح في أندراسي — حديقة إيغلو مدفأة في الشتاء وإطلالة طوال العام.",
      longDescription:
        "360 بار في أندراسي 39 بار كوكتيل على السطح فوق أوكتوجون؛ في الشتاء قباب Igloo Garden. المواعيد: الإثنين–الأربعاء 14:00–00:00، الخميس–السبت 14:00–02:00، الأحد 14:00–00:00. الحجز: info@360bar.hu، +36 30 360 3600.\n\n" +
        S("Sources: https://www.360bar.hu/"),
      slug: "360-bar-ar",
    },
  },
};

module.exports = { LOCALES_BY_ID };
