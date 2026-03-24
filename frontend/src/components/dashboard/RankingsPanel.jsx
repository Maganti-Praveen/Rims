import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { Trophy, Crown, Medal, Upload } from 'lucide-react';

const RANK_STYLE = [
    { icon: Crown,  color: 'text-yellow-500', bg: 'bg-yellow-50 border border-yellow-200'  },
    { icon: Medal,  color: 'text-slate-400',  bg: 'bg-slate-50 border border-slate-200'    },
    { icon: Medal,  color: 'text-amber-700',  bg: 'bg-amber-50 border border-amber-200'    },
];

const RankingsPanel = () => {
    const [rankings, setRankings] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [activeTab, setActiveTab] = useState('college');

    useEffect(() => {
        API.get('/scores/rankings')
            .then(({ data }) => setRankings(data.data))
            .catch(() => setRankings(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="card p-6 animate-pulse h-72" />;
    if (!rankings) return null;

    const departments = Object.keys(rankings.departmentTop3 || {});

    return (
        <div className="card p-6" data-aos="fade-up" data-aos-delay="100">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-dark-800">Rankings</h3>
                <span className="ml-auto text-xs text-dark-400 font-medium">by total uploads</span>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-1 mb-4 bg-primary-50 border border-primary-100 rounded-xl p-1">
                {[{ id: 'college', label: 'College Top 5' }, { id: 'department', label: 'Dept Top 3' }].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200
                            ${activeTab === tab.id
                                ? 'bg-white text-primary-700 shadow-sm border border-primary-100'
                                : 'text-dark-500 hover:text-primary-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* College top 5 */}
            {activeTab === 'college' && (
                <div className="space-y-1.5">
                    {rankings.collegeTop5.map((f, i) => {
                        const rs = RANK_STYLE[i];
                        const RIcon = rs?.icon;
                        return (
                            <Link key={f._id} to={`/faculty/${f._id}`}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary-50 transition-all group">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${rs ? rs.bg : 'bg-dark-50 border border-dark-200'}`}>
                                    {rs ? <RIcon className={`w-4 h-4 ${rs.color}`} /> : (
                                        <span className="text-xs font-bold text-dark-400">#{i + 1}</span>
                                    )}
                                </div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                    ${i === 0 ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                              : 'bg-primary-100 text-primary-700'}`}>
                                    {f.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-dark-800 truncate group-hover:text-primary-700 transition-colors">{f.name}</p>
                                    <p className="text-xs text-dark-400">{f.department}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-primary-50 border border-primary-100 px-2 py-1 rounded-lg">
                                    <Upload className="w-3 h-3 text-primary-500" />
                                    <span className="text-xs font-bold text-primary-700">{f.score}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Dept top 3 */}
            {activeTab === 'department' && (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {departments.map(dept => (
                        <div key={dept}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{dept}</span>
                                <div className="flex-1 h-px bg-primary-100" />
                            </div>
                            <div className="space-y-1">
                                {rankings.departmentTop3[dept].map((f, i) => (
                                    <Link key={f._id} to={`/faculty/${f._id}`}
                                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-primary-50 transition-all group">
                                        <span className={`text-xs font-bold w-5 ${i === 0 ? 'text-primary-500' : 'text-dark-300'}`}>#{i + 1}</span>
                                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                                            {f.name?.charAt(0)}
                                        </div>
                                        <span className="text-sm text-dark-700 group-hover:text-primary-700 flex-1 truncate transition-colors">{f.name}</span>
                                        <span className="text-xs font-bold text-dark-500">{f.score}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RankingsPanel;
