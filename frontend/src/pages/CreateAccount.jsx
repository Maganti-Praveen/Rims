import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { UserPlus, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, XCircle, Download, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateAccount = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isHod = currentUser?.role === 'hod';
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('single');
    const [form, setForm] = useState({
        name: '',
        employeeId: '',
        email: '',
        password: '',
        role: 'faculty',
        designation: 'Assistant Professor',
        department: isHod ? currentUser.department : '',
        mobileNumber: '',
        domain: '',
        officialEmail: '',
        joiningDate: '',
        address: '',
    });

    // Bulk upload state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);

    const departments = [
        'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIML', 'AIDS', 'CYBER', 'IOT', 'MBA', 'BBA',
    ];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('/auth/register', form);
            toast.success(`${form.role.toUpperCase()} account created successfully`);
            navigate('/faculty');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpload = async () => {
        if (!file) {
            toast.error('Please select an Excel file');
            return;
        }
        setUploading(true);
        setUploadResult(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await API.post('/auth/bulk-register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUploadResult(data);
            toast.success(`${data.summary.created} accounts created successfully`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['Name', 'EmployeeId', 'Email', 'Password', 'Role', 'Department', 'Designation', 'MobileNumber', 'Domain', 'OfficialEmail', 'JoiningDate', 'Address'];
        const sampleRow = ['John Doe', 'EMP001', 'john@example.com', 'password123', 'faculty', 'CSE', 'Assistant Professor', '9876543210', 'Machine Learning', 'john.official@college.edu', '2024-01-15', '123 Main St'];
        const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'faculty_upload_template.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-dark-900">Create Account</h1>
                <p className="text-dark-500 text-sm mt-1">
                    {isHod ? 'Add faculty members to your department' : 'Add new faculty or HOD accounts'}
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-1 mb-6 bg-dark-50 rounded-xl p-1 max-w-md">
                <button
                    onClick={() => { setActiveTab('single'); setUploadResult(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-lg transition-all ${activeTab === 'single' ? 'bg-white text-primary-700 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}
                >
                    <UserPlus className="w-4 h-4" /> Single
                </button>
                <button
                    onClick={() => setActiveTab('bulk')}
                    className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-lg transition-all ${activeTab === 'bulk' ? 'bg-white text-primary-700 shadow-sm' : 'text-dark-500 hover:text-dark-700'}`}
                >
                    <FileSpreadsheet className="w-4 h-4" /> Bulk Upload
                </button>
            </div>

            {activeTab === 'single' && (
                <div className="card p-6 max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Full Name *</label>
                                <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Employee ID *</label>
                                <input name="employeeId" value={form.employeeId} onChange={handleChange} className="input-field" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Official Email *</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required placeholder="Enter email address" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Password *</label>
                                <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" required minLength={6} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Role *</label>
                                {isHod ? (
                                    <input value="Faculty" className="input-field bg-dark-50" disabled />
                                ) : (
                                    <select name="role" value={form.role} onChange={handleChange} className="select-field">
                                        <option value="faculty">Faculty</option>
                                        <option value="hod">HOD</option>
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Designation *</label>
                                <select name="designation" value={form.designation} onChange={handleChange} className="select-field">
                                    <option value="Assistant Professor">Assistant Professor</option>
                                    <option value="Associate Professor">Associate Professor</option>
                                    <option value="Head of the Department">Head of the Department</option>
                                    <option value="Principal">Principal</option>
                                    <option value="Dean Planning">Dean Planning</option>
                                    <option value="Dean Internal Affairs">Dean Internal Affairs</option>
                                    <option value="Dean Placements">Dean Placements</option>
                                    <option value="Dean Academics">Dean Academics</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Department *</label>
                                {isHod ? (
                                    <input value={currentUser.department} className="input-field bg-dark-50" disabled />
                                ) : (
                                    <select name="department" value={form.department} onChange={handleChange} className="select-field" required>
                                        <option value="">Select Department</option>
                                        {departments.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Mobile Number</label>
                                <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Domain</label>
                                <input name="domain" value={form.domain} onChange={handleChange} className="input-field" placeholder="e.g., Machine Learning" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Personal Email</label>
                                <input name="officialEmail" type="email" value={form.officialEmail} onChange={handleChange} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-700 mb-1.5">Joining Date</label>
                                <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} className="input-field" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1.5">Address</label>
                            <textarea name="address" value={form.address} onChange={handleChange} className="input-field" rows={2} />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
                            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <UserPlus className="w-4 h-4" />
                                )}
                                Create Account
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'bulk' && (
                <div className="max-w-3xl space-y-6">
                    {/* Upload Card */}
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary-100 rounded-lg">
                                <Upload className="w-5 h-5 text-primary-700" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-dark-800">Upload Excel File</h2>
                                <p className="text-xs text-dark-400">Upload an .xlsx or .csv file with faculty data</p>
                            </div>
                        </div>

                        {/* Template Download */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                            <div className="flex items-start gap-3">
                                <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-blue-800">Download Template</p>
                                    <p className="text-xs text-blue-600 mt-0.5 mb-2">
                                        Required columns: <strong>Name, EmployeeId, Email, Password, Department</strong><br />
                                        Optional: Role, Designation, MobileNumber, Domain, OfficialEmail, JoiningDate, Address<br />
                                        <span className="text-blue-500">Designation options: Assistant Professor, Associate Professor, Head of the Department, Principal, Dean Planning, Dean Internal Affairs, Dean Placements, Dean Academics</span>
                                    </p>
                                    <button onClick={downloadTemplate} className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-all">
                                        <Download className="w-3.5 h-3.5" /> Download CSV Template
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* File Picker */}
                        <div className="border-2 border-dashed border-dark-200 hover:border-primary-400 rounded-xl p-8 text-center transition-colors">
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => { setFile(e.target.files[0]); setUploadResult(null); }}
                                className="hidden"
                                id="bulk-upload-input"
                            />
                            <label htmlFor="bulk-upload-input" className="cursor-pointer">
                                <FileSpreadsheet className="w-12 h-12 text-dark-300 mx-auto mb-3" />
                                {file ? (
                                    <div>
                                        <p className="text-sm font-semibold text-dark-800">{file.name}</p>
                                        <p className="text-xs text-dark-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm font-medium text-dark-600">Click to select file</p>
                                        <p className="text-xs text-dark-400 mt-1">Supports .xlsx, .xls, .csv (max 5MB)</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Upload Button */}
                        <div className="flex justify-end mt-5">
                            <button
                                onClick={handleBulkUpload}
                                disabled={!file || uploading}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                {uploading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                {uploading ? 'Processing...' : 'Upload & Create Accounts'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {uploadResult && (
                        <div className="card p-6">
                            <h3 className="text-lg font-bold text-dark-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary-600" /> Upload Results
                            </h3>

                            {/* Summary Badges */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-emerald-700">{uploadResult.summary.created}</p>
                                    <p className="text-xs text-emerald-600">Created</p>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-amber-700">{uploadResult.summary.skipped}</p>
                                    <p className="text-xs text-amber-600">Skipped</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                                    <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                    <p className="text-2xl font-bold text-red-700">{uploadResult.summary.errors}</p>
                                    <p className="text-xs text-red-600">Errors</p>
                                </div>
                            </div>

                            {/* Created List */}
                            {uploadResult.data.created.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">✅ Created Successfully</p>
                                    <div className="space-y-1">
                                        {uploadResult.data.created.map((u, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-emerald-50/50 p-2 rounded-lg text-sm">
                                                <span className="text-dark-400 text-xs w-8">Row {u.row}</span>
                                                <span className="font-medium text-dark-800">{u.name}</span>
                                                <span className="text-dark-400 text-xs">{u.email}</span>
                                                <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{u.department}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skipped List */}
                            {uploadResult.data.skipped.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">⚠️ Skipped (Duplicates)</p>
                                    <div className="space-y-1">
                                        {uploadResult.data.skipped.map((u, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-amber-50/50 p-2 rounded-lg text-sm">
                                                <span className="text-dark-400 text-xs w-8">Row {u.row}</span>
                                                <span className="font-medium text-dark-800">{u.name}</span>
                                                <span className="ml-auto text-xs text-amber-600">{u.reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Error List */}
                            {uploadResult.data.errors.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">❌ Errors</p>
                                    <div className="space-y-1">
                                        {uploadResult.data.errors.map((u, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-red-50/50 p-2 rounded-lg text-sm">
                                                <span className="text-dark-400 text-xs w-8">Row {u.row}</span>
                                                <span className="font-medium text-dark-800">{u.name}</span>
                                                <span className="ml-auto text-xs text-red-600">{u.reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreateAccount;
