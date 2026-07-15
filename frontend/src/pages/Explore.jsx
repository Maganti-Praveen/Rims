import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import getFileUrl from '../utils/getFileUrl';
import {
    BookOpen, Lightbulb, Briefcase, Microphone, MagnifyingGlass,
    ArrowRight, ArrowSquareOut, TrendUp, Funnel, CalendarBlank, X, Bell
} from '@phosphor-icons/react';
import useAcademicYears from '../hooks/useAcademicYears';
import SendNotificationModal from '../components/ui/SendNotificationModal';

const Explore = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [publications, setPublications] = useState([]);
    const [books, setBooks] = useState([]);
    const [patents, setPatents] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [seminars, setSeminars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'publications');
    const [yearFilter, setYearFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [pubTypeFilter, setPubTypeFilter] = useState('');
    const [indexedFilter, setIndexedFilter] = useState('');
    const [patentStatusFilter, setPatentStatusFilter] = useState('');
    const [workshopRoleFilter, setWorkshopRoleFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [notifyOpen, setNotifyOpen] = useState(false);
    const { academicYears } = useAcademicYears();

    useEffect(() => {
        fetchAll();
    }, [yearFilter]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const params = {};
            if (yearFilter) params.academicYear = yearFilter;

            const [pubRes, bookRes, patRes, wsRes, semRes] = await Promise.all([
                API.get('/publications', { params }),
                API.get('/books', { params }),
                API.get('/patents', { params }),
                API.get('/workshops', { params }),
                API.get('/seminars', { params }),
            ]);
            setPublications(pubRes.data.data);
            setBooks(bookRes.data.data);
            setPatents(patRes.data.data);
            setWorkshops(wsRes.data.data);
            setSeminars(semRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

    const filteredData = (items, key = 'title') => {
        let result = items;
        if (searchQuery) {
            result = result.filter(item =>
                (item[key] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.facultyId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return result;
    };

    const filteredPublications = () => {
        let data = filteredData(publications);
        if (pubTypeFilter) data = data.filter(p => p.publicationType === pubTypeFilter);
        if (indexedFilter) data = data.filter(p => p.indexedType === indexedFilter);
        return data;
    };

    const filteredBooks = () => {
        let data = filteredData(books);
        if (pubTypeFilter) data = data.filter(b => b.publicationType === pubTypeFilter);
        if (indexedFilter) data = data.filter(b => b.indexedType === indexedFilter);
        return data;
    };

    const filteredPatents = () => {
        let data = filteredData(patents);
        if (patentStatusFilter) data = data.filter(p => p.status === patentStatusFilter);
        return data;
    };

    const filteredWorkshops = () => {
        let data = filteredData(workshops);
        if (workshopRoleFilter) data = data.filter(w => w.role === workshopRoleFilter);
        return data;
    };

    const clearAllFilters = () => {
        setSearchQuery(''); setYearFilter('');
        setPubTypeFilter(''); setIndexedFilter('');
        setPatentStatusFilter(''); setWorkshopRoleFilter('');
    };

    const hasActiveFilters = searchQuery || yearFilter || pubTypeFilter || indexedFilter || patentStatusFilter || workshopRoleFilter;

    const tabs = [
        { id: 'publications', label: 'Publications', icon: BookOpen, count: publications.length, color: 'text-emerald-600 bg-emerald-50' },
        { id: 'books', label: 'Books / Chapters', icon: BookOpen, count: books.length, color: 'text-amber-600 bg-amber-50' },
        { id: 'patents', label: 'Patents', icon: Lightbulb, count: patents.length, color: 'text-amber-600 bg-amber-50' },
        { id: 'workshops', label: 'Workshops', icon: Briefcase, count: workshops.length, color: 'text-rose-600 bg-rose-50' },
        { id: 'seminars', label: 'Seminars', icon: Microphone, count: seminars.length, color: 'text-violet-600 bg-violet-50' },
    ];

    return (
        <div>
            {notifyOpen && (
                <SendNotificationModal onClose={() => setNotifyOpen(false)} />
            )}
            {/* Header */}
            <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-dark-900 flex items-center gap-2">
                            <TrendUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" /> Explore
                        </h1>
                        <p className="text-dark-500 text-xs sm:text-sm mt-1">Browse all research activities across the institution</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Send Notification — admin/HOD only */}
                        {(user?.role === 'admin' || user?.role === 'hod') && (
                            <button
                                onClick={() => setNotifyOpen(true)}
                                className="btn-primary flex items-center gap-1.5 text-sm"
                                title="Send notification to faculty"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="hidden sm:inline">Notify</span>
                            </button>
                        )}
                        <div className="relative flex-1 sm:flex-none">
                            <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="input-field pl-9 w-full sm:w-48 text-sm"
                            />
                        </div>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="select-field w-auto text-sm"
                        >
                            <option value="">All Years</option>
                            {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-secondary flex items-center gap-1.5 text-sm ${showFilters ? 'bg-primary-50 border-primary-300' : ''}`}
                        >
                            <Funnel className="w-4 h-4" />
                            <span className="hidden sm:inline">Filters</span>
                            {hasActiveFilters && <span className="w-2 h-2 bg-primary-600 rounded-full" />}
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-dark-100">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-dark-600 uppercase tracking-wider">Advanced Filters</p>
                            {hasActiveFilters && (
                                <button onClick={clearAllFilters} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                                    <X className="w-3 h-3" /> Clear All
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-[10px] font-medium text-dark-500 mb-1">Publication Type</label>
                                <select value={pubTypeFilter} onChange={(e) => setPubTypeFilter(e.target.value)} className="select-field text-sm">
                                    <option value="">All Types</option>
                                    <option value="Journal">Journal</option>
                                    <option value="Conference">Conference</option>
                                    <option value="Book">Book</option>
                                    <option value="Chapter">Chapter</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-dark-500 mb-1">Indexed In</label>
                                <select value={indexedFilter} onChange={(e) => setIndexedFilter(e.target.value)} className="select-field text-sm">
                                    <option value="">All Indexes</option>
                                    <option value="SCI">SCI</option>
                                    <option value="Scopus">Scopus</option>
                                    <option value="SEI">SEI</option>
                                    <option value="UGC">UGC</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-dark-500 mb-1">Patent Status</label>
                                <select value={patentStatusFilter} onChange={(e) => setPatentStatusFilter(e.target.value)} className="select-field text-sm">
                                    <option value="">All Statuses</option>
                                    <option value="Filed">Filed</option>
                                    <option value="Published">Published</option>
                                    <option value="Granted">Granted</option>
                                    <option value="Utility">Utility</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-dark-500 mb-1">Workshop Role</label>
                                <select value={workshopRoleFilter} onChange={(e) => setWorkshopRoleFilter(e.target.value)} className="select-field text-sm">
                                    <option value="">All Roles</option>
                                    <option value="Organized">Organized</option>
                                    <option value="Attended">Attended</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 -mx-1 px-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25'
                            : 'bg-white text-dark-600 hover:bg-dark-50 border border-dark-200'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-dark-100 text-dark-500'
                            }`}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Publications Tab */}
                    {activeTab === 'publications' && (
                        <div className="card">
                            <div className="p-4 border-b border-dark-100 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-emerald-600" />
                                <h2 className="font-semibold text-dark-900">Publications ({filteredPublications().length})</h2>
                            </div>
                            {filteredPublications().length > 0 ? (
                                <>
                                    {/* Desktop Table */}
                                    <div className="overflow-x-auto hidden md:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-primary-800">
                                                    <th className="text-left py-3 px-4 font-medium text-white">Title</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Faculty</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Journal</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Type</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Indexed</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Year</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">File</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPublications().map((pub) => (
                                                    <tr key={pub._id} className="border-t border-dark-100 hover:bg-accent-50">
                                                        <td className="py-3 px-4 font-medium text-dark-900 max-w-xs truncate">{pub.title}</td>
                                                        <td className="py-3 px-4 text-dark-600">
                                                            {pub.facultyId?.name || '-'}
                                                            <div className="text-xs text-dark-400">{pub.facultyId?.department}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-dark-600 max-w-[200px] truncate">{pub.journalName || '-'}</td>
                                                        <td className="py-3 px-4"><span className="badge-primary text-xs">{pub.publicationType || '-'}</span></td>
                                                        <td className="py-3 px-4"><span className="badge-success text-xs">{pub.indexedType || '-'}</span></td>
                                                        <td className="py-3 px-4 text-dark-500">{pub.academicYear || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            {pub.fileUrl ? (
                                                                <a href={getFileUrl(pub.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-dark-100">
                                        {filteredPublications().map((pub) => (
                                            <div key={pub._id} className="p-4">
                                                <p className="text-sm font-semibold text-dark-900 mb-1">{pub.title}</p>
                                                <p className="text-xs text-dark-500 mb-2">{pub.journalName || 'No journal'}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="text-dark-600">{pub.facultyId?.name}</span>
                                                    <span className="badge-primary">{pub.publicationType || '-'}</span>
                                                    <span className="badge-success">{pub.indexedType || '-'}</span>
                                                    <span className="text-dark-400">{pub.academicYear}</span>
                                                    {pub.fileUrl && (
                                                        <a href={getFileUrl(pub.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-primary-600 ml-auto">
                                                            <ArrowSquareOut className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-dark-400 text-sm text-center py-12">No publications found</p>
                            )}
                        </div>
                    )}

                    {/* Books & Chapters Tab */}
                    {activeTab === 'books' && (
                        <div className="card">
                            <div className="p-4 border-b border-dark-100 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-amber-600" />
                                <h2 className="font-semibold text-dark-900">Books & Chapters ({filteredBooks().length})</h2>
                            </div>
                            {filteredBooks().length > 0 ? (
                                <>
                                    {/* Desktop Table */}
                                    <div className="overflow-x-auto hidden md:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-primary-800">
                                                    <th className="text-left py-3 px-4 font-medium text-white">Title</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Faculty</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Publisher</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Type</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">ISBN / ISSN</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Year</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">File</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredBooks().map((book) => (
                                                    <tr key={book._id} className="border-t border-dark-100 hover:bg-accent-50">
                                                        <td className="py-3 px-4 font-medium text-dark-900 max-w-xs truncate">{book.title}</td>
                                                        <td className="py-3 px-4 text-dark-600">
                                                            {book.facultyId?.name || '-'}
                                                            <div className="text-xs text-dark-400">{book.facultyId?.department}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-dark-600 max-w-[200px] truncate">{book.journalName || '-'}</td>
                                                        <td className="py-3 px-4"><span className="badge-primary text-xs">{book.publicationType || '-'}</span></td>
                                                        <td className="py-3 px-4"><span className="badge-success text-xs">{book.issn || '-'}</span></td>
                                                        <td className="py-3 px-4 text-dark-500">{book.academicYear || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            {book.fileUrl ? (
                                                                <a href={getFileUrl(book.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                                                                    <ArrowSquareOut className="w-4 h-4" />
                                                                </a>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Mobile Cards */}
                                    <div className="md:hidden divide-y divide-dark-100">
                                        {filteredBooks().map((book) => (
                                            <div key={book._id} className="p-4">
                                                <p className="text-sm font-semibold text-dark-900 mb-1">{book.title}</p>
                                                <p className="text-xs text-dark-500 mb-2">{book.journalName || 'No publisher'}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="text-dark-600">{book.facultyId?.name}</span>
                                                    <span className="badge-primary">{book.publicationType || '-'}</span>
                                                    <span className="badge-success">{book.issn || '-'}</span>
                                                    <span className="text-dark-400">{book.academicYear}</span>
                                                    {book.fileUrl && (
                                                        <a href={getFileUrl(book.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-primary-600 ml-auto">
                                                            <ArrowSquareOut className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-dark-400 text-sm text-center py-12">No books or chapters found</p>
                            )}
                        </div>
                    )}

                    {/* Patents Tab */}
                    {activeTab === 'patents' && (
                        <div className="card">
                            <div className="p-4 border-b border-dark-100 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-600" />
                                <h2 className="font-semibold text-dark-900">Patents ({filteredPatents().length})</h2>
                            </div>
                            {filteredPatents().length > 0 ? (
                                <>
                                    <div className="overflow-x-auto hidden md:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-primary-800">
                                                    <th className="text-left py-3 px-4 font-medium text-white">Title</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Faculty</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Patent No.</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Status</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Filing Date</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Year</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">File</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPatents().map((pat) => (
                                                    <tr key={pat._id} className="border-t border-dark-100 hover:bg-accent-50">
                                                        <td className="py-3 px-4 font-medium text-dark-900 max-w-xs truncate">{pat.title}</td>
                                                        <td className="py-3 px-4 text-dark-600">
                                                            {pat.facultyId?.name || '-'}
                                                            <div className="text-xs text-dark-400">{pat.facultyId?.department}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-dark-600">{pat.patentNumber || '-'}</td>
                                                        <td className="py-3 px-4"><span className="badge-warning text-xs">{pat.status || '-'}</span></td>
                                                        <td className="py-3 px-4 text-dark-500">{formatDate(pat.filingDate)}</td>
                                                        <td className="py-3 px-4 text-dark-500">{pat.academicYear || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            {pat.fileUrl ? (
                                                                <a href={getFileUrl(pat.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                                                                    <ArrowSquareOut className="w-4 h-4" />
                                                                </a>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="md:hidden divide-y divide-dark-100">
                                        {filteredPatents().map((pat) => (
                                            <div key={pat._id} className="p-4">
                                                <p className="text-sm font-semibold text-dark-900 mb-1">{pat.title}</p>
                                                <p className="text-xs text-dark-500 mb-2">{pat.patentNumber || 'No patent number'}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="text-dark-600">{pat.facultyId?.name}</span>
                                                    <span className="badge-warning">{pat.status || '-'}</span>
                                                    <span className="text-dark-400">{pat.academicYear}</span>
                                                    {pat.fileUrl && (
                                                        <a href={getFileUrl(pat.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-primary-600 ml-auto">
                                                            <ArrowSquareOut className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-dark-400 text-sm text-center py-12">No patents found</p>
                            )}
                        </div>
                    )}

                    {/* Workshops Tab */}
                    {activeTab === 'workshops' && (
                        <div className="card">
                            <div className="p-4 border-b border-dark-100 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-rose-600" />
                                <h2 className="font-semibold text-dark-900">Workshops ({filteredWorkshops().length})</h2>
                            </div>
                            {filteredWorkshops().length > 0 ? (
                                <>
                                    <div className="overflow-x-auto hidden md:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-primary-800">
                                                    <th className="text-left py-3 px-4 font-medium text-white">Title</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Faculty</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Institution</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Role</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Mode</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Duration</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Date</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Year</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Cert</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredWorkshops().map((ws) => (
                                                    <tr key={ws._id} className="border-t border-dark-100 hover:bg-accent-50">
                                                        <td className="py-3 px-4 font-medium text-dark-900 max-w-xs truncate">{ws.title}</td>
                                                        <td className="py-3 px-4 text-dark-600">
                                                            {ws.facultyId?.name || '-'}
                                                            <div className="text-xs text-dark-400">{ws.facultyId?.department}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-dark-600 max-w-[200px] truncate">{ws.institution || '-'}</td>
                                                        <td className="py-3 px-4"><span className="badge-primary text-xs">{ws.role || '-'}</span></td>
                                                        <td className="py-3 px-4"><span className="badge bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{ws.mode || '-'}</span></td>
                                                        <td className="py-3 px-4 text-dark-500">{ws.durationDays || '-'}</td>
                                                        <td className="py-3 px-4 text-dark-500">{formatDate(ws.date)}</td>
                                                        <td className="py-3 px-4 text-dark-500">{ws.academicYear || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            {ws.certificateUrl ? (
                                                                <a href={getFileUrl(ws.certificateUrl)} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                                                                    <ArrowSquareOut className="w-4 h-4" />
                                                                </a>
                                                            ) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="md:hidden divide-y divide-dark-100">
                                        {filteredWorkshops().map((ws) => (
                                            <div key={ws._id} className="p-4">
                                                <p className="text-sm font-semibold text-dark-900 mb-1">{ws.title}</p>
                                                <p className="text-xs text-dark-500 mb-2">{ws.institution || 'No institution'}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="text-dark-600">{ws.facultyId?.name}</span>
                                                    <span className="badge-primary">{ws.role || '-'}</span>
                                                    <span className="badge bg-green-50 text-green-700 font-semibold px-1.5 py-0.5 rounded">{ws.mode || '-'}</span>
                                                    {ws.durationDays && <span className="text-dark-500">Days: {ws.durationDays}</span>}
                                                    <span className="text-dark-400">{ws.academicYear}</span>
                                                    {ws.certificateUrl && (
                                                        <a href={getFileUrl(ws.certificateUrl)} target="_blank" rel="noopener noreferrer" className="text-primary-600 ml-auto">
                                                            <ArrowSquareOut className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-dark-400 text-sm text-center py-12">No workshops found</p>
                            )}
                        </div>
                    )}

                    {/* Seminars Tab */}
                    {activeTab === 'seminars' && (
                        <div className="card">
                            <div className="p-4 border-b border-dark-100 flex items-center gap-2">
                                <Microphone className="w-5 h-5 text-violet-600" />
                                <h2 className="font-semibold text-dark-900">Seminars ({filteredData(seminars, 'topic').length})</h2>
                            </div>
                            {filteredData(seminars, 'topic').length > 0 ? (
                                <>
                                    <div className="overflow-x-auto hidden md:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-primary-800">
                                                    <th className="text-left py-3 px-4 font-medium text-white">Topic</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Faculty</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Institution</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Role</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Mode</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Date</th>
                                                    <th className="text-left py-3 px-4 font-medium text-white">Year</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredData(seminars, 'topic').map((sem) => (
                                                    <tr key={sem._id} className="border-t border-dark-100 hover:bg-accent-50">
                                                        <td className="py-3 px-4 font-medium text-dark-900 max-w-xs truncate">{sem.topic}</td>
                                                        <td className="py-3 px-4 text-dark-600">
                                                            {sem.facultyId?.name || '-'}
                                                            <div className="text-xs text-dark-400">{sem.facultyId?.department}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-dark-600 max-w-[200px] truncate">{sem.institution || '-'}</td>
                                                        <td className="py-3 px-4 text-dark-500">{sem.role || '-'}</td>
                                                        <td className="py-3 px-4"><span className="badge bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">{sem.mode || '-'}</span></td>
                                                        <td className="py-3 px-4 text-dark-500">{formatDate(sem.date)}</td>
                                                        <td className="py-3 px-4 text-dark-500">{sem.academicYear || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="md:hidden divide-y divide-dark-100">
                                        {filteredData(seminars, 'topic').map((sem) => (
                                            <div key={sem._id} className="p-4">
                                                <p className="text-sm font-semibold text-dark-900 mb-1">{sem.topic}</p>
                                                <p className="text-xs text-dark-500 mb-2">{sem.institution || 'No institution'}</p>
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="text-dark-600">{sem.facultyId?.name}</span>
                                                    <span className="text-dark-400">{sem.role || '-'}</span>
                                                    <span className="badge bg-green-50 text-green-700 font-semibold px-1.5 py-0.5 rounded">{sem.mode || '-'}</span>
                                                    <span className="text-dark-400">{sem.academicYear}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-dark-400 text-sm text-center py-12">No seminars found</p>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Explore;
