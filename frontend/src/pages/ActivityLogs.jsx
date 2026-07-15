import { useState, useEffect } from 'react';
import API from '../api/axios';
import { ClipboardText } from '@phosphor-icons/react';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({
        action: '',
        category: '',
        startDate: '',
        endDate: '',
        page: 1,
    });

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = { page: filters.page, limit: 20 };
            if (filters.action) params.action = filters.action;
            if (filters.category) params.category = filters.category;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const { data } = await API.get('/activity-logs', { params });
            setLogs(data.data);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                total: data.total,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const actionColors = {
        Add: 'badge-success',
        Update: 'badge-warning',
        Delete: 'badge-danger',
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <ClipboardText className="w-6 h-6 text-primary-600" />
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">Activity Logs</h1>
                    <p className="text-dark-500 text-sm">{pagination.total} total activities recorded</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
                        className="select-field w-auto min-w-[140px]"
                    >
                        <option value="">All Actions</option>
                        <option value="Add">Add</option>
                        <option value="Update">Update</option>
                        <option value="Delete">Delete</option>
                    </select>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                        className="select-field w-auto min-w-[160px]"
                    >
                        <option value="">All Categories</option>
                        <option value="User">User</option>
                        <option value="Education">Education</option>
                        <option value="Certification">Certification</option>
                        <option value="Publication">Publication</option>
                        <option value="Patent">Patent</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                    </select>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
                        className="input-field w-auto"
                        placeholder="From"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
                        className="input-field w-auto"
                        placeholder="To"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-dark-50 border-b border-dark-100">
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">User</th>
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Action</th>
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Category</th>
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Details</th>
                                <th className="text-left px-5 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-dark-400">Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-dark-400">No activity logs found</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log._id} className="border-b border-dark-100 hover:bg-dark-50/50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div>
                                                <p className="font-medium text-dark-900">{log.userId?.name || 'Unknown'}</p>
                                                <p className="text-xs text-dark-400 capitalize">{log.userId?.role}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={actionColors[log.action] || 'badge-primary'}>{log.action}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-dark-600">{log.category}</td>
                                        <td className="px-5 py-3.5 text-dark-500 max-w-[250px] truncate">{log.details}</td>
                                        <td className="px-5 py-3.5 text-dark-500 text-xs">
                                            {new Date(log.timestamp).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-dark-100">
                        <p className="text-sm text-dark-500">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                disabled={filters.page <= 1}
                                className="btn-secondary text-xs px-3 py-1.5"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                disabled={filters.page >= pagination.totalPages}
                                className="btn-secondary text-xs px-3 py-1.5"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
