import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { MagnifyingGlass, X, BookOpen, Lightbulb, Briefcase, Microphone, Users } from '@phosphor-icons/react';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (value) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setResults(null);
            setOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await API.get('/search', { params: { q: value } });
                setResults(data.data);
                setOpen(true);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleResultClick = (type, item) => {
        setOpen(false);
        setQuery('');
        setResults(null);
        if (type === 'faculty') {
            navigate(`/faculty/${item._id}`);
        } else {
            navigate('/explore');
        }
    };

    const totalResults = results ? (results.publications?.length || 0) + (results.patents?.length || 0) + (results.workshops?.length || 0) + (results.seminars?.length || 0) + (results.faculty?.length || 0) : 0;

    const iconMap = {
        publications: BookOpen,
        patents: Lightbulb,
        workshops: Briefcase,
        seminars: Microphone,
        faculty: Users,
    };

    const labelMap = {
        publications: 'Publications',
        patents: 'Patents',
        workshops: 'Workshops',
        seminars: 'Seminars',
        faculty: 'Faculty',
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative w-40 xs:w-48 sm:w-64">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-8 py-1.5 bg-dark-50 border border-dark-200 rounded-xl text-xs sm:text-sm text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200"
                />
                {query && (
                    <button onClick={() => { setQuery(''); setResults(null); setOpen(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className="w-3.5 h-3.5 text-dark-400 hover:text-dark-600" />
                    </button>
                )}
            </div>

            {open && results && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-dark-100 z-50 max-h-96 overflow-y-auto" style={{ minWidth: '280px' }}>
                    {totalResults === 0 ? (
                        <div className="p-4 text-center text-dark-400 text-sm">No results for "{query}"</div>
                    ) : (
                        <>
                            {['publications', 'patents', 'workshops', 'seminars', 'faculty'].map((type) => {
                                const items = results[type];
                                if (!items || items.length === 0) return null;
                                const Icon = iconMap[type];
                                return (
                                    <div key={type}>
                                        <div className="px-3 py-2 bg-dark-50 text-xs font-semibold text-dark-500 uppercase tracking-wide flex items-center gap-1.5">
                                            <Icon className="w-3.5 h-3.5" /> {labelMap[type]} ({items.length})
                                        </div>
                                        {items.map((item) => (
                                            <button
                                                key={item._id}
                                                onClick={() => handleResultClick(type, item)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-accent-50 border-b border-dark-50 last:border-0"
                                            >
                                                <p className="text-sm font-medium text-dark-900 truncate">{item.title || item.topic || item.name}</p>
                                                <p className="text-xs text-dark-400 mt-0.5">
                                                    {type === 'faculty' ? item.department : (item.facultyId?.name || '')}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </>
                    )}
                    {loading && (
                        <div className="p-3 text-center">
                            <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
