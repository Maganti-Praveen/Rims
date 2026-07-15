import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import StatCard from '../components/dashboard/StatCard';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import {
    Users, BookOpen, Lightbulb, Briefcase, Microphone, Certificate,
    TrendUp, DownloadSimple, FileXls, Trophy, Funnel
} from '@phosphor-icons/react';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import useAcademicYears from '../hooks/useAcademicYears';
import RankingsPanel from '../components/dashboard/RankingsPanel';
import DomainChart from '../components/dashboard/DomainChart';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats]                   = useState(null);
    const [chartData, setChartData]           = useState([]);
    const [trendData, setTrendData]           = useState([]);
    const [topContributors, setTopContributors] = useState([]);
    const [departments, setDepartments]       = useState([]);
    const [filters, setFilters]               = useState({ department: '', academicYear: '' });
    const [loading, setLoading]               = useState(true);
    const [exporting, setExporting]           = useState(false);
    const { academicYears }                   = useAcademicYears();

    useEffect(() => {
        fetchData();
        if (user.role === 'admin') fetchDepartments();
    }, [filters]);

    const fetchDepartments = async () => {
        try { const { data } = await API.get('/users/departments'); setDepartments(data.data); }
        catch (err) { console.error(err); }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.department)  params.department  = filters.department;
            if (filters.academicYear) params.academicYear = filters.academicYear;
            const [statsRes, chartRes, trendRes, topRes] = await Promise.all([
                API.get('/dashboard/stats', { params }),
                API.get('/dashboard/chart', { params }),
                API.get('/dashboard/trends', { params }),
                API.get('/dashboard/top-contributors', { params }),
            ]);
            setStats(statsRes.data.data);
            setChartData(chartRes.data.data);
            setTrendData(trendRes.data.data);
            setTopContributors(topRes.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleExport = async (type) => {
        setExporting(true);
        try {
            const params = {};
            if (filters.department)   params.department   = filters.department;
            if (filters.academicYear) params.academicYear = filters.academicYear;
            const endpoint = type === 'naac' ? '/export/naac' : '/export/excel';
            const filename = type === 'naac' ? 'RCEE_NAAC_Report.xlsx' : 'RCEE_RIMS_Report.xlsx';
            const response = await API.get(endpoint, { params, responseType: 'blob' });
            const url  = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url; link.setAttribute('download', filename);
            document.body.appendChild(link); link.click();
            link.remove(); window.URL.revokeObjectURL(url);
        } catch (err) { console.error(err); }
        finally { setExporting(false); }
    };

    /* ── Chart.js line chart data ── */
    const lineData = {
        labels: trendData.map(d => d.year),
        datasets: [
            { label: 'Publications', data: trendData.map(d => d.publications || 0), borderColor: '#ea580c', backgroundColor: 'rgba(234,88,12,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#ea580c' },
            { label: 'Patents',      data: trendData.map(d => d.patents      || 0), borderColor: '#d97706', backgroundColor: 'rgba(217,119,6,0.08)',   fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#d97706' },
            { label: 'Workshops',    data: trendData.map(d => d.workshops    || 0), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)',  fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#10b981' },
            { label: 'Seminars',     data: trendData.map(d => d.seminars     || 0), borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.08)',  fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#7c3aed' },
        ],
    };
    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { family: 'Inter', size: 12, weight: '600' }, color: '#57534e', usePointStyle: true, padding: 16 } },
            tooltip: { backgroundColor: '#fff', titleColor: '#1c1917', bodyColor: '#78716c', borderColor: '#fed7aa', borderWidth: 1, cornerRadius: 12, padding: 12, titleFont: { family: 'Inter', weight: '700' }, bodyFont: { family: 'Inter', size: 12 } },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#78716c' }, border: { color: '#e7e5e4' } },
            y: { beginAtZero: true, grid: { color: '#f5f5f4' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#78716c', stepSize: 1 }, border: { dash: [4, 4], color: 'transparent' } },
        },
        animation: { duration: 800, easing: 'easeOutQuart' },
    };

    return (
        <div className="space-y-6">
            {/* ── Page header ── */}
            <div
                data-aos="fade-down"
                className="rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4"
                style={{ background: 'linear-gradient(135deg,#9a3412 0%,#c2410c 45%,#ea580c 80%,#fb923c 100%)' }}
            >
                <div>
                    <h1 className="font-heading text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-orange-200 text-sm mt-0.5">
                        {user.role === 'admin' ? 'Overview of all departments' : `${user.department} Department Overview`}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleExport('excel')} disabled={exporting}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm">
                        <DownloadSimple className="w-4 h-4" /> Export
                    </button>
                    <button onClick={() => handleExport('naac')} disabled={exporting}
                        className="flex items-center gap-2 bg-white text-primary-700 hover:bg-orange-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all">
                        <FileXls className="w-4 h-4" /> NAAC
                    </button>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="card p-4" data-aos="fade-up">
                <div className="flex flex-wrap gap-3 items-center">
                    <Funnel className="w-4 h-4 text-primary-500 shrink-0" />
                    {user.role === 'admin' && (
                        <select value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            className="select-field w-full sm:w-auto sm:min-w-[180px]">
                            <option value="">All Departments</option>
                            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    )}
                    <select value={filters.academicYear}
                        onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                        className="select-field w-full sm:w-auto sm:min-w-[160px]">
                        <option value="">All Years</option>
                        {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {(filters.department || filters.academicYear) && (
                        <button onClick={() => setFilters({ department: '', academicYear: '' })}
                            className="text-sm text-primary-600 hover:text-primary-800 font-semibold px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-lg transition-colors">
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-dark-400 text-sm">Loading dashboard…</p>
                </div>
            ) : (
                <>
                    {/* ── Stat cards ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                        <StatCard title="Faculty"       value={stats?.totalFaculty       || 0} icon={Users}     color="orange"  linkTo="/faculty"                 delay={0}   />
                        <StatCard title="Publications"  value={stats?.totalPublications  || 0} icon={BookOpen}  color="emerald" linkTo="/explore?tab=publications" delay={60}  />
                        <StatCard title="Patents"       value={stats?.totalPatents       || 0} icon={Lightbulb} color="amber"   linkTo="/explore?tab=patents"      delay={120} />
                        <StatCard title="Workshops"     value={stats?.totalWorkshops     || 0} icon={Briefcase}     color="rose"    linkTo="/explore?tab=workshops"    delay={180} />
                        <StatCard title="Seminars"      value={stats?.totalSeminars      || 0} icon={Microphone}       color="violet"  linkTo="/explore?tab=seminars"     delay={240} />
                        <StatCard title="Certifications" value={stats?.totalCertifications|| 0} icon={Certificate} color="sky"     linkTo="/explore?tab=certifications" delay={300} />
                    </div>

                    {/* ── Charts row ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Dept chart */}
                        <div className="card p-5" data-aos="fade-up">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                    <TrendUp className="w-3.5 h-3.5 text-white" />
                                </div>
                                <h2 className="font-semibold text-dark-900">Department-wise Output</h2>
                            </div>
                            <DepartmentChart data={chartData} />
                        </div>

                        {/* Trend chart */}
                        <div className="card p-5" data-aos="fade-up" data-aos-delay="80">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                                    <TrendUp className="w-3.5 h-3.5 text-white" />
                                </div>
                                <h2 className="font-semibold text-dark-900">Year-over-Year Trends</h2>
                            </div>
                            {trendData.length > 0 ? (
                                <div style={{ height: '280px' }}>
                                    <Line data={lineData} options={lineOptions} />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-dark-400 text-sm">No trend data available</div>
                            )}
                        </div>
                    </div>

                    {/* ── Top Contributors ── */}
                    <div className="card overflow-hidden" data-aos="fade-up">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-dark-100">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                                <Trophy className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h2 className="font-semibold text-dark-900">Top Contributors</h2>
                        </div>
                        {topContributors.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px]">
                                    <thead>
                                        <tr style={{ background: 'linear-gradient(135deg,#c2410c,#ea580c)' }}>
                                            {['Rank','Faculty Name','Department','Publications','Patents','Workshops','Seminars','Total'].map(h => (
                                                <th key={h} className={`py-3 px-4 font-semibold text-white ${['Publications','Patents','Workshops','Seminars','Total'].includes(h) ? 'text-center' : 'text-left'}`}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topContributors.map((c, i) => (
                                            <tr key={c._id} className="border-t border-dark-100 hover:bg-primary-50/40 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                                                        ${i === 0 ? 'bg-yellow-100 text-yellow-700'
                                                        : i === 1 ? 'bg-slate-100 text-slate-600'
                                                        : i === 2 ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-dark-50 text-dark-500'}`}>
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-semibold text-dark-900">{c.name}</td>
                                                <td className="py-3 px-4 text-dark-500">{c.department}</td>
                                                {['publications','patents','workshops','seminars'].map(k => (
                                                    <td key={k} className="py-3 px-4 text-center font-semibold text-primary-700">{c[k]}</td>
                                                ))}
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                                                        {c.total}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-dark-400 text-sm text-center py-8">No contributor data available</p>
                        )}
                    </div>

                    {/* ── Rankings & Domain ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <RankingsPanel />
                        <DomainChart />
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
