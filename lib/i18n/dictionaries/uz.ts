import type { Dictionary } from '../types';

/**
 * O'zbekcha (lotin yozuvi).
 *
 * ⚠️ Bu matnlarni ona tili egasi ko'rib chiqishi kerak. Ma'no va grammatika
 * to'g'ri, lekin kartochka matnlari — mahsulotning eng nozik qismi, va tirik
 * ohang faqat ona tilida gapiradigan odam bilan yetkaziladi. Tahrir qilishda
 * uslubga rioya qiling: qisqa jumlalar, aniq tafsilotlar, undov belgisisiz.
 *
 * Ruscha versiyadagi kabi, shablon matnlarida jinsga bog'liq shakllardan
 * qochilgan — o'zbek tilida bu tabiiy, lekin tarjima qilishda esda tuting.
 */
export const uz: Dictionary = {
  ui: {
    nav: {
      forShops: 'Salonlarga',
      dashboard: 'Panel',
      templates: 'Shablonlar',
      works: 'Bizning ishlarimiz',
      howItWorks: 'Qanday ishlaydi',
      createCard: 'Kartochka yaratish',
      viewSite: 'Saytga',
    },

    loader: {
      linePlain: 'Kichkina dunyo,',
      lineItalic: 'bitta odam uchun yaratilgan.',
      label: 'Yig‘ilmoqda',
    },
    hero: {
      eyebrow: 'Haqiqiy guldasta uchun raqamli kartochka',
      line1: "Ba'zi tuyg'ular",
      line2: 'xabarga',
      line3: "sig'maydi.",
      sub: 'Yaqin insoningiz uchun kichkina dunyo yarating.',
      ctaPrimary: 'Chiroyli narsa yaratish',
      ctaSecondary: "Shablonlarni ko'rish",
      ctaWorks: "Ishlarni ko‘rish",
      scroll: 'Pastga',
    },

    feeling: {
      eyebrow: 'Birinchi qadam',
      title: "Tuyg'uni tanlang.",
      lead: 'Maket ham, shrift ham emas. Ekran yonganda odam nimani his qilishi kerakligidan boshlang.',
      explore: "Ko'rish",
    },

    story: {
      eyebrow: 'Ikkinchi qadam',
      title: 'Hikoyani tanlang.',
      lead: "Buni aytishning olti yo'li. Har biri o'z sur'ati, ranglari va harakatiga ega alohida tajriba — shunchaki boshqa rang emas.",
      previewPrefix: "Ko'rish",
      allTemplates: 'Barcha shablonlar',
      livePreview: "Jonli ko'rinish — video ham, maket ham emas.",
    },

    memories: {
      eyebrow: 'Uchinchi qadam',
      title: "Xotiralarni qo'shing.",
      lead: "Ism, xat, suratlar va faqat ikkovingiz uchun ma'noga ega sanalar. Biz ulardan kartochka yig'amiz — sizga faqat eslash qoladi.",
      labels: {
        name: 'Ism',
        date: 'Sana',
        detail: 'Faqat siz bilgan narsa',
        message: 'Xat',
        memory: 'Xotira',
        photos: 'Suratlar',
      },
      samples: {
        name: 'Alina',
        date: '2023-yil mart — qahva haqidagi bahs',
        detail: "Bir marta aytilgandi: pionlar gapning o'rtasida to'xtatilganday ko'rinadi.",
        message:
          "Buni o'n bir marta boshladim. Har safar yo juda kichik, yo juda ko'p bo'lib chiqdi. Mana oddiysi.",
        memory: "Kechikkan poyezd. O'sha yilning eng yaxshi to'rt soati.",
      },
    },

    bouquet: {
      eyebrow: "Ko'prik",
      title: 'Guldastaga biriktiring.',
      lead: "Gullar har doimgidek keladi. Kartochka esa — qoladigan qismi.",
      doorLine: "QR — bu shunchaki eshik. Eshikni hech kim eslab qolmaydi.",
      steps: [
        { title: 'Guldasta', body: "Do'kondan tanlanadi — har doimgidek." },
        { title: 'Kartochka', body: "Poyaga bog'langan kichkina bosma yorliq. Bitta satr va kod." },
        { title: 'Skanerlash', body: "Vazani topishdan oldin telefon qo'lga olinadi." },
        { title: 'Dunyo', body: 'Bitta odam uchun yaratilgan kichkina dunyo, ekranma-ekran ochiladi.' },
      ],
      note: 'QR — bu shunchaki eshik. Eshikni hech kim eslab qolmaydi.',
    },

    closing: {
      title: "Guldastadan ko'ra ko'proq.",
      promise: 'Guldasta befarq emasligingizni aytadi. Kartochka esa sababini tushuntiradi.',
      ctaPrimary: 'Chiroyli narsa yaratish',
      ctaSecondary: 'Tayyor kartochkani ochish',
    },

    footer: {
      promise: 'Guldasta befarq emasligingizni aytadi. Kartochka esa sababini tushuntiradi.',
      tagline: 'Bitta odam uchun yaratilgan kichkina dunyo.',
      product: 'Mahsulot',
      forShops: "Gul do'konlariga",
      links: {
        templates: 'Shablonlar',
        create: 'Kartochka yaratish',
        seeCard: "Tayyor kartochkani ko'rish",
        works: 'Bizning ishlarimiz',
        shops: 'Do‘konlarga: bu qancha beradi',
        dashboard: "Do'kon paneli",
        orders: 'Buyurtmalar',
        printable: 'Bosma QR-kartochka',
      },
    },

    templates: {
      metaTitle: 'Shablonlar',
      metaDescription:
        "Buni aytishning olti yo'li. Har bir shablon — o'z sur'ati, ranglari va harakatiga ega alohida tajriba.",
      eyebrow: 'Kutubxona',
      title: 'Hikoyani tanlang.',
      lead: "Quyidagi har bir shablon o'zini o'zi o'ynatadi — tayyor kartochkadagi kabi komponentlar, ranglar va harakat. Bu yerda birorta maket yo'q.",
      everything: 'Barchasi',
      countLine: '«{feeling}» uchun shablonlar: {count}.',
      openPreview: "To'liq ko'rinishni ochish",
      mood: 'Kayfiyat',
      motion: 'Harakat',
      suits: 'Mos keladi',
      sections: 'Bo‘limlar',
      previewOf: '«{name}» shabloni ko‘rinishi',
      preview: "Ko'rinish",
      useThis: 'Tanlash',
      back: 'Shablonlarga',
    },

    create: {
      metaTitle: 'Otkritka yaratish',
      metaDescription: 'To‘qqizta savol — va bitta odam uchun yaratilgan kichkina dunyo.',
      progress: '{total} qadamdan {current}-si',
      back: 'Orqaga',
      continue: 'Davom etish',
      steps: {
        recipient: {
          eyebrow: 'Boshlaymiz',
          question: 'Bu kimga?',
          theirName: 'Qabul qiluvchining ismi',
          yourName: 'Sizning ismingiz',
        },
        occasion: {
          eyebrow: 'Sabab',
          question: 'Qanday sabab?',
          hint: "Sabab bo'lmasa — bu ham juda yaxshi javob.",
        },
        mood: {
          eyebrow: 'Kayfiyat',
          question: "U qanday bo'lishi kerak?",
          hint: 'Bir nechtasini tanlash mumkin — otkritka kamdan-kam bir ohangda bo‘ladi.',
        },
        story: {
          eyebrow: 'Eng muhimi',
          question: 'Hikoyani aytib bering.',
          hint: "Qanday chiqsa shunday yozing — silliqlikdan ko'ra aniqlik muhimroq. Sana, bahs, bir marta tilga olingan gul.",
          placeholder: "Bu odam haqida, hikoyangiz haqida yoki aytmoqchi bo'lgan gapingizni yozing...",
          needHelp: 'Matn yozishga yordam kerak',
          wordCount: "So'zlar: {count}. Bo'sh satr yangi xatboshi ochadi.",
          emptyHint: "Bo'sh qoldiring — siz uchun qisqa va samimiy matn yozamiz.",
        },
        photos: {
          eyebrow: "Agar bo'lsa",
          question: "Bir nechta surat qo'shing.",
          hint: "Uch-to'rttasi odatda yigirmatasidan yaxshiroq. Ular yuborilishidan oldin qurilmangizda kichraytiriladi.",
          skip: 'Suratsiz',
          drop: "Suratlarni shu yerga tashlang yoki qurilmangizdan tanlang.",
          choose: 'Suratlarni tanlash',
          preparing: 'Tayyorlanmoqda…',
          enough: 'Bu yetarli',
          count: "Suratlar: {count}, siz qo'shgan tartibda.",
          remove: '{index}-suratni olib tashlash',
        },
        template: {
          eyebrow: 'Shakli',
          question: 'Hikoyani tanlang.',
          hint: "Javoblaringizga qarab biz «{name}»ni tanlagan bo'lardik. Rozi bo'lmasangiz ham bo'ladi.",
          skip: 'O‘zingiz tanlang',
          suggested: "Biz shuni tanlagan bo'lardik",
          routes: { template: 'Tayyor shablon', own: 'O‘z g‘oyam', work: 'Ishlaringizdagidek' },
          ownHint:
            'O‘z so‘zlaringiz bilan tasvirlab bering. Do‘kon kartochkani shablondan emas, sizning tavsifingizdan yig‘adi.',
          ownPlaceholder:
            'Masalan: qorong‘i ekran, bitta surat asta paydo bo‘ladi, keyin xat qatorma-qator. Va bizning qo‘shig‘imiz yangrasin.',
          workHint:
            'Yoqqanini tanlang. Do‘kon shunga o‘xshashini qiladi — sizning so‘zlaringiz va suratlaringiz bilan.',
        },
        language: {
          label: 'Kartochka tili',
          hint: "Kartochka qaysi tilda yozilishi. Bu sayt tili emas.",
        },
        preview: {
          eyebrow: 'Deyarli tayyor',
          question: 'Mana u.',
          hint: "Haqiqiy kartochkaning kichik nusxasi, o'z sahnalari bilan. Chop etilgani butun ekranni egallaydi.",
          looksRight: "Hammasi to'g'ri",
          wishHint: 'Siz shablon tanlamadingiz, demak bu yerda ko‘rsatadigan narsa ham yo‘q. Mana, nima so‘raganingiz.',
          wishTitle: 'Sizning so‘rovingiz',
          wishWork: '«{title}» ishiga o‘xshashini qilish — sizning so‘zlaringiz va suratlaringiz bilan.',
          for: 'Kimga',
          from: 'Kimdan',
          template: 'Shablon',
          photos: 'Suratlar',
          none: "Yo'q",
        },
        publish: {
          eyebrow: 'Oxirgi qadam',
          question: 'Chop eting.',
          hint: "Sizga havola va kod beriladi. Do'kon kodni kichkina kartochkaga chop etib, gullarga bog'laydi.",
          explain:
            'Chop etish {name} uchun shaxsiy sahifa yaratadi. Uni faqat kodga ega odam ocha oladi — qidiruv tizimlari indekslamaydi.',
          action: 'Kartochkani chop etish',
          working: 'Chop etilmoqda…',
        },
        brief: {
          eyebrow: 'Salon uchun',
          question: 'Alohida istaklar bormi?',
          hint: 'Muddat, bezak, yuqoridagi savollarga sig‘magan narsalar. Buni salon ko‘radi — otkritkaga tushmaydi.',
          placeholder: 'Jumagacha kerak, yorqin ranglarsiz bo‘lsa yaxshi, to‘y suratini kattaroq qo‘ying...',
          skip: 'Istaklar yo‘q',
        },
        contact: {
          eyebrow: 'Siz bilan qanday bog‘lanamiz',
          question: 'Aloqa qoldiring.',
          hint: 'Salonda otkritkangiz bo‘yicha savol tug‘ilsa kerak bo‘ladi. Bittasi yetarli.',
          phone: 'Telefon',
          email: 'Pochta',
          required: 'Telefon yoki pochta qoldiring.',
        },
      },
      done: {
        title: '{name} uchun ariza qabul qilindi.',
        lead: 'Salon otkritkani yig‘adi va siz bilan bog‘lanadi. Qoralamani hozir ham ko‘rish mumkin — salon tugatgach u o‘zgaradi.',
        openPreview: 'Qoralamani ko‘rish',
        codeLabel: 'Kod',
        copyLink: 'Havolani nusxalash',
        copied: 'Havola nusxalandi',
        openCard: 'Kartochkani ochish',
        printQr: 'Guldasta uchun QR-kartochkani chop etish',
      },
    },

    qr: {
      title: 'Guldasta uchun kartochka.',
      lead: "100% masshtabda matt qog'ozga chop eting, belgilar bo'yicha kesing va poyalarga bog'lang. {recipient} uchun, {sender} tomonidan.",
      print: 'Kartochkani chop etish',
      copyLink: 'Havolani nusxalash',
      copied: 'Nusxalandi',
    },

    preview: { draft: 'Qoralama. Salon otkritkani hali tayyorlayapti — havolani sovg‘a qilish erta.' },

    shops: {
      metaTitle: 'Gul do‘konlariga',
      metaDescription:
        'Peshtaxtadagi qo‘shimcha savdo: guldastaga raqamli otkritka. Do‘kon katta qismini o‘ziga oladi va faqat e’lon qilingan otkritka uchun to‘laydi.',

      hero: {
        eyebrow: 'Gul do‘konlariga',
        title: 'Guldastaga qoladigan narsani qo‘shib soting.',
        lead: 'Guldasta bir hafta yashaydi. Yorliqdagi QR orqali ochiladigan otkritka esa abadiy qoladi — va har bir chekka o‘zingiz belgilagancha qo‘shadi. Sotuvchidan uch daqiqa ketadi.',
        cta: 'Telegramga yozish',
        secondary: 'Otkritkani ko‘rish',
        imageAlt: 'Kraft qog‘ozga o‘ralgan guldasta, bog‘ichiga Bir dunyo yorlig‘i bog‘langan.',
        sceneHint: 'Aylantirish uchun torting',
      },

      earnings: {
        eyebrow: 'Bu qancha beradi',
        title: 'O‘z raqamlaringizda hisoblang.',
        lead: 'Slayderlarni o‘z do‘koningizga moslang. Biz e’lon qilingan otkritkadan belgilangan summani olamiz — qolgani sizniki.',
        bouquetPrice: 'O‘rtacha guldasta',
        cardsPerMonth: 'Oyiga otkritka',
        cardPrice: 'Xaridorga otkritka narxi',
        perCard: 'Otkritkadan daromadingiz',
        perMonth: 'Oylik daromadingiz',
        fee: 'Shu oy uchun bizning ulushimiz — {amount}.',
        feeNote: 'E’lon qilingan paytda yechiladi, ya’ni siz xaridordan pulni olganingizdan keyin. Na abonent to‘lovi, na oldindan sarmoya.',
        free: 'Birinchi {count} ta otkritka — bepul, umuman ulushsiz.',
      },

      product: {
        eyebrow: 'Xaridor nima oladi',
        title: 'Rasm ham, video ham emas.',
        lead: 'Bitta odam uchun yaratilgan kichkina sayt: ism, xat, suratlar, faqat ikkovlariga ma’noli sanalar. Yorliqdagi QR orqali telefondan ochiladi.',
        note: 'Havolani qidiruvdan topib bo‘lmaydi — faqat kodi borgina ocha oladi.',
      },

      tag: {
        eyebrow: 'Siz nimani bog‘laysiz',
        title: 'Mana shu yorliq.',
        lead: 'Qalin karton, guruch halqa, jut ip. Qo‘lingizda ushlaydigan yagona narsa: qolgani xaridorning telefonida yashaydi.',
        alt: 'Bir dunyo bosma yorlig‘i: karton, guruch halqa va jut ip',
        note: 'Bu yerda u bo‘sh, chunki shunday holda keladi. Ism va kod har bir buyurtma uchun alohida bosiladi — har bir otkritkaning o‘z kodi bor.',
      },

      workflow: {
        eyebrow: 'Sizda bu qanday ketadi',
        title: 'Peshtaxtada uch daqiqa.',
        lead: 'Halol, haqiqiy vaqt bilan. Hech narsa o‘rnatish shart emas — hammasi brauzerda ishlaydi.',
        steps: [
          {
            time: '30 soniya',
            title: 'Taklif qilish',
            body: 'Xaridor guldastani tanladi. Telefondan tayyor namunani ko‘rsatasiz: «unga otkritka ham qo‘shaymizmi?»',
          },
          {
            time: '2 daqiqa',
            title: 'Yozib olish',
            body: 'U kimga va qanday sabab ekanini aytadi, xohlasa surat yuboradi. Siz buni shaklga kiritasiz — yoki u o‘z telefonidan o‘zi to‘ldiradi.',
          },
          {
            time: '30 soniya',
            title: 'Berish',
            body: 'Biz otkritkani yig‘amiz, siz tekshirib e’lon qilasiz. QR yorliqni chop etib poyaga bog‘laysiz.',
          },
        ],
        total: 'Matnni biz yozamiz. Sizdan — xaridorga aytish va «e’lon qilish»ni bosish.',
      },

      objections: {
        eyebrow: 'Odatda nima so‘rashadi',
        title: 'Qisqa va halol.',
        items: [
          {
            q: 'Olishmasa-chi?',
            a: 'Unda hech narsa yo‘qotmadingiz. Biz faqat e’lon qilingan otkritka uchun pul olamiz, siz esa xaridor to‘laganidan keyin e’lon qilasiz. Oldindan hech narsa to‘lanmaydi.',
          },
          {
            q: 'Sotuvchilarni o‘qitish kerakmi?',
            a: 'Yo‘q. Shakl — oddiy so‘zlar bilan to‘qqizta savol, hech qanday sozlama yoki muharrirsiz. Telefonda buyurtma qabul qila oladigan odam uddalaydi.',
          },
          {
            q: 'Matnni kim yozadi?',
            a: 'Biz. Xaridor o‘z so‘zlari bilan qanday chiqsa shunday aytadi — biz undan otkritka yig‘amiz va e’lon qilishdan oldin sizga ko‘rsatamiz.',
          },
          {
            q: 'Xaridor hech narsa aytmasa-chi?',
            a: 'Otkritka baribir chiqadi. Har bir shablonning sababga mos zaxira matni bor — bo‘sh ham, quruq ham bo‘lmaydi.',
          },
          {
            q: 'Menga o‘z saytim kerakmi?',
            a: 'Yo‘q. Hammasi havola orqali ochiladi va istalgan telefonda ishlaydi. O‘rnatadigan va sozlaydigan narsa yo‘q.',
          },
        ],
      },

      contact: {
        eyebrow: 'Boshlash',
        title: 'Keling, bitta guldastada sinab ko‘ramiz.',
        lead: 'Telegramga yozing — jonli otkritkani ko‘rsatamiz, sizga kirish ochamiz, birinchi otkritkalarni bepul qilamiz. Shartnomasiz va oldindan to‘lovsiz.',
        cta: 'Telegramga yozish',
        note: 'O‘sha kuni javob beramiz.',
      },
    },

    notFound: {
      title: "Bu kartochka bu yerda yo'q.",
      lead: "Yo kod biroz noto'g'ri o'qilgan, yo do'kon kartochkani hali tugatmagan. Ikkalasi ham hal bo'ladi.",
      hint: "Kodda oltita belgi bo'ladi va unda hech qachon O harfi va 0 raqami bo'lmaydi.",
      back: 'Bosh sahifaga',
      makeOwn: "O'zingiznikini yarating",
    },

    card: { madeWith: 'Yaratildi:' },

    works: {
      metaTitle: 'Bizning ishlarimiz',
      metaDescription:
        'Allaqachon yaratilgan va odamlarga topshirilgan kartochkalar. Namuna emas — manziliga yetib borgan ishlar.',
      eyebrow: 'Qilingan',
      title: 'Bizning ishlarimiz.',
      lead: 'Egalariga yetib borgan kartochkalar. Har biri qabul qiluvchi ko‘rgan holida ochiladi — qayta yig‘ilmagan va tekislanmagan.',
      tabTemplates: 'Shablonlar',
      tabWorks: 'Bizning ishlarimiz',
      open: 'Ochish',
      openFull: 'Yangi oynada ochish',
      year: 'Yil',
      basedTemplate: 'Uning asosida shablon bor',
      noteCompressedVideo:
        'Video siqilgan: asli 123 MB edi, GitHub esa 100 MB dan katta fayllarni qabul qilmaydi. Qolgan hammasi o‘zgarishsiz.',
      noteReplacedName:
        'Qabul qiluvchining ismi namuna ism bilan almashtirilgan: kartochka bir kishi uchun qilingan, ko‘rsatilayotgani esa hammaga. Qolgan hammasi o‘zgarishsiz.',
      noteFixedSource:
        'Fayl saqlanayotganda unga tushib qolgan ikkita ortiqcha qator olib tashlandi: ular sahifada ko‘rinib turardi va brauzerni moslik rejimiga o‘tkazardi. Kartochkaning birorta so‘ziga tegilmadi.',
      qr: 'QR-kod',
      copyLink: 'Havolani nusxalash',
      copied: 'Nusxalandi',
      back: 'Barcha ishlarga',
      original: 'Asl nusxa — qabul qiluvchi ko‘rgan holida.',
    },
    localeSwitcher: { label: 'Til' },
  },

  admin: {
    title: 'Salon kabineti',

    nav: {
      overview: 'Umumiy',
      orders: 'Buyurtmalar',
      cards: 'Otkritkalar',
      templates: 'Shablonlar',
      viewSite: 'Saytga',
      signOut: 'Chiqish',
    },

    login: {
      lead: "Buyurtmalar navbati va e'lon qilingan otkritkalar.",
      password: 'Parol',
      submit: 'Kirish',
      pending: 'Tekshirilmoqda…',
      errorEmpty: 'Parolni kiriting.',
      errorWrong: "Parol noto'g'ri.",
      errorUnconfigured: "Kirish sozlanmagan: ADMIN_PASSWORD belgilanmagan.",
      unconfigured:
        "Kirish sozlanmagan. ADMIN_PASSWORD muhit o'zgaruvchisini belgilang va qayta yig'ing.",
    },

    status: {
      NEW: { label: 'Yangi', hint: 'Salondan endi keldi' },
      PROCESSING: { label: 'Ishlanmoqda', hint: 'Yozilyapti va yig‘ilyapti' },
      REVIEW: { label: 'Tekshiruvda', hint: 'Odam qayta o‘qishini kutyapti' },
      READY: { label: 'Tayyor', hint: "Tasdiqlangan, hali e'lon qilinmagan" },
      PUBLISHED: { label: "E'lon qilingan", hint: 'Ishlayapti va guldastaga biriktirilgan' },
      CANCELLED: { label: 'Bekor qilingan', hint: 'Bekor qilindi; kod band bo‘lib qoladi' },
    },

    overview: {
      title: 'Bugun',
      // Uzbek does not inflect the noun after a numeral, so one form serves.
      count: { other: 'Tizimda {count} ta buyurtma.' },
      needsPerson: 'Odam kerak',
      allOrders: 'Barcha buyurtmalar',
      nothingWaiting: 'Kutayotgani yo‘q. Hamma buyurtma olingan.',
    },

    notifications: {
      title: 'Buyurtma bildirishnomalari',
      ready: 'Sozlangan. Telegram bu ma’lumotlarni qabul qilishiga ishonch hosil qilish uchun tekshiruv yuboring.',
      off: 'O‘chiq — birorta o‘zgaruvchi berilmagan. O‘z kompyuteringizda va har bir previewda shunday bo‘lishi kerak.',
      partial:
        'Yarim sozlangan: {missing} berilmagan. Buyurtmalar keladi, lekin hech kim bilmaydi.',
      test: 'Tekshiruv yuborish',
      testing: 'Yuborilmoqda…',
      sent: 'Yetkazildi. Suhbatni oching — xabar allaqachon o‘sha yerda.',
      unconfigured: 'Tekshirishga hech narsa yo‘q: {missing} berilmagan.',
      rejected: 'Telegram rad etdi: {detail}',
      unreachable: 'Telegramga yetib bo‘lmadi: {detail}',
      findChats: 'Chat id topish',
      findingChats: 'Qidirilmoqda…',
      chatsNone: 'Bot so‘nggi sutkada birorta xabar ko‘rmadi. U a’zo bo‘lgan guruhga biror narsa yozing va yana bosing.',
      chatsHint: 'Kerakli id ni to‘liq, minus bilan birga, Vercel dagi TELEGRAM_CHAT_ID ga qo‘ying va Redeploy qiling.',
      chatCurrent: 'hozir shu sozlangan',
      redeploy:
        'O‘zgaruvchilar faqat yangi buildga tushadi — o‘zgartirgandan keyin qayta deploy qiling.',
    },

    orders: {
      title: 'Buyurtmalar',
      shown: { other: '{count} ta ko‘rsatilyapti' },
      searchPlaceholder: 'Ism, kod, salon…',
      search: 'Qidirish',
      all: 'Hammasi',
      noMatch: 'Hech narsa topilmadi.',
      from: 'kimdan:',
      export: 'Hammasini yuklab olish',
      columns: {
        recipient: 'Kimga',
        for: 'Kim bo‘ladi',
        occasion: 'Sabab',
        template: 'Shablon',
        shop: 'Salon',
        created: 'Yaratilgan',
        status: 'Holat',
        code: 'Kod',
      },
    },

    cards: {
      title: 'Otkritkalar',
      count: { other: '{count} ta ishlayotgan otkritka.' },
      neverIndexed: 'Har biri shaxsiy va qidiruvga chiqmaydi.',
      none: "Hali hech narsa e'lon qilinmagan.",
      from: 'kimdan:',
      open: 'Ochish',
      print: 'Chop etish',
      copyLink: 'Havolani nusxalash',
      copied: 'Nusxalandi',
      openOrder: 'Buyurtmani ochish',
      qrAlt: 'Otkritkaning QR kodi',
    },

    templates: {
      title: 'Shablonlar',
      lead: {
        other:
          "{count} ta shablon. Shablonlar kod ichida yashaydi — bu ro'yxat reyestrdan yig'iladi, shuning uchun hech qachon eskirmaydi. Yangisini qo'shish — bitta fayl.",
      },
      rows: {
        id: 'ID',
        scene: 'Sahna',
        suits: 'Sabablar',
        moods: 'Kayfiyatlar',
        motion: 'Harakat',
        sections: 'Bloklar',
      },
      noScene: '3D yo‘q',
      usage: { other: '{count} ta buyurtma' },
      preview: 'Ko‘rish',
      builder: {
        newTemplate: 'Shablon yig‘ish',
        identity: 'Tizimda qanday ataladi',
        idLabel: 'Identifikator',
        idHint: 'Lotin harflari va defis. U /templates/… manziliga aylanadi va buyurtmaga yoziladi — keyin o‘zgarmaydi.',
        look: 'Qanday ko‘rinadi',
        palette: 'Palitra',
        scene: 'Sahna',
        motif: 'Naqsh',
        suits: 'Qaysi sabablarga',
        moods: 'Kayfiyatlar',
        beats: 'Nimalardan iborat',
        beatsHint: 'Shablon o‘ynaydigan qismlarni belgilang va har biriga ko‘rinish tanlang. Ma’lumotsiz qism o‘zi yo‘qoladi: surat bo‘lmasa, galereya ham bo‘lmaydi.',
        order: 'Tartib',
        orderHint: 'Bitta qismni boshqasidan oldinga surish mumkin va bu otkritka ma’nosini o‘zgartiradi: yozuv xatdan oldin kelsa, xat unga javob bo‘lib o‘qiladi.',
        orderNone: 'Oddiy tartib',
        orderMove: 'Oldinga surish',
        orderBefore: 'Nimadan oldin',
        copy: 'Qanday tasvirlangan',
        copyHint: 'Inglizcha majburiy — u barcha tillar uchun zaxira. Ruscha va o‘zbekcha alohida qo‘shiladi.',
        name: 'Nomi',
        tagline: 'Bitta satr',
        description: 'Tavsif',
        animationStyle: 'Qanday harakatlanadi',
        save: 'Shablonni saqlash',
        saving: 'Saqlanmoqda…',
        saved: 'Saqlandi. U allaqachon galereyada va buyurtma shaklida.',
        remove: 'O‘chirish',
        removeConfirm: 'Shablon o‘chirilsinmi? Unda yig‘ilgan otkritkalar ishlashda davom etadi.',
        existing: 'Shu yerda yig‘ilganlar',
        none: 'Hozircha yo‘q.',
        preview: 'Ko‘rish',
        importTitle: 'Yoki tayyor sahifani o‘qish',
        importHint: 'Qo‘lda yozilgan HTML joylashgan ochiq repozitoriyga havola. Model uni o‘qib, quyidagi shaklni to‘ldiradi — hech narsa saqlamaydi, bu siz tuzatadigan qoralama.',
        importAction: 'O‘qish',
        importing: 'O‘qilmoqda…',
        unmapped: 'Dvigatelda mos qismi yo‘q ekranlar:',
        importOr: 'Yoki agar bu repozitoriy emas, diskdagi papka bo‘lsa:',
        importFiles: 'Papkani tanlash',
        importFilesHint: 'Faqat html, css va js o‘qiladi. Suratlar, musiqa va video yuborilmaydi: ular buyurtmaga tegishli, shablonga emas.',
        importNoFiles: 'Bu papkada html ham, css ham, js ham yo‘q.',
      },
    },

    order: {
      back: '← Buyurtmalar',
      from: 'kimdan:',
      sectionOrder: 'Buyurtma',
      sectionBrief: 'Buyurtmachi istaklari',
      sectionWish: 'Buyurtmachi shablon tanlamadi',
      wishWork: '«{title}» ishidagidek bo‘lishini xohlaydi.',
      wishOwn: 'O‘z g‘oyasini tasvirlab berdi:',
      sectionMessage: 'Buyurtmachi nima yozgan',
      sectionPhotos: 'Suratlar',
      sectionDetails: 'Yana nima ko‘rsatilgan',
      sectionNotes: 'Salon eslatmalari',
      fields: {
        orderId: 'Buyurtma ID',
        customer: 'Buyurtmachi',
        recipient: 'Kimga',
        shop: 'Salon',
        template: 'Shablon',
        created: 'Yaratilgan',
        published: "E'lon qilingan",
        card: 'Otkritka',
      },
      direct: 'To‘g‘ridan-to‘g‘ri',
      notPublished: 'Hali yo‘q',
      composed: { other: '{count} ta blok yig‘ilgan' },
      notComposed: 'Hali yig‘ilmagan',
      noMessage: 'Hech narsa yozilmagan — shablon halol zaxira matnni qo‘yadi.',
      notesPlaceholder:
        'Olib ketish vaqti, qadoq, keyingi odam bilishi kerak bo‘lgan hamma narsa.',
      saveNotes: 'Eslatmalarni saqlash',
      panelStatus: 'Holat',
      panelDanger: 'Qaytarib bo‘lmaydi',
      deleteHint: 'Buyurtma hech qachon e’lon qilinmagan, shuning uchun uni butunlay o‘chirish mumkin.',
      deleteAction: 'Buyurtmani o‘chirish',
      deleteConfirm: 'Buyurtma butunlay o‘chirilsinmi? Buni qaytarib bo‘lmaydi.',
      deleteBlocked: 'E’lon qilingan buyurtmani o‘chirib bo‘lmaydi: kod yorliqqa chop etilgan bo‘lishi mumkin. Uni bekor qiling — otkritka yo‘qoladi, kod esa band bo‘lib qoladi.',
      panelCard: 'Otkritka',
      panelQr: 'QR',
      generate: 'Otkritkani yig‘ish',
      previewCard: 'Otkritkani ko‘rish',
      custom: {
        title: 'O‘z otkritkangiz',
        lead: 'Agar otkritkani qo‘lda yozgan bo‘lsangiz, uning butun papkasini tanlang. Shunda QR shablon yig‘masiga emas, o‘shanga olib boradi. Chegara — fayliga 4 MB: og‘ir video o‘tmaydi.',
        pick: 'Papkani tanlash',
        replace: 'Yana fayl yuklash',
        uploading: '{total} tadan {done} tasi yuklanmoqda…',
        entryLabel: 'Qaysi fayldan ochiladi',
        entryNone: 'Tanlanmagan — shablon ko‘rsatiladi',
        empty: 'Hozircha fayl yo‘q.',
        summary: 'Fayllar: {count}, jami {size}',
        removeAll: 'O‘z otkritkani olib tashlash',
        removeConfirm: 'Barcha yuklangan fayllar o‘chirilsinmi? Buyurtma shablon yig‘masiga qaytadi.',
        showing: 'Hozir kod bo‘yicha yuklangan otkritka ochiladi.',
        showingEngine: 'Hozir kod bo‘yicha shablon yig‘masi ochiladi.',
        unitMb: 'MB',
        unitKb: 'KB',
      },
      composeOverridden: 'Hozir kod bo‘yicha yuklangan otkritka ochiladi, bu yig‘ma emas. Qayta yig‘ish mumkin — lekin natijani ko‘rish uchun avval o‘z otkritkangizni olib tashlang.',
      customLive: 'Kartochkangiz yuklandi — kod aynan uni ochadi. Yig‘adigan narsa qolmadi.',
      customNextPublish:
        'Bitta qadam qoldi: holatni «Nashr etilgan» qilish. Undan oldin manzil hech kimga javob bermaydi, yorliqdagi QR ham.',
      customPublished: 'Holat «Nashr etilgan» — manzil ishlaydi, QR unga olib boradi.',
      qrNotLive: 'Bu manzil hali ochilmaydi. U holat «Опубликован» bo‘lganda ishlaydi. Yorliqni oldinroq chop etish mumkin: kod allaqachon shu buyurtmaga biriktirilgan.',
      previewDraft: 'Qoralamani ochish',
      howTitle: 'Bu buyurtma bilan nima qilinadi',
      howSteps: [
        'Buyurtmachining istaklarini va yozganini o‘qing. Odam yozadigan yagona narsa shu — dvigatel hech nima to‘qimaydi.',
        'Shablonni tanlang va «Собрать открытку» tugmasini bosing. Sayt otkritkani buyurtmachining javoblaridan yig‘adi; uni boshqa shablon bilan istagancha qayta yig‘ish mumkin.',
        '«Qoralamani ochish» tugmasini bosing — qabul qiluvchi ko‘radigan otkritkaning o‘zi ochiladi, ustida bu qoralama degan yozuv bilan. Hech narsa yuklash kerak emas: otkritka fayl emas, saytda yashaydi.',
        'Hammasi to‘g‘ri bo‘lsa, holatni «Опубликован» ga o‘tkazing. Faqat shundan keyin QR bo‘limidagi manzil ochila boshlaydi.',
        '«Бирка на печать» tugmasini bosing, chop eting va guldastaga bog‘lang. QR o‘sha manzilga olib boradi.',
      ],
      previewTemplate: 'Shablonni ko‘rish',
      printable: 'Chop etish uchun yorliq',
      copyUrl: 'Havolani nusxalash',
      qrAlt: 'Otkritkaning QR kodi',
    },
  },

  content: {
    coverHeadline: 'seni bir narsa kutyapti…',

    card: {
      scrollGently: 'Sekin suring',
      tagLine: 'Seni yana bir narsa kutyapti.',
      letterLabel: 'Xat',
      open: 'Och',
      pullRibbon: 'Tasmani torting',
      unfold: 'Yoying',
      wishesTitle: 'Bir nechta tilak',
      galleryEmpty: 'Hozircha suratlar yo‘q',
      audio: { play: 'Musiqani yoqish' },
      cake: {
        prompt: 'Tilak tilang.',
        hint: "O'chirish uchun bosing",
        reply: 'Tiladingizmi? Ushalsin.',
      },
      question: {
        ask: 'Boramizmi?',
        yes: 'Ha',
        no: 'Yo‘q',
        reply: 'Bilardim.',
      },
      defaultWishes: [
        'Shoshilmagan tong',
        'Rejalashtirilmagan biror narsa',
        'Keladigan odamlar',
        'Bitta juda yaxshi kechki ovqat',
      ],
      video: {
        play: 'Ko‘rish',
        title: 'Bu yerda ovoz',
        unsupported: 'Brauzer bu videoni ijro eta olmaydi.',
      },
    },

    occasions: {
      love: { label: 'Sevgi', line: "Birinchi bo'lib o'ylaydigan odamingizga." },
      birthday: { label: "Tug'ilgan kun", line: 'Bu odamning butun bir yili — nishonlashga arziydi.' },
      'for-mom': { label: 'Onaga', line: "Otkritkaga hech qachon sig'maydigan so'zlar." },
      anniversary: { label: 'Yubiley', line: 'Birga qurgan hamma narsangiz bir joyda.' },
      friendship: { label: "Do'stlik", line: 'Qoladiganlarga.' },
      celebration: { label: 'Bayram', line: 'Yaxshi voqea yuz berdi. Buni tuzukroq ayting.' },
      'just-because': { label: 'Shunchaki', line: 'Sababsiz. Sabab shuning ozi.' },
    },

    moods: {
      romantic: { label: 'Romantik', line: "Past yorug'lik, sekin o'tishlar, bitta sham." },
      warm: { label: 'Iliq', line: 'Ertalabki oshxonadek.' },
      cute: { label: 'Yoqimli', line: "Yengil va bir oz o'ynoqi." },
      elegant: { label: 'Nafis', line: "Vazmin. Har bir tafsilot o'ylangan." },
      funny: { label: 'Hazil bilan', line: "Avval kulishadi, keyin ta'sirlanishadi." },
      minimal: { label: 'Minimalizm', line: "Kam so'z. Ko'p havo." },
      dreamy: { label: 'Xayolparast', line: 'Yumshoq fokus, uchayotgan gulbarglar.' },
    },
    scenes: {
      petals: 'Gulbarglar',
      sakura: 'Sakura',
      bloom: 'Gul',
      heart: 'Yurak',
      embers: 'Uchqunlar',
      none: 'Sahnasiz',
    },
    beats: {
      cover: 'Muqova',
      envelope: 'Konvert',
      intro: 'Kirish',
      letter: 'Xat',
      video: 'Video',
      gallery: 'Suratlar',
      timeline: 'Xronologiya',
      memories: 'Xotiralar',
      quote: 'Iqtibos',
      wishes: 'Tilaklar',
      question: 'Savol',
      cake: 'Tort',
      final: 'Yakun',
      closing: 'Imzo',
    },
    motifs: {
      petals: 'Gulbarglar',
      sparks: 'Uchqunlar',
      linen: 'Zig‘ir',
      arch: 'Ravoq',
      sun: 'Quyosh',
      branch: 'Shox',
    },
    looks: {
      'cover.arch': 'Ravoq',
      'cover.film': 'Orqa fonda video',
      'cover.glow': 'Yog‘du',
      'cover.gradient': 'Gradient',
      'cover.paper': 'Qog‘oz',
      'cover.washi': 'Vasi',
      'envelope.heart': 'Yurak',
      'envelope.ribbon': 'Tasma',
      'envelope.washi': 'Vasi',
      'envelope.wax': 'Muhr',
      'intro.centered': 'Markazda',
      'intro.offset': 'Siljigan',
      'letter.handwritten': 'Qo‘lyozma',
      'letter.lines': 'Satrma-satr',
      'letter.serif': 'Antikva',
      'letter.washi': 'Vasi',
      'video.framed': 'Ramkada',
      'video.full': 'To‘liq kenglik',
      'video.screen': 'Ekran',
      'gallery.filmstrip': 'Plyonka',
      'gallery.mosaic': 'Mozaika',
      'gallery.polaroid': 'Polaroid',
      'gallery.stack': 'Taxlam',
      'timeline.ledger': 'Reyestr',
      'timeline.thread': 'Ip',
      'memories.chips': 'Yorliqlar',
      'memories.notes': 'Qaydlar',
      'quote.centered': 'Markazda',
      'quote.rule': 'Chiziq bilan',
      'wishes.list': 'Ro‘yxat',
      'question.chase': 'Qochadigan tugma',
      'question.plain': 'Oddiy',
      'cake.candles': 'Shamlar',
      'final.bloom': 'Gul',
      'final.fade': 'So‘nish',
      'closing.seal': 'Muhr',
      'closing.signature': 'Imzo',
    },

    recipients: {
      girlfriend: "Qiz do'stga",
      boyfriend: 'Yigitga',
      wife: 'Xotinga',
      husband: 'Erga',
      mom: 'Onaga',
      dad: 'Otaga',
      friend: "Do'stga",
      family: 'Oilaga',
      'someone-special': 'Alohida insonga',
    },
    demo: {
      romantic: {
        recipientName: 'Alina',
        senderName: 'Firdavs',
        story:
          'Bu xatni o‘n bir marta boshladim. Har safar yo juda mayda, yo juda baland chiqdi — mana, oddiysi.\n\nIkki yil oldin sen kofe haqida qat’iy fikri bor notanish odam eding. Endi esa men gapni o‘ylab bo‘lmasimdan aytadigan odamsan. Shu orada, ikkalamiz ham e’lon qilmagan holda, oddiy kunlarim jimgina yaxshilanib qoldi.\n\nSenga pion oldim — bir kuni o‘tib ketayotib, ular gapning o‘rtasida to‘xtab qolganga o‘xshaydi, deganding. O‘shandan beri shu esimdan chiqmaydi.',
        moments: [
          { date: 'Mart 2023', title: 'Kofe haqidagi bahs', text: 'Sen haq eding. Shu paytgacha buni tan olmagandim.' },
          { date: 'Avgust 2023', title: 'Kechikkan poyezd', text: 'O‘sha yilning eng yaxshi to‘rt soati.' },
          { date: 'Shu hafta', title: 'Pionlar', text: 'Gapning o‘rtasida — va’da qilganimdek.' },
        ],
        memories: [
          { label: 'Kulguing', text: 'O‘ylamay kuladigani, xushmuomalasi emas.' },
          { label: 'Ko‘k palto', text: 'U senda abadiy. Almashtirma.' },
        ],
      },
      birthday: {
        recipientName: 'Marta',
        senderName: 'Kamila',
        story:
          'Yana bir yil, sen esa hamon tunning yarmida telefonni ko‘tarib, uxlamagandim deb turadigan odamsan.\n\nBu yil boshqa shaharga ko‘chding, qo‘rqinchli bir ishni boshlading va baribir mening har bir tadbirimga yetib kelding. Buni qanday uddalayotganingni bilmayman. Menimcha, sen ham bilmaysan.\n\nXullas: tug‘ilgan kuning bilan. Kun o‘zing chindan xohlagandek o‘tsin, kerak deb o‘ylaganingdek emas.',
        memories: [
          { label: 'Ko‘chish', text: 'To‘rt qavat, liftsiz, iyulda.' },
          { label: 'Karaoke', text: 'Karaoke haqida gaplashmaymiz.' },
        ],
        wishes: ['Shoshilmagan tong', 'Rejalashtirilmagan bir narsa', 'Kelib turadigan odamlar', 'Bitta juda yaxshi ovqat'],
      },
      mom: {
        recipientName: 'Onajon',
        senderName: 'Firdavs',
        story:
          'Yakshanba kuni qo‘ng‘iroq qildim va biz yigirma daqiqa ob-havo haqida gaplashdik — bizda boshqa gapni shunday aytishadi.\n\nShuning uchun o‘sha boshqa gapni yozib qo‘yaman.\n\nYaxshi qiladigan ishlarimning deyarli hammasini, avval sizning qilganingizni ko‘rganim uchun qilaman. Ayniqsa sabrni — bunda men hali ancha ortdaman. Sizda bularning hech biri mehnatga o‘xshamasdi. Endi tushunaman: mehnat edi.\n\nRahmat. Kattalari uchun ham, yillar o‘tib sezganim mingta maydasi uchun ham.',
        moments: [
          { date: 'Har sentyabrda', title: 'Maktabning birinchi kuni', text: 'Ko‘ylakni ikki marta dazmollardingiz.' },
          { date: '2016', title: 'Hammasi joyidan qo‘zg‘algan yil', text: 'Bir marta ham charchadim demadingiz.' },
        ],
      },
      anniversary: {
        recipientName: 'Doniyor',
        senderName: 'Sofiya',
        story:
          'O‘n yil. Tez o‘tdi — aytishlaricha, bu yaxshi alomat.\n\nMen esa katta sanalarga emas, oddiy kechalarga qaytaveraman — boshqa birov bilan bo‘lsa, ular hech qanday e’tiborga arzimasdi.\n\nYana shuni tanlardim. Aslida, deyarli har kuni, o‘ylab ham o‘tirmay tanlayapman.',
        moments: [
          { date: '2016', title: 'Yomon mehmonxona', text: 'Olti kun yomg‘ir yog‘di.' },
          { date: '2019', title: 'Radiatori shovqin qiladigan kvartira' },
          { date: '2022', title: 'Nihoyat tugatgan oshxonamiz' },
          { date: 'Bugun', title: 'O‘n yil' },
        ],
        memories: [{ label: 'Yakshanba', text: 'Sen, gazeta va hech qanday reja yo‘q.' }],
      },
      memories: {
        recipientName: 'Lola',
        senderName: 'Timur',
        story:
          'Oilamizda bundan oldin buni hech kim qilmagan edi. Sen birinchi bo‘lib bording va buning uddasidan chiqsa bo‘lishini ko‘rsatding.\n\nKo‘pchilik diplomni ko‘radi. Men undan oldingi ikki yilni va turging kelmagan tonglarni ko‘rdim.\n\nRomga solishga arziydigani — o‘sha.',
        moments: [
          { date: 'Birinchi yil', title: 'Asosan kutubxona' },
          { date: 'Ikkinchi yil', title: 'Sal bo‘lmasa tashlab yuborayozgan payting' },
          { date: 'Iyun', title: 'Tamom' },
        ],
      },
      sakura: {
        recipientName: 'Haruto',
        senderName: 'Emi',
        story:
          'Hech qanday sabab yo‘q. Hech narsa bo‘lgani yo‘q, oldinda ham hech narsa yo‘q.\n\nBurchakdagi gulchidan o‘tib ketayotgandim, vitrinada bitta shox turgan ekan, sen esimga tushding — va shuning o‘zi kifoya tuyuldi.\n\nXat shu, tamom.',
        memories: [{ label: 'Burchakdagi do‘kon', text: 'Hamon o‘sha yerda. Hamon o‘sha bitta shox.' }],
      },
    },

    templates: {
      romantic: {
        name: 'Tungi kuy',
        tagline: "Past yorug'lik, sekin o'tishlar, bitta uzun xat.",
        description:
          "Yaxshi kechaning oxiriday tutadigan kartochka. Hikoya deyarli qorong'ilikda ochiladi, shishadan yasalgan yurak butun yorug'likni o'zida ushlab turadi, xat esa odam pastga surgan sari xatboshima-xatboshi ochiladi. Ancha vaqtdan beri o'ylab yurgan gapingiz uchun.",
        animationStyle: "Uzoq so'nishlar, uchayotgan gulbarglar, xatboshima-xatboshi ochilish",
      },
      birthday: {
        name: 'Oltin soat',
        tagline: 'Bayramona, iliq va sharsiz.',
        description:
          "Tug'ilgan kun otkritkalari odatda baqiradi. Bu esa qadah ko'taradi. Iliq shampan rangidagi qog'oz, endigina stolga qo'yilganday joylashtirilgan suratlar va satrma-satr ochiladigan tilaklar ro'yxati. Sana haqida emas, odam haqidagi bitta jumla bilan tugaydi.",
        animationStyle: "Yuqoriga ko'tarilayotgan uchqunlar, qiya suratlar, satrma-satr tilaklar",
      },
      mom: {
        name: 'Oshxona nuri',
        tagline: 'Shoshilmasdan, saxiy va bir oz quyoshli.',
        description:
          "Telefon suhbatiga hech qachon sig'maydigan narsalar uchun. Iliq zig'ir yuzalar, sekin o'qish uchun yetarlicha yirik terilgan xat va onangiz bergan narsalarning tinch ro'yxati. Qiyshiq shriftlar ham, gulli ramkalar ham yo'q — bu yerda unga jiddiy munosabatda bo'linadi.",
        animationStyle: 'Yumshoq nur harakati, yirik terim, xotirjam ochilishlar',
      },
      anniversary: {
        name: "O'n ming tong",
        tagline: 'Me\'moriy, tinch, vaqt chizig\'i atrofida qurilgan.',
        description:
          "Yubiley — bu uzun yozuv, shuning uchun bu yerda vaqt chizig'i hikoyaning umurtqasiga aylanadi. Yarim tunga o'xshash yuzalar, guruch tafsilotlar va ravoqli muqova unga yuborilgan emas, bosilgan narsa vaznini beradi. Xat o'rtada, taxtachaday ramkada turadi.",
        animationStyle: "Me'moriy o'tishlar, vaqt chizig'i ipi, vazmin parallaks",
      },
      memories: {
        name: 'Arxiv',
        tagline: 'Suratlar yetakchi. Gapiradigani ular.',
        description:
          "Aslida kichkina ko'rgazma bo'lgan kartochka uchun. Arxiv qog'ozi, muzey yorliqlariday izohlar va bosh barmoq bilan suriladigan gorizontal plyonka. Na 3D, na effektlar — istalgan telefonda bir zumda ochiladi va barcha piksellarni suratlarga beradi.",
        animationStyle: 'Gorizontal plyonka, muzey izohlari, deyarli effektsiz',
      },
      sakura: {
        name: 'Hanami',
        tagline: 'Vasi qogozi, sumi siyohi, bitta gullagan shox.',
        description:
          "Yapon bezagidan emas, yapon bosma kompozitsiyasidan olingan: ulkan chekkalar, ataylab markazdan siljitilgan ustun va siz o'qiyotganingizda gulbarglarini to'kadigan bitta sakura shoxi. Kutubxonadagi eng tinch shablon va eng yaxshi qariydigani.",
        animationStyle: "Tushayotgan sakura, assimetrik ustunlar, siyoh o'tishlari",
      },




    },

    copy: {
      love: {
        intro: "Xabarga sig'maydigan gaplar bor.",
        quote: "Bu birdaniga bo'lmadi. Bu hamon davom etyapti — jimgina, oddiy seshanbalarda.",
        galleryTitle: "Biz, ko'pincha poza qilmasdan",
        timelineTitle: 'Bu yerga qanday kelganmiz',
        memoriesTitle: 'Menda qolgan mayda narsalar',
        finalHeadline: "Ba'zi odamlar yonida oddiy kunlar oddiy bo'lmay qoladi.",
        finalText: 'Ularni sezishimning sababi — sen.',
        signOff: 'Mehr bilan,',
        fallbackLetter:
          "{name},\n\nOvoz chiqarib aytish menda yomon chiqadi, shuning uchun yozyapman.\n\nSen hayotimning oddiy qismlarini yaxshiroq qilasan. Baland ovozda emas — jimgina, yo'qligini tasavvur qilgandagina sezish mumkin bo'ladigan darajada.\n\nSenda saqlab qo'yiladigan biror narsa qolishini istadim.",
      },
      birthday: {
        intro: "Butun bir yil sen. Bu xabardan ko'proq narsaga arziydi.",
        quote: "Sen bor bo'lganingdan beri dunyo sezilarli darajada yaxshilandi.",
        galleryTitle: 'Bu yil, bolaklarda',
        timelineTitle: 'Yil, qisqacha',
        memoriesTitle: 'Seni nima uchun tabriklash kerak',
        finalHeadline: "O'zing bo'lib qoladigan yana bir yil uchun.",
        finalText: "Tahrirsiz. Shunchaki ko'proq.",
        signOff: "Tug'ilgan kuning bilan,",
        fallbackLetter:
          "Tug'ilgan kuning bilan, {name}.\n\nXabar yuborsam ham bo'lardi. Bunday sabab uchun bu juda kam.\n\nShuning uchun shunday: butun bir yil sen bo'lding, va yoningdagilarning hammasiga shundan yaxshi bo'ldi. Buni tuzukroq aytish kerak.\n\nKuningni o'zing xohlaganday o'tkaz.",
      },
      'for-mom': {
        intro: "Telefon suhbatiga hech qachon sig'maydigan gaplar bor.",
        quote: 'Mendagi yumshoq narsalarning hammasi — sendan.',
        galleryTitle: 'Biz, shuncha yillar davomida',
        timelineTitle: 'Menga nima berganing',
        memoriesTitle: 'Nimani eslayman',
        finalHeadline: 'Rahmat. Hammasi uchun, hozir yetib borayotgan narsalar uchun ham.',
        finalText: 'Hozir yetib boryapti.',
        signOff: 'Mehr bilan,',
        fallbackLetter:
          "{name},\n\nBuni yetarlicha tez-tez aytmayman, telefon suhbati esa bunga hech qachon to'g'ri kelmaydi.\n\nQanday yashayotganimdagi juda ko'p narsa — sendan. Ayniqsa sabr: unga hamon yetib kelolmayapman.\n\nRahmat. Katta narsalar uchun va keyinroq yetib borgan mingta mayda narsa uchun.",
      },
      anniversary: {
        intro: "Oddiy tonglar bilan o'lchangan yillar.",
        quote: 'Yana tanlash kerak bolsa — va undan keyin ham — sen.',
        galleryTitle: 'Dalillar',
        timelineTitle: "O'tgan yillar",
        memoriesTitle: 'Saqlashga arziydigan narsalar',
        finalHeadline: 'Hamon sen. Hamon shu. Hamon yaxshi.',
        finalText: 'Keyingi oddiy tonglar uchun.',
        signOff: 'Doim,',
        fallbackLetter:
          "{name},\n\nYana bir yil. Tez o'tdi — aytishlaricha, bu yaxshi belgi.\n\nEsga katta sanalar emas, oddiy kechalar keladi: boshqa birov bilan hech nima bo'lmaydigan kechalar.\n\nBuni yana tanlash — ha. Har kuni, deyarli o'ylab ham o'tirmasdan.",
      },
      friendship: {
        intro: "Ba'zi odamlar shunchaki qoladi. Sen shulardansan.",
        quote: "Hamma ham qolmaydi. Sen bilan bu hech qachon savol bo'lmagan.",
        galleryTitle: 'Moddiy dalillar',
        timelineTitle: 'Qisqacha tarix',
        memoriesTitle: 'Esimda qolgani',
        finalHeadline: "Seni sevish oson, yo'qotish qiyin. Buning uchun rahmat.",
        finalText: "O'zing ham bilasan. Mayli, yozib qo'yilsin.",
        signOff: 'Minnatdorlik bilan,',
        fallbackLetter:
          "{name},\n\nBu bayram otkritkasi emas. Bu ko'proq tilxat.\n\nSen noqulay paytlarda ham kelasan va buni hech qachon yaxshilik qilgandek ko'rsatmaysan. Bunday narsa o'ylagandan ko'ra kamroq uchraydi.\n\nUmuman. Gullar mos darajadagi dramatiklikday tuyuldi.",
      },
      celebration: {
        intro: "Bo'ldi. Haqiqatan va hamma narsaga qaramay.",
        quote: "Erta tonglarni hech kim ko'rmadi. Mendan boshqa.",
        galleryTitle: "Bu qanday ko'rindi",
        timelineTitle: "Uzun yo'l",
        memoriesTitle: 'Bu nimalarga tushdi',
        finalHeadline: "Keyin nima bo'lsa ham, endi isbotlaydigan narsa yo'q.",
        finalText: "Buni qabul qil. Hech bo'lmasa bir marta — tuzukroq.",
        signOff: 'Sen bilan faxrlanaman,',
        fallbackLetter:
          "{name},\n\nTabriklayman. Chin dildan.\n\nKo'pchilik natijani ko'radi. Menga undan oldingi qismi ko'rindi: hech nima aniq bo'lmagan, chiroyli bo'lmagan oraliq.\n\nSen shunchaki to'xtamaysan. Nishonlashga arziydigani ana shu.",
      },
      'just-because': {
        intro: 'Sababsiz. Shunchaki seshanba, va sen xayolda.',
        quote: "Ba'zan sabab kerak emas. Bugun xuddi shunday kun.",
        galleryTitle: 'Hech narsa alohida emas',
        timelineTitle: 'Turli dalillar',
        memoriesTitle: 'Mayda narsalar',
        finalHeadline: 'Sababsiz. Butun sabab ham shu.',
        finalText: "Umid qilaman, kun yaxshi o'tgandir.",
        signOff: "Seni o'ylayapman,",
        fallbackLetter:
          "{name},\n\nBunga hech qanday sabab bog'lanmagan. Hech nima bo'lgani yo'q va hech nima kutilmayapti.\n\nShunchaki oddiy kunning oddiy pallasida xayol senga keldi, va shuning o'zi yetarli tuyuldi.\n\nButun xabar shu.",
      },
    },
  },
};
