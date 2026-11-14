// =====================================================
// INTERNATIONALIZATION (i18n)
// Multi-language support for portfolio content
// Supported languages: English (en), French (fr)
// =====================================================

export type Language = "en" | "fr";

export interface Content {
  profile: {
    name: string;
    headline: string;
  };
  about: {
    title: string;
    description: string;
    highlights: string[];
    cvLabel: string;
    cvLink: string;
  };
  projects: {
    title: string;
    description: string;
    items: Array<{
      /** Stable id shared by the 3D world and the UI (arcade cabinet, screenshot file). */
      id: string;
      name: string;
      /** Short role line shown on the project card. */
      role: string;
      description: string;
      technologies: string[];
      link: string;
    }>;
  };
  skills: {
    title: string;
    description: string;
    categories: Array<{
      name: string;
      items: string[];
    }>;
  };
  contact: {
    title: string;
    description: string;
    methods: Array<{
      type: string;
      value: string;
      link: string;
    }>;
  };
  navigation: {
    about: string;
    projects: string;
    skills: string;
    contact: string;
    back: string;
    language: string;
    pressEnter: string;
  };
  ui: {
    intro: {
      title: string;
      description: string;
      controlsTitle: string;
      controls: Array<{ key: string; action: string }>;
      startButton: string;
      expressButton: string;
    };
    contentPanel: {
      keyHighlights: string;
      learnMore: string;
      roleLabel: string;
      stackLabel: string;
      /** "{name}" is replaced by the project name. */
      screenshotAlt: string;
      cvAction: string;
    };
    settings: {
      title: string;
      languageLabel: string;
      close: string;
      soundLabel: string;
      soundOn: string;
      soundOff: string;
      qualityLabel: string;
      qualityAuto: string;
      qualityHigh: string;
      qualityLow: string;
      qualityHint: string;
      volumeLabel: string;
      volumeChannels: { master: string; music: string; effects: string; ambience: string; ui: string };
      openSettings: string;
      expressLink: string;
      expressLinkShort: string;
    };
    express: {
      title: string;
      tagline: string;
      skipLink: string;
      navLabel: string;
      languageLabel: string;
      backTo3D: string;
      footer: string;
      soundCredits: string;
    };
    loading: {
      title: string;
      hint: string;
      ready: string;
      timedOut: string;
    };
    prompt: {
      open: string;
      tapToOpen: string;
      enterKey: string;
    };
    mobile: {
      joystick: string;
      boost: string;
    };
    hud: {
      map: string;
    };
    escapeMenu: {
      menuTitle: string;
      tabHome: string;
      tabControls: string;
      tabSettings: string;
      tabMap: string;
      controlOr: string;
      mapYourPosition: string;
      mapTeleportHint: string;
      controls: Array<{
        keys: string;
        action: string;
      }>;
    };
    hwAccelWarning: {
      title: string;
      description: string;
      chrome: string;
      firefox: string;
      edge: string;
      dismissButton: string;
    };
  };
}

// =====================================================
// ENGLISH CONTENT
// =====================================================

