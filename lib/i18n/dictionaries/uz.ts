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
      templates: 'Shablonlar',
      howItWorks: 'Qanday ishlaydi',
      createCard: 'Kartochka yaratish',
      viewSite: 'Saytga',
    },

    hero: {
      eyebrow: 'Haqiqiy guldasta uchun raqamli kartochka',
      line1: "Ba'zi tuyg'ular",
      line2: 'xabarga',
      line3: "sig'maydi.",
      sub: 'Yaqin insoningiz uchun kichkina dunyo yarating.',
      ctaPrimary: 'Chiroyli narsa yaratish',
      ctaSecondary: "Shablonlarni ko'rish",
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
        dashboard: "Do'kon paneli",
        orders: 'Buyurtmalar',
        printable: 'Bosma QR-kartochka',
      },
    },

    templates: {
      eyebrow: 'Kutubxona',
      title: 'Hikoyani tanlang.',
      lead: "Quyidagi har bir shablon o'zini o'zi o'ynatadi — tayyor kartochkadagi kabi komponentlar, ranglar va harakat. Bu yerda birorta maket yo'q.",
      everything: 'Barchasi',
      countLine: '«{feeling}» uchun shablonlar: {count}.',
      openPreview: "To'liq ko'rinishni ochish",
      mood: 'Kayfiyat',
      motion: 'Harakat',
      suits: 'Mos keladi',
      sections: "Bo'limlar",
      preview: "Ko'rinish",
      useThis: 'Tanlash',
      back: 'Shablonlarga',
    },

    create: {
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
        mood: { eyebrow: 'Kayfiyat', question: "U qanday bo'lishi kerak?" },
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
          suggested: "Biz shuni tanlagan bo'lardik",
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
      },
      done: {
        title: '{name} uchun tayyor.',
        lead: "Kodni gul do'koniga bering. Ular uni kichkina kartochkaga chop etib, poyalarga bog'lashadi — skanerlangunicha kartochka shaxsiy bo'lib qoladi.",
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

    notFound: {
      title: "Bu kartochka bu yerda yo'q.",
      lead: "Yo kod biroz noto'g'ri o'qilgan, yo do'kon kartochkani hali tugatmagan. Ikkalasi ham hal bo'ladi.",
      hint: "Kodda oltita belgi bo'ladi va unda hech qachon O harfi va 0 raqami bo'lmaydi.",
      back: 'Bosh sahifaga',
      makeOwn: "O'zingiznikini yarating",
    },

    card: { madeWith: 'Yaratildi:' },

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
    },

    overview: {
      title: 'Bugun',
      // Uzbek does not inflect the noun after a numeral, so one form serves.
      count: { other: 'Tizimda {count} ta buyurtma.' },
      needsPerson: 'Odam kerak',
      allOrders: 'Barcha buyurtmalar',
      nothingWaiting: 'Kutayotgani yo‘q. Hamma buyurtma olingan.',
    },

    orders: {
      title: 'Buyurtmalar',
      shown: { other: '{count} ta ko‘rsatilyapti' },
      searchPlaceholder: 'Ism, kod, salon…',
      search: 'Qidirish',
      all: 'Hammasi',
      noMatch: 'Hech narsa topilmadi.',
      from: 'kimdan:',
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
    },

    order: {
      back: '← Buyurtmalar',
      from: 'kimdan:',
      sectionOrder: 'Buyurtma',
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
      panelCard: 'Otkritka',
      panelQr: 'QR',
      generate: 'Otkritkani yig‘ish',
      previewCard: 'Otkritkani ko‘rish',
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
      open: 'Och',
      pullRibbon: 'Tasmani torting',
      unfold: 'Yoying',
      wishesTitle: 'Bir nechta tilak',
      defaultWishes: [
        'Shoshilmagan tong',
        'Rejalashtirilmagan biror narsa',
        'Keladigan odamlar',
        'Bitta juda yaxshi kechki ovqat',
      ],
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
