import type { MoodId, OccasionId, RecipientId } from '@/lib/card/taxonomy';
import type { OrderStatus } from '@/lib/db/types';

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

export type Dictionary = {
  ui: {
    nav: { templates: string; howItWorks: string; createCard: string; viewSite: string };
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
        dashboard: string;
        orders: string;
        printable: string;
      };
    };
    templates: {
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
      preview: string;
      useThis: string;
      back: string;
    };
    create: {
      progress: string;
      back: string;
      continue: string;
      steps: {
        recipient: { eyebrow: string; question: string; theirName: string; yourName: string };
        occasion: { eyebrow: string; question: string; hint: string };
        mood: { eyebrow: string; question: string };
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
    notFound: { title: string; lead: string; hint: string; back: string; makeOwn: string };
    card: { madeWith: string };
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
      defaultWishes: string[];
    };
    occasions: Record<OccasionId, { label: string; line: string }>;
    moods: Record<MoodId, { label: string; line: string }>;
    recipients: Record<RecipientId, string>;
    templates: Record<string, TemplateStrings>;
    copy: Record<OccasionId, OccasionCopyStrings>;
  };
};
