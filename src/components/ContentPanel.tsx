// =====================================================
// CONTENT PANEL COMPONENT
// Displays section content in a clean, readable format
// Supports: About, Projects, Skills, Contact sections
// =====================================================

import { type Content, type Language } from "../i18n";

interface ContentPanelProps {
  section: string | null;
  content: Content;
  language: Language;
  onBack: () => void;
}

// =====================================================
// RENDER ABOUT SECTION
// =====================================================

const renderAbout = (content: Content) => (
  <div className="content-about">
    <h1>{content.about.title}</h1>
    <p className="description">{content.about.description}</p>
    <div className="highlights">
      <h3>{content.ui.contentPanel.keyHighlights}</h3>
      <ul>
        {content.about.highlights.map((highlight, index) => (
          <li key={index}>{highlight}</li>
        ))}
      </ul>
    </div>
    <a
      href={content.about.cvLink}
      target="_blank"
      rel="noopener noreferrer"
      className="cv-link"
    >
      {content.about.cvLabel} →
    </a>
  </div>
);

// =====================================================
// RENDER PROJECTS SECTION
// =====================================================

const renderProjects = (content: Content) => (
  <div className="content-projects">
    <h1>{content.projects.title}</h1>
    <p className="description">{content.projects.description}</p>
    <div className="projects-grid">
      {content.projects.items.map((project, index) => (
        <div key={index} className="project-card">
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <div className="technologies">
            {project.technologies.map((tech, techIndex) => (
              <span key={techIndex} className="tech-badge">
                {tech}
              </span>
            ))}
          </div>
          {project.link && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
              {content.ui.contentPanel.learnMore}
            </a>
          )}
        </div>
      ))}
    </div>
  </div>
);

// =====================================================
// RENDER SKILLS SECTION
// =====================================================

const renderSkills = (content: Content) => (
  <div className="content-skills">
    <h1>{content.skills.title}</h1>
    <p className="description">{content.skills.description}</p>
    <div className="skills-grid">
      {content.skills.categories.map((category, index) => (
        <div key={index} className="skill-category">
          <h3>{category.name}</h3>
          <ul>
            {category.items.map((skill, skillIndex) => (
              <li key={skillIndex}>{skill}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

// =====================================================
// RENDER CONTACT SECTION
// =====================================================

const renderContact = (content: Content) => (
  <div className="content-contact">
    <h1>{content.contact.title}</h1>
    <p className="description">{content.contact.description}</p>
    <div className="contact-methods">
      {content.contact.methods.map((method, index) => (
        <a
          key={index}
          href={method.link}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-link"
        >
          <strong>{method.type}:</strong> {method.value}
        </a>
      ))}
    </div>
  </div>
);

// =====================================================
// MAIN CONTENT PANEL COMPONENT
// =====================================================

export const ContentPanel: React.FC<ContentPanelProps> = ({
  section,
  content,
  onBack,
}) => {
  if (!section) return null;

  let sectionContent = null;

  switch (section.toLowerCase()) {
    case "about":
      sectionContent = renderAbout(content);
      break;
    case "projects":
      sectionContent = renderProjects(content);
      break;
    case "skills":
      sectionContent = renderSkills(content);
      break;
    case "contact":
      sectionContent = renderContact(content);
      break;
    default:
      return null;
  }

  return (
    <div className="ui-overlay">
      <button className="btn-close" onClick={onBack} aria-label="Close">
        ✕
      </button>
      <div className="content-container">
        {sectionContent}
      </div>
    </div>
  );
};

export default ContentPanel;
