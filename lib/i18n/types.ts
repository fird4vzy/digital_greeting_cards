import type { MoodId, OccasionId, RecipientId } from '@/lib/card/taxonomy';

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
      };
      done: {
        title: string;
        lead: string;
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
    notFound: { title: string; lead: string; hint: string; back: string; makeOwn: string };
    card: { madeWith: string };
    localeSwitcher: { label: string };
  };

  content: {
    /** The signature cover line. Follows the *card's* locale. */
    coverHeadline: string;
    /** Built-in strings rendered inside a card. */
    card: {
      scrollGently: string;
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
