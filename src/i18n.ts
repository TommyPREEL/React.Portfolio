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
  };
}

// =====================================================
// ENGLISH CONTENT
// =====================================================

const EN: Content = {
  about: {
    title: "About Me",
    description:
      "Hello! I'm a passionate Full Stack Developer with expertise in creating modern, scalable web applications. With years of experience in both frontend and backend technologies, I strive to deliver exceptional user experiences combined with robust server-side solutions.",
    highlights: [
      "Full Stack Development",
      "React & TypeScript Specialist",
      "Cloud-Native Architecture",
      "Problem Solver & Team Player",
    ],
  },
  projects: {
    title: "Projects",
    description: "Here are some of my recent projects that showcase my skills and passion for development.",
    items: [
      {
        name: "3D Portfolio Website",
        description:
          "An innovative interactive 3D portfolio using React, Three.js, and modern web technologies. Users can navigate through different sections using an isometric car.",
        technologies: ["React", "Three.js", "TypeScript", "Tailwind CSS"],
        link: "#",
      },
      {
        name: "E-Commerce Platform",
        description:
          "Full-featured e-commerce application with payment integration, inventory management, and real-time notifications.",
        technologies: ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
        link: "#",
      },
      {
        name: "Real-Time Chat Application",
        description:
          "WebSocket-based chat application with real-time messaging, user presence, and file sharing capabilities.",
        technologies: ["React", "WebSocket", "Firebase", "Material-UI"],
        link: "#",
      },
    ],
  },
  skills: {
    title: "Skills & Expertise",
    description: "Technical skills and tools I've mastered throughout my career.",
    categories: [
      {
        name: "Frontend",
        items: ["React", "TypeScript", "Tailwind CSS", "Three.js", "Next.js", "Vue.js"],
      },
      {
        name: "Backend",
        items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST API", "GraphQL"],
      },
      {
        name: "Tools & DevOps",
        items: ["Git", "Docker", "CI/CD", "AWS", "Vercel", "GitHub Actions"],
      },
      {
        name: "Soft Skills",
        items: ["Team Leadership", "Problem Solving", "Communication", "Project Management"],
      },
    ],
  },
  contact: {
    title: "Contact Me",
    description: "Let's connect! Feel free to reach out for collaborations or opportunities.",
    methods: [
      {
        type: "Email",
        value: "hello@yourportfolio.com",
        link: "mailto:hello@yourportfolio.com",
      },
      {
        type: "LinkedIn",
        value: "linkedin.com/in/yourprofile",
        link: "https://linkedin.com/in/yourprofile",
      },
      {
        type: "GitHub",
        value: "github.com/yourprofile",
        link: "https://github.com/yourprofile",
      },
      {
        type: "Twitter",
        value: "@yourhandle",
        link: "https://twitter.com/yourhandle",
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
  },
};

// =====================================================
// FRENCH CONTENT
// =====================================================

const FR: Content = {
  about: {
    title: "À Propos",
    description:
      "Bonjour! Je suis un développeur Full Stack passionné, spécialisé dans la création d'applications web modernes et scalables. Avec plusieurs années d'expérience en technologies frontend et backend, je m'efforce de fournir des expériences utilisateur exceptionnelles combinées à des solutions serveur robustes.",
    highlights: [
      "Développement Full Stack",
      "Spécialiste React & TypeScript",
      "Architecture Cloud-Native",
      "Résolveur de Problèmes & Joueur d'Équipe",
    ],
  },
  projects: {
    title: "Projets",
    description: "Voici quelques-uns de mes projets récents qui mettent en avant mes compétences et ma passion pour le développement.",
    items: [
      {
        name: "Site Portfolio 3D",
        description:
          "Un portfolio interactif innovant en 3D utilisant React, Three.js et les technologies web modernes. Les utilisateurs peuvent naviguer à travers différentes sections en utilisant une voiture isométrique.",
        technologies: ["React", "Three.js", "TypeScript", "Tailwind CSS"],
        link: "#",
      },
      {
        name: "Plateforme E-Commerce",
        description:
          "Application e-commerce complète avec intégration des paiements, gestion des stocks et notifications en temps réel.",
        technologies: ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
        link: "#",
      },
      {
        name: "Application de Chat en Temps Réel",
        description:
          "Application de chat basée sur WebSocket avec messagerie en temps réel, présence utilisateur et partage de fichiers.",
        technologies: ["React", "WebSocket", "Firebase", "Material-UI"],
        link: "#",
      },
    ],
  },
  skills: {
    title: "Compétences & Expertise",
    description: "Compétences techniques et outils que j'ai maîtrisés tout au long de ma carrière.",
    categories: [
      {
        name: "Frontend",
        items: ["React", "TypeScript", "Tailwind CSS", "Three.js", "Next.js", "Vue.js"],
      },
      {
        name: "Backend",
        items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST API", "GraphQL"],
      },
      {
        name: "Outils & DevOps",
        items: ["Git", "Docker", "CI/CD", "AWS", "Vercel", "GitHub Actions"],
      },
      {
        name: "Soft Skills",
        items: ["Leadership d'Équipe", "Résolution de Problèmes", "Communication", "Gestion de Projet"],
      },
    ],
  },
  contact: {
    title: "Me Contacter",
    description: "Connectons-nous! N'hésitez pas à me contacter pour des collaborations ou des opportunités.",
    methods: [
      {
        type: "Email",
        value: "hello@yourportfolio.com",
        link: "mailto:hello@yourportfolio.com",
      },
      {
        type: "LinkedIn",
        value: "linkedin.com/in/votreprofil",
        link: "https://linkedin.com/in/yourprofile",
      },
      {
        type: "GitHub",
        value: "github.com/votreprofil",
        link: "https://github.com/yourprofile",
      },
      {
        type: "Twitter",
        value: "@votreidentifiant",
        link: "https://twitter.com/yourhandle",
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
