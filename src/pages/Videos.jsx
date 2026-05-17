import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../services/api';
import { notify } from '../utils/notify';
import Loader from '../components/Loader';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

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
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Catch up on our latest tutorials, insights, and hobby deep-dives straight from our YouTube channel.
            </p>
            <div className="sec-line" style={{ margin: '0 auto' }} />
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
              <Loader />
            </div>
          ) : videos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <p>No videos available right now. Please check back later.</p>
              <a href="http://www.youtube.com/time4hobbies" target="_blank" rel="noreferrer" className="nbtn primary" style={{ marginTop: '1rem' }}>
                Visit Channel directly
              </a>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
              marginTop: '3rem'
            }}>
              {videos.map((vid, idx) => (
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
          )}

          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <a href="http://www.youtube.com/time4hobbies" target="_blank" rel="noreferrer" className="hero-btn solid">
              Subscribe to our Channel
            </a>
          </div>
        </section>
      </main>

      {/* Video Modal Popup */}
      {activeVideo && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }} onClick={closeVideo}>
          <div style={{
            position: 'relative', width: '100%', maxWidth: '1000px', backgroundColor: '#000',
            borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
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
