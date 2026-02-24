# 🚗 3D Interactive Portfolio

Un portfolio web innovant et interactif où vous navigez à travers une vue isométrique 3D contrôlant une petite voiture. Conçu pour les développeurs web Full Stack cherchant à impressionner les recruteurs et clients.

## 🎯 Features

- **3D Isometric Navigation**: Vue isométrique verrouillée pour une expérience visuelle unique
- **Interactive Car Control**: Contrôlez une voiture avec WASD/ZQSD pour explorer les zones
- **Multi-language Support**: Contenu en anglais ET français avec changement de langue instantané
- **Responsive Design**: Adapté pour desktop (mobile à venir)
- **Modern Tech Stack**: React + Three.js + TypeScript pour une performance optimale
- **Dark Theme UI**: Interface élégante avec palette de couleurs modernes

## 🛠️ Tech Stack

- **Frontend Framework**: React 18+
- **3D Graphics**: Three.js + @react-three/fiber
- **3D Utilities**: @react-three/drei
- **Language**: TypeScript
- **Styling**: CSS3 with CSS Variables
- **Build Tool**: Vite

## 📋 Structure du Projet

```
src/
├── App.tsx                 # Application principale avec gestion d'état
├── App.css                 # Styles de l'application
├── i18n.ts                 # Système de langue (EN/FR)
├── components/
│   └── ContentPanel.tsx    # Panneau de contenu pour les sections
├── index.css               # Styles globaux
└── main.tsx                # Point d'entrée
```

## 🎮 Contrôles

### Navigation
- **W / Z**: Avancer
- **S**: Reculer
- **A / Q**: Aller à gauche
- **D**: Aller à droite
- **Cliquer sur une zone**: Ouvrir la section correspondante
- **Bouton "Back" ou ✕**: Fermer le panneau

### Interface
- **Bouton "EN/FR"** (coin supérieur droit): Changer la langue

## 📝 Sections du Portfolio

### About (À Propos)
- Description personnelle
- Points forts et spécialités
- Objectifs professionnels

### Projects (Projets)
- Liste des projets réalisés
- Technologies utilisées
- Liens vers les démos/repositories

### Skills (Compétences)
- Compétences Frontend
- Compétences Backend
- Outils & DevOps
- Soft Skills

### Contact (Contact)
- Email
- LinkedIn
- GitHub
- Twitter/Social Media

## 🔧 Configuration Initiale

### Personnalisation du Contenu

Modifiez le fichier `src/i18n.ts`:

```typescript
const EN: Content = {
  about: {
    title: "About Me",
    description: "Votre description...",
    highlights: ["Point 1", "Point 2", ...],
  },
  // ...autres sections
}
```

### Changement de Couleurs

Les couleurs sont définies dans `App.css` avec des variables CSS:

```css
:root {
  --primary-color: #6366f1;      /* Indigo */
  --secondary-color: #ec4899;    /* Rose */
  --accent-color: #fbbf24;       /* Ambre */
  /* ... autres couleurs */
}
```

## 🚀 Installation & Lancement

### Prérequis
- Node.js 16+
- npm ou yarn

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application s'ouvrira sur `http://localhost:5173`

### Build Production

```bash
npm run build
```

### Preview Production

```bash
npm run preview
```

## 📱 Responsive Design

L'application est actuellement optimisée pour **desktop**. Les améliorations mobiles incluront:
- Contrôles tactiles
- Interface adaptée aux petits écrans
- Optimisation des zones cliquables

## 🎨 Personnalisation Avancée

### Ajouter une Nouvelle Langue

1. Créez une nouvelle variable dans `i18n.ts`:
```typescript
const ES: Content = {
  // Contenu en espagnol
}
```

2. Ajoutez à `allLanguages`:
```typescript
export const allLanguages: Array<{ code: Language; name: string }> = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
]
```

### Modifier le Modèle 3D

Les zones et la voiture sont définies dans `App.tsx`. Vous pouvez:
- Ajuster les positions avec `position={[x, y, z]}`
- Changer les couleurs avec `color="#hexcode"`
- Ajouter plus de zones avec le composant `<Zone />`

## 🔮 Améliorations Futures

- [ ] Animations de caméra lors du passage à une section (GSAP)
- [ ] Support mobile avec contrôles tactiles
- [ ] Sauvegarde de la langue préférée (localStorage)
- [ ] Animations de la voiture (rotation, accélération)
- [ ] Particules/Effets visuels additionnels
- [ ] Performance optimization (lazy loading)
- [ ] Intégration avec CMS pour le contenu dynamique

## 📞 Support & Contact

Pour toute question ou suggestion, contactez via les liens dans la section "Contact" du portfolio.

## 📄 License

MIT License - Libre d'utilisation pour projets personnels et commerciaux.

---

**Créé avec ❤️ pour les développeurs Full Stack ambitieux**
