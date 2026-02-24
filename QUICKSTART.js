// =====================================================
// QUICK START GUIDE
// Customize your portfolio in 5 minutes
// =====================================================

/* ====================================================
   STEP 1: PERSONALIZE YOUR CONTENT
   File: src/i18n.ts
   ==================================================== */

// Find the EN object and update these sections:

const EN = {
  about: {
    title: "About Me", // Keep or change
    description:
      "Replace THIS TEXT with your professional summary. Highlight your experience, passion for development, and key achievements.",
    highlights: [
      "Replace these highlights", // 4 key points about you
      "with your own expertise",
      "Add your specialties here",
      "What makes you unique?",
    ],
  },
  projects: {
    title: "Projects", // Keep or change
    description: "Your introduction to your project showcase.",
    items: [
      {
        name: "Your Project Name", // Change to your first project
        description:
          "Describe what your project does, what problem it solves, and why you're proud of it.",
        technologies: ["Tech1", "Tech2", "Tech3"], // Technologies you used
        link: "https://your-project-link.com", // Link to your project
      },
      // Add more projects by copying the object above
    ],
  },
  skills: {
    title: "Skills & Expertise",
    description: "A showcase of your technical skills.",
    categories: [
      {
        name: "Frontend",
        items: ["React", "TypeScript", "Tailwind CSS", "Three.js", "Next.js"], // Your skills
      },
      {
        name: "Backend",
        items: ["Node.js", "Express", "PostgreSQL", "MongoDB"], // Your skills
      },
      // Add more categories or update existing ones
    ],
  },
  contact: {
    title: "Contact Me",
    description: "The best way to reach me for opportunities.",
    methods: [
      {
        type: "Email",
        value: "your.email@example.com", // Your email
        link: "mailto:your.email@example.com",
      },
      {
        type: "LinkedIn",
        value: "linkedin.com/in/yourprofile", // Your LinkedIn
        link: "https://linkedin.com/in/yourprofile",
      },
      {
        type: "GitHub",
        value: "github.com/yourprofile", // Your GitHub
        link: "https://github.com/yourprofile",
      },
      {
        type: "Twitter",
        value: "@yourhandle", // Your Twitter (optional)
        link: "https://twitter.com/yourhandle",
      },
    ],
  },
};

/* ====================================================
   STEP 2: TRANSLATE TO FRENCH (Optional)
   Update the FR object with French translations
   ==================================================== */

const FR = {
  about: {
    title: "À Propos",
    description: "Replace with French translation...",
    // ... rest of French content
  },
};

/* ====================================================
   STEP 3: CUSTOMIZE COLORS
   File: src/App.css
   ==================================================== */

// Find the :root section and customize these colors:

/*
:root {
  --primary-color: #6366f1;      // Main color (indigo) - change to your brand
  --secondary-color: #ec4899;    // Secondary color (pink)
  --accent-color: #fbbf24;       // Highlight color (amber)
  --text-primary: #f1f5f9;       // Main text
  --text-secondary: #cbd5e1;     // Secondary text
  --border-color: #334155;       // Borders
  --background-dark: #0f172a;    // Dark background
  --surface-dark: #1e293b;       // Surface color
}
*/

// Example: Change to a blue/orange theme:
/*
--primary-color: #3b82f6;        // Blue
--secondary-color: #f97316;      // Orange
--accent-color: #06b6d4;         // Cyan
*/

/* ====================================================
   STEP 4: ADJUST WORLD ZONES
   File: src/App.tsx - World component
   ==================================================== */

// Find the <Zone /> components and adjust their positions:
// position={[x, y, z]} - x: left/right, y: up/down, z: forward/backward

/*
<Zone
  position={[5, 0.25, -5]}    // Adjust these numbers
  label="ABOUT"
  onEnter={() => onZoneEnter("about")}
/>
*/

// Move zones closer or further apart by changing the numbers
// Keep y=0.25 for floor level

/* ====================================================
   STEP 5: ADD YOUR LOGO/FAVICON
   File: public/favicon.ico
   ==================================================== */

// Replace the default favicon with your own:
// 1. Create a 32x32 or 64x64 pixel PNG/ICO image
// 2. Save it as public/favicon.ico
// 3. The browser will automatically pick it up

/* ====================================================
   STEP 6: UPDATE SITE METADATA
   File: index.html
   ==================================================== */

/*
<title>Your Name - Full Stack Developer</title>
<meta name="description" content="Your professional description">
<meta name="keywords" content="your, keywords, here">
<meta name="author" content="Your Name">
*/

/* ====================================================
   DEPLOYMENT
   ==================================================== */

// Build for production:
// npm run build

// This creates a 'dist' folder ready to deploy to:
// - Vercel (recommended for Next.js/React)
// - Netlify
// - GitHub Pages
// - Any static hosting

// Deploy on Vercel (easiest):
// 1. Push your code to GitHub
// 2. Go to vercel.com
// 3. Import your repository
// 4. Deploy (automatic!)

/* ====================================================
   TIPS & TRICKS
   ==================================================== */

// 🎨 Color Palette Generator:
// https://coolors.co/ - Create beautiful color schemes

// 🔗 Hosting & Domain:
// - Vercel: Free hosting + custom domain
// - Namecheap/Google Domains: Affordable domains

// 📸 Project Screenshots:
// Use tools like Figma, Screenshots.pro, or MacBook screenshots

// ✨ Make it shine:
// - Add subtle animations (CSS transitions already included)
// - Use high-quality project images
// - Write clear, concise descriptions
// - Keep contact links up to date

// 🚀 Monitor Performance:
// - Google PageSpeed Insights
// - WebPageTest.org
// - Lighthouse (built into Chrome DevTools)

/* ====================================================
   SUPPORT & RESOURCES
   ==================================================== */

// Documentation:
// - React: https://react.dev
// - Three.js: https://threejs.org/docs
// - TypeScript: https://www.typescriptlang.org/docs

// Icons & Assets:
// - Icons: https://heroicons.com/ or https://fontawesome.com/
// - Colors: https://tailwindcss.com/docs/customizing-colors

// Need Help?
// - GitHub Issues: Report bugs
// - Stack Overflow: Ask questions
// - Discord Communities: Get support

console.log(
  "🚀 Your portfolio is ready! Customize the i18n.ts file to add your content."
);
