import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { Trophy, Crown, Medal, UploadSimple, Funnel, CalendarBlank, Star } from '@phosphor-icons/react';
import useAcademicYears from '../hooks/useAcademicYears';

const Rankings = () => {
    const [rankings, setRankings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState([]);
    const { academicYears } = useAcademicYears();

    // Filters
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [sortBy, setSortBy] = useState('score'); // 'score' (Research Score) or 'uploadCount' (Upload Count)

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        fetchRankings();
    }, [selectedDept, selectedYear, sortBy]);

    const fetchDepartments = async () => {
        try {
            const { data } = await API.get('/users/departments');
            setDepartments(data.data || []);
        } catch (err) {
            console.error('Failed to load departments', err);
        }
    };

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const params = { sortBy };
            if (selectedDept) params.department = selectedDept;
            if (selectedYear) params.academicYear = selectedYear;

            const { data } = await API.get('/scores/rankings', { params });
            setRankings(data.data);
        } catch (err) {
            console.error('Failed to load rankings', err);
        } finally {
            setLoading(false);
        }
    };

    // Helper for rendering default avatar if no profile pic
    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    // Extract podium members (top 3) and general table members (rem 4+)
    const podiumList = rankings?.collegeTop5 ? rankings.collegeTop5.slice(0, 3) : [];
    const tableList = rankings?.collegeTop5 ? rankings.collegeTop5.slice(3) : [];

    // Order podium as: 2nd place, 1st place, 3rd place for visual balance
    const visualPodium = [];
    if (podiumList[1]) visualPodium.push({ rank: 2, data: podiumList[1] });
    if (podiumList[0]) visualPodium.push({ rank: 1, data: podiumList[0] });
    if (podiumList[2]) visualPodium.push({ rank: 3, data: podiumList[2] });

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-orange-600" /> Institution Leaderboard
                    </h1>
                    <p className="text-dark-500 text-sm mt-1">Recognizing outstanding research and scholastic contributions</p>
                </div>

                {/* Criterion selector */}
                <div className="flex bg-primary-100/60 p-1 rounded-xl border border-primary-200">
                    <button
                        onClick={() => setSortBy('score')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5
                            ${sortBy === 'score'
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'text-dark-600 hover:text-orange-600'}`}
                    >
                        <Star className="w-3.5 h-3.5" />
                        Research Score
                    </button>
                    <button
                        onClick={() => setSortBy('uploadCount')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5
                            ${sortBy === 'uploadCount'
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'text-dark-600 hover:text-orange-600'}`}
                    >
                        <UploadSimple className="w-3.5 h-3.5" />
                        Upload Count
                    </button>
                </div>
            </div>

            {/* Filters panel */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-dark-600 uppercase tracking-wider">
                        <Funnel className="w-4 h-4 text-orange-500" /> Filters:
                    </div>

                    {/* Department filter */}
                    <div className="min-w-[180px]">
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="select-field text-xs py-1.5"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Academic Year filter */}
                    <div className="min-w-[180px]">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="select-field text-xs py-1.5"
                        >
                            <option value="">All Academic Years</option>
                            {academicYears.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Clear button */}
                    {(selectedDept || selectedYear) && (
                        <button
                            onClick={() => { setSelectedDept(''); setSelectedYear(''); }}
                            className="text-xs text-orange-600 hover:text-orange-800 font-semibold"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    {/* Visual Podium Skeleton */}
                    <div className="flex flex-col md:flex-row items-end justify-center gap-6 py-6 px-4 bg-dark-50/20 rounded-2xl border border-dark-100">
                        {/* 2nd place skeleton */}
                        <div className="flex flex-col items-center p-6 rounded-2xl border border-dark-200 bg-white w-full md:w-64 h-64 justify-between md:order-1">
                            <div className="w-16 h-16 rounded-full bg-dark-100" />
                            <div className="space-y-2 w-full flex flex-col items-center">
                                <div className="h-4 w-2/3 bg-dark-200/80 rounded" />
                                <div className="h-3 w-1/3 bg-dark-100 rounded" />
                            </div>
                            <div className="h-8 w-24 bg-dark-100 rounded-full" />
                        </div>
                        {/* 1st place skeleton */}
                        <div className="flex flex-col items-center p-6 rounded-2xl border border-dark-200 bg-white w-full md:w-64 h-72 justify-between md:order-2">
                            <div className="w-20 h-20 rounded-full bg-dark-100" />
                            <div className="space-y-2 w-full flex flex-col items-center">
                                <div className="h-4 w-2/3 bg-dark-200/80 rounded" />
                                <div className="h-3 w-1/3 bg-dark-100 rounded" />
                            </div>
                            <div className="h-8 w-24 bg-dark-100 rounded-full" />
                        </div>
                        {/* 3rd place skeleton */}
                        <div className="flex flex-col items-center p-6 rounded-2xl border border-dark-200 bg-white w-full md:w-64 h-56 justify-between md:order-3">
                            <div className="w-14 h-14 rounded-full bg-dark-100" />
                            <div className="space-y-2 w-full flex flex-col items-center">
                                <div className="h-4 w-2/3 bg-dark-200/80 rounded" />
                                <div className="h-3 w-1/3 bg-dark-100 rounded" />
                            </div>
                            <div className="h-8 w-24 bg-dark-100 rounded-full" />
                        </div>
                    </div>

                    {/* Table list skeleton */}
                    <div className="card overflow-hidden bg-white border border-dark-100">
                        <div className="px-5 py-4 border-b border-dark-100 bg-dark-50/50">
                            <div className="h-4 w-32 bg-dark-200/80 rounded" />
                        </div>
                        <div className="p-5 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-dark-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-dark-100 shrink-0" />
                                        <div className="space-y-2">
                                            <div className="h-3.5 w-32 bg-dark-200/80 rounded" />
                                            <div className="h-3 w-20 bg-dark-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-4 w-12 bg-dark-200/80 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Visual Podium for Top 3 */}
                    {podiumList.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-end justify-center gap-6 py-6 px-4 bg-gradient-to-b from-orange-50/20 to-transparent rounded-2xl border border-orange-100/50">
                            {visualPodium.map(({ rank, data }) => {
                                const rankColors = {
                                    1: { border: 'border-yellow-400', bg: 'bg-yellow-50/70', badgeBg: 'bg-yellow-500', icon: Crown, shadow: 'shadow-yellow-md', ring: 'ring-yellow-400' },
                                    2: { border: 'border-slate-300', bg: 'bg-slate-50/70', badgeBg: 'bg-slate-400', icon: Medal, shadow: 'shadow-slate-md', ring: 'ring-slate-300' },
                                    3: { border: 'border-amber-500/50', bg: 'bg-amber-50/70', badgeBg: 'bg-amber-600', icon: Medal, shadow: 'shadow-amber-md', ring: 'ring-amber-500' }
                                };
                                const config = rankColors[rank];
                                const IconComp = config.icon;

                                return (
                                    <div
                                        key={data._id}
                                        className={`flex flex-col items-center p-6 rounded-2xl border ${config.border} ${config.bg} ${config.shadow} w-full md:w-64 transition-transform hover:-translate-y-1 duration-300`}
                                        style={{ order: rank === 1 ? 2 : rank === 2 ? 1 : 3 }}
                                    >
                                        <div className="relative mb-4">
                                            {/* Avatar Frame */}
                                            <div className={`w-20 h-20 rounded-full overflow-hidden border-4 ${config.border} flex items-center justify-center bg-white shadow-inner`}>
                                                {data.profilePicture ? (
                                                    <img
                                                        src={`${API.defaults.baseURL.replace('/api', '')}${data.profilePicture}`}
                                                        alt={data.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="w-full h-full flex items-center justify-center font-bold text-dark-500 bg-primary-50 text-xl">
                                                    {getInitials(data.name)}
                                                </div>
                                            </div>

                                            {/* Rank Crown/Medal Badge */}
                                            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full ${config.badgeBg} text-white flex items-center justify-center shadow-md`}>
                                                <IconComp className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Name & Dept */}
                                        <Link to={`/faculty/${data._id}`} className="text-center group">
                                            <h3 className="font-bold text-dark-800 text-sm group-hover:text-orange-600 transition-colors truncate max-w-[200px]">
                                                {data.name}
                                            </h3>
                                            <p className="text-xs text-dark-500 mt-0.5">{data.department}</p>
                                        </Link>

                                        {/* Score tag */}
                                        <div className="mt-4 flex items-center gap-1.5 bg-white px-4 py-1.5 rounded-full border border-dark-100 shadow-sm">
                                            <Medal className="w-4 h-4 text-orange-500" />
                                            <span className="text-sm font-bold text-dark-800">
                                                {data.displayScore}
                                            </span>
                                            <span className="text-[10px] text-dark-400 font-medium">
                                                {sortBy === 'score' ? 'pts' : 'docs'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dark-100">
                            <p className="text-dark-500">No records found for the selected filter combination.</p>
                        </div>
                    )}

                    {/* Rankings Table (4th place onwards) */}
                    {tableList.length > 0 && (
                        <div className="card overflow-hidden">
                            <div className="px-5 py-4 border-b border-dark-100 bg-dark-50/50">
                                <h3 className="text-xs font-bold text-dark-600 uppercase tracking-wider">Remaining Ranks</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-dark-100 text-xs font-semibold text-dark-400 uppercase bg-dark-50/20">
                                            <th className="px-6 py-3.5 w-20 text-center">Rank</th>
                                            <th className="px-6 py-3.5">Faculty Member</th>
                                            <th className="px-6 py-3.5">Department</th>
                                            <th className="px-6 py-3.5 text-right">Research Score</th>
                                            <th className="px-6 py-3.5 text-right">Upload Count</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-50">
                                        {tableList.map((f, i) => (
                                            <tr key={f._id} className="hover:bg-primary-50/30 transition-colors">
                                                <td className="px-6 py-4 text-center font-bold text-dark-400">
                                                    #{i + 4}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                            {getInitials(f.name)}
                                                        </div>
                                                        <div>
                                                            <Link to={`/faculty/${f._id}`} className="font-semibold text-dark-800 hover:text-orange-600 transition-colors text-sm">
                                                                {f.name}
                                                            </Link>
                                                            <p className="text-xs text-dark-400 font-mono">{f.employeeId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-dark-600">
                                                    {f.department}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-sm font-bold ${sortBy === 'score' ? 'text-orange-600' : 'text-dark-600'}`}>
                                                        {f.score}
                                                    </span>
                                                    <span className="text-[10px] text-dark-400 ml-1">pts</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`text-sm font-bold ${sortBy === 'uploadCount' ? 'text-orange-600' : 'text-dark-600'}`}>
                                                        {f.uploadCount}
                                                    </span>
                                                    <span className="text-[10px] text-dark-400 ml-1">docs</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Rankings;
