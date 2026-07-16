import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Buildings, Plus, UserCheck, Pencil, Check } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

const SchoolManagement = () => {
    const [schools, setSchools] = useState([]);
    const [allDepartments, setAllDepartments] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    
    const [formData, setFormData] = useState({ name: '', code: '', deanId: '', selectedDeptIds: [] });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [schoolRes, deptRes, userRes] = await Promise.all([
                API.get('/schools'),
                API.get('/departments'),
                API.get('/users'),
            ]);
            setSchools(schoolRes.data.data || []);
            setAllDepartments(deptRes.data.data || []);
            setFacultyList(userRes.data.data || []);
        } catch (err) {
            toast.error('Failed to load school management data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/schools', {
                name: formData.name,
                code: formData.code,
                deanId: formData.deanId || null,
            });
            // If department checkboxes were selected during create, update mappings
            if (formData.selectedDeptIds.length > 0) {
                await API.put(`/schools/${data.data._id}`, {
                    departmentIds: formData.selectedDeptIds,
                });
            }
            toast.success('School created successfully!');
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating school');
        }
    };

    const handleEditClick = (school) => {
        setEditingSchool(school);
        const mappedDeptIds = school.departments ? school.departments.map(d => d._id) : [];
        setFormData({
            name: school.name,
            code: school.code,
            deanId: school.deanId?._id || '',
            selectedDeptIds: mappedDeptIds,
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editingSchool) return;
        try {
            await API.put(`/schools/${editingSchool._id}`, {
                name: formData.name,
                code: formData.code,
                deanId: formData.deanId || null,
                departmentIds: formData.selectedDeptIds,
            });
            toast.success('School details & department mappings updated!');
            setEditingSchool(null);
            resetForm();
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating school');
        }
    };

    const toggleDeptSelection = (deptId) => {
        setFormData(prev => {
            const exists = prev.selectedDeptIds.includes(deptId);
            return {
                ...prev,
                selectedDeptIds: exists
                    ? prev.selectedDeptIds.filter(id => id !== deptId)
                    : [...prev.selectedDeptIds, deptId],
            };
        });
    };

    const resetForm = () => {
        setFormData({ name: '', code: '', deanId: '', selectedDeptIds: [] });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Buildings className="w-7 h-7 text-primary-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900">School Management</h1>
                        <p className="text-dark-500 text-sm">Manage Schools, assign Deans & select department access</p>
                    </div>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add New School
                </button>
            </div>

            {loading ? (
                <div className="card p-12 text-center text-dark-400">Loading schools...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {schools.map((school) => (
                        <div key={school._id} className="card p-6 flex flex-col justify-between relative group hover:border-primary-200 transition-colors">
                            <div>
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="badge-primary mb-1.5 inline-block">{school.code}</span>
                                        <h2 className="text-xl font-bold text-dark-900">{school.name}</h2>
                                    </div>
                                    <button
                                        onClick={() => handleEditClick(school)}
                                        className="btn-secondary text-xs flex items-center gap-1 py-1.5 px-3 border-primary-200 text-primary-700 hover:bg-primary-50"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Edit Card
                                    </button>
                                </div>

                                {/* Dean Info Box */}
                                <div className="bg-dark-50 p-4 rounded-xl mb-4 border border-dark-100">
                                    <p className="text-xs text-dark-400 font-semibold uppercase tracking-wider mb-2">Dean of {school.code}</p>
                                    {school.deanId ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-dark-900">{school.deanId.name}</p>
                                                <p className="text-xs text-dark-500">{school.deanId.email} • {school.deanId.employeeId}</p>
                                            </div>
                                            <UserCheck className="w-5 h-5 text-emerald-600" />
                                        </div>
                                    ) : (
                                        <p className="text-xs text-amber-600 italic">No Dean assigned currently</p>
                                    )}
                                </div>

                                {/* Accessible Departments List */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs text-dark-400 font-semibold uppercase tracking-wider">Assigned Department Access</p>
                                        <span className="text-xs text-dark-500 font-medium">{school.departments?.length || 0} Departments</span>
                                    </div>
                                    {school.departments?.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {school.departments.map(dept => (
                                                <span key={dept._id} className="px-2.5 py-1 bg-white border border-primary-200 rounded-lg text-xs font-semibold text-primary-700 shadow-2xs">
                                                    {dept.code} — {dept.name}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-dark-400 italic">No departments selected for this school yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {(showCreateModal || editingSchool) && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-dark-900 mb-4">
                            {editingSchool ? `Edit ${editingSchool.name}` : 'Create New School'}
                        </h2>
                        <form onSubmit={editingSchool ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="label">School Title / Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. School of Computing & Technology"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                />
                                <p className="text-2xs text-dark-400 mt-1">
                                    💡 You can change the school title anytime. Dean assignment and department access scope remain intact.
                                </p>
                            </div>

                            <div>
                                <label className="label">School Short Code</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. SOC"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="label">Assign Dean</label>
                                <select
                                    value={formData.deanId}
                                    onChange={e => setFormData({ ...formData, deanId: e.target.value })}
                                    className="select-field"
                                >
                                    <option value="">-- No Dean --</option>
                                    {facultyList.map(f => (
                                        <option key={f._id} value={f._id}>
                                            {f.name} ({f.department} - {f.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Department Selection Checkboxes */}
                            <div>
                                <label className="label mb-2">Select Departments Accessible under this School:</label>
                                <div className="grid grid-cols-2 gap-2.5 bg-dark-50 p-4 rounded-xl border border-dark-100 max-h-48 overflow-y-auto">
                                    {allDepartments.map(dept => {
                                        const isChecked = formData.selectedDeptIds.includes(dept._id);
                                        return (
                                            <label
                                                key={dept._id}
                                                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border text-xs font-semibold transition-all ${isChecked ? 'bg-primary-50 border-primary-300 text-primary-800' : 'bg-white border-dark-200 text-dark-700 hover:border-dark-300'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleDeptSelection(dept._id)}
                                                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                                                />
                                                <span>{dept.code} ({dept.name})</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-dark-100">
                                <button
                                    type="button"
                                    onClick={() => { setShowCreateModal(false); setEditingSchool(null); resetForm(); }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary flex items-center gap-1.5">
                                    <Check className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolManagement;
