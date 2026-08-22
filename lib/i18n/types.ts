import type { MoodId, OccasionId, RecipientId } from '@/lib/card/taxonomy';
import type { OrderStatus } from '@/lib/db/types';
import type { SectionKind } from '@/lib/card/schema';
import type { MotifId, SceneId } from '@/lib/card/template';

/**
 * The dictionary contract.
 *
 * Every locale file implements this exactly, so a missing string is a compile
 * error rather than an English word appearing in the middle of a Russian page.
 * That is the whole reason this is a typed object and not a JSON blob.
 *
 * It is split in two halves that behave differently:
 *
 *   ui      — site chrome. Chosen by the visitor's URL.
 *   content — what a card is made of. Chosen by the *card's* own locale, so a
 *             Russian card stays Russian for a recipient whose phone is in
 *             English.
 */

/**
 * A count-dependent string, in CLDR plural categories.
 *
 * Russian needs three forms for a plain noun — 1 заказ, 2 заказа, 5 заказов —
 * so `${n} order${n === 1 ? '' : 's'}` cannot be translated, only replaced.
 * `plural()` in `./plural.ts` picks the form with `Intl.PluralRules`; a locale
 * that does not use a category simply omits it, which is why only `other` is
 * required. Uzbek uses `other` alone.
 */
export type PluralForms = {
  one?: string;
  few?: string;
  many?: string;
  other: string;
};

export type OccasionCopyStrings = {
  intro: string;
  quote: string;
  galleryTitle: string;
  timelineTitle: string;
  memoriesTitle: string;
  finalHeadline: string;
  finalText: string;
  signOff: string;
  /** `{name}` is substituted with the recipient's first name. */
  fallbackLetter: string;
};

export type TemplateStrings = {
  name: string;
  tagline: string;
  description: string;
  animationStyle: string;
};

/** Одна демо-история — всё, что в ней написано словами. */
export type DemoStoryStrings = {
  recipientName: string;
  senderName: string;
  /** Письмо. Пустая строка — взять заготовку повода из копи-банка. */
  story: string;
  moments?: { date: string; title: string; text?: string }[];
  memories?: { label: string; text: string }[];
  wishes?: string[];
};

