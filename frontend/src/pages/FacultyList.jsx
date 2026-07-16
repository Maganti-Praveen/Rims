import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { MagnifyingGlass, DownloadSimple, Eye, Trash, CheckSquare, Square, XCircle, Key } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ResetPasswordModal from '../components/ui/ResetPasswordModal';

const FacultyList = () => {
    const { user } = useAuth();
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({ department: '', search: '', role: '' });
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState([]);
    const [deleting, setDeleting] = useState(false);

    // Confirm Dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });
    // Reset password modal state
    const [resetTarget, setResetTarget] = useState(null);

    const canDelete = user.role === 'admin' || user.role === 'hod';

    useEffect(() => {
        fetchFaculty();
        if (user.role === 'admin') fetchDepartments();
    }, [filters]);

    const fetchDepartments = async () => {
        try {
            const { data } = await API.get('/users/departments');
            setDepartments(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.department) params.department = filters.department;
            if (filters.search) params.search = filters.search;
            if (filters.role) params.role = filters.role;

            const { data } = await API.get('/users', { params });
            setFaculty(data.data);
            setSelected([]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const params = {};
            if (filters.department) params.department = filters.department;

            const response = await API.get('/export/excel', {
                params,
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'rdms_report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Excel report downloaded');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const handleDelete = (id) => {
        const target = faculty.find(f => f._id === id);
        setConfirmConfig({
            title: 'Delete Faculty Account',
            message: `Are you sure you want to delete "${target?.name}"? All their publications, patents, workshops, seminars, education, and certifications will be permanently removed.`,
            onConfirm: async () => {
                setDeleting(true);
                try {
                    await API.delete(`/users/${id}`);
                    toast.success('User and all related data deleted');
                    setConfirmOpen(false);
                    fetchFaculty();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Delete failed');
                } finally {
                    setDeleting(false);
                }
            }
        });
        setConfirmOpen(true);
    };

    const handleBulkDelete = () => {
        setConfirmConfig({
            title: `Delete ${selected.length} Faculty Account(s)`,
            message: `Are you sure you want to delete ${selected.length} selected user(s)? All their publications, patents, workshops, seminars, education, and certifications will be permanently removed. This cannot be undone.`,
            onConfirm: async () => {
                setDeleting(true);
                try {
                    await API.post('/users/bulk-delete', { ids: selected });
                    toast.success(`${selected.length} user(s) and all related data deleted`);
                    setSelected([]);
                    setConfirmOpen(false);
                    fetchFaculty();
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Bulk delete failed');
                } finally {
                    setDeleting(false);
                }
            }
        });
        setConfirmOpen(true);
    };

    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        const selectable = faculty.filter(f => f.role !== 'admin');
        if (selected.length === selectable.length) {
            setSelected([]);
        } else {
            setSelected(selectable.map(f => f._id));
        }
    };

    const isAllSelected = faculty.length > 0 && faculty.filter(f => f.role !== 'admin').length > 0 && selected.length === faculty.filter(f => f.role !== 'admin').length;
    const isSomeSelected = selected.length > 0;

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">Faculty</h1>
                    <p className="text-dark-500 text-sm mt-1">{faculty.length} members found</p>
                </div>
                <button onClick={handleExportExcel} className="btn-secondary flex items-center gap-2">
                    <DownloadSimple className="w-4 h-4" /> Export Excel
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input-field pl-9"
                        />
                    </div>
                    {user.role === 'admin' && (
                        <select
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                            className="select-field w-auto min-w-[180px]"
                        >
                            <option value="">All Departments</option>
                            {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    )}
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="select-field w-auto min-w-[140px]"
                    >
                        <option value="">All Roles</option>
                        <option value="faculty">Faculty</option>
                        <option value="hod">HOD</option>
                    </select>
                </div>
            </div>

            {/* Selection Action Bar */}
            {isSomeSelected && (
                <div className="card p-3 mb-4 bg-red-50 border-red-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-red-800">
                            {selected.length} selected
                        </span>
                        <button
                            onClick={() => setSelected([])}
                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                            <XCircle className="w-3.5 h-3.5" /> Clear
                        </button>
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Trash className="w-4 h-4" />
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Desktop Table */}
            <div className="card overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-dark-50 border-b border-dark-100">
                                {canDelete && (
                                    <th className="px-4 py-3 w-10">
                                        <button onClick={toggleSelectAll} className="text-dark-400 hover:text-primary-600 transition-colors">
                                            {isAllSelected ? (
                                                <CheckSquare className="w-5 h-5 text-primary-600" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </th>
                                )}
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Name</th>
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Employee ID</th>
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Department</th>
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Role</th>
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Email</th>
                                <th className="text-right px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={canDelete ? 7 : 6} className="text-center py-12 text-dark-400">Loading...</td>
                                </tr>
                            ) : faculty.length === 0 ? (
                                <tr>
                                    <td colSpan={canDelete ? 7 : 6} className="text-center py-12 text-dark-400">No faculty found</td>
                                </tr>
                            ) : (
                                faculty.map((f) => (
                                    <tr
                                        key={f._id}
                                        className={`border-b border-dark-100 hover:bg-dark-50/50 transition-colors ${selected.includes(f._id) ? 'bg-primary-50/50' : ''}`}
                                    >
                                        {canDelete && (
                                            <td className="px-4 py-3.5">
                                                {f.role !== 'admin' && (
                                                    <button onClick={() => toggleSelect(f._id)} className="text-dark-400 hover:text-primary-600 transition-colors">
                                                        {selected.includes(f._id) ? (
                                                            <CheckSquare className="w-5 h-5 text-primary-600" />
                                                        ) : (
                                                            <Square className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs">
                                                    {f.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-dark-900">{f.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-dark-600">{f.employeeId}</td>
                                        <td className="px-5 py-3.5 text-dark-600">{f.department}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={`badge ${f.role === 'hod' ? 'badge-warning' : 'badge-primary'}`}>
                                                {f.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-dark-600">{f.email}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    to={`/faculty/${f._id}`}
                                                    className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {canDelete && (
                                                    <button
                                                        onClick={() => setResetTarget(f)}
                                                        className="p-2 text-dark-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title="Reset Password"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canDelete && f.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleDelete(f._id)}
                                                        className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="card p-8 text-center text-dark-400">Loading...</div>
                ) : faculty.length === 0 ? (
                    <div className="card p-8 text-center text-dark-400">No faculty found</div>
                ) : (
                    <>
                        {canDelete && faculty.length > 0 && (
                            <button
                                onClick={toggleSelectAll}
                                className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-2 mb-1"
                            >
                                {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                {isAllSelected ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                        {faculty.map((f) => (
                            <div
                                key={f._id}
                                className={`card p-4 transition-colors ${selected.includes(f._id) ? 'ring-2 ring-primary-400 bg-primary-50/30' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    {canDelete && f.role !== 'admin' && (
                                        <button onClick={() => toggleSelect(f._id)} className="mt-0.5 text-dark-400 hover:text-primary-600 flex-shrink-0">
                                            {selected.includes(f._id) ? (
                                                <CheckSquare className="w-5 h-5 text-primary-600" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    )}
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                        {f.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-dark-900 text-sm truncate">{f.name}</h3>
                                            <span className={`badge text-[10px] ${f.role === 'hod' ? 'badge-warning' : 'badge-primary'}`}>
                                                {f.role.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-dark-500 truncate">{f.email}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-dark-400">
                                            <span>{f.employeeId}</span>
                                            <span>•</span>
                                            <span className="badge-primary badge text-[10px]">{f.department}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Link
                                            to={`/faculty/${f._id}`}
                                            className="p-2 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                         {canDelete && (
                                             <button
                                                 onClick={() => setResetTarget(f)}
                                                 className="p-2 text-dark-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                 title="Reset Password"
                                             >
                                                 <Key className="w-5 h-5" />
                                             </button>
                                         )}
                                         {canDelete && f.role !== 'admin' && (
                                             <button
                                                 onClick={() => handleDelete(f._id)}
                                                 className="p-2 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                             >
                                                 <Trash className="w-5 h-5" />
                                             </button>
                                         )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setDeleting(false); }}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                loading={deleting}
            />

            {/* Reset Password Modal */}
            {resetTarget && (
                <ResetPasswordModal
                    user={resetTarget}
                    onClose={() => setResetTarget(null)}
                />
            )}
        </div>
    );
};

export default FacultyList;
