import type { Dictionary } from '../types';

/**
 * English — the source dictionary.
 *
 * House style, which the other locales follow: short sentences, concrete over
 * abstract, no exclamation marks. Never "cherish", never "special moments",
 * never "journey". Warmth comes from detail, not from adjectives.
 */
export const en: Dictionary = {
  ui: {
    nav: {
      templates: 'Templates',
      howItWorks: 'How it works',
      createCard: 'Create a card',
      viewSite: 'View site',
    },

    hero: {
      eyebrow: 'A digital card for a real bouquet',
      line1: 'Some feelings',
      line2: 'deserve more',
      line3: 'than a message.',
      sub: 'Create a little digital world for someone special.',
      ctaPrimary: 'Create something beautiful',
      ctaSecondary: 'Explore templates',
      scroll: 'Scroll',
    },

    feeling: {
      eyebrow: 'Step one',
      title: 'Choose a feeling.',
      lead: 'Not a layout, not a font. Start with what you actually want them to feel when the screen lights up.',
      explore: 'Explore',
    },

    story: {
      eyebrow: 'Step two',
      title: 'Choose a story.',
      lead: 'Six ways to say it. Each one is a real experience with its own pace, palette and motion — not a colour swap.',
      previewPrefix: 'Preview',
      allTemplates: 'All templates',
      livePreview: 'Live preview — no video, no mockup.',
    },

    memories: {
      eyebrow: 'Step three',
      title: 'Add your memories.',
      lead: 'A name, a message, photographs, the dates that only mean something to the two of you. We turn them into the card; you just have to remember them.',
      labels: {
        name: 'Their name',
        date: 'A date',
        detail: 'Something only you would know',
        message: 'The message',
        memory: 'A memory',
        photos: 'Photographs',
      },
      samples: {
        name: 'Alina',
        date: 'March 2023 — the coffee argument',
        detail: 'She said peonies look like they are mid-sentence.',
        message:
          'I have started this eleven times. Every version sounded either too small or too much, so here is the plain one.',
        memory: 'The train we missed. Best four hours of that year.',
      },
    },

    bouquet: {
      eyebrow: 'The bridge',
      title: 'Attach it to a bouquet.',
      lead: 'The flowers arrive the way they always have. The card is the part they keep.',
      steps: [
        { title: 'The bouquet', body: 'Chosen at the shop, the way it has always been done.' },
        { title: 'The card', body: 'A small printed card tied to the stems. One line, one code.' },
        { title: 'The scan', body: 'They lift their phone before they have even found a vase.' },
        { title: 'The world', body: 'A little world, made just for them, opening one screen at a time.' },
      ],
      note: 'The QR is only the doorway. Nobody remembers a doorway.',
    },

    closing: {
      title: 'More than a bouquet.',
      promise: 'Your bouquet says I care. Your digital card tells them why.',
      ctaPrimary: 'Create something beautiful',
      ctaSecondary: 'Open a finished card',
    },

    footer: {
      promise: 'Your bouquet says I care. Your digital card tells them why.',
      tagline: 'A little world, made just for them.',
      product: 'Product',
      forShops: 'For flower shops',
      links: {
        templates: 'Templates',
        create: 'Create a card',
        seeCard: 'See a real card',
        shops: 'For shops: what it pays',
        dashboard: 'Shop dashboard',
        orders: 'Orders',
        printable: 'Printable QR card',
      },
    },

    templates: {
      metaTitle: 'Templates',
      metaDescription:
        'Six ways to say it. Each template is a real experience with its own pace, palette and motion.',
      eyebrow: 'The library',
      title: 'Choose a story.',
      lead: 'Every template below is playing itself — the same components, palette and motion the finished card will use. Nothing here is a mockup.',
      everything: 'Everything',
      countLine: '{count} templates suited to {feeling}.',
      openPreview: 'Open full preview',
      mood: 'Mood',
      motion: 'Motion',
      suits: 'Suits',
      sections: 'Sections',
      preview: 'Preview',
      useThis: 'Use this',
      back: 'Back to templates',
    },

    create: {
      metaTitle: 'Create a card',
      metaDescription: 'Nine questions, and a little world made for someone.',
      progress: 'Step {current} of {total}',
      back: 'Back',
      continue: 'Continue',
      steps: {
        recipient: {
          eyebrow: 'To begin',
          question: 'Who is this for?',
          theirName: 'Their name',
          yourName: 'Your name',
        },
        occasion: {
          eyebrow: 'The reason',
          question: "What's the occasion?",
          hint: "If there isn't one, that is a perfectly good answer.",
        },
        mood: { eyebrow: 'The feeling', question: 'How should it feel?' },
        story: {
          eyebrow: 'The important part',
          question: 'Tell us the story.',
          hint: 'Write it badly if you have to — specifics beat polish. The date, the argument, the flower they mentioned once.',
          placeholder: 'Tell us about them, your story, or what you want to say...',
          needHelp: 'I need help writing it',
          wordCount: '{count} words. Blank lines become new paragraphs.',
          emptyHint: 'Leave it empty and we will write something honest and short for you.',
        },
        photos: {
          eyebrow: 'If you have them',
          question: 'Add a few photographs.',
          hint: 'Three or four is usually better than twenty. They are resized on your device before anything is sent.',
          skip: 'No photos',
          drop: 'Drop photographs here, or choose them from your device.',
          choose: 'Choose photos',
          preparing: 'Preparing…',
          enough: 'That is plenty',
          count: '{count} photographs, shown in the order you added them.',
          remove: 'Remove photograph {index}',
        },
        template: {
          eyebrow: 'The shape of it',
          question: 'Choose a story.',
          hint: 'Based on your answers we would pick {name}. You can overrule us.',
          suggested: 'Suggested for you',
        },
        language: {
          label: 'Language of the card',
          hint: 'The language it will be written in — not the language you are browsing in.',
        },
        preview: {
          eyebrow: 'Nearly there',
          question: 'Here it is.',
          hint: 'A miniature of the real card, playing its own beats. The published version fills the whole screen.',
          looksRight: 'Looks right',
          for: 'For',
          from: 'From',
          template: 'Template',
          photos: 'Photographs',
          none: 'None',
        },
        publish: {
          eyebrow: 'The last step',
          question: 'Publish it.',
          hint: 'You get a link and a code. The shop prints the code onto a small card and ties it to the flowers.',
          explain:
            'Publishing creates a private page for {name} that only someone with the code can open. It is never indexed by search engines.',
          action: 'Publish the card',
          working: 'Publishing…',
        },
        brief: {
          eyebrow: 'For the shop',
          question: 'Anything else they should know?',
          hint: 'Deadlines, styling, anything the questions above had no room for. The shop reads this; it never goes into the card.',
          placeholder: 'Needed by Friday, nothing too bright, make the wedding photograph larger...',
          skip: 'Nothing to add',
        },
        contact: {
          eyebrow: 'How to reach you',
          question: 'Leave a contact.',
          hint: 'Needed if the shop has a question about your card. One is enough.',
          phone: 'Phone',
          email: 'Email',
          required: 'Leave a phone number or an email address.',
        },
      },
      done: {
        title: 'The order for {name} is in.',
        lead: 'The shop will put the card together and get in touch. You can look at the draft now — it will change once they are finished.',
        openPreview: 'See the draft',
        codeLabel: 'The code',
        copyLink: 'Copy the link',
        copied: 'Link copied',
        openCard: 'Open the card',
        printQr: 'Print the QR card for the bouquet',
      },
    },

    qr: {
      title: 'The card for the bouquet.',
      lead: 'Print at 100% on matte card stock, cut to the marks, and tie it to the stems. For {recipient}, from {sender}.',
      print: 'Print the card',
      copyLink: 'Copy card link',
      copied: 'Copied',
    },

    preview: { draft: 'A draft. The shop is still working on this card — too early to give the link away.' },

    shops: {
      metaTitle: 'For flower shops',
      metaDescription:
        'A counter upsell: a digital card for the bouquet. The shop keeps most of it and pays only for a card it publishes.',

      hero: {
        eyebrow: 'For flower shops',
        title: 'Sell the part they keep.',
        lead: 'A bouquet lasts a week. The card they open from the QR on its tag lasts for good — and adds whatever you decide to every sale. Three minutes of an assistant’s time.',
        cta: 'Message us on Telegram',
        secondary: 'See a card',
        imageAlt: 'A bouquet in kraft paper with the Bir dunyo tag tied at the wrap.',
        sceneHint: 'Drag to turn it',
      },

      earnings: {
        eyebrow: 'What it pays',
        title: 'Work it out on your own numbers.',
        lead: 'Move the sliders to match your shop. We take a fixed amount per published card; the rest is yours.',
        bouquetPrice: 'Average bouquet',
        cardsPerMonth: 'Cards per month',
        cardPrice: 'What you charge for a card',
        perCard: 'You keep, per card',
        perMonth: 'You keep, per month',
        fee: 'Our share this month — {amount}.',
        feeNote: 'Charged when you publish, which is after you have taken the customer’s money. No subscription, nothing paid up front.',
        free: 'The first {count} cards are free — no share at all.',
      },

      product: {
        eyebrow: 'What the customer gets',
        title: 'Not a picture, not a video.',
        lead: 'A small website made for one person: their name, a letter, photographs, the dates that mean something only to the two of them. It opens on a phone from the QR on the tag.',
        note: 'The link is not findable in search — only someone with the code can open it.',
      },

      tag: {
        eyebrow: 'What you tie on',
        title: 'This tag.',
        lead: 'Thick card stock, a brass eyelet, jute string. The only part you hold: everything else lives on the customer’s phone.',
        alt: 'The printed Bir dunyo tag: card stock, a brass eyelet and jute string',
        note: 'It is blank here because that is how it arrives. The name and the code are printed on it for a particular order — every card has a code of its own.',
      },

      workflow: {
        eyebrow: 'What it looks like for you',
        title: 'Three minutes at the counter.',
        lead: 'Honestly, with the real timings. Nothing to install — it all runs in a browser.',
        steps: [
          {
            time: '30 seconds',
            title: 'Offer it',
            body: 'They have chosen a bouquet. You show a finished example on your phone: “shall we add a card to it?”',
          },
          {
            time: '2 minutes',
            title: 'Take it down',
            body: 'They say who it is for and why, and send photographs if they have them. You put it into the form — or they fill it in on their own phone.',
          },
          {
            time: '30 seconds',
            title: 'Hand it over',
            body: 'We compose the card, you read it and publish. Print the QR tag and tie it to the stems.',
          },
        ],
        total: 'We write the card. You tell the customer about it and press publish.',
      },

      objections: {
        eyebrow: 'What shops ask',
        title: 'Short answers.',
        items: [
          {
            q: 'What if nobody buys it?',
            a: 'Then you have lost nothing. We charge only for a published card, and you publish after the customer has paid. Nothing is due up front.',
          },
          {
            q: 'Do I have to train my staff?',
            a: 'No. The form is nine questions in plain words — no settings, no editor. Anyone who can take an order over the phone can do it.',
          },
          {
            q: 'Who writes the card?',
            a: 'We do. The customer says it however it comes out, we turn it into a card, and you read it before it goes live.',
          },
          {
            q: 'What if the customer says nothing?',
            a: 'The card still works. Every template has an honest fallback letter for the occasion — never blank, never generic.',
          },
          {
            q: 'Do I need a website of my own?',
            a: 'No. Everything opens from a link and works on any phone. There is nothing to install or configure.',
          },
        ],
      },

      contact: {
        eyebrow: 'Getting started',
        title: 'Try it on one bouquet.',
        lead: 'Message us on Telegram — we will show you a real card, set you up, and the first cards are free. No contract, nothing paid in advance.',
        cta: 'Message us on Telegram',
        note: 'We answer the same day.',
      },
    },

    notFound: {
      title: "This card isn't here.",
      lead: 'Either the code was read slightly wrong, or the card is still being finished by the shop. Both are fixable.',
      hint: 'Codes are six characters and never contain the letter O or the number 0.',
      back: 'Back to the start',
      makeOwn: 'Make one of your own',
    },

    card: { madeWith: 'Made with' },

    localeSwitcher: { label: 'Language' },
  },

  admin: {
    title: 'Shop dashboard',

    nav: {
      overview: 'Overview',
      orders: 'Orders',
      cards: 'Cards',
      templates: 'Templates',
      viewSite: 'View site',
      signOut: 'Sign out',
    },

    login: {
      lead: 'The order queue and the cards already live.',
      password: 'Password',
      submit: 'Sign in',
      pending: 'Checking…',
      errorEmpty: 'Enter the password.',
      errorWrong: 'Wrong password.',
      errorUnconfigured: 'Sign-in is not configured: ADMIN_PASSWORD is unset.',
      unconfigured:
        'Sign-in is not configured. Set the ADMIN_PASSWORD environment variable and redeploy.',
    },

    status: {
      NEW: { label: 'New', hint: 'Just arrived from the shop' },
      PROCESSING: { label: 'Processing', hint: 'Being written and composed' },
      REVIEW: { label: 'Review', hint: 'Waiting on a human read-through' },
      READY: { label: 'Ready', hint: 'Approved, not yet live' },
      PUBLISHED: { label: 'Published', hint: 'Live and attached to a bouquet' },
      CANCELLED: { label: 'Cancelled', hint: 'Called off; the code stays reserved' },
    },

    overview: {
      title: 'Today',
      count: { one: '{count} order in the system.', other: '{count} orders in the system.' },
      needsPerson: 'Needs a person',
      allOrders: 'All orders',
      nothingWaiting: 'Nothing waiting. Every order has been picked up.',
    },

    notifications: {
      title: 'Order notifications',
      ready: 'Configured. Send a test to confirm Telegram accepts these values.',
      off: 'Off — neither variable is set. That is correct on your own machine and on every preview.',
      partial: 'Half configured: {missing} is not set. Orders arrive and nobody is told.',
      test: 'Send a test',
      testing: 'Sending…',
      sent: 'Delivered. It is in the chat now.',
      unconfigured: 'Nothing to test: {missing} is not set.',
      rejected: 'Telegram refused: {detail}',
      unreachable: 'Telegram could not be reached: {detail}',
      redeploy: 'Environment variables only reach a new build — redeploy after changing them.',
    },

    orders: {
      title: 'Orders',
      shown: { one: '{count} shown', other: '{count} shown' },
      searchPlaceholder: 'Name, code, shop…',
      search: 'Search',
      all: 'All',
      noMatch: 'No orders match that.',
      from: 'from',
      export: 'Download all',
      columns: {
        recipient: 'Recipient',
        for: 'For',
        occasion: 'Occasion',
        template: 'Template',
        shop: 'Shop',
        created: 'Created',
        status: 'Status',
        code: 'Code',
      },
    },

    cards: {
      title: 'Cards',
      count: { one: '{count} live card.', other: '{count} live cards.' },
      neverIndexed: 'Each one is private and never indexed.',
      none: 'Nothing published yet.',
      from: 'from',
      open: 'Open',
      print: 'Print',
      copyLink: 'Copy link',
      copied: 'Copied',
      openOrder: 'Open the order',
      qrAlt: 'QR code for the card',
    },

    templates: {
      title: 'Templates',
      lead: {
        one: '{count} registered. Templates live in the codebase — this list is generated from the registry, so it is never out of date. Adding one is a single file.',
        other:
          '{count} registered. Templates live in the codebase — this list is generated from the registry, so it is never out of date. Adding one is a single file.',
      },
      rows: {
        id: 'ID',
        scene: 'Scene',
        suits: 'Suits',
        moods: 'Moods',
        motion: 'Motion',
        sections: 'Sections',
      },
      noScene: 'No 3D',
      usage: { one: '{count} order', other: '{count} orders' },
      preview: 'Preview',
      builder: {
        newTemplate: 'Build a template',
        identity: 'What the system calls it',
        idLabel: 'Identifier',
        idHint: 'Lower-case letters and hyphens. It becomes /templates/… and is written into orders — it does not change afterwards.',
        look: 'How it looks',
        palette: 'Palette',
        scene: 'Scene',
        motif: 'Motif',
        suits: 'Occasions it suits',
        moods: 'Moods',
        beats: 'What it is made of',
        beatsHint: 'Tick the parts it plays and choose a look for each. A part with no data disappears on its own: no photographs, no gallery.',
        order: 'Order',
        orderHint: 'One part can move ahead of another. That is exactly what separates Aloud from Nocturne: the recording comes before the letter, so the letter reads as the reply.',
        orderNone: 'Standard order',
        orderMove: 'Move',
        orderBefore: 'Ahead of',
        copy: 'How it is described',
        copyHint: 'English is required — it is the fallback for every language. Russian and Uzbek are added separately.',
        name: 'Name',
        tagline: 'One line',
        description: 'Description',
        animationStyle: 'How it moves',
        save: 'Save template',
        saving: 'Saving…',
        saved: 'Saved. It is in the gallery and the order form already.',
        remove: 'Delete',
        removeConfirm: 'Delete this template? Cards already built on it keep working.',
        existing: 'Built here',
        none: 'None yet.',
        preview: 'Preview',
        importTitle: 'Or read an existing page',
        importHint: 'A link to a public repository of hand-written HTML. The model reads it and fills the form below — it saves nothing, this is a draft you correct.',
        importAction: 'Read it',
        importing: 'Reading…',
        unmapped: 'Screens the engine has no beat for:',
        importOr: 'Or, if it is a folder rather than a repository:',
        importFiles: 'Choose a folder',
        importFilesHint: 'Only html, css and js are read. Photographs, music and video are not sent: they belong to an order, not to a template.',
        importNoFiles: 'That folder has no html, css or js in it.',
      },
    },

    order: {
      back: '← Orders',
      from: 'from',
      sectionOrder: 'The order',
      sectionBrief: 'What the customer asked for',
      sectionMessage: 'What the customer wrote',
      sectionPhotos: 'Photographs',
      sectionDetails: 'Details supplied',
      sectionNotes: 'Shop notes',
      fields: {
        orderId: 'Order ID',
        customer: 'Customer',
        recipient: 'Recipient',
        shop: 'Shop',
        template: 'Template',
        created: 'Created',
        published: 'Published',
        card: 'Card',
      },
      direct: 'Direct',
      notPublished: 'Not yet',
      composed: { one: '{count} section composed', other: '{count} sections composed' },
      notComposed: 'Not composed yet',
      noMessage: 'Nothing written — the template will supply an honest fallback letter.',
      notesPlaceholder: 'Pickup time, packaging, anything the next person needs to know.',
      saveNotes: 'Save notes',
      panelStatus: 'Status',
      panelDanger: 'Irreversible',
      deleteHint: 'This order was never published, so it can be deleted for good.',
      deleteAction: 'Delete the order',
      deleteConfirm: 'Delete this order permanently? This cannot be undone.',
      deleteBlocked: 'A published order cannot be deleted: its code may already be printed on a tag. Cancel it instead — the card goes down and the code stays reserved.',
      panelCard: 'Card',
      panelQr: 'QR',
      generate: 'Generate card',
      previewCard: 'Preview the card',
      previewTemplate: 'Preview the template',
      printable: 'Printable card',
      copyUrl: 'Copy URL',
      qrAlt: 'QR code for the card',
    },
  },

  content: {
    coverHeadline: 'there’s something waiting for you…',

    card: {
      scrollGently: 'Scroll gently',
      tagLine: 'There is a little something extra for you.',
      letterLabel: 'The letter',
      open: 'Open it',
      pullRibbon: 'Pull the ribbon',
      unfold: 'Unfold',
      wishesTitle: 'A few wishes',
      question: {
        ask: 'Shall we?',
        yes: 'Yes',
        no: 'No',
        reply: 'Knew it.',
      },
      defaultWishes: [
        'A slow morning',
        'Something you did not plan',
        'People who show up',
        'One very good meal',
      ],
      video: {
        play: 'Play',
        title: 'A voice, here',
        unsupported: 'This browser cannot play the video.',
      },
    },

    occasions: {
      love: { label: 'Love', line: 'For the person you think about first.' },
      birthday: { label: 'Birthday', line: 'A whole year of them, worth celebrating.' },
      'for-mom': { label: 'For Mom', line: 'The words that never quite fit in a card.' },
      anniversary: { label: 'Anniversary', line: 'Everything you have built, in one place.' },
      friendship: { label: 'Friendship', line: 'For the ones who stayed.' },
      celebration: { label: 'Celebration', line: 'Something good happened. Say it properly.' },
      'just-because': { label: 'Just Because', line: 'No reason. That is the reason.' },
    },

    moods: {
      romantic: { label: 'Romantic', line: 'Low light, slow reveals, one candle.' },
      warm: { label: 'Warm', line: 'Like a kitchen in the morning.' },
      cute: { label: 'Cute', line: 'Light-footed and a little playful.' },
      elegant: { label: 'Elegant', line: 'Restrained. Every detail deliberate.' },
      funny: { label: 'Funny', line: 'They will laugh before they cry.' },
      minimal: { label: 'Minimal', line: 'Few words. A lot of air.' },
      dreamy: { label: 'Dreamy', line: 'Soft focus, drifting petals.' },
    },

    recipients: {
      girlfriend: 'Girlfriend',
      boyfriend: 'Boyfriend',
      wife: 'Wife',
      husband: 'Husband',
      mom: 'Mom',
      dad: 'Dad',
      friend: 'Friend',
      family: 'Family',
      'someone-special': 'Someone special',
    },

    templates: {
      romantic: {
        name: 'Nocturne',
        tagline: 'Low light, slow reveals, one long letter.',
        description:
          'A card that behaves like the end of a good evening. The story opens in near-darkness, a single glass heart holds the light, and the letter is revealed one paragraph at a time as they scroll. Built for the message you have been rehearsing for a while.',
        animationStyle: 'Long fades, drifting petals, paragraph-by-paragraph reveal',
      },
      birthday: {
        name: 'Golden Hour',
        tagline: 'Celebratory, warm, and completely free of balloons.',
        description:
          'Birthday cards usually shout. This one raises a glass. Warm champagne paper, photographs arranged like they were just laid on a table, and a wish list that unfolds line by line. Ends on a single sentence about the person, not the date.',
        animationStyle: 'Rising embers, tilted photographs, line-by-line wishes',
      },
      mom: {
        name: 'Kitchen Light',
        tagline: 'Unhurried, generous, and slightly sunlit.',
        description:
          'Built for the things that never fit into a phone call. Warm linen surfaces, a letter set large enough to read slowly, and a quiet ledger of the things she gave you. No cursive fonts, no floral borders — it takes her seriously.',
        animationStyle: 'Soft light drift, large type, gentle sequential reveals',
      },
      anniversary: {
        name: 'Ten Thousand Mornings',
        tagline: 'Architectural, quiet, built around a timeline.',
        description:
          'An anniversary is a long record, so this template makes the timeline the spine of the story. Midnight surfaces, brass detailing and an arched cover give it the weight of something printed rather than posted. The letter sits in the middle, framed like a plaque.',
        animationStyle: 'Architectural wipes, timeline threading, restrained parallax',
      },
      memories: {
        name: 'The Archive',
        tagline: 'Photograph-led. The pictures do the talking.',
        description:
          'For the card that is really a small exhibition. Archival paper, captions set like museum labels, and a horizontal filmstrip you scrub through with a thumb. No 3D, no effects — it loads instantly on any phone and puts every pixel into the photographs.',
        animationStyle: 'Filmstrip scrubbing, museum captions, near-zero effects',
      },
      sakura: {
        name: 'Hanami',
        tagline: 'Washi paper, sumi ink, one branch of blossom.',
        description:
          'Borrowed from Japanese print composition rather than Japanese decoration: enormous margins, a deliberately off-centre column, and a single sakura branch that sheds petals as you read. The quietest template in the library, and the one that ages best.',
        animationStyle: 'Falling sakura, asymmetric columns, ink-wash transitions',
      },
      aloud: {
        name: 'Aloud',
        tagline: 'A recording first, then the words.',
        description:
          'The shortest card in the library, and the only one that opens its mouth. A title over soft light, an envelope to tap, then the sender on camera before a single line is read — the letter arrives afterwards, one line at a time, as the reply. For the message that is easier said than written.',
        animationStyle: 'Drifting light, a tapped envelope, the letter line by line',
      },
      window: {
        name: 'The Window',
        tagline: 'A few words over something moving.',
        description:
          'The video plays behind the words rather than beside them, like a view somebody is half-watching. There is little text and it is large, because nobody reads for long across a moving picture. For the things said quietly: rest, get better, I am here.',
        animationStyle: 'Movement behind the type, falling petals, nothing hurried',
      },
      ask: {
        name: 'Shall We',
        tagline: 'Asks a question and will not take no.',
        description:
          'The only template that asks for something instead of telling you something. Photographs, a short run-up, and a question with two buttons — except that "no" runs away from the cursor. There is no way to decline, and that is the joke: the card is not requesting a decision, it is performing one.',
        animationStyle: 'Bright, a button that flees, an answer instead of a question',
      },
    },

    copy: {
      love: {
        intro: 'There are things that are too big for a text message.',
        quote: 'I did not fall for you all at once. I keep falling, quietly, on ordinary Tuesdays.',
        galleryTitle: 'Us, mostly unposed',
        timelineTitle: 'How we got here',
        memoriesTitle: 'Small things I kept',
        finalHeadline: 'Some people make ordinary days feel a little less ordinary.',
        finalText: 'You are the reason I keep noticing them.',
        signOff: 'With love,',
        fallbackLetter:
          '{name},\n\nI am not always good at saying this out loud, so I am writing it down instead.\n\nYou make the ordinary parts of my life better. Not in a dramatic way — in the quiet way, the one you only notice when you imagine it missing.\n\nI wanted you to have something you could keep.',
      },
      birthday: {
        intro: 'A whole year of you. That deserves more than a message.',
        quote: 'The world got noticeably better the year you turned up in it.',
        galleryTitle: 'This year, in pieces',
        timelineTitle: 'The year, roughly',
        memoriesTitle: 'Reasons to celebrate you',
        finalHeadline: 'Here is to another year of you being exactly who you are.',
        finalText: 'No notes. No edits. Just more of it.',
        signOff: 'Happy birthday,',
        fallbackLetter:
          'Happy birthday, {name}.\n\nI could have sent a message. It felt too small for the occasion.\n\nSo instead: a whole year of you happened, and it made things better for everyone standing near you. That is worth saying properly.\n\nHave the day you actually want.',
      },
      'for-mom': {
        intro: 'There are things that never quite fit into a phone call.',
        quote: 'Everything soft in me, I learned from you.',
        galleryTitle: 'Us, over the years',
        timelineTitle: 'Things you gave me',
        memoriesTitle: 'What I remember',
        finalHeadline: 'Thank you. For all of it, including the parts I never noticed.',
        finalText: 'I notice them now.',
        signOff: 'With love,',
        fallbackLetter:
          '{name},\n\nI do not say this often enough, and a phone call never seems like the right place for it.\n\nSo much of how I move through the world came from you. The patience especially — I am still working on that one.\n\nThank you. For the enormous things, and for the thousand small ones I only understood later.',
      },
      anniversary: {
        intro: 'Years, measured in ordinary mornings.',
        quote: 'Given the choice again, and again after that — you.',
        galleryTitle: 'The evidence',
        timelineTitle: 'The years so far',
        memoriesTitle: 'Things worth keeping',
        finalHeadline: 'Still you. Still this. Still glad.',
        finalText: 'Here is to the next stretch of ordinary mornings.',
        signOff: 'Always,',
        fallbackLetter:
          '{name},\n\nAnother year. It went quickly, which I am told is a good sign.\n\nWhat I keep coming back to is not the big occasions but the ordinary evenings — the ones that would be unremarkable with anyone else.\n\nI would choose this again. I do, most days, without thinking about it.',
      },
      friendship: {
        intro: 'Some people just stay. You are one of them.',
        quote: 'Not everyone stays. You never made it a question.',
        galleryTitle: 'Exhibits A through Z',
        timelineTitle: 'A brief history',
        memoriesTitle: 'Things I have not forgotten',
        finalHeadline: 'Thank you for being easy to love and hard to lose.',
        finalText: 'You already know. Here it is in writing anyway.',
        signOff: 'Yours,',
        fallbackLetter:
          '{name},\n\nThis is not an occasion card. It is more of a receipt.\n\nYou have shown up for a lot of things that were not convenient, and never once made it feel like a favour. That is rarer than you think.\n\nAnyway. Flowers seemed like the right amount of dramatic.',
      },
      celebration: {
        intro: 'You did the thing. Properly, and against the odds.',
        quote: 'Nobody saw the early mornings. I did.',
        galleryTitle: 'How it looked',
        timelineTitle: 'The long way round',
        memoriesTitle: 'What it took',
        finalHeadline: 'Whatever comes next, you have already proved the point.',
        finalText: 'Take the win. Properly, for once.',
        signOff: 'So proud of you,',
        fallbackLetter:
          '{name},\n\nCongratulations. Genuinely.\n\nMost people will see the result. I saw the part before it — the unglamorous stretch where it was not obvious this would work, and you kept going anyway.\n\nThat is the part worth celebrating.',
      },
      'just-because': {
        intro: 'No occasion. Just a Tuesday, and you on my mind.',
        quote: 'Some days you do not need a reason. This is one of those days.',
        galleryTitle: 'Nothing in particular',
        timelineTitle: 'Assorted evidence',
        memoriesTitle: 'Small things',
        finalHeadline: 'No reason. That is the whole reason.',
        finalText: 'Hope it landed on a good day.',
        signOff: 'Thinking of you,',
        fallbackLetter:
          '{name},\n\nThere is no occasion attached to this. Nothing happened, nothing is coming up.\n\nI just thought about you at an ordinary moment on an ordinary day and decided that was reason enough.\n\nThat is the whole message.',
      },
    },
  },
};
