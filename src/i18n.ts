// =====================================================
// INTERNATIONALIZATION (i18n)
// Multi-language support for portfolio content
// Supported languages: English (en), French (fr)
// =====================================================

export type Language = "en" | "fr";

export interface Content {
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
      name: string;
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
      controls: string[];
      startButton: string;
    };
    contentPanel: {
      keyHighlights: string;
      learnMore: string;
    };
    settings: {
      title: string;
      languageLabel: string;
      close: string;
    };
    escapeMenu: {
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
  };
}

// =====================================================
// ENGLISH CONTENT
// =====================================================

const EN: Content = {
  about: {
    title: "About Me",
    description:
      "Hey! I'm Tommy, a FullStack Developer based in Toulouse, France. I've been working with TypeScript for years, building Angular and React apps on the frontend and using ExpressJS and AWS on the backend. I care a lot about security, performance, and making things that actually feel good to use. Currently working at Airbus through Alten SO, where I've spent 4+ years on real-world industrial applications.",
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
    description: "A mix of professional and personal projects that reflect what I like to build.",
    items: [
      {
        name: "Airbus Industrial Apps",
        description:
          "Two applications built during my time at Airbus: a visualizer for aircraft parts displayed as a data tree (back office), and a tool for detecting hazardous substances in aircraft parts. Angular-based, with strong focus on testing, security, and code quality.",
        technologies: ["Angular", "TypeScript", "AWS", "CI/CD"],
        link: "",
      },
      {
        name: "MiniGames",
        description:
          "7 party games in one place — play Undercover, Fake Artist, Wavelength and more with friends, whether you're in the same room or miles apart.",
        technologies: ["HTML", "JavaScript", "Node.js", "WebSocket", "PWA"],
        link: "https://minigames.tommy-tech.fr",
      },
      {
        name: "PvPedia",
        description:
          "Race against other players to uncover a hidden Wikipedia article. Guess words to reveal the text and be the first to name the title.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://pvpedia.tommy-tech.fr",
      },
      {
        name: "Kahoot",
        description:
          "Host and play live quizzes with friends. Build your quiz, share a room code, and let everyone compete on their own device in real time.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://kahoot.tommy-tech.fr",
      },
      {
        name: "Self-Hosted Server",
        description:
          "Recycled an old PC into a self-hosted Ubuntu server to host personal projects and game servers. Set up SSH, Docker, networking, and security hardening from scratch.",
        technologies: ["Linux", "Docker", "Networking", "CI/CD"],
        link: "",
      },
      {
        name: "3D Portfolio",
        description:
          "This website! An interactive 3D portfolio built with React, Three.js, and TypeScript. Drive a car around and explore different sections of my profile.",
        technologies: ["React", "Three.js", "TypeScript", "Vite"],
        link: "#",
      },
    ],
  },
  skills: {
    title: "Skills & Expertise",
    description: "The tools and technologies I work with on a daily basis.",
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
    description: "Feel free to reach out, I'm always open to new opportunities and collaborations.",
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
      title: "Welcome! 🚀",
      description:
        "Welcome to my interactive 3D portfolio! Explore my Full Stack developer universe through an immersive experience.",
      controlsTitle: "🎮 How to navigate?",
      controls: [
        "<strong>ZQSD / WASD</strong>: Drive the car",
        "<strong>Shift</strong>: Activate boost 🔥",
        "<strong>Enter</strong>: Open a zone (About, Projects, Skills, Contact)",
        "Drive to the illuminated zones to discover my journey!",
      ],
      startButton: "Let's go! 🎮",
    },
    contentPanel: {
      keyHighlights: "Key Highlights:",
      learnMore: "Learn More →",
    },
    settings: {
      title: "Settings",
      languageLabel: "Language",
      close: "Close",
    },
    escapeMenu: {
      tabHome: "Home",
      tabControls: "Controls",
      tabSettings: "Settings",
      tabMap: "Map",
      controlOr: "or",
      mapYourPosition: "Your position",
      mapTeleportHint: "Click a zone to teleport",
      controls: [
        { keys: "WASD / ZQSD", action: "Move around" },
        { keys: "SHIFT", action: "Boost" },
        { keys: "ENTER", action: "Interact with zone" },
        { keys: "ESCAPE", action: "Open / close menu" },
        { keys: "M", action: "Open the map" },
      ],
    },
  },
};

// =====================================================
// FRENCH CONTENT
// =====================================================

