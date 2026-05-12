import { useEffect, useMemo, useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import api from '../services/api';
import { categoryMeta, fallbackSiteConfig } from '../data/fallback';
import { notify } from '../utils/notify';

const emptyIssue = {
  num: '',
  title: '',
  subtitle: '',
  date_label: '',
  description: '',
  digital_url: '',
  html_url: '',
  cover_url: '',
  tags: '',
  published: true,
};

const emptyQuestion = {
  category: 'tech',
  question: '',
  code_snippet: '',
  options: ['', '', '', ''],
  option_explanations: ['', '', '', ''],
  correct_idx: 0,
  explanation: '',
};

const emptyHotspot = {
  label: '',
  description: '',
  url: '',
  x_pct: '50',
  y_pct: '50',
};

const emptyArticle = {
  title: '',
  description: '',
  category: '',
  image_url: '',
  color_accent: 'green',
  page_num: '1',
  sort_order: '0',
};

const categoryColors = {
  green: 'var(--green)',
  blue: 'var(--blue)',
  red: 'var(--red)',
  yellow: 'var(--yellow)',
};

export default function Admin() {
  const [tab, setTab] = useState('settings');
  const [issues, setIssues] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [issueForm, setIssueForm] = useState(emptyIssue);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [hotspotForm, setHotspotForm] = useState(emptyHotspot);
  const [articleForm, setArticleForm] = useState(emptyArticle);
  const [siteConfig, setSiteConfig] = useState(fallbackSiteConfig);
  const [isUploading, setIsUploading] = useState(false);
  const [isHtmlUploading, setIsHtmlUploading] = useState(false);
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const fileInputRef = useRef(null);
  const htmlInputRef = useRef(null);
  const articleImageRef = useRef(null);

  const selectedIssue = useMemo(
    () => issues.find((issue) => issue.id === selectedIssueId),
    [issues, selectedIssueId]
  );

  const loadHotspots = (issueId = selectedIssueId) => {
    if (!issueId) {
      setHotspots([]);
      return;
    }
    api.get(`/issues/${issueId}/hotspots`)
      .then((res) => setHotspots(res.data.hotspots || []))
      .catch(() => setHotspots([]));
  };

  const loadArticles = (issueId = selectedIssueId) => {
    if (!issueId) {
      setArticles([]);
      return;
    }
    api.get(`/issues/${issueId}/articles`)
      .then((res) => setArticles(res.data.articles || []))
      .catch(() => setArticles([]));
  };

  const load = () => {
    api.get('/issues').then((res) => {
      const loaded = res.data.issues || [];
      setIssues(loaded);
      setSelectedIssueId((current) => current || loaded[0]?.id || '');
      if (!selectedIssueId && loaded[0]?.id) {
        loadHotspots(loaded[0].id);
        loadArticles(loaded[0].id);
      }
    }).catch(() => {});
    api.get('/questions').then((res) => setQuestions(res.data.questions || [])).catch(() => {});
    api.get('/users').then((res) => setUsers(res.data.users || [])).catch(() => {});
    api.get('/site-config').then((res) => {
      if (res.data.config) setSiteConfig({ ...fallbackSiteConfig, ...res.data.config });
    }).catch(() => {});
  };

  useEffect(load, []);

  useEffect(() => {
    loadHotspots(selectedIssueId);
    loadArticles(selectedIssueId);
  }, [selectedIssueId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await api.post('/upload/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIssueForm({ ...issueForm, cover_url: res.data.url });
      notify('Image uploaded successfully', 'ok');
    } catch (err) {
      notify(err.response?.data?.error || 'Upload failed', 'err');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleHtmlUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsHtmlUploading(true);
    try {
      const res = await api.post('/upload/issue-html', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIssueForm({ ...issueForm, html_url: res.data.url });
      notify('Interactive HTML uploaded', 'ok');
    } catch (err) {
      notify(err.response?.data?.error || 'HTML upload failed', 'err');
    } finally {
      setIsHtmlUploading(false);
      if (htmlInputRef.current) htmlInputRef.current.value = '';
    }
  };

  const handleArticleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await api.post('/upload/cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setArticleForm({ ...articleForm, image_url: res.data.url });
      notify('Article image uploaded', 'ok');
    } catch (err) {
      notify(err.response?.data?.error || 'Upload failed', 'err');
    } finally {
      setIsUploading(false);
      if (articleImageRef.current) articleImageRef.current.value = '';
    }
  };

  const saveSiteConfig = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...siteConfig,
        ticker_items: Array.isArray(siteConfig.ticker_items)
          ? siteConfig.ticker_items
          : String(siteConfig.ticker_items).split('\n'),
      };
      const res = await api.put('/site-config', payload);
      setSiteConfig({ ...fallbackSiteConfig, ...res.data.config });
      notify('Site settings updated', 'ok');
    } catch (err) {
      notify(err.response?.data?.error || 'Could not save site settings', 'err');
    }
  };

  const updateHomeCategory = (index, field, value) => {
    const categories = [...(siteConfig.home_categories || fallbackSiteConfig.home_categories)];
    categories[index] = { ...categories[index], [field]: value };
    setSiteConfig({ ...siteConfig, home_categories: categories });
  };

  const saveIssue = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...issueForm,
        num: Number(issueForm.num),
        tags: Array.isArray(issueForm.tags) 
          ? issueForm.tags 
          : issueForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };

      if (editingIssueId) {
        await api.put(`/issues/${editingIssueId}`, payload);
        notify('Issue updated', 'ok');
      } else {
        await api.post('/issues', payload);
        notify('Issue saved', 'ok');
      }
      
      setIssueForm(emptyIssue);
      setEditingIssueId(null);
      load();
    } catch (err) {
      notify(err.response?.data?.error || 'Could not save issue', 'err');
    }
  };

  const editIssue = (issue) => {
    setIssueForm({
      ...issue,
      tags: Array.isArray(issue.tags) ? issue.tags.join(', ') : issue.tags
    });
    setEditingIssueId(issue.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditIssue = () => {
    setIssueForm(emptyIssue);
    setEditingIssueId(null);
  };

  const saveQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...questionForm,
        options: questionForm.options.map((option) => option.trim()),
        option_explanations: questionForm.option_explanations.map((item) => item.trim()),
        correct_idx: Number(questionForm.correct_idx),
      };

      if (editingQuestionId) {
        await api.put(`/questions/${editingQuestionId}`, payload);
        notify('Question updated', 'ok');
      } else {
        await api.post('/questions', payload);
        notify('Question saved', 'ok');
      }

      setQuestionForm(emptyQuestion);
      setEditingQuestionId(null);
      load();
    } catch (err) {
      notify(err.response?.data?.error || 'Could not save question', 'err');
    }
  };

  const editQuestion = (question) => {
    setQuestionForm({ ...question });
    setEditingQuestionId(question.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditQuestion = () => {
    setQuestionForm(emptyQuestion);
    setEditingQuestionId(null);
  };

  const saveArticle = async (e) => {
    e.preventDefault();
    if (!selectedIssueId) {
      notify('Create or select an issue first', 'warn');
      return;
    }

    const payload = {
      ...articleForm,
      page_num: Number(articleForm.page_num) || 1,
      sort_order: Number(articleForm.sort_order) || 0,
    };

    try {
      if (editingArticleId) {
        await api.put(`/issues/articles/${editingArticleId}`, payload);
        notify('Article updated', 'ok');
      } else {
        await api.post(`/issues/${selectedIssueId}/articles`, payload);
        notify('Article saved', 'ok');
      }

      setArticleForm(emptyArticle);
      setEditingArticleId(null);
      loadArticles();
    } catch (err) {
      notify(err.response?.data?.error || 'Could not save article', 'err');
    }
  };

  const editArticle = (article) => {
    setArticleForm({
      category: article.category || '',
      image_url: article.image_url || '',
      color_accent: article.color_accent || 'green',
      page_num: String(article.page_num || 1),
      sort_order: String(article.sort_order || 0),
    });
    setEditingArticleId(article.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditArticle = () => {
    setArticleForm(emptyArticle);
    setEditingArticleId(null);
  };

  const deleteArticle = async (id) => {
    await api.delete(`/issues/articles/${id}`)
      .then(() => notify('Article deleted', 'ok'))
      .catch((err) => notify(err.response?.data?.error || 'Delete failed', 'err'));
    loadArticles();
  };

  const addHotspot = async (e) => {
    e.preventDefault();
    if (!selectedIssueId) {
      notify('Create or select an issue first', 'warn');
      return;
    }
    try {
      await api.post(`/issues/${selectedIssueId}/hotspots`, {
        ...hotspotForm,
        x_pct: Number(hotspotForm.x_pct),
        y_pct: Number(hotspotForm.y_pct),
      });
      setHotspotForm(emptyHotspot);
      notify('Hotspot added', 'ok');
      loadHotspots();
    } catch (err) {
      notify(err.response?.data?.error || 'Could not add hotspot', 'err');
    }
  };

  const updateHotspot = async (hotspot) => {
    try {
      await api.put(`/issues/${selectedIssueId}/hotspots/${hotspot.id}`, {
        label: hotspot.label,
        description: hotspot.description,
        url: hotspot.url,
        x_pct: Number(hotspot.x_pct),
        y_pct: Number(hotspot.y_pct),
      });
      notify('Hotspot updated', 'ok');
      loadHotspots();
    } catch (err) {
      notify(err.response?.data?.error || 'Could not update hotspot', 'err');
    }
  };

  const deleteHotspot = async (hotspotId) => {
    await api.delete(`/issues/${selectedIssueId}/hotspots/${hotspotId}`)
      .then(() => notify('Hotspot removed', 'ok'))
      .catch((err) => notify(err.response?.data?.error || 'Delete failed', 'err'));
    loadHotspots();
  };

  const clearHotspots = async () => {
    await api.delete(`/issues/${selectedIssueId}/hotspots`)
      .then(() => notify('Hotspots cleared', 'ok'))
      .catch((err) => notify(err.response?.data?.error || 'Clear failed', 'err'));
    loadHotspots();
  };

  const deleteIssue = async (id) => {
    await api.delete(`/issues/${id}`).then(() => notify('Issue deleted', 'ok')).catch((err) => notify(err.response?.data?.error || 'Delete failed', 'err'));
    setSelectedIssueId('');
    load();
  };

  const deleteQuestion = async (id) => {
    await api.delete(`/questions/${id}`).then(() => notify('Question deleted', 'ok')).catch((err) => notify(err.response?.data?.error || 'Delete failed', 'err'));
    load();
  };

  const resetUser = async (id) => {
    await api.patch(`/users/${id}/reset-score`).then(() => notify('Score reset', 'ok')).catch((err) => notify(err.response?.data?.error || 'Reset failed', 'err'));
    load();
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    await api.delete(`/users/${id}`).then(() => notify('User deleted', 'ok')).catch((err) => notify(err.response?.data?.error || 'Delete failed', 'err'));
    load();
  };

  const updateHotspotField = (index, field, value) => {
    setHotspots((current) => current.map((hotspot, i) => (i === index ? { ...hotspot, [field]: value } : hotspot)));
  };

  return (
    <div className="screen active">
      <NavBar />
      <main className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sb-section">Controls</div>
          {[
            ['settings', 'Site Settings'],
            ['hotspots', 'Hotspots'],
            ['issues', 'Issues'],
            ['articles', 'Articles'],
            ['questions', 'Questions'],
            ['users', 'Users'],
          ].map(([key, label]) => (
            <button className={`sb-link ${tab === key ? 'active' : ''}`} type="button" key={key} onClick={() => setTab(key)}>
              <span className="sb-icon">{label.slice(0, 1)}</span>{label}
            </button>
          ))}
        </aside>

        <section className="admin-main">
          <div className="admin-content">
            {tab === 'settings' && (
              <div className="admin-panels active">
                <h1 className="admin-pg-title">Site <span>Settings</span></h1>
                <form className="issue-form" onSubmit={saveSiteConfig}>
                  <div className="issue-form-title">Header Ticker</div>
                  <div className="f-row">
                    <div>
                      <label className="f-label">Ticker Items, one per line</label>
                      <textarea
                        className="f-input"
                        value={(siteConfig.ticker_items || []).join('\n')}
                        onChange={(e) => setSiteConfig({ ...siteConfig, ticker_items: e.target.value.split('\n') })}
                      />
                    </div>
                    <div>
                      <label className="f-label">Separator</label>
                      <input
                        className="f-input"
                        value={siteConfig.ticker_separator}
                        onChange={(e) => setSiteConfig({ ...siteConfig, ticker_separator: e.target.value })}
                      />
                      <div className="ticker-edit-preview">
                        <span>{siteConfig.ticker_items?.[0] || 'Preview item'}</span>
                        <b>{siteConfig.ticker_separator}</b>
                        <span>{siteConfig.ticker_items?.[1] || 'Next item'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="issue-form-title">Home Hero</div>
                  <div className="f-row">
                    <div><label className="f-label">Issue Label</label><input className="f-input" value={siteConfig.home_issue_label || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_issue_label: e.target.value })} /></div>
                    <div><label className="f-label">Primary Button</label><input className="f-input" value={siteConfig.home_primary_cta || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_primary_cta: e.target.value })} /></div>
                  </div>
                  <div className="f-row">
                    <div><label className="f-label">Hero Title Top</label><input className="f-input" value={siteConfig.home_hero_title_top || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_hero_title_top: e.target.value })} /></div>
                    <div><label className="f-label">Hero Title Accent</label><input className="f-input" value={siteConfig.home_hero_title_accent || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_hero_title_accent: e.target.value })} /></div>
                    <div><label className="f-label">Hero Title Outline</label><input className="f-input" value={siteConfig.home_hero_title_outline || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_hero_title_outline: e.target.value })} /></div>
                  </div>
                  <div className="f-group"><label className="f-label">Hero Description</label><textarea className="f-input" value={siteConfig.home_hero_description || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_hero_description: e.target.value })} /></div>
                  <div className="f-row">
                    <div><label className="f-label">Secondary Button</label><input className="f-input" value={siteConfig.home_secondary_cta || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_secondary_cta: e.target.value })} /></div>
                    <div><label className="f-label">Footer Text</label><input className="f-input" value={siteConfig.home_footer_text || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_footer_text: e.target.value })} /></div>
                  </div>

                  <div className="issue-form-title">Home Categories</div>
                  <div className="category-cms-grid">
                    {(siteConfig.home_categories || fallbackSiteConfig.home_categories).map((item, index) => (
                      <div className="category-cms-item" key={`${item.name}-${index}`}>
                        <div className="f-row compact-row">
                          <div><label className="f-label">Icon</label><input className="f-input" value={item.icon || ''} onChange={(e) => updateHomeCategory(index, 'icon', e.target.value)} /></div>
                          <div>
                            <label className="f-label">Color</label>
                            <select className="f-input" value={item.color || 'green'} onChange={(e) => updateHomeCategory(index, 'color', e.target.value)}>
                              {Object.keys(categoryColors).map((color) => <option value={color} key={color}>{color}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="f-group"><label className="f-label">Name</label><input className="f-input" value={item.name || ''} onChange={(e) => updateHomeCategory(index, 'name', e.target.value)} /></div>
                        <div className="f-group"><label className="f-label">Description</label><textarea className="f-input" value={item.description || ''} onChange={(e) => updateHomeCategory(index, 'description', e.target.value)} /></div>
                      </div>
                    ))}
                  </div>

                  <div className="issue-form-title">Featured Reads and Quiz CTA</div>
                  <div className="f-row">
                    <div><label className="f-label">Featured Label</label><input className="f-input" value={siteConfig.home_featured_label || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_featured_label: e.target.value })} /></div>
                    <div><label className="f-label">Featured Title</label><input className="f-input" value={siteConfig.home_featured_title || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_featured_title: e.target.value })} /></div>
                  </div>
                  <div className="f-row">
                    <div><label className="f-label">Quiz CTA Title</label><input className="f-input" value={siteConfig.home_quiz_title || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_quiz_title: e.target.value })} /></div>
                    <div><label className="f-label">Quiz Button</label><input className="f-input" value={siteConfig.home_quiz_button || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_quiz_button: e.target.value })} /></div>
                  </div>
                  <div className="f-group"><label className="f-label">Quiz CTA Description</label><textarea className="f-input" value={siteConfig.home_quiz_description || ''} onChange={(e) => setSiteConfig({ ...siteConfig, home_quiz_description: e.target.value })} /></div>

                  <div className="issue-form-title">Interactive Panel</div>
                  <div className="f-row">
                    <div><label className="f-label">Small Label</label><input className="f-input" value={siteConfig.interactive_label} onChange={(e) => setSiteConfig({ ...siteConfig, interactive_label: e.target.value })} /></div>
                    <div><label className="f-label">Panel Title</label><input className="f-input" value={siteConfig.interactive_title} onChange={(e) => setSiteConfig({ ...siteConfig, interactive_title: e.target.value })} /></div>
                  </div>
                  <div className="f-group"><label className="f-label">Panel Description</label><textarea className="f-input" value={siteConfig.interactive_description} onChange={(e) => setSiteConfig({ ...siteConfig, interactive_description: e.target.value })} /></div>
                  <div className="f-group"><label className="f-label">Panel Background Image URL</label><input className="f-input" value={siteConfig.interactive_bg_url} onChange={(e) => setSiteConfig({ ...siteConfig, interactive_bg_url: e.target.value })} /></div>
                  <button className="btn-solid-green" type="submit">Save Settings</button>
                </form>
              </div>
            )}

            {tab === 'hotspots' && (
              <div className="admin-panels active">
                <h1 className="admin-pg-title">Issue <span>Hotspots</span></h1>
                <div className="admin-split">
                  <div className="issue-form">
                    <div className="issue-form-title">Select Issue</div>
                    <div className="f-group">
                      <label className="f-label">Magazine Issue</label>
                      <select className="f-input" value={selectedIssueId} onChange={(e) => setSelectedIssueId(e.target.value)}>
                        {issues.map((issue) => <option value={issue.id} key={issue.id}>Issue #{issue.num} - {issue.title || 'Untitled'}</option>)}
                      </select>
                    </div>
                    <div className="hotspot-admin-preview">
                      <span>{selectedIssue ? `Issue #${selectedIssue.num}` : 'No issue selected'}</span>
                      {hotspots.map((hotspot) => (
                        <button
                          className="hotspot-mini-dot"
                          type="button"
                          key={hotspot.id}
                          style={{ left: `${hotspot.x_pct}%`, top: `${hotspot.y_pct}%` }}
                          title={hotspot.label}
                          onClick={() => setHotspotForm({ label: hotspot.label, description: hotspot.description || '', url: hotspot.url || '', x_pct: String(hotspot.x_pct), y_pct: String(hotspot.y_pct) })}
                        />
                      ))}
                    </div>
                    <button className="btn-act btn-red" type="button" onClick={clearHotspots} disabled={!selectedIssueId || !hotspots.length}>Clear All Hotspots</button>
                  </div>

                  <form className="issue-form" onSubmit={addHotspot}>
                    <div className="issue-form-title">Add Hotspot</div>
                    <div className="f-row">
                      <div><label className="f-label">X Position %</label><input className="f-input" type="number" min="0" max="100" value={hotspotForm.x_pct} onChange={(e) => setHotspotForm({ ...hotspotForm, x_pct: e.target.value })} /></div>
                      <div><label className="f-label">Y Position %</label><input className="f-input" type="number" min="0" max="100" value={hotspotForm.y_pct} onChange={(e) => setHotspotForm({ ...hotspotForm, y_pct: e.target.value })} /></div>
                    </div>
                    <div className="f-group"><label className="f-label">Label</label><input className="f-input" value={hotspotForm.label} onChange={(e) => setHotspotForm({ ...hotspotForm, label: e.target.value })} /></div>
                    <div className="f-group"><label className="f-label">URL</label><input className="f-input" value={hotspotForm.url} onChange={(e) => setHotspotForm({ ...hotspotForm, url: e.target.value })} /></div>
                    <div className="f-group"><label className="f-label">Description</label><textarea className="f-input" value={hotspotForm.description} onChange={(e) => setHotspotForm({ ...hotspotForm, description: e.target.value })} /></div>
                    <button className="btn-solid-green" type="submit">Add Hotspot</button>
                  </form>
                </div>

                <div className="issues-list">
                  {hotspots.map((hotspot, index) => (
                    <div className="issue-item hotspot-edit-item" key={hotspot.id}>
                      <div className="ii-info">
                        <div className="f-row">
                          <div><label className="f-label">Label</label><input className="f-input" value={hotspot.label || ''} onChange={(e) => updateHotspotField(index, 'label', e.target.value)} /></div>
                          <div><label className="f-label">URL</label><input className="f-input" value={hotspot.url || ''} onChange={(e) => updateHotspotField(index, 'url', e.target.value)} /></div>
                        </div>
                        <div className="f-row">
                          <div><label className="f-label">X %</label><input className="f-input" type="number" min="0" max="100" value={hotspot.x_pct} onChange={(e) => updateHotspotField(index, 'x_pct', e.target.value)} /></div>
                          <div><label className="f-label">Y %</label><input className="f-input" type="number" min="0" max="100" value={hotspot.y_pct} onChange={(e) => updateHotspotField(index, 'y_pct', e.target.value)} /></div>
                        </div>
                        <div className="f-group"><label className="f-label">Description</label><textarea className="f-input" value={hotspot.description || ''} onChange={(e) => updateHotspotField(index, 'description', e.target.value)} /></div>
                      </div>
                      <div className="ii-actions">
                        <button className="btn-act btn-green" type="button" onClick={() => updateHotspot(hotspot)}>Update</button>
                        <button className="btn-act btn-red" type="button" onClick={() => deleteHotspot(hotspot.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'issues' && (
              <div className="admin-panels active">
                <h1 className="admin-pg-title">Magazine <span>Issues</span></h1>
                <form className="issue-form" onSubmit={saveIssue}>
                  <div className="issue-form-title">{editingIssueId ? 'Update' : 'Create'} Issue</div>
                  <div className="f-row">
                    <div><label className="f-label">Issue Number</label><input className="f-input" value={issueForm.num} onChange={(e) => setIssueForm({ ...issueForm, num: e.target.value })} /></div>
                    <div><label className="f-label">Date Label</label><input className="f-input" value={issueForm.date_label} onChange={(e) => setIssueForm({ ...issueForm, date_label: e.target.value })} /></div>
                  </div>
                  <div className="f-row">
                    <div><label className="f-label">Title</label><input className="f-input" value={issueForm.title} onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })} /></div>
                    <div><label className="f-label">Subtitle</label><input className="f-input" value={issueForm.subtitle} onChange={(e) => setIssueForm({ ...issueForm, subtitle: e.target.value })} /></div>
                  </div>
                  <div className="f-group"><label className="f-label">Description</label><textarea className="f-input" value={issueForm.description} onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} /></div>
                  <div className="f-row">
                    <div><label className="f-label">Digital URL</label><input className="f-input" value={issueForm.digital_url} onChange={(e) => setIssueForm({ ...issueForm, digital_url: e.target.value })} /></div>
                    <div className="f-group">
                      <label className="f-label">Cover URL</label>
                      <div className="input-with-btn">
                        <input className="f-input" value={issueForm.cover_url} onChange={(e) => setIssueForm({ ...issueForm, cover_url: e.target.value })} placeholder="https://..." />
                        <button 
                          className={`btn-act ${isUploading ? 'btn-gray' : 'btn-green'}`} 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? '...' : 'Upload'}
                        </button>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        onChange={handleUpload} 
                      />
                    </div>
                  </div>
                  <div className="f-group">
                    <label className="f-label">Interactive HTML URL</label>
                    <div className="input-with-btn">
                      <input className="f-input" value={issueForm.html_url || ''} onChange={(e) => setIssueForm({ ...issueForm, html_url: e.target.value })} placeholder="Upload an .html file or paste a URL" />
                      <button
                        className={`btn-act ${isHtmlUploading ? 'btn-gray' : 'btn-blue'}`}
                        type="button"
                        onClick={() => htmlInputRef.current?.click()}
                        disabled={isHtmlUploading}
                      >
                        {isHtmlUploading ? '...' : 'Upload HTML'}
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={htmlInputRef}
                      style={{ display: 'none' }}
                      accept=".html,.htm,text/html"
                      onChange={handleHtmlUpload}
                    />
                    <div className="f-help">Standalone HTML works best. It opens inside a sandboxed interactive reader.</div>
                  </div>
                  <div className="f-group"><label className="f-label">Tags, comma separated</label><input className="f-input" value={issueForm.tags} onChange={(e) => setIssueForm({ ...issueForm, tags: e.target.value })} /></div>
                  <div className="toggle-wrap f-group">
                    <button 
                      type="button" 
                      className={`toggle ${issueForm.published ? 'on' : ''}`} 
                      onClick={() => setIssueForm({ ...issueForm, published: !issueForm.published })}
                    >
                      <div className="toggle-knob" />
                    </button>
                    <span className="toggle-label">{issueForm.published ? 'Published' : 'Draft'}</span>
                  </div>
                  <div className="f-row">
                    <button className="btn-solid-green" type="submit">{editingIssueId ? 'Update Issue' : 'Save Issue'}</button>
                    {editingIssueId && (
                      <button className="btn-act btn-red" type="button" onClick={cancelEditIssue}>Cancel Edit</button>
                    )}
                  </div>
                </form>

                <div className="issues-list">
                  {issues.map((issue) => (
                    <div className="issue-item" key={issue.id}>
                      <div className="ii-cover">{issue.num}</div>
                      <div className="ii-info">
                        <div className="ii-num">Issue #{issue.num}</div>
                        <div className="ii-title">{issue.title || 'Untitled issue'}</div>
                        <div className="ii-date">{issue.date_label}</div>
                      </div>
                      <span className={`badge ${issue.published ? 'badge-pub' : 'badge-draft'}`}>{issue.published ? 'Published' : 'Draft'}</span>
                      <div className="ii-actions">
                        <button className="btn-act btn-blue" type="button" onClick={() => editIssue(issue)}>Edit</button>
                        <button className="btn-act btn-red" type="button" onClick={() => deleteIssue(issue.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'articles' && (
              <div className="admin-panels active">
                <h1 className="admin-pg-title">Issue <span>Articles</span></h1>
                <div className="admin-split">
                  <div className="issue-form">
                    <div className="issue-form-title">Select Issue</div>
                    <div className="f-group">
                      <label className="f-label">Magazine Issue</label>
                      <select className="f-input" value={selectedIssueId} onChange={(e) => setSelectedIssueId(e.target.value)}>
                        {issues.map((issue) => <option value={issue.id} key={issue.id}>Issue #{issue.num} - {issue.title || 'Untitled'}</option>)}
                      </select>
                    </div>
                    <div className="article-cms-note">
                      <span>{selectedIssue ? `Issue #${selectedIssue.num}` : 'No issue selected'}</span>
                      <p>The first three articles by sort order become the home page Featured Reads cards.</p>
                    </div>
                  </div>

                  <form className="issue-form" onSubmit={saveArticle}>
                    <div className="issue-form-title">{editingArticleId ? 'Update' : 'Create'} Article</div>
                    <div className="f-row">
                      <div><label className="f-label">Category</label><input className="f-input" value={articleForm.category} onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })} /></div>
                      <div>
                        <label className="f-label">Accent Color</label>
                        <select className="f-input" value={articleForm.color_accent} onChange={(e) => setArticleForm({ ...articleForm, color_accent: e.target.value })}>
                          {Object.keys(categoryColors).map((color) => <option value={color} key={color}>{color}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="f-group"><label className="f-label">Title</label><input className="f-input" value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} /></div>
                    <div className="f-group"><label className="f-label">Description</label><textarea className="f-input" value={articleForm.description} onChange={(e) => setArticleForm({ ...articleForm, description: e.target.value })} /></div>
                    
                    <div className="f-group">
                      <label className="f-label">Page Image URL</label>
                      <div className="input-with-btn">
                        <input className="f-input" value={articleForm.image_url} onChange={(e) => setArticleForm({ ...articleForm, image_url: e.target.value })} placeholder="https://..." />
                        <button 
                          className={`btn-act ${isUploading ? 'btn-gray' : 'btn-green'}`} 
                          type="button" 
                          onClick={() => articleImageRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? '...' : 'Upload'}
                        </button>
                      </div>
                      <input 
                        type="file" 
                        ref={articleImageRef} 
                        style={{ display: 'none' }} 
                        accept="image/*" 
                        onChange={handleArticleImageUpload} 
                      />
                    </div>

                    <div className="f-row">
                      <div><label className="f-label">Page Number</label><input className="f-input" type="number" value={articleForm.page_num} onChange={(e) => setArticleForm({ ...articleForm, page_num: e.target.value })} /></div>
                      <div><label className="f-label">Sort Order</label><input className="f-input" type="number" value={articleForm.sort_order} onChange={(e) => setArticleForm({ ...articleForm, sort_order: e.target.value })} /></div>
                    </div>
                    <div className="f-row">
                      <button className="btn-solid-green" type="submit">{editingArticleId ? 'Update Article' : 'Save Article'}</button>
                      {editingArticleId && (
                        <button className="btn-act btn-red" type="button" onClick={cancelEditArticle}>Cancel Edit</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="issues-list">
                  {articles.map((article) => (
                    <div className="issue-item" key={article.id}>
                      <div className={`ii-cover article-cover-${article.color_accent || 'green'}`}>{article.page_num || '-'}</div>
                      <div className="ii-info">
                        <div className="ii-num">{article.category || 'Article'}</div>
                        <div className="ii-title">{article.title || 'Untitled article'}</div>
                        <div className="ii-date">Sort {article.sort_order || 0}</div>
                      </div>
                      <span className={`badge badge-${article.color_accent || 'pub'}`}>{article.color_accent || 'green'}</span>
                      <div className="ii-actions">
                        <button className="btn-act btn-blue" type="button" onClick={() => editArticle(article)}>Edit</button>
                        <button className="btn-act btn-red" type="button" onClick={() => deleteArticle(article.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'questions' && (
              <div className="admin-panels active">
                <h1 className="admin-pg-title">Quiz <span>Questions</span></h1>
                <form className="issue-form" onSubmit={saveQuestion}>
                  <div className="issue-form-title">{editingQuestionId ? 'Update' : 'Create'} Question</div>
                  <div className="f-row">
                    <div>
                      <label className="f-label">Category</label>
                      <select className="f-input" value={questionForm.category} onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}>
                        {Object.entries(categoryMeta).map(([key, meta]) => <option value={key} key={key}>{meta.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="f-label">Correct Option</label>
                      <select className="f-input" value={questionForm.correct_idx} onChange={(e) => setQuestionForm({ ...questionForm, correct_idx: e.target.value })}>
                        {[0, 1, 2, 3].map((value) => <option value={value} key={value}>{String.fromCharCode(65 + value)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="f-group"><label className="f-label">Question</label><textarea className="f-input" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} /></div>
                  <div className="f-group"><label className="f-label">Code Snippet</label><textarea className="f-input" value={questionForm.code_snippet} onChange={(e) => setQuestionForm({ ...questionForm, code_snippet: e.target.value })} /></div>
                  <div className="f-row">
                    {questionForm.options.map((option, index) => (
                      <div className="question-option-block" key={index}>
                        <label className="f-label">Option {String.fromCharCode(65 + index)}</label>
                        <input className="f-input" value={option} onChange={(e) => {
                          const options = [...questionForm.options];
                          options[index] = e.target.value;
                          setQuestionForm({ ...questionForm, options });
                        }} />
                        <label className="f-label option-explain-label">Explanation for Option {String.fromCharCode(65 + index)}</label>
                        <textarea className="f-input" value={questionForm.option_explanations[index]} onChange={(e) => {
                          const option_explanations = [...questionForm.option_explanations];
                          option_explanations[index] = e.target.value;
                          setQuestionForm({ ...questionForm, option_explanations });
                        }} />
                      </div>
                    ))}
                  </div>
                  <div className="f-group"><label className="f-label">General Explanation Fallback</label><textarea className="f-input" value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} /></div>
                  <div className="f-row">
                    <button className="btn-solid-green" type="submit">{editingQuestionId ? 'Update Question' : 'Save Question'}</button>
                    {editingQuestionId && (
                      <button className="btn-act btn-red" type="button" onClick={cancelEditQuestion}>Cancel Edit</button>
                    )}
                  </div>
                </form>

                <table className="data-table">
                  <thead><tr><th>Category</th><th>Question</th><th>Action</th></tr></thead>
                  <tbody>
                    {questions.map((question) => (
                      <tr key={question.id}>
                        <td>{question.category}</td>
                        <td>{question.question}</td>
                        <td className="ii-actions">
                          <button className="btn-act btn-blue" type="button" onClick={() => editQuestion(question)}>Edit</button>
                          <button className="btn-act btn-red" type="button" onClick={() => deleteQuestion(question.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'users' && (
              <div className="admin-panels active">
                <h1 className="admin-pg-title">User <span>Scores</span></h1>
                <table className="data-table">
                  <thead><tr><th>User</th><th>Role</th><th>Total</th><th>YT</th><th>AQ</th><th>Tech</th><th>Action</th></tr></thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td><span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{user.role}</span></td>
                        <td>{user.score_total || 0}</td>
                        <td>{user.score_yt || 0}</td>
                        <td>{user.score_aq || 0}</td>
                        <td>{user.score_tech || 0}</td>
                        <td className="ii-actions">
                          <button className="btn-act btn-yellow" type="button" onClick={() => resetUser(user.id)}>Reset</button>
                          {user.role !== 'admin' && (
                            <button className="btn-act btn-red" type="button" onClick={() => deleteUser(user.id)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
