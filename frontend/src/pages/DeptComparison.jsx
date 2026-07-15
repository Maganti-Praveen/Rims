import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
    BookOpen, Lightbulb, Briefcase, Microphone, Certificate,
    ArrowsLeftRight, Users, ChartBar, TrendUp
} from '@phosphor-icons/react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';

const COLORS = { d1: '#1e3a8a', d2: '#f97316' };

const DeptComparison = () => {
    const [departments, setDepartments] = useState([]);
    const [dept1, setDept1] = useState('');
    const [dept2, setDept2] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        API.get('/users/departments').then(({ data }) => setDepartments(data.data || [])).catch(() => { });
    }, []);

    const handleCompare = async () => {
        if (!dept1 || !dept2) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const { data } = await API.get('/dashboard/compare-dept', { params: { dept1, dept2 } });
            setResult(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to compare departments');
        } finally {
            setLoading(false);
        }
    };

    const getRadarData = () => {
        if (!result) return [];
        return [
            { category: 'Publications', d1: result.dept1.publications, d2: result.dept2.publications },
            { category: 'Books & Chapters', d1: result.dept1.books || 0, d2: result.dept2.books || 0 },
            { category: 'Patents', d1: result.dept1.patents, d2: result.dept2.patents },
            { category: 'Workshops', d1: result.dept1.workshops, d2: result.dept2.workshops },
            { category: 'Seminars', d1: result.dept1.seminars, d2: result.dept2.seminars },
            { category: 'Certs', d1: result.dept1.certifications, d2: result.dept2.certifications },
        ];
    };

    const getBarData = () => {
        if (!result) return [];
        return [
            { name: 'Publications', [result.dept1.department]: result.dept1.publications, [result.dept2.department]: result.dept2.publications },
            { name: 'Books & Chapters', [result.dept1.department]: result.dept1.books || 0, [result.dept2.department]: result.dept2.books || 0 },
            { name: 'Patents', [result.dept1.department]: result.dept1.patents, [result.dept2.department]: result.dept2.patents },
            { name: 'Workshops', [result.dept1.department]: result.dept1.workshops, [result.dept2.department]: result.dept2.workshops },
            { name: 'Seminars', [result.dept1.department]: result.dept1.seminars, [result.dept2.department]: result.dept2.seminars },
            { name: 'Certifications', [result.dept1.department]: result.dept1.certifications, [result.dept2.department]: result.dept2.certifications },
        ];
    };

    const StatRow = ({ label, icon: Icon, v1, v2 }) => {
        const higher = v1 > v2 ? 'left' : v2 > v1 ? 'right' : 'tie';
        return (
            <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-dark-50 hover:bg-dark-100 transition-colors">
                <div className="flex items-center gap-2 w-28">
                    <Icon className="w-4 h-4 text-accent-500 shrink-0" />
                    <span className="text-xs font-medium text-dark-600">{label}</span>
                </div>
                <span className={`text-sm font-bold w-12 text-right ${higher === 'left' ? 'text-emerald-600' : higher === 'right' ? 'text-red-500' : 'text-dark-700'}`}>{v1}</span>
                <span className="text-dark-300 text-xs mx-2">vs</span>
                <span className={`text-sm font-bold w-12 text-left ${higher === 'right' ? 'text-emerald-600' : higher === 'left' ? 'text-red-500' : 'text-dark-700'}`}>{v2}</span>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-dark-900">Department Comparison</h1>
                <p className="text-dark-500 text-sm mt-1">Compare aggregate research output between two departments</p>
            </div>

            {/* Selector */}
            <div className="card p-5 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-dark-700 mb-1">Department 1</label>
                        <select value={dept1} onChange={(e) => setDept1(e.target.value)} className="select-field w-full">
                            <option value="">Select Department</option>
                            {departments.filter(d => d !== dept2).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center justify-center pb-1">
                        <ArrowsLeftRight className="w-5 h-5 text-accent-500" />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-dark-700 mb-1">Department 2</label>
                        <select value={dept2} onChange={(e) => setDept2(e.target.value)} className="select-field w-full">
                            <option value="">Select Department</option>
                            {departments.filter(d => d !== dept1).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleCompare}
                        disabled={!dept1 || !dept2 || loading}
                        className="btn-primary whitespace-nowrap"
                    >
                        {loading ? 'Comparing…' : 'Compare'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </div>

            {result && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[result.dept1, result.dept2].map((d, i) => (
                            <div key={d.department} className={`card p-5 border-l-4 ${i === 0 ? 'border-primary-600' : 'border-accent-500'}`}>
                                <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-1">
                                    {i === 0 ? 'Department 1' : 'Department 2'}
                                </p>
                                <h2 className={`text-lg font-bold mb-3 ${i === 0 ? 'text-primary-800' : 'text-accent-600'}`}>
                                    {d.department}
                                </h2>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <p className="text-2xl font-extrabold text-dark-900">{d.total}</p>
                                        <p className="text-xs text-dark-400 mt-0.5">Total Output</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-dark-900">{d.facultyCount}</p>
                                        <p className="text-xs text-dark-400 mt-0.5">Faculty</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-dark-900">{d.perFaculty}</p>
                                        <p className="text-xs text-dark-400 mt-0.5">Per Faculty</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts + Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Radar */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <ChartBar className="w-5 h-5 text-primary-600" />
                                <h2 className="text-base font-semibold text-primary-800">Research Radar</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={getRadarData()}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                                    <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Radar name={result.dept1.department} dataKey="d1" stroke={COLORS.d1} fill={COLORS.d1} fillOpacity={0.3} />
                                    <Radar name={result.dept2.department} dataKey="d2" stroke={COLORS.d2} fill={COLORS.d2} fillOpacity={0.3} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Bar Chart */}
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendUp className="w-5 h-5 text-accent-500" />
                                <h2 className="text-base font-semibold text-primary-800">Category Breakdown</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={getBarData()} margin={{ left: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey={result.dept1.department} fill={COLORS.d1} radius={[3, 3, 0, 0]} />
                                    <Bar dataKey={result.dept2.department} fill={COLORS.d2} radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed stat rows */}
                    <div className="card p-5">
                        <div className="flex justify-between items-center mb-4 px-3">
                            <p className="font-semibold text-primary-800">{result.dept1.department}</p>
                            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-dark-400" /><span className="text-xs text-dark-400">Category Totals</span></div>
                            <p className="font-semibold text-accent-600">{result.dept2.department}</p>
                        </div>
                        <div className="space-y-2">
                            <StatRow label="Publications" icon={BookOpen} v1={result.dept1.publications} v2={result.dept2.publications} />
                            <StatRow label="Books & Chapters" icon={BookOpen} v1={result.dept1.books || 0} v2={result.dept2.books || 0} />
                            <StatRow label="Patents" icon={Lightbulb} v1={result.dept1.patents} v2={result.dept2.patents} />
                            <StatRow label="Workshops" icon={Briefcase} v1={result.dept1.workshops} v2={result.dept2.workshops} />
                            <StatRow label="Seminars" icon={Microphone} v1={result.dept1.seminars} v2={result.dept2.seminars} />
                            <StatRow label="Certifications" icon={Certificate} v1={result.dept1.certifications} v2={result.dept2.certifications} />
                            <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-primary-50 border border-primary-200 mt-2">
                                <span className="text-sm font-semibold text-primary-800 flex-1">Total Output</span>
                                <span className={`text-lg font-bold w-12 text-right ${result.dept1.total > result.dept2.total ? 'text-emerald-600' : result.dept1.total < result.dept2.total ? 'text-red-500' : 'text-dark-700'}`}>{result.dept1.total}</span>
                                <span className="text-dark-300 text-xs mx-2">vs</span>
                                <span className={`text-lg font-bold w-12 text-left ${result.dept2.total > result.dept1.total ? 'text-emerald-600' : result.dept2.total < result.dept1.total ? 'text-red-500' : 'text-dark-700'}`}>{result.dept2.total}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DeptComparison;