export type Dictionary = {
  ui: {
    nav: { templates: string; works: string; howItWorks: string; createCard: string; viewSite: string };
    hero: {
      eyebrow: string;
      line1: string;
      line2: string;
      line3: string;
      sub: string;
      ctaPrimary: string;
      ctaSecondary: string;
      scroll: string;
    };
    feeling: { eyebrow: string; title: string; lead: string; explore: string };
    story: {
      eyebrow: string;
      title: string;
      lead: string;
      previewPrefix: string;
      allTemplates: string;
      livePreview: string;
    };
    memories: {
      eyebrow: string;
      title: string;
      lead: string;
      labels: {
        name: string;
        date: string;
        detail: string;
        message: string;
        memory: string;
        photos: string;
      };
      samples: {
        name: string;
        date: string;
        detail: string;
        message: string;
        memory: string;
      };
    };
    bouquet: {
      eyebrow: string;
      title: string;
      lead: string;
      steps: { title: string; body: string }[];
      note: string;
    };
    closing: { title: string; promise: string; ctaPrimary: string; ctaSecondary: string };
    footer: {
      promise: string;
      tagline: string;
      product: string;
      forShops: string;
      links: {
        templates: string;
        create: string;
        seeCard: string;
        works: string;
        shops: string;
        dashboard: string;
        orders: string;
        printable: string;
      };
    };
    templates: {
      metaTitle: string;
      metaDescription: string;
      eyebrow: string;
      title: string;
      lead: string;
      everything: string;
      countLine: string;
      openPreview: string;
      mood: string;
      motion: string;
      suits: string;
      sections: string;
      /** Accessible name of the miniature. `{name}` is the template name. */
      previewOf: string;
      preview: string;
      useThis: string;
      back: string;
    };
    create: {
      metaTitle: string;
      metaDescription: string;
      progress: string;
      back: string;
      continue: string;
      steps: {
        recipient: { eyebrow: string; question: string; theirName: string; yourName: string };
        occasion: { eyebrow: string; question: string; hint: string };
        mood: { eyebrow: string; question: string; hint: string };
        story: {
          eyebrow: string;
          question: string;
          hint: string;
          placeholder: string;
          needHelp: string;
          wordCount: string;
          emptyHint: string;
        };
        photos: {
          eyebrow: string;
          question: string;
          hint: string;
          skip: string;
          drop: string;
          choose: string;
          preparing: string;
          enough: string;
          count: string;
          remove: string;
        };
        template: { eyebrow: string; question: string; hint: string; suggested: string };
        language: { label: string; hint: string };
        preview: {
          eyebrow: string;
          question: string;
          hint: string;
          looksRight: string;
          for: string;
          from: string;
          template: string;
          photos: string;
          none: string;
        };
        publish: {
          eyebrow: string;
          question: string;
          hint: string;
          explain: string;
          action: string;
          working: string;
        };
        /** Instructions to the shop: deadlines, styling, anything else. */
        brief: {
          eyebrow: string;
          question: string;
          hint: string;
          placeholder: string;
          skip: string;
        };
        /** How the shop reaches them. At least one channel is required. */
        contact: {
          eyebrow: string;
          question: string;
          hint: string;
          phone: string;
          email: string;
          required: string;
        };
      };
      done: {
        title: string;
        lead: string;
        openPreview: string;
        codeLabel: string;
        copyLink: string;
        copied: string;
        openCard: string;
        printQr: string;
      };
    };
    qr: {
      title: string;
      lead: string;
      print: string;
      copyLink: string;
      copied: string;
    };
    preview: { draft: string };

    /**
     * The page written for flower shops, not for their customers. Different
     * audience, different argument: earnings and effort, not romance.
     */
    shops: {
      metaTitle: string;
      metaDescription: string;
      hero: {
        eyebrow: string;
        title: string;
        lead: string;
        cta: string;
        secondary: string;
        imageAlt: string;
        /** Shown under the hero object once it is actually interactive. */
        sceneHint: string;
      };
      earnings: {
        eyebrow: string;
        title: string;
        lead: string;
        bouquetPrice: string;
        cardsPerMonth: string;
        cardPrice: string;
        perCard: string;
        perMonth: string;
        fee: string;
        feeNote: string;
        free: string;
      };
      product: { eyebrow: string; title: string; lead: string; note: string };
      /** The physical tag, as a 3D object the florist can turn. */
      tag: {
        eyebrow: string;
        title: string;
        lead: string;
        /** Alt text for the rendered still, which is what most visitors see. */
        alt: string;
        /** Why the tag in view carries no name and no code. */
        note: string;
      };
      workflow: {
        eyebrow: string;
        title: string;
        lead: string;
        steps: { time: string; title: string; body: string }[];
        total: string;
      };
      objections: { eyebrow: string; title: string; items: { q: string; a: string }[] };
      contact: { eyebrow: string; title: string; lead: string; cta: string; note: string };
    };
    notFound: { title: string; lead: string; hint: string; back: string; makeOwn: string };
    card: { madeWith: string };
    works: {
      metaTitle: string;
      metaDescription: string;
      eyebrow: string;
      title: string;
      lead: string;
      /** Вкладки над галереей: шаблоны или уже сделанные работы. */
      tabTemplates: string;
      tabWorks: string;
      open: string;
      openFull: string;
      year: string;
      /** Пометка на карточке работы, у которой есть шаблон-потомок. */
      basedTemplate: string;
      /** Честное примечание о единственном изменённом файле. */
      noteCompressedVideo: string;
      noteReplacedName: string;
      noteFixedSource: string;
      qr: string;
      copyLink: string;
      copied: string;
      back: string;
      /** Подпись под фреймом: это оригинал, а не пересборка. */
      original: string;
    };
    localeSwitcher: { label: string };
  };

  /**
   * The shop dashboard.
   *
   * Follows the operator's chosen locale like the rest of `ui` — it is the
   * language the florist works in, and has nothing to do with the language a
   * card is written in. A Tashkent shop can run the queue in Uzbek all day and
   * still publish Russian cards.
   */
  admin: {
    /** The dashboard's own name — heading on the login page, browser tab. */
    title: string;
    nav: {
      overview: string;
      orders: string;
      cards: string;
      templates: string;
      viewSite: string;
      signOut: string;
    };
    login: {
      lead: string;
      password: string;
      submit: string;
      pending: string;
      errorEmpty: string;
      errorWrong: string;
      errorUnconfigured: string;
      /** Shown in place of the form when no password is configured at all. */
      unconfigured: string;
    };
    /** Overlaid onto STATUS_META, which keeps the structure and the colour. */
    status: Record<OrderStatus, { label: string; hint: string }>;
    overview: {
      title: string;
      count: PluralForms;
      needsPerson: string;
      allOrders: string;
      nothingWaiting: string;
    };
    /** The order-notification setup, checkable without placing a real order. */
    notifications: {
      title: string;
      /** Both variables set. Says nothing about whether Telegram accepts them. */
      ready: string;
      /** Neither set — the correct state locally and on every preview. */
      off: string;
      /** One set and not the other. `{missing}` names the absent variable. */
      partial: string;
      test: string;
      testing: string;
      sent: string;
      /** `{missing}` names what to set. */
      unconfigured: string;
      /** Telegram answered and refused. `{detail}` is its own wording. */
      rejected: string;
      /** Telegram was never reached. `{detail}` is the transport error. */
      unreachable: string;
      /** Environment variables only reach a new build. */
      redeploy: string;
    };
    orders: {
      title: string;
      shown: PluralForms;
      searchPlaceholder: string;
      search: string;
      all: string;
      noMatch: string;
      from: string;
      export: string;
      columns: {
        recipient: string;
        for: string;
        occasion: string;
        template: string;
        shop: string;
        created: string;
        status: string;
        code: string;
      };
    };
    cards: {
      title: string;
      count: PluralForms;
      neverIndexed: string;
      none: string;
      from: string;
      open: string;
      print: string;
      copyLink: string;
      copied: string;
      openOrder: string;
      qrAlt: string;
    };
    templates: {
      title: string;
      lead: PluralForms;
      rows: {
        id: string;
        scene: string;
        suits: string;
        moods: string;
        motion: string;
        sections: string;
      };
      noScene: string;
      usage: PluralForms;
      preview: string;
      /** The builder: a template assembled from the vocabulary, no deploy. */
      builder: {
        newTemplate: string;
        identity: string;
        idLabel: string;
        idHint: string;
        look: string;
        palette: string;
        scene: string;
        motif: string;
        suits: string;
        moods: string;
        beats: string;
        beatsHint: string;
        order: string;
        orderHint: string;
        orderNone: string;
        orderMove: string;
        orderBefore: string;
        copy: string;
        copyHint: string;
        name: string;
        tagline: string;
        description: string;
        animationStyle: string;
        save: string;
        saving: string;
        saved: string;
        remove: string;
        removeConfirm: string;
        existing: string;
        none: string;
        preview: string;
        /** Reading a repository of hand-written HTML into this form. */
        importTitle: string;
        importHint: string;
        importAction: string;
        importing: string;
        unmapped: string;
        importOr: string;
        importFiles: string;
        importFilesHint: string;
        importNoFiles: string;
      };
    };
    order: {
      back: string;
      from: string;
      sectionOrder: string;
      sectionBrief: string;
      sectionMessage: string;
      sectionPhotos: string;
      sectionDetails: string;
      sectionNotes: string;
      fields: {
        orderId: string;
        customer: string;
        recipient: string;
        shop: string;
        template: string;
        created: string;
        published: string;
        card: string;
      };
      direct: string;
      notPublished: string;
      composed: PluralForms;
      notComposed: string;
      noMessage: string;
      notesPlaceholder: string;
      saveNotes: string;
      panelStatus: string;
      panelDanger: string;
      deleteHint: string;
      deleteAction: string;
      deleteConfirm: string;
      deleteBlocked: string;
      panelCard: string;
      panelQr: string;
      generate: string;
      previewCard: string;
      /** Same button before publishing — it opens the draft, not the live card. */
      previewDraft: string;
      /**
       * The order of operations, spelled out on the page.
       *
       * Here rather than in a README because the question it answers — "what
       * do I actually do with this order?" — is asked while looking at the
       * order, and an operator who has to leave the page to find out has
       * already been failed by it.
       */
      howTitle: string;
      howSteps: string[];
      previewTemplate: string;
      printable: string;
      copyUrl: string;
      qrAlt: string;
    };
  };

  content: {
    /** The signature cover line. Follows the *card's* locale. */
    coverHeadline: string;
    /** Built-in strings rendered inside a card. */
    card: {
      scrollGently: string;
      /** The one line printed on the physical hang tag. */
      tagLine: string;
      /** Labels the letter beat in the miniature template preview. */
      letterLabel: string;
      open: string;
      pullRibbon: string;
      unfold: string;
      wishesTitle: string;
      /** Shown in the miniature preview when a card has no photographs yet. */
      galleryEmpty: string;
      /** The card-level music control. */
      audio: { play: string };
      /** The cake beat. Structural, like the question's. */
      cake: { prompt: string; hint: string; reply: string };
      /** The question beat. Structural copy, so it lives here, not in a template. */
      question: {
        ask: string;
        yes: string;
        no: string;
        reply: string;
      };
      defaultWishes: string[];
      /** The video beat. Nothing is fetched until this button is pressed. */
      video: {
        /** Accessible name of the play button, over the poster. */
        play: string;
        /** Heading above the beat when the template asks for one. */
        title: string;
        /** Shown in place of the clip when the browser cannot play it. */
        unsupported: string;
      };
    };
    occasions: Record<OccasionId, { label: string; line: string }>;
    moods: Record<MoodId, { label: string; line: string }>;
    /**
     * Names for the vocabulary itself — the scenes and the beats.
     *
     * These are identifiers everywhere else in the codebase and were being
     * printed raw into a Russian dashboard, which is the same class of bug as
     * an English string in a template file: correct-looking in English, wrong
     * in both other languages.
     */
    scenes: Record<SceneId, string>;
    beats: Record<SectionKind, string>;
    motifs: Record<MotifId, string>;
    /**
     * Names for the looks, keyed `kind.variant`.
     *
     * A flat record with a fallback to the identifier rather than a nested
     * type: the vocabulary itself is already compile-checked in
     * `SECTION_VARIANTS`, so the risk here is a missing translation, and a
     * missing translation should show an operator the id rather than fail the
     * build for everyone.
     */
    looks: Record<string, string>;
    recipients: Record<RecipientId, string>;
    /**
     * Демо-истории галереи, по одной на шаблон.
     *
     * Ключ — id шаблона. Сид в `lib/card/demo.ts` держит структуру истории —
     * какие отношения и настроение она показывает, сколько ей нужно
     * фотографий, — а здесь лежит каждое её слово. То же разделение, что у
     * таксономии и реестра шаблонов, и по той же причине: превью, которое
     * читается по-английски русскому посетителю, — это та же ошибка, что
     * панель, печатающая сырой идентификатор.
     *
     * Шаблон без своей истории показывает `romantic` — поэтому запись здесь
     * нужна не для каждого шаблона, а только для тех, кому английская
     * заготовка не подходит по смыслу.
     */
    demo: Record<string, DemoStoryStrings>;
    templates: Record<string, TemplateStrings>;
    copy: Record<OccasionId, OccasionCopyStrings>;
  };
};
