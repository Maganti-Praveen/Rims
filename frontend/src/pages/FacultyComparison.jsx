import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Users, BookOpen, Lightbulb, Briefcase, Microphone, Certificate, ArrowsLeftRight } from '@phosphor-icons/react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const FacultyComparison = () => {
    const { user } = useAuth();
    const [facultyList, setFacultyList] = useState([]);
    const [selected1, setSelected1] = useState('');
    const [selected2, setSelected2] = useState('');
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFacultyList();
    }, []);

    const fetchFacultyList = async () => {
        try {
            const { data } = await API.get('/users', { params: { role: 'faculty,hod' } });
            setFacultyList(data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCompare = async () => {
        if (!selected1 || !selected2) return;
        setLoading(true);
        try {
            const { data } = await API.get('/dashboard/compare', { params: { faculty1: selected1, faculty2: selected2 } });
            setComparison(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRadarData = () => {
        if (!comparison) return [];
        return [
            { category: 'Publications', faculty1: comparison.faculty1.publications, faculty2: comparison.faculty2.publications },
            { category: 'Books & Chapters', faculty1: comparison.faculty1.books || 0, faculty2: comparison.faculty2.books || 0 },
            { category: 'Patents', faculty1: comparison.faculty1.patents, faculty2: comparison.faculty2.patents },
            { category: 'Workshops', faculty1: comparison.faculty1.workshops, faculty2: comparison.faculty2.workshops },
            { category: 'Seminars', faculty1: comparison.faculty1.seminars, faculty2: comparison.faculty2.seminars },
            { category: 'Certifications', faculty1: comparison.faculty1.certifications, faculty2: comparison.faculty2.certifications },
        ];
    };

    const StatBlock = ({ label, val1, val2, icon: Icon }) => (
        <div className="flex items-center justify-between p-3 rounded-lg bg-dark-50">
            <div className="flex items-center gap-2 text-sm text-dark-600">
                <Icon className="w-4 h-4 text-accent-500" />
                {label}
            </div>
            <div className="flex items-center gap-6">
                <span className={`text-sm font-bold ${val1 > val2 ? 'text-emerald-600' : val1 < val2 ? 'text-red-500' : 'text-dark-700'}`}>{val1}</span>
                <span className="text-dark-300 text-xs">vs</span>
                <span className={`text-sm font-bold ${val2 > val1 ? 'text-emerald-600' : val2 < val1 ? 'text-red-500' : 'text-dark-700'}`}>{val2}</span>
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-dark-900">Faculty Comparison</h1>
                <p className="text-dark-500 text-sm mt-1">Compare research output of two faculty members side by side</p>
            </div>

            {/* Selection */}
            <div className="card p-5 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-dark-700 mb-1">Faculty 1</label>
                        <select value={selected1} onChange={(e) => setSelected1(e.target.value)} className="select-field w-full">
                            <option value="">Select Faculty</option>
                            {facultyList.filter((f) => f._id !== selected2).map((f) => (
                                <option key={f._id} value={f._id}>{f.name} — {f.department}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-center pb-1">
                        <ArrowsLeftRight className="w-5 h-5 text-accent-500" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-dark-700 mb-1">Faculty 2</label>
                        <select value={selected2} onChange={(e) => setSelected2(e.target.value)} className="select-field w-full">
                            <option value="">Select Faculty</option>
                            {facultyList.filter((f) => f._id !== selected1).map((f) => (
                                <option key={f._id} value={f._id}>{f.name} — {f.department}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleCompare} disabled={!selected1 || !selected2 || loading} className="btn-primary">
                        {loading ? 'Comparing...' : 'Compare'}
                    </button>
                </div>
            </div>

            {comparison && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="card p-5">
                        <h2 className="text-lg font-semibold text-primary-800 mb-4">Research Output Radar</h2>
                        <ResponsiveContainer width="100%" height={350}>
                            <RadarChart data={getRadarData()}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Radar name={comparison.faculty1.name} dataKey="faculty1" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.3} />
                                <Radar name={comparison.faculty2.name} dataKey="faculty2" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                <Legend wrapperStyle={{ fontSize: '13px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Side-by-side Stats */}
                    <div className="card p-5">
                        <h2 className="text-lg font-semibold text-primary-800 mb-4">Detailed Comparison</h2>
                        <div className="flex justify-between mb-4 px-3">
                            <div className="text-center">
                                <p className="font-semibold text-primary-800">{comparison.faculty1.name}</p>
                                <p className="text-xs text-dark-400">{comparison.faculty1.department}</p>
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-accent-600">{comparison.faculty2.name}</p>
                                <p className="text-xs text-dark-400">{comparison.faculty2.department}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <StatBlock label="Publications" val1={comparison.faculty1.publications} val2={comparison.faculty2.publications} icon={BookOpen} />
                            <StatBlock label="Books & Chapters" val1={comparison.faculty1.books || 0} val2={comparison.faculty2.books || 0} icon={BookOpen} />
                            <StatBlock label="Patents" val1={comparison.faculty1.patents} val2={comparison.faculty2.patents} icon={Lightbulb} />
                            <StatBlock label="Workshops" val1={comparison.faculty1.workshops} val2={comparison.faculty2.workshops} icon={Briefcase} />
                            <StatBlock label="Seminars" val1={comparison.faculty1.seminars} val2={comparison.faculty2.seminars} icon={Microphone} />
                            <StatBlock label="Certifications" val1={comparison.faculty1.certifications} val2={comparison.faculty2.certifications} icon={Certificate} />
                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50 border border-primary-200">
                                <span className="text-sm font-semibold text-primary-800">Total Output</span>
                                <div className="flex items-center gap-6">
                                    <span className="text-lg font-bold text-primary-800">{comparison.faculty1.total}</span>
                                    <span className="text-dark-300 text-xs">vs</span>
                                    <span className="text-lg font-bold text-accent-600">{comparison.faculty2.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyComparison;
