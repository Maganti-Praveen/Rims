import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import {
    BookOpen, Lightbulb, Certificate, Briefcase, Microphone,
    ArrowRight, FileText, TrendUp, Star, GraduationCap
} from '@phosphor-icons/react';
import ReminderBanner from '../components/ui/ReminderBanner';
import useAcademicYears from '../hooks/useAcademicYears';

const STATS_CONFIG = [
    { key: 'publications',   label: 'Pubs',    icon: BookOpen,  grad: 'from-primary-500 to-primary-600' },
    { key: 'books',          label: 'Books',   icon: BookOpen,  grad: 'from-amber-500   to-amber-600'   },
    { key: 'patents',        label: 'Patents',  icon: Lightbulb, grad: 'from-accent-500  to-accent-600'  },
    { key: 'workshops',      label: 'Workshops',icon: Briefcase, grad: 'from-rose-500    to-rose-600'    },
    { key: 'seminars',       label: 'Seminars', icon: Microphone,       grad: 'from-violet-500  to-violet-600'  },
    { key: 'certifications', label: 'Certs',    icon: Certificate,     grad: 'from-sky-500     to-sky-600'     },
];

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { academicYears } = useAcademicYears();

    const [yearFilter, setYearFilter] = useState('');
    const [allPubs, setAllPubs]       = useState([]);
    const [allBooks, setAllBooks]     = useState([]);
    const [allPatents, setAllPatents] = useState([]);
    const [allWorkshops, setAllWorkshops] = useState([]);
    const [allSeminars, setAllSeminars]   = useState([]);
    const [allCerts, setAllCerts]         = useState([]);
    const [education, setEducation]       = useState([]);
    const [researchScore, setResearchScore] = useState(0);
    const [loading, setLoading]           = useState(true);

    const facultyId = user?._id;

    useEffect(() => { if (facultyId) fetchAll(); }, [facultyId, yearFilter]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const params = yearFilter ? { academicYear: yearFilter } : {};
            const [pubRes, bookRes, patRes, wsRes, semRes, certRes, eduRes, scoreRes] = await Promise.all([
                API.get(`/publications/faculty/${facultyId}`, { params }),
                API.get(`/books/faculty/${facultyId}`, { params }),
                API.get(`/patents/faculty/${facultyId}`, { params }),
                API.get(`/workshops/faculty/${facultyId}`, { params }),
                API.get(`/seminars/faculty/${facultyId}`, { params }),
                API.get(`/certifications/${facultyId}`),
                API.get(`/education/${facultyId}`),
                API.get(`/scores/faculty/${facultyId}`),
            ]);
            setAllPubs(pubRes.data.data);
            setAllBooks(bookRes.data.data);
            setAllPatents(patRes.data.data);
            setAllWorkshops(wsRes.data.data);
            setAllSeminars(semRes.data.data);
            setAllCerts(certRes.data.data);
            setEducation(eduRes.data.data);
            setResearchScore(scoreRes.data.data.score || 0);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const highestEdu   = education.find((e) => e.isHighest);
    const researchUrl  = (cat) => `/my-research?category=${cat}${yearFilter ? `&year=${encodeURIComponent(yearFilter)}` : ''}`;

    const counts = {
        publications: allPubs.length, books: allBooks.length, patents: allPatents.length,
        workshops: allWorkshops.length, seminars: allSeminars.length,
        certifications: allCerts.length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-dark-400 text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <ReminderBanner />

            {/* ── Welcome hero ── */}
            <div
                data-aos="fade-down"
                className="rounded-2xl overflow-hidden shadow-orange-md"
                style={{ background: 'linear-gradient(135deg,#9a3412 0%,#c2410c 40%,#ea580c 75%,#fb923c 100%)' }}
            >
                {/* Top section */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-orange-200 text-xs font-medium mb-0.5">Research Dashboard</p>
                        <h1 className="font-heading text-lg sm:text-2xl font-bold text-white leading-tight truncate">
                            Welcome, {user?.name?.split(' ')[0]}!
                        </h1>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="text-orange-200 text-xs">{user?.department}</span>
                            {user?.designation && (
                                <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-semibold rounded-full border border-white/25">
                                    {user.designation}
                                </span>
                            )}
                            {highestEdu && (
                                <span className="px-2 py-0.5 bg-white/15 text-orange-100 text-[10px] font-medium rounded-full border border-white/20 hidden sm:inline-flex items-center">
                                    <GraduationCap className="w-3.5 h-3.5 text-orange-100 mr-1" /> {highestEdu.degree}
                                </span>
                            )}
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-100 text-[10px] font-bold rounded-full border border-yellow-400/30 flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 text-yellow-400" weight="fill" /> Research Score: {researchScore}
                            </span>
                        </div>
                    </div>
                    <Link
                        to="/my-profile"
                        className="shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/30
                            text-white px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all whitespace-nowrap"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Profile</span>
                    </Link>
                </div>

                {/* Stats strip — scrollable on mobile, 6-col on desktop */}
                <div className="border-t border-white/15 overflow-x-auto">
                    <div className="flex min-w-max sm:min-w-0 sm:grid sm:grid-cols-6">
                        {STATS_CONFIG.map((s) => (
                            <button
                                key={s.key}
                                onClick={() => navigate(researchUrl(s.key))}
                                className="flex flex-col items-center py-2.5 px-5 sm:px-3
                                    hover:bg-white/10 transition-colors group
                                    border-r border-white/10 last:border-r-0 shrink-0 sm:shrink"
                            >
                                <span className="font-heading text-base sm:text-lg font-bold text-white group-hover:scale-110 transition-transform">
                                    {counts[s.key]}
                                </span>
                                <span className="text-[10px] text-orange-200 font-medium mt-0.5">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Year filter + stat cards ── */}
            <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <TrendUp className="w-4 h-4 text-primary-500 shrink-0" />
                        <h2 className="text-xs sm:text-sm font-bold text-dark-700 uppercase tracking-wider truncate">
                            Research Activity
                            {yearFilter && <span className="text-primary-500 normal-case font-semibold"> — {yearFilter}</span>}
                        </h2>
                    </div>
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="select-field text-xs sm:text-sm py-1.5 h-auto w-auto min-w-[110px] max-w-[140px]"
                    >
                        <option value="">All Years</option>
                        {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {/* Stat cards — 3 cols mobile, 5 cols desktop */}
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    {STATS_CONFIG.map((s, i) => (
                        <button
                            key={s.key}
                            onClick={() => navigate(researchUrl(s.key))}
                            data-aos="fade-up"
                            data-aos-delay={i * 60}
                            className="group bg-white rounded-xl sm:rounded-2xl border border-dark-100 p-3 sm:p-4 text-left
                                hover:shadow-orange-md hover:-translate-y-1 hover:border-primary-200 transition-all duration-300"
                        >
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${s.grad}
                                flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                                <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <p className="font-heading text-xl sm:text-2xl font-bold text-dark-900">{counts[s.key]}</p>
                            <p className="text-[10px] sm:text-xs text-dark-400 mt-0.5 leading-tight">{s.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Recent sections grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

                {/* Publications */}
                <RecentCard
                    title="Recent Publications" viewUrl={researchUrl('publications')}
                    icon={BookOpen} grad="from-primary-500 to-primary-600" iconBg="bg-primary-100" iconText="text-primary-600"
                    hoverBg="hover:bg-primary-50/40" empty={`No publications${yearFilter ? ` for ${yearFilter}` : ' yet'}`}
                    items={allPubs.slice(0, 5)}
                    renderItem={(pub) => ({
                        title: pub.title,
                        sub: [pub.journalName, pub.publicationType && <span key="pt" className="badge-primary text-[10px]">{pub.publicationType}</span>, pub.indexedType && <span key="it" className="badge-success text-[10px]">{pub.indexedType}</span>].filter(Boolean),
                        date: pub.academicYear || fmt(pub.publicationDate),
                    })}
                />

                {/* Patents */}
                <RecentCard
                    title="Recent Patents" viewUrl={researchUrl('patents')}
                    icon={Lightbulb} grad="from-accent-500 to-accent-600" iconBg="bg-amber-100" iconText="text-amber-600"
                    hoverBg="hover:bg-amber-50/40" empty={`No patents${yearFilter ? ` for ${yearFilter}` : ' yet'}`}
                    items={allPatents.slice(0, 5)}
                    renderItem={(pat) => ({
                        title: pat.title,
                        sub: [pat.patentNumber && `#${pat.patentNumber}`, pat.status && <span key="s" className="badge-warning text-[10px]">{pat.status}</span>].filter(Boolean),
                        date: pat.academicYear || fmt(pat.filingDate),
                    })}
                />

                {/* Workshops & Seminars */}
                <div data-aos="fade-up" data-aos-delay="150" className="card overflow-hidden">
                    <SectionHeader title="Workshops & Seminars" viewUrl={researchUrl('workshops')}
                        icon={Briefcase} grad="from-rose-500 to-rose-600" />
                    <div className="divide-y divide-dark-50">
                        {(allWorkshops.length + allSeminars.length) > 0 ? (
                            <>
                                {allWorkshops.slice(0, 3).map((ws) => (
                                    <div key={ws._id} className="flex items-start gap-3 px-4 py-3 hover:bg-rose-50/40 transition-colors">
                                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Briefcase className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-dark-900 truncate">{ws.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wide">Workshop</span>
                                                {ws.role && <span className="badge-primary text-[10px]">{ws.role}</span>}
                                            </div>
                                            <p className="text-[11px] text-dark-400">{ws.academicYear || fmt(ws.date)}</p>
                                        </div>
                                    </div>
                                ))}
                                {allSeminars.slice(0, 3).map((sem) => (
                                    <div key={sem._id} className="flex items-start gap-3 px-4 py-3 hover:bg-violet-50/40 transition-colors">
                                        <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                                            <Microphone className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-dark-900 truncate">{sem.topic}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-semibold text-violet-500 uppercase tracking-wide">Seminar</span>
                                            </div>
                                            <p className="text-[11px] text-dark-400">{sem.academicYear || fmt(sem.date)}</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="text-dark-400 text-sm text-center py-8">
                                No workshops or seminars{yearFilter ? ` for ${yearFilter}` : ' yet'}
                            </p>
                        )}
                    </div>
                </div>

                {/* Certifications */}
                <RecentCard
                    title="Certifications" viewUrl={researchUrl('certifications')}
                    icon={Certificate} grad="from-sky-500 to-sky-600" iconBg="bg-sky-100" iconText="text-sky-600"
                    hoverBg="hover:bg-sky-50/40" empty="No certifications yet"
                    items={allCerts.slice(0, 5)}
                    renderItem={(cert) => ({
                        title: cert.title,
                        sub: [cert.issuedBy].filter(Boolean),
                        date: fmt(cert.date),
                    })}
                />
            </div>
        </div>
    );
};

/* ── Reusable recent card ── */
const SectionHeader = ({ title, viewUrl, icon: Icon, grad }) => (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-dark-100">
        <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="font-semibold text-dark-900 text-sm">{title}</h2>
        </div>
        <Link to={viewUrl} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-semibold">
            View All <ArrowRight className="w-3 h-3" />
        </Link>
    </div>
);

const RecentCard = ({ title, viewUrl, icon: Icon, grad, iconBg, iconText, hoverBg, items, renderItem, empty, aosDelay }) => (
    <div data-aos="fade-up" data-aos-delay={aosDelay} className="card overflow-hidden">
        <SectionHeader title={title} viewUrl={viewUrl} icon={Icon} grad={grad} />
        <div className="divide-y divide-dark-50">
            {items.length > 0 ? items.map((item, idx) => {
                const { title: t, sub, date } = renderItem(item);
                return (
                    <div key={item._id || idx} className={`flex items-start gap-3 px-4 py-3 ${hoverBg} transition-colors`}>
                        <div className={`w-7 h-7 rounded-lg ${iconBg} ${iconText} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-900 truncate">{t}</p>
                            {sub?.length > 0 && (
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                    {sub.map((s, i) => typeof s === 'string'
                                        ? <span key={i} className="text-xs text-dark-400 truncate max-w-[100px]">{s}</span>
                                        : s
                                    )}
                                </div>
                            )}
                            {date && <p className="text-[11px] text-dark-400 mt-0.5">{date}</p>}
                        </div>
                    </div>
                );
            }) : (
                <p className="text-dark-400 text-sm text-center py-8">{empty}</p>
            )}
        </div>
    </div>
);

export default Home;
