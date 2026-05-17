import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../services/api';
import { fallbackSiteConfig } from '../data/fallback';
import Loader from '../components/Loader';

export default function WallOfFame() {
  const [data, setData] = useState({ yt: [], aq: [], tech: {} });
  const [siteConfig, setSiteConfig] = useState(fallbackSiteConfig);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!siteConfig?.comp_end_date) return;
    
    const calculateTimeLeft = () => {
      // Set end date to 23:59:59 of the target day
      const end = new Date(`${siteConfig.comp_end_date}T23:59:59`).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Competition Ended! Winners Finalized.');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft(); // initial call
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [siteConfig?.comp_end_date]);

  useEffect(() => {
    Promise.all([
      api.get('/users/wall-of-fame').catch(() => ({ data: { wallOfFame: { yt: [], aq: [], tech: {} } } })),
      api.get('/site-config').catch(() => ({ data: { config: null } }))
    ]).then(([resWof, resConfig]) => {
      setData(resWof.data.wallOfFame || { yt: [], aq: [], tech: {} });
      if (resConfig.data.config) {
        const fetchedConfig = resConfig.data.config;
        if (fetchedConfig.quiz_subcategories && !fetchedConfig.quiz_subcategories.find(t => t.key === 'sql')) {
          const sqlFallback = fallbackSiteConfig.quiz_subcategories.find(t => t.key === 'sql');
          if (sqlFallback) fetchedConfig.quiz_subcategories.push(sqlFallback);
        }
        setSiteConfig({ ...fallbackSiteConfig, ...fetchedConfig });
      }
    }).finally(() => setLoading(false));
  }, []);

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const Podium = ({ title, users }) => {
    // users is sorted 0: 1st, 1: 2nd, 2: 3rd
    const first = users && users[0];
    const second = users && users[1];
    const third = users && users[2];

    return (
      <div className="podium-category">
        <h2 className="podium-title">{title}</h2>
        <div className="podium-container">
          {/* 2nd Place */}
          <div className="podium-item podium-2nd">
            {second ? (
              <div className="podium-user">
                <span className="p-name" title={second.username}>{second.username}</span>
                <span className="p-score">{second.score} pts</span>
                <span className="p-time">{formatTime(second.time)}</span>
              </div>
            ) : <div className="podium-user empty">-</div>}
            <div className="podium-block yellow-glow">2</div>
          </div>
          
          {/* 1st Place */}
          <div className="podium-item podium-1st">
            {first ? (
              <div className="podium-user">
                <span className="p-name" title={first.username}>{first.username}</span>
                <span className="p-score">{first.score} pts</span>
                <span className="p-time">{formatTime(first.time)}</span>
              </div>
            ) : <div className="podium-user empty">-</div>}
            <div className="podium-block red-glow">1</div>
          </div>
          
          {/* 3rd Place */}
          <div className="podium-item podium-3rd">
            {third ? (
              <div className="podium-user">
                <span className="p-name" title={third.username}>{third.username}</span>
                <span className="p-score">{third.score} pts</span>
                <span className="p-time">{formatTime(third.time)}</span>
              </div>
            ) : <div className="podium-user empty">-</div>}
            <div className="podium-block blue-glow">3</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="screen active">
      <NavBar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');
        
        .wof-page {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
          color: white;
        }
        .wof-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .wof-header h1 {
          font-family: 'Righteous', Impact, sans-serif;
          font-weight: 900;
          font-size: 5rem;
          margin: 0;
          background: linear-gradient(135deg, #ffcc00, #ff4444, #4488ff, #ffcc00);
          background-size: 200% auto;
          -webkit-background-clip: text;
          color: transparent;
          text-transform: uppercase;
          letter-spacing: 6px;
          animation: shine 3s linear infinite;
          text-shadow: 0 0 30px rgba(255, 204, 0, 0.4);
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
        .wof-header p {
          color: #aaa;
          margin-top: 15px;
          font-size: 1.2rem;
          letter-spacing: 1px;
        }
        .podium-grid {
          display: flex;
          flex-direction: column;
          gap: 80px;
        }
        .podium-category {
          background: #111;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #222;
        }
        .podium-title {
          text-align: center;
          margin-bottom: 40px;
          font-size: 1.2rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #fff;
        }
        .podium-container {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          height: 250px;
          gap: 15px;
        }
        .podium-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100px;
        }
        .podium-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 15px;
          text-align: center;
          width: 100%;
        }
        .podium-user.empty {
          opacity: 0.3;
        }
        .p-name {
          font-weight: bold;
          font-size: 1rem;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          display: inline-block;
        }
        .p-score {
          font-size: 0.9rem;
          color: #ccc;
        }
        .p-time {
          font-size: 0.8rem;
          color: var(--muted);
        }
        .podium-block {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 15px;
          font-size: 2rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.8);
          border-radius: 8px 8px 0 0;
        }
        .podium-1st .podium-block {
          height: 150px;
          background: #2a0808;
          border: 1px solid #ff4444;
          box-shadow: 0 0 20px rgba(255, 68, 68, 0.5), inset 0 0 10px rgba(255, 68, 68, 0.3);
        }
        .podium-2nd .podium-block {
          height: 100px;
          background: #2a2a08;
          border: 1px solid #ffcc00;
          box-shadow: 0 0 20px rgba(255, 204, 0, 0.5), inset 0 0 10px rgba(255, 204, 0, 0.3);
        }
        .podium-3rd .podium-block {
          height: 70px;
          background: #08152a;
          border: 1px solid #4488ff;
          box-shadow: 0 0 20px rgba(68, 136, 255, 0.5), inset 0 0 10px rgba(68, 136, 255, 0.3);
        }
        @media (min-width: 900px) {
          .podium-grid {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            gap: 40px;
          }
          .podium-category {
            flex: 0 0 calc(50% - 20px);
            max-width: 500px;
          }
        }
        @media (min-width: 1400px) {
          .podium-category {
            flex: 0 0 calc(33.333% - 27px);
          }
        @media (max-width: 768px) {
          .wof-header h1 {
            font-size: 3rem;
          }
          .podium-grid {
            gap: 40px;
          }
          .podium-category {
            padding: 20px;
          }
          .podium-container {
            height: 200px;
            gap: 5px;
          }
          .podium-item {
            width: 80px;
          }
          .p-name {
            font-size: 0.8rem;
          }
          .podium-1st .podium-block { height: 120px; }
          .podium-2nd .podium-block { height: 80px; }
          .podium-3rd .podium-block { height: 50px; }
          .podium-block { font-size: 1.5rem; padding-top: 10px; }
        }
      `}</style>
      <main className="page-body wof-page">
        <div className="wof-header">
          <h1>Wall of Fame</h1>
          <p>The top 3 fastest and sharpest minds in our 15-Day Quiz Competition.</p>
          
          {timeLeft && (
            <div style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ color: 'var(--muted)', marginRight: '10px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px' }}>Time Remaining</span>
              <span style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'monospace' }}>{timeLeft}</span>
            </div>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="podium-grid">
            {siteConfig.quiz_subcategories.map((sub) => (
              <Podium 
                key={sub.key} 
                title={`Tech / ${sub.label}`} 
                users={data.tech ? (data.tech[sub.key] || []) : []} 
              />
            ))}
            
            <Podium title="YouTube / Content" users={data.yt || []} />
            <Podium title="Aquascaping" users={data.aq || []} />
          </div>
        )}
      </main>
    </div>
  );
}
