import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { fallbackIssues, fallbackQuestions, fallbackSiteConfig } from '../data/fallback';
import { notify } from '../utils/notify';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState(fallbackIssues);
  const [questionCount, setQuestionCount] = useState(fallbackQuestions.length);
  const [siteConfig, setSiteConfig] = useState(fallbackSiteConfig);

  useEffect(() => {
    let live = true;

    api.get('/issues')
      .then(async (res) => {
        if (!live || !res.data.issues?.length) return;
        const loaded = res.data.issues;
        const latestDetail = await api.get(`/issues/${loaded[0].id}`)
          .then((detail) => detail.data.issue)
          .catch(() => loaded[0]);
        if (live) setIssues([latestDetail, ...loaded.slice(1)]);
      })
      .catch(() => {});

    api.get('/questions')
      .then((res) => {
        if (live && Array.isArray(res.data.questions)) setQuestionCount(res.data.questions.length);
      })
      .catch(() => {});

    api.get('/site-config')
      .then((res) => {
        if (live && res.data.config) setSiteConfig({ ...fallbackSiteConfig, ...res.data.config });
      })
      .catch(() => {});

    return () => {
      live = false;
    };
  }, []);

  const latest = issues[0] || fallbackIssues[0];
  const hasInteractiveHtml = !!latest.html_url && latest.html_url !== '#';
  const interactiveHtmlSrc = hasInteractiveHtml
    ? `${api.defaults.baseURL || ''}/issues/${latest.id}/interactive-html`
    : '';
  const featured = useMemo(() => {
    const articles = latest.articles?.length ? latest.articles : fallbackIssues[0].articles;
    return articles.slice(0, 4);
  }, [latest]);

  const startQuiz = () => {
    if (!user) {
      notify('Please sign in to start the quiz', 'info');
      navigate('/login');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="screen active">
      <NavBar />
      <div className="ticker-wrap">
        <div className="ticker-inner">
          {[...siteConfig.ticker_items, ...siteConfig.ticker_items].map((item, index) => (
            <span key={`${item}-${index}`}>
              <em className="ticker-sep">{siteConfig.ticker_separator}</em>
              {item}
            </span>
          ))}
        </div>
      </div>

      <main style={{ position: 'relative', zIndex: 1 }}>
        <section className="home-hero">
          <div className="h-grid" />
          <div className="h-glow" />
          <span className="issue-pill">{siteConfig.home_issue_label} - {latest.date_label || 'April 2026'}</span>
          <h1 className="hero-title">
            {siteConfig.home_hero_title_top}
            <br />
            <span className="ht-accent">{siteConfig.home_hero_title_accent}</span>
            <span className="ht-outline">{siteConfig.home_hero_title_outline}</span>
          </h1>
          <p className="hero-sub">
            {siteConfig.home_hero_description}
          </p>
          <div className="hero-ctas">
            <button className="hero-btn solid" type="button" onClick={() => navigate('/magazine')}>
              {siteConfig.home_primary_cta}
            </button>
            <button className="hero-btn ghost" type="button" onClick={startQuiz}>
              {siteConfig.home_secondary_cta}
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <span className="stat-n">{issues.length}</span>
              <span className="stat-l">Issues</span>
            </div>
            <div>
              <span className="stat-n">{questionCount}</span>
              <span className="stat-l">Questions</span>
            </div>
            <div>
              <span className="stat-n">Free</span>
              <span className="stat-l">Access</span>
            </div>
          </div>
        </section>

        {hasInteractiveHtml && (
          <section className="home-issue-preview" aria-label="Latest interactive magazine issue preview">
            <iframe
              src={interactiveHtmlSrc}
              title={`${latest.title || 'Latest issue'} interactive preview`}
              sandbox="allow-scripts allow-forms allow-popups allow-downloads"
              loading="lazy"
              tabIndex="-1"
            />
            <div className="home-issue-preview-shade">
              <span className="sec-tag">New Issue</span>
              <h2>{latest.title || `Issue #${latest.num}`}</h2>
              <p>{latest.description || 'Explore the latest interactive magazine issue.'}</p>
              <div className="hero-ctas">
                <button className="hero-btn solid" type="button" onClick={() => navigate('/magazine')}>
                  Read Full Issue
                </button>
                <a className="hero-btn ghost" href={interactiveHtmlSrc} target="_blank" rel="noreferrer">
                  Open Preview
                </a>
              </div>
            </div>
          </section>
        )}

        <section className="cats-strip">
          <div className="cats-inner">
            {(siteConfig.home_categories || fallbackSiteConfig.home_categories).map(({ name, description, color, icon }) => (
              <div className="cat-item" key={name}>
                <span className="cat-icon" style={{ color: `var(--${color || 'green'})` }}>{icon}</span>
                <span className="cat-name" style={{ color: `var(--${color || 'green'})` }}>{name}</span>
                <span className="cat-desc">{description}</span>
                <div className="cat-bar" style={{ background: `var(--${color || 'green'})` }} />
              </div>
            ))}
          </div>
        </section>

        <section className="page-body">
          <div className="sec-hdr">
            <span className="sec-tag">{siteConfig.home_featured_label}</span>
            <h2 className="sec-title">{siteConfig.home_featured_title}</h2>
            <div className="sec-line" />
          </div>
          <div className="home-articles">
            {featured.map((article, index) => (
              <button className="ha" type="button" key={article.id || article.title} onClick={() => navigate('/magazine')}>
                <span className="ha-cat" style={{ color: `var(--${article.color_accent || (index === 1 ? 'blue' : index === 2 ? 'yellow' : 'green')})` }}>
                  {article.category}
                </span>
                <h3 className="ha-title">{article.title}</h3>
                <p className="ha-exc">{article.description}</p>
                <div className="ha-read" style={{ color: `var(--${article.color_accent || (index === 1 ? 'blue' : index === 2 ? 'yellow' : 'green')})` }}>
                  Read <span>-&gt;</span>
                </div>
              </button>
            ))}
          </div>

          <div style={{ height: 48 }} />
          <div className="quiz-cta">
            <div>
              <div className="qcta-h">{siteConfig.home_quiz_title}</div>
              <p className="qcta-p">{siteConfig.home_quiz_description}</p>
            </div>
            <button className="hero-btn solid" type="button" onClick={startQuiz}>
              {siteConfig.home_quiz_button}
            </button>
          </div>
        </section>

        <footer className="home-footer">
          <button className="nav-logo" type="button" style={{ fontSize: '1.4rem' }} onClick={() => navigate('/')}>
            TIME<span>4</span>HOBBIES
          </button>
          <div className="hf-links">
            <a href="https://www.youtube.com/c/TIME4HOBBIES" target="_blank" rel="noreferrer" className="hf-link yt">
              YouTube
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hf-link ig">
              Instagram
            </a>
          </div>
          <span className="hf-copy">{siteConfig.home_footer_text}</span>
        </footer>
      </main>
    </div>
  );
}
