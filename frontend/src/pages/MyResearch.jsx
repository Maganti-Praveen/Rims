import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import {
    BookOpen, Lightbulb, Certificate, Briefcase, Microphone,
    ArrowLeft, ArrowSquareOut, MagnifyingGlass, Funnel, Plus
} from '@phosphor-icons/react';
import useAcademicYears from '../hooks/useAcademicYears';
import EmptyState from '../components/ui/EmptyState';

const ResearchSkeleton = () => (
    <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-dark-100">
                <div className="w-9 h-9 rounded-xl bg-dark-100/60 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-dark-200/50 rounded" />
                    <div className="h-3 w-1/3 bg-dark-200/40 rounded" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-dark-50 shrink-0" />
            </div>
        ))}
    </div>
);

const CATEGORIES = [
    { key: 'publications',   label: 'Publications',  icon: BookOpen,  grad: 'from-primary-500 to-primary-600', bg: 'bg-primary-50',  text: 'text-primary-600',  border: 'border-primary-200',  hover: 'hover:border-primary-300'  },
    { key: 'books',          label: 'Books / Chapters', icon: BookOpen,  grad: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', hover: 'hover:border-amber-300' },
    { key: 'patents',        label: 'Patents',        icon: Lightbulb, grad: 'from-accent-500  to-accent-600',  bg: 'bg-amber-50',    text: 'text-amber-600',    border: 'border-amber-200',    hover: 'hover:border-amber-300'    },
    { key: 'workshops',      label: 'Workshops',      icon: Briefcase, grad: 'from-rose-500    to-rose-600',    bg: 'bg-rose-50',     text: 'text-rose-600',     border: 'border-rose-200',     hover: 'hover:border-rose-300'     },
    { key: 'seminars',       label: 'Seminars',       icon: Microphone,       grad: 'from-violet-500  to-violet-600',  bg: 'bg-violet-50',   text: 'text-violet-600',   border: 'border-violet-200',   hover: 'hover:border-violet-300'   },
    { key: 'certifications', label: 'Certifications', icon: Certificate,     grad: 'from-sky-500     to-sky-600',     bg: 'bg-sky-50',      text: 'text-sky-600',      border: 'border-sky-200',      hover: 'hover:border-sky-300'      },
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

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const getModalType = () => {
        if (categoryParam === 'publications') return 'publication';
        if (categoryParam === 'books') return 'book';
        if (categoryParam === 'patents') return 'patent';
        if (categoryParam === 'workshops') return 'workshop';
        if (categoryParam === 'seminars') return 'seminar';
        if (categoryParam === 'certifications') return 'certification';
        return '';
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openAddModal = () => {
        setFormData({
            academicYear: yearParam || '',
        });
        setFile(null);
        setModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const modalType = getModalType();
        const endpoints = {
            certification: '/certifications',
            publication: '/publications',
            book: '/books',
            patent: '/patents',
            workshop: '/workshops',
            seminar: '/seminars',
        };
        try {
            const base = endpoints[modalType];
            const hasFile = ['certification', 'publication', 'book', 'patent', 'workshop'].includes(modalType);

            let payload;
            if (hasFile && file) {
                payload = new FormData();
                Object.keys(formData).forEach((key) => {
                    payload.append(key, formData[key]);
                });
                payload.append('file', file);
            } else {
                payload = { ...formData };
            }

            const config = hasFile && file ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

            await API.post(`${base}/${facultyId}`, payload, config);
            toast.success('Added successfully');
            setModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const renderModalForm = () => {
        const modalType = getModalType();
        switch (modalType) {
            case 'certification':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Title *</label>
                                <input name="title" value={formData.title || ''} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Issued By *</label>
                                <input name="issuedBy" value={formData.issuedBy || ''} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Certificate Type *</label>
                                <select name="certificateType" value={formData.certificateType || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select Type</option>
                                    <option value="NPTEL">NPTEL</option>
                                    <option value="SWAYAM">SWAYAM</option>
                                    <option value="Coursera">Coursera</option>
                                    <option value="Udemy">Udemy</option>
                                    <option value="edX">edX</option>
                                    <option value="AWS">AWS</option>
                                    <option value="Oracle">Oracle</option>
                                    <option value="Cisco">Cisco</option>
                                    <option value="Google">Google</option>
                                    <option value="Other">Other</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Certificate ID / Credential ID (Optional)</label>
                                <input name="credentialId" value={formData.credentialId || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Enroll Date</label>
                                <input name="enrollDate" type="date" value={formData.enrollDate?.split('T')[0] || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Issued Date</label>
                                <input name="issuedDate" type="date" value={formData.issuedDate?.split('T')[0] || ''} onChange={handleChange} className="input-field" /></div>
                        </div>
                        <div className="mt-4"><label className="block text-sm font-medium text-dark-700 mb-1">Upload Certificate (PDF/Image)</label>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="input-field" /></div>
                    </>
                );
            case 'publication':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-dark-700 mb-1">Title *</label>
                                <input name="title" value={formData.title || ''} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Journal Name</label>
                                <input name="journalName" value={formData.journalName || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">ISSN</label>
                                <input name="issn" value={formData.issn || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Volume</label>
                                <input name="volume" value={formData.volume || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">DOI</label>
                                <input name="doi" value={formData.doi || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Publication Type</label>
                                <select name="publicationType" value={formData.publicationType || ''} onChange={handleChange} className="select-field">
                                    <option value="">Select</option>
                                    <option value="Journal">Journal</option><option value="Conference">Conference</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Indexed In</label>
                                <select name="indexedType" value={formData.indexedType || ''} onChange={handleChange} className="select-field">
                                    <option value="">Select</option>
                                    <option value="SCI">SCI</option><option value="Scopus">Scopus</option>
                                    <option value="SEI">SEI</option><option value="UGC">UGC</option>
                                    <option value="IEEE Conference">IEEE Conference</option>
                                    <option value="Other">Other</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Conference Date</label>
                                <input 
                                    name="conferenceDate" 
                                    type="date" 
                                    value={formData.conferenceDate?.split('T')[0] || ''} 
                                    onChange={handleChange} 
                                    className="input-field" 
                                    disabled={formData.indexedType !== 'IEEE Conference'} 
                                    required={formData.indexedType === 'IEEE Conference'}
                                /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Academic Year *</label>
                                <select name="academicYear" value={formData.academicYear || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select</option>
                                    {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Publication Date</label>
                                <input name="publicationDate" type="date" value={formData.publicationDate?.split('T')[0] || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Research Domain</label>
                                <select name="researchDomain" value={formData.researchDomain || ''} onChange={handleChange} className="select-field">
                                    <option value="">Select Domain</option>
                                    {['Artificial Intelligence', 'Machine Learning', 'Internet of Things', 'Cybersecurity', 'Renewable Energy', 'Data Science', 'Cloud Computing', 'Blockchain', 'Robotics', 'Signal Processing', 'VLSI Design', 'Power Systems', 'Embedded Systems', 'Computer Networks', 'Image Processing', 'Natural Language Processing', 'Other'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select></div>
                        </div>
                        <div className="mt-4"><label className="block text-sm font-medium text-dark-700 mb-1">Upload Paper (PDF)</label>
                            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="input-field" /></div>
                    </>
                );
            case 'book':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-dark-700 mb-1">Title *</label>
                                <input name="title" value={formData.title || ''} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Publisher Name / Journal Name</label>
                                <input name="journalName" value={formData.journalName || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">ISBN / ISSN</label>
                                <input name="issn" value={formData.issn || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Volume</label>
                                <input name="volume" value={formData.volume || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">DOI</label>
                                <input name="doi" value={formData.doi || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Type *</label>
                                <select name="publicationType" value={formData.publicationType || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select</option>
                                    <option value="Book">Book</option>
                                    <option value="Chapter">Chapter</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Indexed In</label>
                                <select name="indexedType" value={formData.indexedType || ''} onChange={handleChange} className="select-field">
                                    <option value="">Select</option>
                                    <option value="SCI">SCI</option><option value="Scopus">Scopus</option>
                                    <option value="SEI">SEI</option><option value="UGC">UGC</option><option value="Other">Other</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Academic Year *</label>
                                <select name="academicYear" value={formData.academicYear || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select</option>
                                    {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Publication Date</label>
                                <input name="publicationDate" type="date" value={formData.publicationDate?.split('T')[0] || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Research Domain</label>
                                <select name="researchDomain" value={formData.researchDomain || ''} onChange={handleChange} className="select-field">
                                    <option value="">Select Domain</option>
                                    {['Artificial Intelligence', 'Machine Learning', 'Internet of Things', 'Cybersecurity', 'Renewable Energy', 'Data Science', 'Cloud Computing', 'Blockchain', 'Robotics', 'Signal Processing', 'VLSI Design', 'Power Systems', 'Embedded Systems', 'Computer Networks', 'Image Processing', 'Natural Language Processing', 'Other'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select></div>
                        </div>
                        <div className="mt-4"><label className="block text-sm font-medium text-dark-700 mb-1">Upload Document (PDF)</label>
                            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="input-field" /></div>
                    </>
                );
            case 'patent':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-dark-700 mb-1">Title *</label>
                                <input name="title" value={formData.title || ''} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Patent Number</label>
                                <input name="patentNumber" value={formData.patentNumber || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Status</label>
                                <select name="status" value={formData.status || ''} onChange={handleChange} className="select-field">
                                    <option value="">Select</option>
                                    <option value="Filed">Filed</option><option value="Published">Published</option>
                                    <option value="Granted">Granted</option><option value="Utility">Utility</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Filing Date</label>
                                <input name="filingDate" type="date" value={formData.filingDate?.split('T')[0] || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Grant Date</label>
                                <input name="grantDate" type="date" value={formData.grantDate?.split('T')[0] || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Academic Year *</label>
                                <select name="academicYear" value={formData.academicYear || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select</option>
                                    {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select></div>
                        </div>
                        <div className="mt-4"><label className="block text-sm font-medium text-dark-700 mb-1">Upload Document (PDF)</label>
                            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="input-field" /></div>
                    </>
                );
            case 'workshop':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-dark-700 mb-1">Title *</label>
                                <input name="title" value={formData.title || ''} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Institution</label>
                                <input name="institution" value={formData.institution || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Role</label>
                                <select name="role" value={formData.role || ''} onChange={handleChange} className="select-field">
                                    <option value="">Select</option>
                                    <option value="Organized">Organized</option><option value="Attended">Attended</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Mode *</label>
                                <select name="mode" value={formData.mode || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select Mode</option>
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">No. of Days *</label>
                                <select name="durationDays" value={formData.durationDays || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select Days</option>
                                    <option value="3 Days">3 Days</option>
                                    <option value="5 Days">5 Days</option>
                                    <option value="5+ Days">5+ Days</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Date</label>
                                <input name="date" type="date" value={formData.date?.split('T')[0] || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Academic Year *</label>
                                <select name="academicYear" value={formData.academicYear || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select</option>
                                    {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select></div>
                        </div>
                        <div className="mt-4"><label className="block text-sm font-medium text-dark-700 mb-1">Upload Certificate (PDF/Image)</label>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="input-field" /></div>
                    </>
                );
            case 'seminar':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-dark-700 mb-1">Topic *</label>
                                <input name="topic" value={formData.topic || ''} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Institution</label>
                                <input name="institution" value={formData.institution || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Role</label>
                                <input name="role" value={formData.role || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Mode *</label>
                                <select name="mode" value={formData.mode || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select Mode</option>
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Date</label>
                                <input name="date" type="date" value={formData.date?.split('T')[0] || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Academic Year *</label>
                                <select name="academicYear" value={formData.academicYear || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select</option>
                                    {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                                </select></div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    useEffect(() => { if (facultyId) fetchData(); }, [facultyId, categoryParam, yearParam]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = yearParam ? { academicYear: yearParam } : {};
            let res;
            if      (categoryParam === 'publications')   res = await API.get(`/publications/faculty/${facultyId}`, { params });
            else if (categoryParam === 'books')          res = await API.get(`/books/faculty/${facultyId}`, { params });
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
            <ArrowSquareOut className="w-3.5 h-3.5" />
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
                        {item.indexedType === 'IEEE Conference' && item.conferenceDate && (
                            <p className="text-xs text-amber-700 font-semibold mt-1">
                                📅 Conference Date: {fmt(item.conferenceDate)}
                            </p>
                        )}
                    </div>
                    <DocLink url={item.fileUrl} />
                </div>
            );
            case 'books': return (
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
                                {item.doi && `DOI: ${item.doi}`}{item.doi && item.issn && '  •  '}{item.issn && `ISBN/ISSN: ${item.issn}`}
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
                            {item.mode        && <span className="badge bg-green-50 text-green-700 border border-green-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">{item.mode}</span>}
                            {item.durationDays && <span className="text-xs text-dark-500">• {item.durationDays}</span>}
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
                        <Microphone className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark-900 text-sm">{item.topic}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {item.institution && <span className="text-xs text-dark-500">{item.institution}</span>}
                            {item.role        && <span className="text-xs text-dark-400">• {item.role}</span>}
                            {item.mode        && <span className="badge bg-green-50 text-green-700 border border-green-100 text-[10px] font-semibold px-2 py-0.5 rounded-full">{item.mode}</span>}
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
                        <Certificate className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark-900 text-sm">{item.title}</p>
                        {item.issuedBy && <p className="text-xs text-dark-500 mt-0.5">{item.issuedBy} • <span className="badge bg-primary-50 text-primary-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">{item.certificateType || 'Other'}</span></p>}
                        <div className="text-xs text-dark-400 mt-1 space-x-3">
                            {item.enrollDate && <span>Enrolled: {fmt(item.enrollDate)}</span>}
                            <span>Issued: {fmt(item.issuedDate || item.date)}</span>
                        </div>
                        {item.credentialId && <p className="text-xs text-dark-400 mt-0.5">Credential ID: {item.credentialId}</p>}
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
            <div className="flex items-center justify-between gap-2" data-aos="fade-down">
                <div className="flex items-center gap-2 min-w-0">
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
                <button
                    onClick={openAddModal}
                    className="btn-primary text-xs sm:text-sm flex items-center gap-1.5 px-3.5 py-2 rounded-xl shrink-0"
                >
                    <Plus className="w-4 h-4" /> Add Record
                </button>
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
                    <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
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
                            <Funnel className="w-4 h-4 text-primary-500 shrink-0" />
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
                <ResearchSkeleton />
            ) : filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map(renderRow)}
                </div>
             ) : (
                <EmptyState
                    title={`No ${category.label.toLowerCase()} found`}
                    description={yearParam ? `You don't have any research records registered for the Academic Year ${yearParam}.` : `You haven't uploaded any records under this category yet.`}
                    icon={category.icon}
                    actionLabel={`Add ${category.label.replace('Books / Chapters', 'Book/Chapter').replace(/s$/, '')}`}
                    onAction={openAddModal}
                />
            )}

            {/* CRUD Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`Add ${category.label.replace('Books / Chapters', 'Book/Chapter').replace(/s$/, '')}`}
            >
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    {renderModalForm()}
                    <div className="flex justify-end gap-2 pt-4 border-t border-dark-100">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MyResearch;
