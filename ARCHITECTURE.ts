/**
 * @fileoverview Component Architecture & Documentation
 * Overview of all components and their responsibilities
 * 
 * UPDATED: January 2026 - Full modular restructure
 */

/* ====================================================
   PROJECT STRUCTURE
   ==================================================== */

/*
src/
├── App.tsx                           // Main application - minimal orchestration
├── App.css                           // Global styles with CSS Variables
├── i18n.ts                           // Internationalization (en/fr)
├── main.tsx                          // React entry point
│
├── types/
│   └── index.ts                      // Shared TypeScript interfaces
│       ├── CarProps                  // Car component props
│       ├── ZoneProps                 // Zone component props
│       ├── WorldProps                // World component props
│       ├── ThreeDUIProps             // 3D UI props
│       ├── MinimapProps              // Minimap props
│       ├── IntroModalProps           // Intro modal props
│       └── PortfolioTitleProps       // Title props
│
├── config/
│   └── index.ts                      // Configuration constants
│       ├── CONFIG                    // World, grass, car, zone, camera settings
│       ├── ZONES                     // Zone positions and labels
│       └── ZoneId                    // Type for zone IDs
│
├── hooks/
│   └── useKeyboardControls.ts        // Keyboard input handling
│       ├── useKeyboardControls()     // WASD/ZQSD car controls
│       └── useEnterKey()             // Enter key for zone interaction
│
├── components/
│   ├── 3d/                           // Three.js/R3F components
│   │   ├── index.ts                  // Barrel export
│   │   ├── AnimatedGrass.tsx         // Instanced grass with wind
│   │   ├── Car.tsx                   // Player vehicle with physics
│   │   ├── Zone.tsx                  // Billboard + ground zone
│   │   ├── ThreeDUI.tsx              // In-world UI elements
│   │   └── World.tsx                 // Main 3D environment
│   │
│   ├── ui/                           // HTML overlay components
│   │   ├── index.ts                  // Barrel export
│   │   ├── Minimap.tsx               // Position indicator
│   │   ├── Minimap.module.css        // Minimap styles
│   │   ├── IntroModal.tsx            // Welcome screen
│   │   ├── IntroModal.module.css     // Modal styles
│   │   ├── PortfolioTitle.tsx        // Header title
│   │   └── PortfolioTitle.module.css // Title styles
│   │
│   └── ContentPanel.tsx              // Section content modal
│
└── assets/                           // Images, icons (if needed)
*/

/* ====================================================
   COMPONENT HIERARCHY
   ==================================================== */

/*
App
├── PortfolioTitle            // Fixed header
├── Minimap                   // Position indicator
├── IntroModal                // Welcome screen (conditional)
├── Canvas                    // Three.js renderer
│   └── World                 // 3D environment
│       ├── Ground            // Grass plane
│       ├── AnimatedGrass     // Instanced grass blades
│       ├── Paths             // Brown dirt roads
│       ├── Zone (x4)         // Interactive areas
│       │   ├── Billboard     // Neon panel
│       │   └── GroundZone    // Activation area
│       ├── Car               // Player vehicle
│       └── ThreeDUI          // Language/Close buttons
├── Modal Backdrop            // Dark overlay (conditional)
└── ContentPanel              // Section content (conditional)
*/

/* ====================================================
   DATA FLOW
   ==================================================== */

/*
App (State Owner)
│
├─> carPosition ────────┬─> World (camera follow)
│                       ├─> Car (initial position)
│                       └─> Minimap (indicator)
│
├─> activeZone ─────────┬─> World (collision detection)
│                       └─> Minimap (highlight icon)
│
├─> activeSection ──────┬─> World (disable car)
│                       ├─> ThreeDUI (show close btn)
│                       └─> ContentPanel (show content)
│
├─> language ───────────┬─> World (ThreeDUI label)
│                       └─> ContentPanel (i18n content)
│
└─> showIntro ──────────┬─> IntroModal (visibility)
*/

/* ====================================================
   COMPONENT DESCRIPTIONS
   ==================================================== */

