import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
    BookOpen, Lightbulb, Award, Briefcase, Mic,
    ArrowLeft, ExternalLink, Search, Filter
} from 'lucide-react';
import useAcademicYears from '../hooks/useAcademicYears';

const CATEGORIES = [
    { key: 'publications',   label: 'Publications',  icon: BookOpen,  grad: 'from-primary-500 to-primary-600', bg: 'bg-primary-50',  text: 'text-primary-600',  border: 'border-primary-200',  hover: 'hover:border-primary-300'  },
    { key: 'patents',        label: 'Patents',        icon: Lightbulb, grad: 'from-accent-500  to-accent-600',  bg: 'bg-amber-50',    text: 'text-amber-600',    border: 'border-amber-200',    hover: 'hover:border-amber-300'    },
    { key: 'workshops',      label: 'Workshops',      icon: Briefcase, grad: 'from-rose-500    to-rose-600',    bg: 'bg-rose-50',     text: 'text-rose-600',     border: 'border-rose-200',     hover: 'hover:border-rose-300'     },
    { key: 'seminars',       label: 'Seminars',       icon: Mic,       grad: 'from-violet-500  to-violet-600',  bg: 'bg-violet-50',   text: 'text-violet-600',   border: 'border-violet-200',   hover: 'hover:border-violet-300'   },
    { key: 'certifications', label: 'Certifications', icon: Award,     grad: 'from-sky-500     to-sky-600',     bg: 'bg-sky-50',      text: 'text-sky-600',      border: 'border-sky-200',      hover: 'hover:border-sky-300'      },
];

