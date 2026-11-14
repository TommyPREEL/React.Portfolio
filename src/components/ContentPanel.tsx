// =====================================================
// CONTENT PANEL COMPONENT
// Terminal readout for About / Projects / Skills / Contact.
// Always 2D (readability, accessibility).
// =====================================================

import { useEffect, useRef, useId } from "react";
import { type Content } from "../i18n";
import { ProjectCard } from "./ui/ProjectCard";
import { ArrowIcon, CloseIcon, ExternalLinkIcon } from "./ui/icons";
import { useDialog } from "./ui/useDialog";
import styles from "./ui/ContentPanel.module.css";

interface ContentPanelProps {
  section: string | null;
  content: Content;
  onBack: () => void;
  /** Project to highlight when the panel is opened from a 3D object (see i18n project ids). */
  focusProjectId?: string | null;
}

type SectionKey = "about" | "projects" | "skills" | "contact";

const isSection = (value: string): value is SectionKey =>
  value === "about" || value === "projects" || value === "skills" || value === "contact";

const renderAbout = (content: Content, titleId: string) => (
  <>
    <h1 id={titleId} className={styles.title}>{content.about.title}</h1>
    <p className={styles.lead}>{content.about.description}</p>
    <h2 className={styles.subtitle}>{content.ui.contentPanel.keyHighlights}</h2>
    <ul className={styles.list}>
      {content.about.highlights.map((highlight) => (
        <li key={highlight}>{highlight}</li>
      ))}
    </ul>
    <a className={styles.primary} href={content.about.cvLink} target="_blank" rel="noopener noreferrer">
      {content.about.cvLabel}
      <ArrowIcon size={18} />
    </a>
  </>
);

const renderProjects = (content: Content, titleId: string, focusId: string | null) => (
  <>
    <h1 id={titleId} className={styles.title}>{content.projects.title}</h1>
    <p className={styles.lead}>{content.projects.description}</p>
    <div className={styles.grid}>
      {content.projects.items.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          content={content}
          highlighted={project.id === focusId}
        />
      ))}
    </div>
  </>
);

const renderSkills = (content: Content, titleId: string) => (
  <>
    <h1 id={titleId} className={styles.title}>{content.skills.title}</h1>
    <p className={styles.lead}>{content.skills.description}</p>
    <div className={styles.grid}>
      {content.skills.categories.map((category) => (
        <section key={category.name} className={styles.group}>
          <h2>{category.name}</h2>
          <ul className={styles.chips}>
            {category.items.map((skill) => (
              <li key={skill} className={styles.chip}>{skill}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  </>
);

const renderContact = (content: Content, titleId: string) => (
  <>
    <h1 id={titleId} className={styles.title}>{content.contact.title}</h1>
    <p className={styles.lead}>{content.contact.description}</p>
    <div className={styles.contacts}>
      {content.contact.methods.map((method) => (
        <a
          key={method.type}
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
      ))}
    </div>
  </>
);

export const ContentPanel: React.FC<ContentPanelProps> = ({
  section,
  content,
  onBack,
  focusProjectId = null,
}) => {
  const key = section ? section.toLowerCase() : "";
  const valid = isSection(key);
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);
  useDialog(ref, onBack);

  // Scroll the opened project into view (and let the highlight show where it is).
  useEffect(() => {
    if (!valid || key !== "projects" || !focusProjectId) return;
    const el = document.getElementById("project-" + focusProjectId);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  }, [valid, key, focusProjectId]);

  if (!valid) return null;

  let body = null;
  switch (key) {
    case "about":
      body = renderAbout(content, titleId);
      break;
    case "projects":
      body = renderProjects(content, titleId, focusProjectId);
      break;
    case "skills":
      body = renderSkills(content, titleId);
      break;
    case "contact":
      body = renderContact(content, titleId);
      break;
  }

  return (
    <section
      ref={ref}
      className={styles.panel + " cut"}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
    >
      <button type="button" className={styles.close} onClick={onBack} aria-label={content.ui.settings.close}>
        <CloseIcon size={22} />
      </button>
      <div className={styles.scroll}>{body}</div>
    </section>
  );
};

export default ContentPanel;