// ─────────────────────────────────────────────────────
// CONFIG (config/index.ts)
// ─────────────────────────────────────────────────────
/*
Centralized configuration for easy customization:

CONFIG.world     - World size, ground color
CONFIG.grass     - Count, size, spread, wind settings
CONFIG.car       - Acceleration, speed, friction, steering
CONFIG.zone      - Size, colors, collision dimensions
CONFIG.camera    - Position, follow distance, smoothing
CONFIG.colors    - Neon blue/yellow, dark tones, path brown

ZONES array      - Zone positions, labels, icons
*/

// ─────────────────────────────────────────────────────
// ANIMATED GRASS (components/3d/AnimatedGrass.tsx)
// ─────────────────────────────────────────────────────
/*
Optimized grass rendering with wind animation:

Features:
- InstancedMesh for 5000 grass blades (single draw call)
- Frame skipping (every other frame) for performance
- Object pooling (reusable Object3D)
- Coherent wind direction based on position
- Avoids paths and zone areas

Performance optimizations:
- Pre-computed positions, scales, rotations
- For loop instead of forEach
- Reusable dummy Object3D reference
*/

// ─────────────────────────────────────────────────────
// CAR (components/3d/Car.tsx)
// ─────────────────────────────────────────────────────
/*
Player vehicle with realistic physics:

Features:
- WASD/ZQSD controls (AZERTY support)
- Smooth acceleration and friction
- Steering based on movement direction
- Boost mode (Shift key) with visual flames
- Detailed 3D model (body, cabin, wheels, lights)

Physics:
- Forward/backward speed with max limits
- Steering only when moving
- Inverted steering when reversing
- World boundary clamping
*/

// ─────────────────────────────────────────────────────
// ZONE (components/3d/Zone.tsx)
// ─────────────────────────────────────────────────────
/*
Interactive area with billboard and ground zone:

Billboard:
- Support poles with bases
- Dark metal backing
- Neon frame (changes color when active)
- Icon and label text

Ground Zone:
- Parking spot style platform
- Neon border matching billboard
- "PRESS ENTER" text when active
- Click handler for mouse interaction
*/

// ─────────────────────────────────────────────────────
// WORLD (components/3d/World.tsx)
// ─────────────────────────────────────────────────────
/*
Main 3D environment orchestrator:

Contains:
- Ground plane (grass texture)
- AnimatedGrass component
- Path/road meshes (brown dirt)
- 4 Zone components
- Car component
- ThreeDUI component

Logic:
- AABB collision detection for zone activation
- Camera following with smooth interpolation
*/

// ─────────────────────────────────────────────────────
// HOOKS (hooks/useKeyboardControls.ts)
// ─────────────────────────────────────────────────────
/*
Keyboard input management:

useKeyboardControls():
- Sets up global key listeners
- Populates window.keys object
- Supports WASD and ZQSD layouts
- Cleans up on unmount

useEnterKey(activeZone, activeSection, callback):
- Handles Enter key for zone interaction
- Only fires when zone is active and no section open
*/

/* ====================================================
   STYLING ARCHITECTURE
   ==================================================== */

/*
App.css - Global styles:
- CSS Variables in :root
- App container and canvas
- Modal backdrop and wrapper

Component Module CSS:
- Minimap.module.css
- IntroModal.module.css
- PortfolioTitle.module.css

Benefits:
- Scoped styles prevent conflicts
- CSS Variables for theming
- Easy maintenance per component
*/

/* ====================================================
   EXTENDING THE PORTFOLIO
   ==================================================== */

/*
Add a New Section:
1. Add zone to ZONES array in config/index.ts
2. Add content to EN and FR objects in i18n.ts
3. Add case to ContentPanel switch statement
4. Add styling in App.css or create module CSS

Add New 3D Feature:
1. Create component in components/3d/
2. Export from components/3d/index.ts
3. Import and use in World.tsx

Add New UI Component:
1. Create component in components/ui/
2. Create matching .module.css file
3. Export from components/ui/index.ts
4. Import and use in App.tsx
*/

/* ====================================================
   PERFORMANCE TIPS
   ==================================================== */

/*
Current Optimizations:
- Grass count: 5000 (reduced from 15000)
- Frame skipping for grass animation
- Shadow map: 2048 (reduced from 4096)
- Object pooling for matrix updates

Further Optimization Options:
- Reduce grass count further if needed
- LOD (Level of Detail) for distant objects
- Frustum culling for off-screen elements
- Web Workers for heavy calculations
*/

console.log(
  "📚 Architecture documentation loaded. See comments for detailed structure."
);
