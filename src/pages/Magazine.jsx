import { useEffect, useMemo, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../services/api';
import { fallbackIssues, fallbackSiteConfig } from '../data/fallback';

const accentClass = {
  green: 'ic-green',
  red: 'ic-red',
  blue: 'ic-blue',
  yellow: 'ic-yellow',
};

const accentTone = {
  green: 'reader-green',
  red: 'reader-red',
  blue: 'reader-blue',
  yellow: 'reader-yellow',
};

export default function Magazine() {
  const [issues, setIssues] = useState(fallbackIssues);
  const [selectedId, setSelectedId] = useState(fallbackIssues[0].id);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState(fallbackSiteConfig);
  const [activePage, setActivePage] = useState(0);
  const pageRefs = useRef([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    let live = true;
    api.get('/issues')
      .then(async (res) => {
        if (!live) return;
        const basicIssues = res.data.issues?.length ? res.data.issues : fallbackIssues;
        const hydrated = await Promise.all(
          basicIssues.map((issue) =>
            api.get(`/issues/${issue.id}`)
              .then((detail) => detail.data.issue)
              .catch(() => issue)
          )
        );
        if (live) {
          setIssues(hydrated);
          setSelectedId(hydrated[0]?.id || fallbackIssues[0].id);
        }
      })
      .catch(() => setIssues(fallbackIssues))
      .finally(() => live && setLoading(false));

    api.get('/site-config')
      .then((res) => {
        if (live && res.data.config) setSiteConfig({ ...fallbackSiteConfig, ...res.data.config });
      })
      .catch(() => {});

    return () => {
      live = false;
    };
  }, []);

  const selected = useMemo(() => issues.find((issue) => issue.id === selectedId) || issues[0] || fallbackIssues[0], [issues, selectedId]);
  const hasDigitalUrl = !!selected.digital_url && selected.digital_url !== '#';
  const hasInteractiveHtml = !!selected.html_url && selected.html_url !== '#';
  const interactiveHtmlSrc = hasInteractiveHtml
    ? `${api.defaults.baseURL || ''}/issues/${selected.id}/interactive-html`
    : '';
  const articles = selected.articles?.length ? selected.articles : fallbackIssues[0].articles;
  const hotspots = selected.hotspots?.length ? selected.hotspots : fallbackIssues[0].hotspots;
  const readerPages = useMemo(() => {
    const tags = selected.tags || fallbackIssues[0].tags;
    const articlePages = articles.map((article, index) => ({
      type: 'article',
      kicker: article.category || 'Feature',
      title: article.title,
      description: article.description,
      page: article.page_num || index + 2,
       accent: article.color_accent || ['green', 'blue', 'yellow'][index % 3],
       label: article.category || `Page ${index + 2}`,
       tags: [article.category, ...tags].filter(Boolean).slice(0, 3),
       hotspots: hotspots.slice(0, Math.max(1, Math.min(hotspots.length, 2))),
       image: article.image_url,
     }));

    return articlePages;
  }, [articles, hotspots, selected, siteConfig]);
  const activeReaderPage = readerPages[activePage] || readerPages[0];

  useEffect(() => {
    setActivePage(0);
  }, [selectedId]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.5,
    };

    const handleIntersect = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-reader-page'), 10);
          if (!isNaN(index)) {
            setActivePage(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // We need to observe all reader-copy elements within this container
    const container = scrollContainerRef.current;
    if (container) {
      const elements = container.querySelectorAll('.reader-copy');
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  }, [readerPages, selectedId]);

  return (
    <div className="screen active">
      <NavBar />
      <main className="page-body">
        <div className="sec-hdr">
          <span className="sec-tag">All Issues</span>
          <h1 className="sec-title">Magazine</h1>
          <div className="sec-line" />
        </div>

        <div className="mag-issue-switcher">
          {issues.map((issue) => (
            <button
              className={`issue-btn ${issue.id === selected.id ? 'active' : ''}`}
              type="button"
              key={issue.id}
              onClick={() => setSelectedId(issue.id)}
            >
              Issue #{issue.num}
            </button>
          ))}
        </div>

        <section className="mag-layout">
          <div className="mag-cover-side">
            <div className="mag-ghost-num">{selected.num}</div>
            <div className="mag-cover-wrap">
              {selected.cover_url ? (
                <img className="mag-cover-img" src={selected.cover_url} alt={`${selected.title} cover`} />
              ) : (
                <div className="cover-placeholder">
                  <span className="cp-logo">TIME4HOBBIES</span>
                  <span className="cp-sub">Issue #{selected.num}</span>
                </div>
              )}
              <div className="mag-new-badge">{loading ? 'Loading' : 'Latest'}</div>
            </div>
          </div>
          <div className="mag-info-side">
            <div className="mag-issue-label">{selected.date_label || 'April 2026'}</div>
            <h2 className="mag-issue-title">
              {selected.title || 'Build. Learn.'} <span>{selected.subtitle || 'Create.'}</span>
            </h2>
            <p className="mag-issue-desc">{selected.description || fallbackIssues[0].description}</p>
            <div className="mag-tags">
              {(selected.tags || fallbackIssues[0].tags).map((tag, index) => (
                <span className={`mtag ${index % 3 === 0 ? 'g' : index % 3 === 1 ? 'b' : 'r'}`} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="mag-action-row">
              {hasInteractiveHtml && (
                <a className="mag-read-btn" href="#interactive-issue">
                  Read Interactive Issue
                </a>
              )}
              {hasDigitalUrl && (
                <a className="mag-read-btn mag-read-secondary" href={selected.digital_url} target="_blank" rel="noreferrer">
                  Read Digital Issue
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="reader-wrap" aria-label="Scroll magazine reader" style={{ '--reader-accent': `var(--${activeReaderPage.accent})` }}>
          <div className="reader-sticky">
            <div 
              className={`reader-page-art ${accentTone[activeReaderPage.accent] || 'reader-green'}`}
              style={activeReaderPage.image ? { backgroundImage: `url(${activeReaderPage.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              <div className="reader-page-shadow" />
              <div className="reader-page-top">
                <span>TIME4HOBBIES</span>
                <span>PAGE {activeReaderPage.page}</span>
              </div>
              {!activeReaderPage.image && (
                <div className="reader-page-main">
                  <span className="reader-kicker">{activeReaderPage.kicker}</span>
                  <h2>{activeReaderPage.title}</h2>
                  <p>{activeReaderPage.description}</p>
                </div>
              )}
              <div className="reader-mini-tags">
                {(activeReaderPage.tags || []).slice(0, 4).map((tag, index) => (
                  <span key={`${tag}-${index}`}>{tag}</span>
                ))}
              </div>
              <div className="reader-fold" />
              {(activeReaderPage.hotspots || []).slice(0, 3).map((hotspot, index) => (
                <a
                  className="reader-dot"
                  key={`${hotspot.id || hotspot.label}-${index}`}
                  href={hotspot.url || '#'}
                  style={{
                    left: `${hotspot.x_pct ?? hotspot.x ?? 30 + index * 18}%`,
                    top: `${hotspot.y_pct ?? hotspot.y ?? 34 + index * 14}%`,
                  }}
                  aria-label={hotspot.label}
                >
                  <span>{hotspot.label}</span>
                </a>
              ))}
            </div>

            <div className="reader-progress" aria-hidden="true">
              {readerPages.map((page, index) => (
                <button
                  className={`reader-step ${index === activePage ? 'active' : ''}`}
                  type="button"
                  key={`${page.label}-${index}`}
                  onClick={() => pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {page.label}
                </button>
              ))}
            </div>
          </div>

          <div className="reader-scroll" ref={scrollContainerRef}>
            {readerPages.map((page, index) => (
              <article
                className={`reader-copy ${index === activePage ? 'active' : ''}`}
                key={`${page.type}-${page.title}-${index}`}
                data-reader-page={index}
                ref={(node) => {
                  pageRefs.current[index] = node;
                }}
              >
                <span className="reader-copy-page">Page {page.page}</span>
                <h2>{page.title}</h2>
                <p>{page.description}</p>
                <div className="reader-copy-tags">
                  {(page.tags || []).slice(0, 4).map((tag, tagIndex) => (
                    <span key={`${tag}-${tagIndex}`}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="hotspot-preview"
          style={siteConfig.interactive_bg_url ? { backgroundImage: `linear-gradient(rgba(6,6,8,0.55), rgba(6,6,8,0.55)), url(${siteConfig.interactive_bg_url})` } : undefined}
        >
          <div className="hotspot-preview-label">{siteConfig.interactive_label}</div>
          <div className="hotspot-preview-copy">
            <h2>{siteConfig.interactive_title}</h2>
            <p>{siteConfig.interactive_description}</p>
          </div>
          {hotspots.map((hotspot) => (
            <a
              className="hs-dot"
              key={hotspot.id || hotspot.label}
              href={hotspot.url || '#'}
              style={{ left: `${hotspot.x_pct ?? hotspot.x}%`, top: `${hotspot.y_pct ?? hotspot.y}%` }}
              aria-label={hotspot.label}
            >
              <span className="hs-tooltip">
                <span className="hs-tooltip-title">{hotspot.label}</span>
                <span className="hs-tooltip-link">{hotspot.description || hotspot.url}</span>
              </span>
            </a>
          ))}
        </section>

        {hasInteractiveHtml && (
          <section className="interactive-issue-frame" id="interactive-issue" aria-label="Interactive HTML magazine issue">
            <div className="interactive-issue-bar">
              <div>
                <span className="sec-tag">Interactive Issue</span>
                <h2>{selected.title || `Issue #${selected.num}`}</h2>
              </div>
              <a className="frame-open-link" href={interactiveHtmlSrc} target="_blank" rel="noreferrer">Open Fullscreen</a>
            </div>
            <iframe
              src={interactiveHtmlSrc}
              title={`${selected.title || 'Magazine'} interactive issue`}
              sandbox="allow-scripts allow-forms allow-popups allow-downloads"
              loading="lazy"
            />
          </section>
        )}






      </main>
    </div>
  );
}
