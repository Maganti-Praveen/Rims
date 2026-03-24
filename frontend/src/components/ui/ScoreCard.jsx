import { useState, useEffect } from 'react';
import API from '../../api/axios';

const CATS = [
    { key: 'publications',   label: 'Publications',  emoji: '📄', color: '#ea580c', light: '#fff7ed' },
    { key: 'patents',        label: 'Patents',        emoji: '💡', color: '#d97706', light: '#fffbeb' },
    { key: 'workshops',      label: 'Workshops',      emoji: '🔧', color: '#e11d48', light: '#fff1f2' },
    { key: 'seminars',       label: 'Seminars',       emoji: '🎤', color: '#7c3aed', light: '#f5f3ff' },
    { key: 'certifications', label: 'Certifications', emoji: '🏅', color: '#0ea5e9', light: '#f0f9ff' },
];

const ScoreCard = ({ facultyId }) => {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!facultyId) return;
        API.get(`/scores/faculty/${facultyId}`)
            .then(({ data: res }) => setData(res.data))
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [facultyId]);

    if (loading || !data) return null;

    const total  = CATS.reduce((s, c) => s + (data.counts[c.key] || 0), 0);
    const maxVal = Math.max(...CATS.map(c => data.counts[c.key] || 0), 1);

    return (
        <div className="card mb-5">

            {/* Header row */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-dark-100">
                <div>
                    <h3 className="text-sm font-bold text-dark-900">Research Summary</h3>
                    <p className="text-xs text-dark-400 mt-0.5">Uploads across all categories</p>
                </div>
                <div className="text-right">
                    <p className="font-heading text-2xl font-extrabold text-primary-600 leading-none">{total}</p>
                    <p className="text-[10px] text-dark-400 uppercase tracking-wide mt-0.5">Total</p>
                </div>
            </div>

            {/* Category rows */}
            <div className="px-5 py-3 space-y-3">
                {CATS.map((cat) => {
                    const count = data.counts[cat.key] || 0;
                    const pct   = maxVal > 0 ? Math.round((count / maxVal) * 100) : 0;
                    return (
                        <div key={cat.key}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0"
                                        style={{ background: cat.light }}
                                    >
                                        {cat.emoji}
                                    </span>
                                    <span className="text-xs font-medium text-dark-700">{cat.label}</span>
                                </div>
                                <span className="text-xs font-bold tabular-nums" style={{ color: cat.color }}>
                                    {count}
                                </span>
                            </div>
                            {/* Track */}
                            <div className="h-1.5 w-full rounded-full bg-dark-100 overflow-hidden">
                                <div
                                    className="h-1.5 rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ScoreCard;