const FR: Content = {
  about: {
    title: "À Propos",
    description:
      "Salut ! Moi c'est Tommy, développeur FullStack basé à Toulouse. Je travaille avec TypeScript au quotidien, côté front en Angular et React, et côté back avec ExpressJS et AWS. J'accorde beaucoup d'importance à la sécurité, la performance, et surtout à l'expérience utilisateur. Actuellement en poste chez Airbus via Alten SO, où j'ai passé plus de 4 ans sur des applications industrielles concrètes.",
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
    description: "Un mélange de projets professionnels et personnels qui reflètent ce que j'aime construire.",
    items: [
      {
        name: "Applications Industrielles Airbus",
        description:
          "Deux applications développées chez Airbus : un visualiseur de pièces d'avion sous forme d'arbre de données (back office), et un outil de détection de substances dangereuses. Basées sur Angular, avec un fort accent sur les tests, la sécurité et la qualité du code.",
        technologies: ["Angular", "TypeScript", "AWS", "CI/CD"],
        link: "",
      },
      {
        name: "MiniGames",
        description:
          "7 jeux de soirée en un seul endroit — jouez à Undercover, Fake Artist, Wavelength et plus encore avec vos amis, dans la même pièce ou à distance.",
        technologies: ["HTML", "JavaScript", "Node.js", "WebSocket", "PWA"],
        link: "https://minigames.tommy-tech.fr",
      },
      {
        name: "PvPedia",
        description:
          "Course contre d'autres joueurs pour découvrir un article Wikipédia caché. Devinez des mots pour révéler le texte et soyez le premier à trouver le titre.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://pvpedia.tommy-tech.fr",
      },
      {
        name: "Kahoot",
        description:
          "Créez et jouez des quiz en direct avec vos amis. Construisez votre quiz, partagez un code de salle, et laissez tout le monde s'affronter sur son propre appareil en temps réel.",
        technologies: ["React", "TypeScript", "Socket.IO", "Node.js"],
        link: "https://kahoot.tommy-tech.fr",
      },
      {
        name: "Serveur Auto-Hébergé",
        description:
          "J'ai recyclé un vieux PC en serveur Ubuntu pour héberger mes projets perso et des serveurs de jeux. Configuration SSH, Docker, réseau et sécurisation from scratch.",
        technologies: ["Linux", "Docker", "Réseau", "CI/CD"],
        link: "",
      },
      {
        name: "Portfolio 3D",
        description:
          "Ce site ! Un portfolio interactif en 3D construit avec React, Three.js et TypeScript. Conduisez une voiture et explorez les différentes sections de mon profil.",
        technologies: ["React", "Three.js", "TypeScript", "Vite"],
        link: "#",
      },
    ],
  },
  skills: {
    title: "Compétences & Expertise",
    description: "Les outils et technologies que j'utilise au quotidien.",
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
    description: "N'hésitez pas à me contacter, je suis toujours ouvert aux nouvelles opportunités et collaborations.",
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
      title: "Bienvenue ! 🚀",
      description:
        "Bienvenue sur mon portfolio interactif en 3D ! Explorez mon univers de développeur Full Stack à travers une expérience immersive.",
      controlsTitle: "🎮 Comment naviguer ?",
      controls: [
        "<strong>ZQSD / WASD</strong> : Conduire la voiture",
        "<strong>Shift</strong> : Activer le boost 🔥",
        "<strong>Enter</strong> : Ouvrir une zone (About, Projects, Skills, Contact)",
        "Conduisez jusqu'aux zones illuminées pour découvrir mon parcours !",
      ],
      startButton: "C'est parti ! 🎮",
    },
    contentPanel: {
      keyHighlights: "Points Clés :",
      learnMore: "En savoir plus →",
    },
    settings: {
      title: "Paramètres",
      languageLabel: "Langue",
      close: "Fermer",
    },
    escapeMenu: {
      tabHome: "Accueil",
      tabControls: "Contrôles",
      tabSettings: "Paramètres",
      tabMap: "Carte",
      controlOr: "ou",
      mapYourPosition: "Votre position",
      mapTeleportHint: "Cliquez sur une zone pour vous téléporter",
      controls: [
        { keys: "WASD / ZQSD", action: "Se déplacer" },
        { keys: "SHIFT", action: "Boost" },
        { keys: "ENTRÉE", action: "Interagir avec une zone" },
        { keys: "ÉCHAP", action: "Ouvrir / fermer le menu" },
        { keys: "M", action: "Ouvrir la carte" },
      ],
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
