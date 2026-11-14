/**
 * @fileoverview Project readout card shared by ContentPanel and ExpressView.
 * Screenshot is loaded from /projects/{id}-640.jpg (+ {id}.jpg 1280w) and hidden if the file is missing.
 */

import { useState } from "react";
import type { Content } from "../../i18n";
import { ExternalLinkIcon } from "./icons";
import styles from "./ProjectCard.module.css";

type Project = Content["projects"]["items"][number];

export interface ProjectCardProps {
  project: Project;
  content: Content;
  /** Highlight this card (opened from a 3D object). */
  highlighted?: boolean;
  /** Heading level, so the card fits the page outline. */
  headingLevel?: 2 | 3;
}

export function ProjectCard({ project, content, highlighted = false, headingLevel = 3 }: ProjectCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const { contentPanel } = content.ui;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const hasLink = project.link !== "" && project.link !== "#";
  const alt = contentPanel.screenshotAlt.replace("{name}", project.name);

  return (
    <article
      id={"project-" + project.id}
      className={styles.card + " cut"}
      data-highlighted={highlighted ? "true" : undefined}
      aria-current={highlighted ? "true" : undefined}
    >
      {!imageFailed && (
        <div className={styles.shot}>
          <img
            src={"/projects/" + project.id + "-640.jpg"}
            srcSet={`/projects/${project.id}-640.jpg 640w, /projects/${project.id}.jpg 1280w`}
            sizes="(max-width: 700px) 100vw, 640px"
            alt={alt}
            width={640}
            height={400}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </div>
      )}
      <div className={styles.body}>
        <Heading className={styles.name}>{project.name}</Heading>
        <p className={styles.role}>
          <span className={styles.roleLabel}>{contentPanel.roleLabel}</span> {project.role}
        </p>
        <p className={styles.pitch}>{project.description}</p>
        <ul className={styles.chips} aria-label={contentPanel.stackLabel}>
          {project.technologies.map((tech) => (
            <li key={tech} className={styles.chip}>{tech}</li>
          ))}
        </ul>
        {hasLink && (
          <a className={styles.link} href={project.link} target="_blank" rel="noopener noreferrer">
            {contentPanel.learnMore}
            <ExternalLinkIcon size={18} />
          </a>
        )}
      </div>
    </article>
  );
}
