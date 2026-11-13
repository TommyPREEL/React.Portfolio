/**
 * @fileoverview Express version: the whole portfolio as a plain, accessible 2D page.
 * No WebGL, no canvas. Same tokens as the 3D overlays.
 */

import { useEffect } from "react";
import { allLanguages, type Content, type Language } from "../../i18n";
import { ArrowIcon, ExternalLinkIcon } from "./icons";
import { ProjectCard } from "./ProjectCard";
import styles from "./ExpressView.module.css";

export interface ExpressViewProps {
  content: Content;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onBackTo3D: () => void;
}

export function ExpressView({ content, language, onLanguageChange, onBackTo3D }: ExpressViewProps) {
  const { ui, navigation, profile } = content;

  // Keep <html lang> and the tab title in sync with the chosen language.
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = profile.name + " - " + ui.express.title;
  }, [language, profile.name, ui.express.title]);

  const sections = [
    { id: "about", label: navigation.about },
    { id: "projects", label: navigation.projects },
    { id: "skills", label: navigation.skills },
    { id: "contact", label: navigation.contact },
  ];

  return (
    <div className={styles.root} lang={language}>
      <a className={styles.skip} href="#express-main">
        {ui.express.skipLink}
      </a>

      <header className={styles.bar}>
        <div className={styles.barInner}>
          <nav className={styles.nav} aria-label={ui.express.navLabel}>
            <ul>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={"#express-" + s.id} className={styles.navLink}>{s.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.tools}>
            <div className={styles.segment} role="group" aria-label={ui.express.languageLabel}>
              {allLanguages.map(({ code, name }) => (
                <button
                  key={code}
                  type="button"
                  lang={code}
                  aria-label={name}
                  aria-pressed={language === code}
                  className={styles.segmentButton + (language === code ? " " + styles.segmentActive : "")}
                  onClick={() => onLanguageChange(code)}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <button type="button" className={styles.backButton} onClick={onBackTo3D}>
              {ui.express.backTo3D}
              <ArrowIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      <main id="express-main" className={styles.main} tabIndex={-1}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>{ui.express.title}</p>
          <h1 className={styles.name}>{profile.name}</h1>
          <p className={styles.headline}>{profile.headline}</p>
          <p className={styles.tagline}>{ui.express.tagline}</p>
        </div>

        <section id="express-about" className={styles.section} aria-labelledby="express-about-title">
          <h2 id="express-about-title" className={styles.h2}>{content.about.title}</h2>
          <p className={styles.lead}>{content.about.description}</p>
          <h3 className={styles.h3}>{ui.contentPanel.keyHighlights}</h3>
          <ul className={styles.highlights}>
            {content.about.highlights.map((h) => (
              <li key={h} className={styles.highlight + " cut cut-sm"}>{h}</li>
            ))}
          </ul>
          <a className={styles.primary} href={content.about.cvLink} target="_blank" rel="noopener noreferrer">
            {content.about.cvLabel}
            <ExternalLinkIcon size={18} />
          </a>
        </section>

        <section id="express-projects" className={styles.section} aria-labelledby="express-projects-title">
          <h2 id="express-projects-title" className={styles.h2}>{content.projects.title}</h2>
          <p className={styles.lead}>{content.projects.description}</p>
          <div className={styles.projects}>
            {content.projects.items.map((project) => (
              <ProjectCard key={project.id} project={project} content={content} headingLevel={3} />
            ))}
          </div>
        </section>

        <section id="express-skills" className={styles.section} aria-labelledby="express-skills-title">
          <h2 id="express-skills-title" className={styles.h2}>{content.skills.title}</h2>
          <p className={styles.lead}>{content.skills.description}</p>
          <div className={styles.skills}>
            {content.skills.categories.map((category) => (
              <div key={category.name} className={styles.skillGroup}>
                <h3 className={styles.h3}>{category.name}</h3>
                <ul className={styles.chips}>
                  {category.items.map((item) => (
                    <li key={item} className={styles.chip}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="express-contact" className={styles.section} aria-labelledby="express-contact-title">
          <h2 id="express-contact-title" className={styles.h2}>{content.contact.title}</h2>
          <p className={styles.lead}>{content.contact.description}</p>
          <ul className={styles.contacts}>
            {content.contact.methods.map((method) => (
              <li key={method.type}>
                <a
                  className={styles.contact}
                  href={method.link}
                  target={method.link.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                >
                  <span className={styles.contactType}>{method.type}</span>
                  <span className={styles.contactValue}>
                    {method.value}
                    <ExternalLinkIcon size={18} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>{ui.express.footer}</p>
      </footer>
    </div>
  );
}