const EN: Content = {
  profile: {
    name: "Tommy PREEL",
    headline: "FullStack developer, Toulouse",
  },
  about: {
    title: "About Me",
    description:
      "Hey, I'm Tommy, a full-stack developer in Toulouse, France. I write TypeScript every day: Angular and React on the front, ExpressJS and AWS on the back. I care about security and performance, and I like things that feel good to use. I work at Airbus through Alten SO, where I've spent 4+ years on industrial applications.",
    highlights: [
      "4+ years at Airbus (with 3 years as work-study)",
      "TypeScript / Angular / React",
      "AWS & Cloud Infrastructure",
      "CI/CD, Docker & Self-Hosting",
    ],
    cvLabel: "View my CV",
    cvLink: "https://tommy-tech.fr/cv",
  },
  projects: {
    title: "Projects",
    description: "Work and personal projects. The arcade cabinets are my web games.",
    items: [
      {
        id: "airbus",
        name: "Airbus Industrial Apps",
        role: "Developer, work-study then employee",
        description:
          "Two Angular apps I built at Airbus: a back-office viewer that shows aircraft parts as a data tree, and a tool that detects hazardous substances in aircraft parts. I put a lot of care into tests, security and code quality.",
        technologies: ["Angular", "TypeScript", "AWS", "CI/CD"],
        link: "",
      },
      {
        id: "manga-sensei",
        name: "MangaSensei",
        role: "Solo project, full stack",
        description:
          "Collect cards of manga characters, trade them with other players and battle with them. Rankings turn every collection into a small competition.",
        technologies: ["React", "PostgreSQL", "Vitest", "Playwright"],
        link: "https://manga-sensei.tommy-tech.fr",
      },
      {
        id: "minigames",
        name: "MiniGames",
        role: "Solo project, full stack",
        description:
          "7 party games in one app, including Undercover, Fake Artist and Wavelength. Play in the same room or from different cities.",
        technologies: ["HTML", "JavaScript", "Node.js", "WebSocket", "PWA"],
        link: "https://minigames.tommy-tech.fr",
      },
      {
        id: "pvpedia",
        name: "PvPedia",
        role: "Solo project, full stack",
        description:
          "A Wikipedia article is hidden and everyone races to name it. Guess words to reveal the text, and find the title before the others.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://pvpedia.tommy-tech.fr",
      },
      {
        id: "blitzquiz",
        name: "BlitzQuiz",
        role: "Solo project, full stack",
        description:
          "Write your own quiz, share a room code, and everyone answers from their own phone or laptop.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://blitzquiz.tommy-tech.fr",
      },
      {
        id: "blindtest",
        name: "Blindtest",
        role: "Solo project, full stack",
        description:
          "A music blindtest where players race to name each song. Open a room, share the code, and find out who really knows their music.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://blindtest.tommy-tech.fr",
      },
      {
        id: "scrum-poker",
        name: "Scrum Poker",
        role: "Solo project, full stack",
        description:
          "Planning poker for agile teams. Open a room, invite the team and vote on story points together. Handy for remote sprint planning.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://scrum-poker.tommy-tech.fr",
      },
      {
        id: "reflex-game",
        name: "Reflex Game",
        role: "Solo project, full stack",
        description:
          "A dot appears on screen and everyone rushes to click it first. Simple, and a good way to find out who has the fastest reflexes.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://reflex-game.tommy-tech.fr",
      },
      {
        id: "self-hosted-server",
        name: "Self-Hosted Server",
        role: "Personal infrastructure",
        description:
          "I turned an old PC into an Ubuntu server that hosts my personal projects and game servers. SSH, Docker, networking and security hardening: I set it all up myself.",
        technologies: ["Linux", "Docker", "Networking", "CI/CD"],
        link: "",
      },
      {
        id: "portfolio",
        name: "3D Portfolio",
        role: "Design, 3D and development",
        description:
          "This website, built with React, Three.js and TypeScript. You drive a small car around the island to visit each section.",
        technologies: ["React", "Three.js", "TypeScript", "Vite"],
        link: "#",
      },
    ],
  },
  skills: {
    title: "Skills & Expertise",
    description: "What I use day to day. Knock a block over if you like.",
    categories: [
      {
        name: "Frontend",
        items: ["Angular", "React", "TypeScript", "HTML / CSS", "Figma"],
      },
      {
        name: "Backend",
        items: ["ExpressJS", "REST API", "PostgreSQL", "MySQL", "Python"],
      },
      {
        name: "DevOps & Cloud",
        items: ["AWS", "Docker", "CI/CD", "GitHub Actions", "Jenkins"],
      },
      {
        name: "Methods & More",
        items: ["Scrum / SAFe", "Release Management", "Security", "Testing (E2E, Unit)"],
      },
    ],
  },
  contact: {
    title: "Contact Me",
    description: "I'm open to new opportunities and collaborations. Send me a message.",
    methods: [
      {
        type: "Email",
        value: "preel.tommy@gmail.com",
        link: "mailto:preel.tommy@gmail.com",
      },
      {
        type: "GitHub",
        value: "github.com/tommypreel",
        link: "https://github.com/tommypreel",
      },
      {
        type: "CV",
        value: "tommy-tech.fr/cv",
        link: "https://tommy-tech.fr/cv",
      },
    ],
  },
  navigation: {
    about: "ABOUT",
    projects: "PROJECTS",
    skills: "SKILLS",
    contact: "CONTACT",
    back: "Back",
    language: "Language",
    pressEnter: "PRESS ENTER",
  },
  ui: {
    intro: {
      title: "Drive through my work",
      description:
        "Drive around my night island. The garage is about me, the arcade and hangar hold my projects, the light blocks are my skills, and the radar is how to reach me.",
      controlsTitle: "Controls",
      controls: [
        { key: "WASD / ZQSD", action: "Drive the car" },
        { key: "Shift", action: "Boost" },
        { key: "Enter", action: "Open the zone you are standing in" },
        { key: "Esc", action: "Menu, settings and map" },
      ],
      startButton: "Start driving",
      expressButton: "Classic version",
    },
    contentPanel: {
      keyHighlights: "Key highlights",
      learnMore: "Visit project",
      roleLabel: "Role",
      stackLabel: "Stack",
      screenshotAlt: "Screenshot of {name}",
      cvAction: "Open CV",
    },
    settings: {
      title: "Settings",
      languageLabel: "Language",
      close: "Close",
      soundLabel: "Sound",
      soundOn: "Sound on",
      soundOff: "Sound off",
      qualityLabel: "Graphics quality",
      qualityAuto: "Auto",
      qualityHigh: "High",
      qualityLow: "Low",
      qualityHint: "Low turns off bloom and lowers resolution to run smoother on phones.",
      volumeLabel: "Volume",
      volumeChannels: { master: "Overall", music: "Music", effects: "Effects", ambience: "Ambience", ui: "Interface" },
      openSettings: "Open settings",
      expressLink: "Classic version",
      expressLinkShort: "Classic",
    },
    express: {
      title: "Classic version",
      tagline: "The whole portfolio on one plain page, no 3D needed.",
      skipLink: "Skip to content",
      navLabel: "Sections",
      languageLabel: "Language",
      backTo3D: "Back to the 3D island",
      footer: "Built by Tommy PREEL",
      soundCredits: "Sounds: Kenney, Juhani Junkala, MintoDog (CC0) · Jet take-off by dklon (CC-BY 3.0)",
    },
    loading: {
      title: "Loading the island",
      hint: "Preparing the 3D scene",
      ready: "Ready",
      timedOut: "3D is taking long to load. The classic version has everything, right now.",
    },
    prompt: {
      open: "Open",
      tapToOpen: "Tap to open",
      enterKey: "Enter",
    },
    mobile: {
      joystick: "Driving joystick",
      boost: "Boost",
    },
    hud: {
      map: "Map",
    },
    escapeMenu: {
      menuTitle: "Menu",
      tabHome: "Home",
      tabControls: "Controls",
      tabSettings: "Settings",
      tabMap: "Map",
      controlOr: "or",
      mapYourPosition: "Your position",
      mapTeleportHint: "Select a zone to teleport",
      controls: [
        { keys: "WASD / ZQSD", action: "Move around" },
        { keys: "SHIFT", action: "Boost" },
        { keys: "ENTER", action: "Interact with zone" },
        { keys: "ESCAPE", action: "Open / close menu" },
        { keys: "M", action: "Open the map" },
      ],
    },
    hwAccelWarning: {
      title: "Enable hardware acceleration",
      description:
        "This site renders in 3D with WebGL. If hardware acceleration is off in your browser, it may lag.",
      chrome: "Chrome / Edge: Settings > System > Use hardware acceleration when available",
      firefox: "Firefox: about:config > layers.acceleration.force-enabled > true",
      edge: "Then restart your browser and reload the page.",
      dismissButton: "Got it, continue",
    },
  },
};

