import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import api from '../services/api';
import { difficultyMeta, fallbackQuestions, fallbackSiteConfig } from '../data/fallback';

export default function TechTracks() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(fallbackQuestions);
  const [siteConfig, setSiteConfig] = useState(fallbackSiteConfig);

  useEffect(() => {
    let live = true;
    api.get('/questions').then((res) => {
      if (live && Array.isArray(res.data.questions)) setQuestions(res.data.questions);
    }).catch(() => {});
    api.get('/site-config').then((res) => {
      if (live && res.data.config) {
        const fetchedConfig = res.data.config;
        
        // Ensure SQL track is merged in if it's missing from the backend config
        if (fetchedConfig.quiz_subcategories && !fetchedConfig.quiz_subcategories.find(t => t.key === 'sql')) {
          const sqlFallback = fallbackSiteConfig.quiz_subcategories.find(t => t.key === 'sql');
          if (sqlFallback) {
            fetchedConfig.quiz_subcategories.push(sqlFallback);
          }
        }
        
        setSiteConfig({ ...fallbackSiteConfig, ...fetchedConfig });
      }
    }).catch(() => {});
    return () => { live = false; };
  }, []);

  const quizSubcategories = siteConfig.quiz_subcategories || fallbackSiteConfig.quiz_subcategories;
  const trackCounts = useMemo(() => {
    return quizSubcategories.reduce((acc, item) => {
      acc[item.key] = Object.keys(difficultyMeta).reduce((levels, level) => {
        levels[level] = questions.filter((q) => (
          q.category === 'tech'
          && (q.subcategory || 'python') === item.key
          && (q.difficulty || 'basic') === level
        )).length;
        return levels;
      }, {});
      return acc;
    }, {});
  }, [questions, quizSubcategories]);

  return (
    <div className="screen active">
      <NavBar />
      <main className="page-body">
        <div style={{ marginBottom: '20px' }}>
          <button className="nbtn" type="button" onClick={() => navigate('/dashboard')}>
            &larr; Back to Dashboard
          </button>
        </div>
        <section className="quiz-track-section" style={{ marginTop: '0' }}>
          <div className="panel-title" style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--green)' }}>Tech / Data Tracks</div>
          <div className="track-grid">
            {quizSubcategories.map((track) => (
              <article className={`track-card track-${track.color || 'green'}`} key={track.key}>
                <div className="track-head">
                  <span className="track-icon">{track.icon || track.label?.slice(0, 2)}</span>
                  <div>
                    <div className="track-name">{track.label}</div>
                    <p className="track-desc">{track.description}</p>
                  </div>
                </div>
                <div className="difficulty-row">
                  {Object.entries(difficultyMeta).map(([level, meta]) => (
                    <button
                      className="diff-pill"
                      type="button"
                      key={level}
                      onClick={() => navigate(`/quiz/tech?subcategory=${encodeURIComponent(track.key)}&difficulty=${level}`)}
                    >
                      <span>{meta.short}</span>
                      <b>{trackCounts[track.key]?.[level] || 0}</b>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
