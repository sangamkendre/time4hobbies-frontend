import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../services/api';
import { notify } from '../utils/notify';
import Loader from '../components/Loader';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Games', 'Aquascape', 'IoT', 'Linux'];

  useEffect(() => {
    let live = true;
    
    api.get('/youtube/videos')
      .then(res => {
        if (!live) return;
        if (res.data && res.data.videos) {
          setVideos(res.data.videos);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!live) return;
        console.error("Failed to load videos:", err);
        notify("Failed to load YouTube videos", "error");
        setLoading(false);
      });

    return () => {
      live = false;
    };
  }, []);

  const openVideo = (video) => {
    setActiveVideo(video);
  };

  const closeVideo = () => {
    setActiveVideo(null);
  };

  return (
    <div className="screen active">
      <NavBar />
      <div className="ticker-wrap" style={{ opacity: 0.5 }}>
        <div className="ticker-inner">
          {Array(10).fill(0).map((_, i) => (
            <span key={i}>
              <em className="ticker-sep">•</em>
              LATEST UPLOADS
            </span>
          ))}
        </div>
      </div>

      <main style={{ position: 'relative', zIndex: 1 }}>
        <section className="page-body" style={{ minHeight: '80vh', paddingTop: '4rem' }}>
          <div className="sec-hdr" style={{ textAlign: 'center', alignItems: 'center' }}>
            <span className="sec-tag">Time4Hobbies</span>
            <h2 className="sec-title" style={{ fontSize: '3rem', margin: '1rem 0' }}>Latest Videos</h2>
            <div className="videos-hero-banner">
              {/* Subtle accent glows */}
              <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '120px', height: '120px', background: 'var(--green)', opacity: '0.15', filter: 'blur(40px)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '120px', height: '120px', background: '#ff0000', opacity: '0.15', filter: 'blur(40px)', borderRadius: '50%' }}></div>
              
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                color: '#ff0000',
                padding: '14px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 20px rgba(255, 0, 0, 0.2)'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </div>
              
              <p style={{ 
                color: 'var(--text-muted)', 
                margin: 0, 
                fontSize: '1.15rem', 
                lineHeight: '1.6',
                textAlign: 'left'
              }}>
                Catch up on our latest <strong style={{ color: 'var(--text)' }}>tutorials</strong>, <strong style={{ color: 'var(--text)' }}>insights</strong>, and <strong style={{ color: 'var(--text)' }}>hobby deep-dives</strong> straight from our <a href="https://www.youtube.com/@time4hobbies" target="_blank" rel="noreferrer" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 'bold' }}>YouTube channel</a>.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader />
            </div>
          ) : videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <p>No videos available right now. Please check back later.</p>
              <a href="https://www.youtube.com/@time4hobbies" target="_blank" rel="noreferrer" className="nbtn primary" style={{ marginTop: '1rem' }}>
                Visit Channel directly
              </a>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      background: activeCategory === cat ? 'rgba(0, 255, 170, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      color: activeCategory === cat ? 'var(--green)' : 'var(--text-muted)',
                      border: `1px solid ${activeCategory === cat ? 'var(--green)' : 'rgba(255, 255, 255, 0.1)'}`,
                      padding: '0.6rem 1.5rem',
                      borderRadius: '30px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: activeCategory === cat ? '0 0 15px rgba(0, 255, 170, 0.2)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (activeCategory !== cat) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.color = 'var(--text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeCategory !== cat) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="videos-grid">
                {videos
                  .filter(vid => activeCategory === 'All' || vid.category === activeCategory)
                  .map((vid, idx) => (
                  <div 
                    key={vid.id || idx} 
                    className="glass-card" 
                    style={{ 
                      padding: 0, 
                      overflow: 'hidden', 
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,255,170,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => openVideo(vid)}
                  >
                    <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
                      <img 
                        src={vid.thumbnail} 
                        alt={vid.title} 
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
                          opacity: 0.9, transition: 'opacity 0.3s ease'
                        }} 
                      />
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                        color: 'var(--green)', padding: '4px 10px', borderRadius: '4px',
                        fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(0,255,170,0.3)'
                      }}>
                        {vid.category || 'General'}
                      </div>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '60px', height: '60px', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)',
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}>
                        <div style={{
                          width: 0, height: 0, borderTop: '10px solid transparent',
                          borderBottom: '10px solid transparent', borderLeft: '16px solid var(--green)',
                          marginLeft: '5px'
                        }} />
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text)', lineHeight: 1.4 }}>
                        {vid.title}
                      </h3>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(vid.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ color: 'var(--green)', fontSize: '0.9rem', fontWeight: 600 }}>Play Video</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <a href="https://www.youtube.com/@time4hobbies" target="_blank" rel="noreferrer" className="hero-btn solid">
              Subscribe to our Channel
            </a>
          </div>
        </section>
      </main>

      {/* Video Modal Popup */}
      {activeVideo && (
        <div className="video-modal-overlay" onClick={closeVideo}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <button 
              onClick={closeVideo}
              style={{
                position: 'absolute', top: '10px', right: '10px', width: '40px', height: '40px',
                backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%',
                fontSize: '1.5rem', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ×
            </button>
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-card)' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text)' }}>{activeVideo.title}</h2>
              <a 
                href={activeVideo.link} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}
              >
                Watch directly on YouTube ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