// =====================================================
// FRENCH CONTENT
// =====================================================

const FR: Content = {
  profile: {
    name: "Tommy PREEL",
    headline: "Développeur FullStack, Toulouse",
  },
  about: {
    title: "À Propos",
    description:
      "Salut, moi c'est Tommy, développeur full stack à Toulouse. Je fais du TypeScript tous les jours : Angular et React côté front, ExpressJS et AWS côté back. La sécurité et la performance comptent pour moi, et j'aime que ce que je fais soit agréable à utiliser. Je travaille chez Airbus via Alten SO, où je travaille depuis plus de 4 ans sur des applications industrielles.",
    highlights: [
      "4+ ans chez Airbus (dont 3 ans en alternance)",
      "TypeScript / Angular / React",
      "AWS & Infrastructure Cloud",
      "CI/CD, Docker & Self-Hosting",
    ],
    cvLabel: "Voir mon CV",
    cvLink: "https://tommy-tech.fr/cv",
  },
  projects: {
    title: "Projets",
    description: "Des projets pro et perso. Les bornes d'arcade, ce sont mes jeux web.",
    items: [
      {
        id: "airbus",
        name: "Applications Industrielles Airbus",
        role: "Développeur, alternance puis salarié",
        description:
          "Deux applications Angular développées chez Airbus : un outil de back office qui affiche les pièces d'avion sous forme d'arbre de données, et un outil qui détecte les substances dangereuses dans ces pièces. Je soigne particulièrement les tests, la sécurité et la qualité du code.",
        technologies: ["Angular", "TypeScript", "AWS", "CI/CD"],
        link: "",
      },
      {
        id: "manga-sensei",
        name: "MangaSensei",
        role: "Projet perso, full stack",
        description:
          "Collectionnez des cartes de personnages de manga, échangez-les avec d'autres joueurs et battez-vous avec. Le classement transforme chaque collection en petite compétition.",
        technologies: ["React", "PostgreSQL", "Vitest", "Playwright"],
        link: "https://manga-sensei.tommy-tech.fr",
      },
      {
        id: "minigames",
        name: "MiniGames",
        role: "Projet perso, full stack",
        description:
          "7 jeux de soirée dans une seule appli, dont Undercover, Fake Artist et Wavelength. On y joue dans la même pièce ou chacun chez soi.",
        technologies: ["HTML", "JavaScript", "Node.js", "WebSocket", "PWA"],
        link: "https://minigames.tommy-tech.fr",
      },
      {
        id: "pvpedia",
        name: "PvPedia",
        role: "Projet perso, full stack",
        description:
          "Un article Wikipédia est caché et tout le monde court après son titre. Devinez des mots pour révéler le texte, et trouvez le titre avant les autres.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://pvpedia.tommy-tech.fr",
      },
      {
        id: "blitzquiz",
        name: "BlitzQuiz",
        role: "Projet perso, full stack",
        description:
          "Écrivez votre propre quiz, partagez un code de salle, et chacun répond depuis son téléphone ou son ordi.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://blitzquiz.tommy-tech.fr",
      },
      {
        id: "blindtest",
        name: "Blindtest",
        role: "Projet perso, full stack",
        description:
          "Un blindtest où il faut retrouver chaque morceau avant les autres. Ouvrez une salle, partagez le code et voyez qui s'y connaît vraiment en musique.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://blindtest.tommy-tech.fr",
      },
      {
        id: "scrum-poker",
        name: "Scrum Poker",
        role: "Projet perso, full stack",
        description:
          "Du planning poker pour les équipes agiles. Ouvrez une salle, invitez l'équipe et votez ensemble sur les story points. Pratique pour un sprint planning à distance.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://scrum-poker.tommy-tech.fr",
      },
      {
        id: "reflex-game",
        name: "Reflex Game",
        role: "Projet perso, full stack",
        description:
          "Un point apparaît à l'écran et tout le monde se rue dessus pour cliquer en premier. Simple, et très bien pour savoir qui a les meilleurs réflexes.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://reflex-game.tommy-tech.fr",
      },
      {
        id: "self-hosted-server",
        name: "Serveur Auto-Hébergé",
        role: "Infrastructure personnelle",
        description:
          "J'ai transformé un vieux PC en serveur Ubuntu qui héberge mes projets perso et des serveurs de jeux. SSH, Docker, réseau, sécurisation : j'ai tout monté moi-même.",
        technologies: ["Linux", "Docker", "Réseau", "CI/CD"],
        link: "",
      },
      {
        id: "portfolio",
        name: "Portfolio 3D",
        role: "Design, 3D et développement",
        description:
          "Ce site, fait avec React, Three.js et TypeScript. On conduit une petite voiture sur l'île pour visiter chaque section.",
        technologies: ["React", "Three.js", "TypeScript", "Vite"],
        link: "#",
      },
    ],
  },
  skills: {
    title: "Compétences & Expertise",
    description: "Ce que j'utilise au quotidien. Renversez un bloc si ça vous tente.",
    categories: [
      {
        name: "Frontend",
        items: ["Angular", "React", "TypeScript", "HTML / CSS", "Figma"],
      },
      {
        name: "Backend",
        items: ["ExpressJS", "API REST", "PostgreSQL", "MySQL", "Python"],
      },
      {
        name: "DevOps & Cloud",
        items: ["AWS", "Docker", "CI/CD", "GitHub Actions", "Jenkins"],
      },
      {
        name: "Méthodes & Autres",
        items: ["Scrum / SAFe", "Gestion de Release", "Sécurité", "Tests (E2E, Unitaires)"],
      },
    ],
  },
  contact: {
    title: "Me Contacter",
    description: "Je suis ouvert aux nouvelles opportunités et collaborations. Écrivez-moi.",
    methods: [
      {
        type: "Email",
        value: "preel.tommy@gmail.com",
        link: "mailto:preel.tommy@gmail.com",
      },
      {
        type: "GitHub",
        value: "github.com/tommypreel",
        link: "https://github.com/tommypreel",
      },
      {
        type: "CV",
        value: "tommy-tech.fr/cv",
        link: "https://tommy-tech.fr/cv",
      },
    ],
  },
  navigation: {
    about: "À PROPOS",
    projects: "PROJETS",
    skills: "COMPÉTENCES",
    contact: "CONTACT",
    back: "Retour",
    language: "Langue",
    pressEnter: "APPUYEZ SUR ENTRER",
  },
  ui: {
    intro: {
      title: "Visitez mon île en voiture",
      description:
        "Roulez sur mon île de nuit. Le garage parle de moi, la salle d'arcade et le hangar abritent mes projets, les blocs lumineux sont mes compétences, et le radar vous donne mes contacts.",
      controlsTitle: "Commandes",
      controls: [
        { key: "ZQSD / WASD", action: "Conduire la voiture" },
        { key: "Maj", action: "Boost" },
        { key: "Entrée", action: "Ouvrir la zone où vous êtes" },
        { key: "Échap", action: "Menu, paramètres et carte" },
      ],
      startButton: "Démarrer",
      expressButton: "Version classique",
    },
    contentPanel: {
      keyHighlights: "Points clés",
      learnMore: "Voir le projet",
      roleLabel: "Rôle",
      stackLabel: "Stack",
      screenshotAlt: "Capture d'écran de {name}",
      cvAction: "Ouvrir le CV",
    },
    settings: {
      title: "Paramètres",
      languageLabel: "Langue",
      close: "Fermer",
      soundLabel: "Son",
      soundOn: "Son activé",
      soundOff: "Son coupé",
      qualityLabel: "Qualité graphique",
      qualityAuto: "Auto",
      qualityHigh: "Élevée",
      qualityLow: "Basse",
      qualityHint: "Basse désactive l'effet de lueur et réduit la résolution pour fluidifier sur mobile.",
      volumeLabel: "Volume",
      volumeChannels: { master: "Général", music: "Musique", effects: "Effets", ambience: "Ambiances", ui: "Interface" },
      openSettings: "Ouvrir les paramètres",
      expressLink: "Version classique",
      expressLinkShort: "Classique",
    },
    express: {
      title: "Version classique",
      tagline: "Tout le portfolio sur une page simple, sans 3D.",
      skipLink: "Aller au contenu",
      navLabel: "Sections",
      languageLabel: "Langue",
      backTo3D: "Retour à l'île 3D",
      footer: "Réalisé par Tommy PREEL",
      soundCredits: "Sons : Kenney, Juhani Junkala, MintoDog (CC0) · Décollage de jet par dklon (CC-BY 3.0)",
    },
    loading: {
      title: "Chargement de l'île",
      hint: "Préparation de la scène 3D",
      ready: "Prêt",
      timedOut: "La 3D met du temps à charger. La version classique contient tout, tout de suite.",
    },
    prompt: {
      open: "Ouvrir",
      tapToOpen: "Touchez pour ouvrir",
      enterKey: "Entrée",
    },
    mobile: {
      joystick: "Joystick de conduite",
      boost: "Boost",
    },
    hud: {
      map: "Carte",
    },
    escapeMenu: {
      menuTitle: "Menu",
      tabHome: "Accueil",
      tabControls: "Contrôles",
      tabSettings: "Paramètres",
      tabMap: "Carte",
      controlOr: "ou",
      mapYourPosition: "Votre position",
      mapTeleportHint: "Choisissez une zone pour vous téléporter",
      controls: [
        { keys: "WASD / ZQSD", action: "Se déplacer" },
        { keys: "SHIFT", action: "Boost" },
        { keys: "ENTRÉE", action: "Interagir avec une zone" },
        { keys: "ÉCHAP", action: "Ouvrir / fermer le menu" },
        { keys: "M", action: "Ouvrir la carte" },
      ],
    },
    hwAccelWarning: {
      title: "Activer l'accélération matérielle",
      description:
        "Ce site affiche la 3D avec WebGL. Si l'accélération matérielle est désactivée dans votre navigateur, ça peut ramer.",
      chrome: "Chrome / Edge : Paramètres > Système > Utiliser l'accélération matérielle si disponible",
      firefox: "Firefox : about:config > layers.acceleration.force-enabled > true",
      edge: "Redémarrez ensuite votre navigateur et rechargez la page.",
      dismissButton: "Compris, continuer",
    },
  },
};

// =====================================================
// LANGUAGE SELECTOR
// =====================================================

export const getContent = (language: Language): Content => {
  return language === "fr" ? FR : EN;
};

export const allLanguages: Array<{ code: Language; name: string }> = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
];
