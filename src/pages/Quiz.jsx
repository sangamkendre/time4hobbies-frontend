import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { categoryMeta, fallbackQuestions } from '../data/fallback';
import { notify } from '../utils/notify';

export default function Quiz() {
  const { category = 'tech' } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const meta = categoryMeta[category] || categoryMeta.tech;
  const [questions, setQuestions] = useState(() => fallbackQuestions.filter((q) => q.category === category));
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setIdx(0);
    setChosen(null);
    setCorrect(0);
    setFinished(false);
    api.get(`/questions?category=${category}`)
      .then((res) => {
        const loaded = res.data.questions?.length ? res.data.questions : fallbackQuestions.filter((q) => q.category === category);
        setQuestions(loaded);
      })
      .catch(() => setQuestions(fallbackQuestions.filter((q) => q.category === category)));
  }, [category]);

  const current = questions[idx];
  const total = questions.length;
  const pct = total ? ((idx + 1) / total) * 100 : 0;

  const resultMessage = useMemo(() => {
    const percent = total ? Math.round((correct / total) * 100) : 0;
    if (percent >= 80) return 'Excellent run. You are clearly building real momentum.';
    if (percent >= 50) return 'Good progress. A little review and this category is yours.';
    return 'A useful first pass. Try again and watch the score climb.';
  }, [correct, total]);

  const chosenExplanation = chosen === null
    ? ''
    : current.option_explanations?.[chosen] || current.explanation || (chosen === current.correct_idx ? 'Correct.' : 'Not quite.');

  const choose = (optionIndex) => {
    if (chosen !== null) return;
    setChosen(optionIndex);
    if (optionIndex === current.correct_idx) setCorrect((value) => value + 1);
  };

  const finish = async () => {
    setSubmitting(true);
    try {
      await api.post('/quiz/submit', { category, total_qs: total, correct_qs: correct });
      await refreshUser().catch(() => null);
      notify('Quiz score submitted', 'ok');
    } catch (err) {
      notify(err.response?.data?.error || 'Could not submit score', 'warn');
    } finally {
      setSubmitting(false);
      setFinished(true);
    }
  };

  const next = () => {
    if (idx + 1 >= total) {
      finish();
      return;
    }
    setIdx((value) => value + 1);
    setChosen(null);
  };

  if (!current && !finished) {
    return (
      <div className="screen active">
        <nav className="t4h-nav">
          <button className="nav-logo" type="button" onClick={() => navigate('/')}>TIME<span>4</span>HOBBIES</button>
          <div className="nav-right"><button className="nbtn" type="button" onClick={() => navigate('/dashboard')}>Dashboard</button></div>
        </nav>
        <main className="page-body">
          <div className="panel">No questions are available for this category yet.</div>
        </main>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="screen active">
        <nav className="t4h-nav">
          <button className="nav-logo" type="button" onClick={() => navigate('/')}>TIME<span>4</span>HOBBIES</button>
          <div className="nav-right"><button className="nbtn danger" type="button" onClick={() => navigate('/dashboard')}>Dashboard</button></div>
        </nav>
        <main className="result-center">
          <div className="result-box">
            <span className="res-lbl">{meta.label}</span>
            <div className="res-big">{correct}/{total}</div>
            <span className="res-lbl">Questions Correct</span>
            <p className="res-msg">{resultMessage}</p>
            <div className="res-btns">
              <button className="nbtn" type="button" onClick={() => navigate('/dashboard')}>Dashboard</button>
              <button className="btn-solid-green" type="button" onClick={() => window.location.reload()}>Try Again</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="screen active">
      <nav className="t4h-nav">
        <button className="nav-logo" type="button" onClick={() => navigate('/dashboard')}>TIME<span>4</span>HOBBIES</button>
        <div className="nav-right">
          <span className="nav-chip"><b>{user?.username}</b></span>
          <button className="nbtn danger" type="button" onClick={() => navigate('/dashboard')}>Exit Quiz</button>
        </div>
      </nav>

      <main className="quiz-wrap">
        <div className="quiz-hdr">
          <div className={`qbadge ${meta.className}`}>{meta.label}</div>
          <div className="q-prog">
            <div className="q-prog-bar"><div className="q-prog-fill" style={{ width: `${pct}%` }} /></div>
            <span className="q-prog-txt">{idx + 1}/{total}</span>
          </div>
        </div>

        <section className="q-box">
          <span className="q-num">Question {idx + 1}</span>
          <div className="q-text">{current.question}</div>
          {current.code_snippet && <pre className="q-code">{current.code_snippet}</pre>}
        </section>

        <section className="q-opts">
          {current.options.map((option, optionIndex) => {
            const state = chosen === null ? '' : optionIndex === current.correct_idx ? 'correct' : chosen === optionIndex ? 'wrong' : '';
            return (
              <button className={`q-opt ${state}`} type="button" key={option} disabled={chosen !== null} onClick={() => choose(optionIndex)}>
                <span className="opt-k">{String.fromCharCode(65 + optionIndex)}</span>
                {option}
              </button>
            );
          })}
        </section>

        <div className={`q-fb ${chosen !== null ? 'show' : ''} ${chosen === current.correct_idx ? 'win' : 'lose'}`}>
          {chosenExplanation}
        </div>
        <button className={`btn-next ${chosen !== null ? 'show' : ''}`} type="button" onClick={next} disabled={submitting}>
          {idx + 1 >= total ? (submitting ? 'Submitting...' : 'Finish Quiz') : 'Next Question'}
        </button>
      </main>
    </div>
  );
}
