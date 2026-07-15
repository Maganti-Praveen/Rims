import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Gear, FloppyDisk, Trophy, Lightning, BookOpen, Lightbulb, Briefcase, Microphone, Certificate } from '@phosphor-icons/react';

const ScoreSettings = () => {
    const { user } = useAuth();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await API.get('/scores/config');
            setConfigs(data.data || []);
        } catch {
            toast.error('Failed to load score configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, points) => {
        setSaving(id);
        try {
            await API.put(`/scores/config/${id}`, { points: Number(points) });
            toast.success('Score updated');
            fetchConfig();
        } catch {
            toast.error('Failed to update');
        } finally {
            setSaving(null);
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="card p-8 text-center">
                <p className="text-dark-500">Access denied. Admin only.</p>
            </div>
        );
    }

    const categoryLabels = {
        publication: { label: 'Publications', icon: BookOpen, color: 'bg-blue-50 border-blue-200', iconColor: 'text-blue-600' },
        patent: { label: 'Patents', icon: Lightbulb, color: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600' },
        workshop: { label: 'Workshops', icon: Briefcase, color: 'bg-green-50 border-green-200', iconColor: 'text-green-600' },
        seminar: { label: 'Seminars', icon: Microphone, color: 'bg-purple-50 border-purple-200', iconColor: 'text-purple-600' },
        certification: { label: 'Certifications', icon: Certificate, color: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-600' },
    };

    const grouped = configs.reduce((acc, c) => {
        if (!acc[c.category]) acc[c.category] = [];
        acc[c.category].push(c);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-100 rounded-lg">
                    <Gear className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">Score Settings</h1>
                    <p className="text-dark-500 text-sm">Configure research score point values for each category</p>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(grouped).map(([category, items]) => {
                    const catConfig = categoryLabels[category] || { label: category, icon: BookOpen, color: 'bg-dark-50 border-dark-200', iconColor: 'text-dark-600' };
                    const CatIcon = catConfig.icon;
                    return (
                        <div key={category} className={`card border ${catConfig.color} overflow-hidden`}>
                            <div className="px-5 py-3 border-b border-dark-100 bg-white/50">
                                <h3 className="text-base font-bold text-dark-800 flex items-center gap-2">
                                    <CatIcon className={`w-5 h-5 ${catConfig.iconColor}`} /> {catConfig.label}
                                </h3>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {items.map((item) => (
                                        <div key={item._id} className="bg-white rounded-xl border border-dark-100 p-4 hover:shadow-sm transition-all">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-dark-700">{item.subCategory}</span>
                                                <div className="flex items-center gap-1">
                                                    <Lightning className="w-3.5 h-3.5 text-accent-500" />
                                                    <span className="text-xs text-dark-400">pts</span>
                                                </div>
                                            </div>
                                            {item.description && (
                                                <p className="text-xs text-dark-400 mb-3">{item.description}</p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    defaultValue={item.points}
                                                    className="input-field text-center font-bold text-lg w-20"
                                                    id={`score-${item._id}`}
                                                />
                                                <button
                                                    onClick={() => handleUpdate(item._id, document.getElementById(`score-${item._id}`).value)}
                                                    disabled={saving === item._id}
                                                    className="btn-primary text-xs px-3 py-2 flex items-center gap-1"
                                                >
                                                    {saving === item._id ? (
                                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <FloppyDisk className="w-3.5 h-3.5" />
                                                    )}
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 card p-5 bg-primary-50 border-primary-200">
                <div className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-primary-800">How Scores Work</h4>
                        <p className="text-xs text-primary-600 mt-1">
                            Each faculty member's Research Score is calculated by multiplying the number of items in each category by the point value you set here.
                            For publications and patents, the score depends on the sub-type (e.g., SCI vs Scopus, Granted vs Filed).
                            Rankings are automatically updated based on these scores.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreSettings;