const MyResearch = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { academicYears } = useAcademicYears();

    const categoryParam = searchParams.get('category') || 'publications';
    const yearParam     = searchParams.get('year') || '';

    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch]   = useState('');

    const facultyId = user?._id;
    const category  = CATEGORIES.find(c => c.key === categoryParam) || CATEGORIES[0];

    useEffect(() => { if (facultyId) fetchData(); }, [facultyId, categoryParam, yearParam]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = yearParam ? { academicYear: yearParam } : {};
            let res;
            if      (categoryParam === 'publications')   res = await API.get(`/publications/faculty/${facultyId}`, { params });
            else if (categoryParam === 'patents')        res = await API.get(`/patents/faculty/${facultyId}`, { params });
            else if (categoryParam === 'workshops')      res = await API.get(`/workshops/faculty/${facultyId}`, { params });
            else if (categoryParam === 'seminars')       res = await API.get(`/seminars/faculty/${facultyId}`, { params });
            else if (categoryParam === 'certifications') res = await API.get(`/certifications/${facultyId}`);
            setData(res?.data?.data || []);
        } catch (err) {
            console.error(err); setData([]);
        } finally {
            setLoading(false);
        }
    };

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value); else next.delete(key);
        setSearchParams(next);
    };

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
    const filtered = data.filter(item => {
        const q = search.toLowerCase();
        return !q || JSON.stringify(item).toLowerCase().includes(q);
    });

    const DocLink = ({ url }) => url ? (
        <a href={url} target="_blank" rel="noreferrer"
           className="shrink-0 w-8 h-8 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 flex items-center justify-center transition-colors"
           title="View document">
            <ExternalLink className="w-3.5 h-3.5" />
        </a>
    ) : null;

    const renderRow = (item) => {
        const base = "flex items-start gap-4 p-4 rounded-xl bg-white border border-dark-100 hover:shadow-orange-sm hover:-translate-y-0.5 transition-all duration-200";
        switch (categoryParam) {
            case 'publications': return (
                <div key={item._id} className={base} data-aos="fade-up">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${category.grad} flex items-center justify-center shrink-0`}>
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark-900 text-sm leading-snug">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {item.journalName    && <span className="text-xs text-dark-500">{item.journalName}</span>}
                            {item.publicationType && <span className="badge-primary text-[10px]">{item.publicationType}</span>}
                            {item.indexedType     && <span className="badge-success text-[10px]">{item.indexedType}</span>}
                            {item.academicYear    && <span className="text-xs text-dark-400 font-medium">• {item.academicYear}</span>}
                        </div>
                        {(item.doi||item.issn) && (
                            <p className="text-xs text-dark-400 mt-1">
                                {item.doi && `DOI: ${item.doi}`}{item.doi && item.issn && '  •  '}{item.issn && `ISSN: ${item.issn}`}
                            </p>
                        )}
                    </div>
                    <DocLink url={item.fileUrl} />
                </div>
            );
            case 'patents': return (
                <div key={item._id} className={base} data-aos="fade-up">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${category.grad} flex items-center justify-center shrink-0`}>
                        <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark-900 text-sm">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {item.patentNumber && <span className="text-xs text-dark-500">#{item.patentNumber}</span>}
                            {item.status       && <span className="badge-warning text-[10px]">{item.status}</span>}
                            {item.academicYear && <span className="text-xs text-dark-400 font-medium">• {item.academicYear}</span>}
                        </div>
                        {item.filingDate && <p className="text-xs text-dark-400 mt-1">Filed: {fmt(item.filingDate)}</p>}
                    </div>
                    <DocLink url={item.fileUrl} />
                </div>
            );
            case 'workshops': return (
                <div key={item._id} className={base} data-aos="fade-up">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${category.grad} flex items-center justify-center shrink-0`}>
                        <Briefcase className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark-900 text-sm">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {item.institution && <span className="text-xs text-dark-500">{item.institution}</span>}
                            {item.role        && <span className="badge-primary text-[10px]">{item.role}</span>}
                            {item.academicYear && <span className="text-xs text-dark-400 font-medium">• {item.academicYear}</span>}
                        </div>
                        {item.date && <p className="text-xs text-dark-400 mt-1">{fmt(item.date)}</p>}
                    </div>
                    <DocLink url={item.fileUrl} />
                </div>
            );
            case 'seminars': return (
                <div key={item._id} className={base} data-aos="fade-up">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${category.grad} flex items-center justify-center shrink-0`}>
                        <Mic className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark-900 text-sm">{item.topic}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {item.institution && <span className="text-xs text-dark-500">{item.institution}</span>}
                            {item.role        && <span className="text-xs text-dark-400">• {item.role}</span>}
                            {item.academicYear && <span className="text-xs text-dark-400 font-medium">• {item.academicYear}</span>}
                        </div>
                        {item.date && <p className="text-xs text-dark-400 mt-1">{fmt(item.date)}</p>}
                    </div>
                    <DocLink url={item.fileUrl} />
                </div>
            );
            case 'certifications': return (
                <div key={item._id} className={base} data-aos="fade-up">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${category.grad} flex items-center justify-center shrink-0`}>
                        <Award className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark-900 text-sm">{item.title}</p>
                        {item.issuedBy && <p className="text-xs text-dark-500 mt-0.5">{item.issuedBy}</p>}
                        <p className="text-xs text-dark-400 mt-0.5">{fmt(item.date)}</p>
                    </div>
                    <DocLink url={item.fileUrl} />
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex items-center gap-2" data-aos="fade-down">
                <button
                    onClick={() => navigate('/home')}
                    className="p-2 rounded-xl hover:bg-primary-50 text-dark-400 hover:text-primary-600 border border-dark-200 hover:border-primary-200 transition-all shrink-0"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="min-w-0">
                    <h1 className="font-heading text-base sm:text-xl font-bold text-dark-900 truncate">My Research</h1>
                    <p className="text-xs text-dark-400 truncate">{user?.name?.split(' ').slice(0,2).join(' ')} · {user?.department}</p>
                </div>
            </div>

            {/* ── Category tabs — scrollable on mobile ── */}
            <div className="-mx-3 sm:mx-0" data-aos="fade-up" data-aos-delay="50">
                <div className="flex gap-2 overflow-x-auto px-3 sm:px-0 pb-1 sm:flex-wrap"
                     style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {CATEGORIES.map((cat) => {
                        const isActive = cat.key === categoryParam;
                        return (
                            <button
                                key={cat.key}
                                onClick={() => setParam('category', cat.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 whitespace-nowrap shrink-0
                                    ${isActive
                                        ? `bg-gradient-to-r ${cat.grad} text-white border-transparent shadow-sm`
                                        : `bg-white border-dark-200 text-dark-500 hover:border-primary-300 hover:text-primary-600`
                                    }`}
                            >
                                <cat.icon className="w-3.5 h-3.5" />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Filters row ── */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center" data-aos="fade-up" data-aos-delay="80">
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Search ${category.label.toLowerCase()}…`}
                        className="input-field pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {categoryParam !== 'certifications' && (
                        <div className="flex items-center gap-2 bg-white border border-dark-200 rounded-xl px-3 py-2 flex-1 sm:flex-none">
                            <Filter className="w-4 h-4 text-primary-500 shrink-0" />
                            <select
                                value={yearParam}
                                onChange={(e) => setParam('year', e.target.value)}
                                className="text-sm bg-transparent border-0 outline-none cursor-pointer text-dark-700 font-medium flex-1 min-w-[100px]"
                            >
                                <option value="">All Years</option>
                                {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    )}
                    <span className="text-xs text-dark-400 whitespace-nowrap">
                        <span className="font-bold text-dark-700">{filtered.length}</span> records
                        {yearParam && <span className="text-primary-500"> · {yearParam}</span>}
                    </span>
                </div>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                </div>
            ) : filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map(renderRow)}
                </div>
            ) : (
                <div className="card p-12 text-center" data-aos="fade-up">
                    <div className={`w-14 h-14 bg-gradient-to-br ${category.grad} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-orange-sm`}>
                        <category.icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-dark-700 font-semibold">No {category.label.toLowerCase()} found</p>
                    <p className="text-dark-400 text-sm mt-1">
                        {yearParam ? `No records for ${yearParam}. Try a different year.` : 'No records added yet.'}
                    </p>
                    <Link to="/my-profile" className="btn-primary mt-5 inline-flex items-center gap-2 text-sm">
                        Add from Profile
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyResearch;
