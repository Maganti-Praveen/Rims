import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { confirmDelete } from '../utils/swal';
import Accordion from '../components/ui/Accordion';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import {
    User, GraduationCap, Certificate, BookOpen, Lightbulb,
    Briefcase, Microphone, Plus, PencilSimple, Trash, DownloadSimple,
    UploadSimple, ArrowSquareOut, Key, X
} from '@phosphor-icons/react';
import ProfilePicture from '../components/ui/ProfilePicture';
import useAcademicYears from '../hooks/useAcademicYears';
import ScoreCard from '../components/ui/ScoreCard';
import ResetPasswordModal from '../components/ui/ResetPasswordModal';

const FacultyProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const { academicYears } = useAcademicYears();
    const [faculty, setFaculty] = useState(null);
    const [education, setEducation] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [publications, setPublications] = useState([]);
    const [books, setBooks] = useState([]);
    const [patents, setPatents] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [seminars, setSeminars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [yearFilter, setYearFilter] = useState('');
    const [saving, setSaving] = useState(false);
    const [editProfileOpen, setEditProfileOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({});
    const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfYear, setPdfYear] = useState('');
 
    const facultyId = id || currentUser?._id;
    const canEdit = currentUser?._id === facultyId;
    // Admin and HOD can reset passwords (but not their own via this UI)
    const canResetPassword = (currentUser?.role === 'admin' || currentUser?.role === 'hod') && !canEdit;
 
    useEffect(() => {
        if (facultyId) fetchAll();
    }, [facultyId]);
 
    const fetchAll = async () => {
        setLoading(true);
        try {
            const [facRes, eduRes, certRes, pubRes, bookRes, patRes, wsRes, semRes] = await Promise.all([
                API.get(`/users/${facultyId}`),
                API.get(`/education/${facultyId}`),
                API.get(`/certifications/${facultyId}`),
                API.get(`/publications/faculty/${facultyId}`),
                API.get(`/books/faculty/${facultyId}`),
                API.get(`/patents/faculty/${facultyId}`),
                API.get(`/workshops/faculty/${facultyId}`),
                API.get(`/seminars/faculty/${facultyId}`),
            ]);
            setFaculty(facRes.data.data);
            setEducation(eduRes.data.data);
            setCertifications(certRes.data.data);
            setPublications(pubRes.data.data);
            setBooks(bookRes.data.data);
            setPatents(patRes.data.data);
            setWorkshops(wsRes.data.data);
            setSeminars(semRes.data.data);
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };
 
    const openAddModal = (type) => {
        setModalType(type);
        setEditItem(null);
        setFormData({});
        setFile(null);
        setModalOpen(true);
    };
 
    const openEditModal = (type, item) => {
        setModalType(type);
        setEditItem(item);
        setFormData({ ...item });
        setFile(null);
        setModalOpen(true);
    };
 
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const endpoints = {
                education: '/education',
                certification: '/certifications',
                publication: '/publications',
                book: '/books',
                patent: '/patents',
                workshop: '/workshops',
                seminar: '/seminars',
            };
            const base = endpoints[modalType];
            const hasFile = ['certification', 'publication', 'book', 'patent', 'workshop'].includes(modalType);
 
            let payload;
            if (hasFile && file) {
                payload = new FormData();
                Object.keys(formData).forEach((key) => {
                    if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt' && key !== 'facultyId')
                        payload.append(key, formData[key]);
                });
                payload.append('file', file);
            } else {
                payload = { ...formData };
                delete payload._id;
                delete payload.__v;
                delete payload.createdAt;
                delete payload.updatedAt;
                delete payload.facultyId;
            }

            const config = hasFile && file ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

            if (editItem) {
                await API.put(`${base}/${editItem._id}`, payload, config);
                toast.success('Updated successfully');
            } else {
                await API.post(`${base}/${facultyId}`, payload, config);
                toast.success('Added successfully');
            }

            setModalOpen(false);
            fetchAll();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (type, itemId) => {
        const ok = await confirmDelete({ title: 'Delete entry?', text: 'This cannot be undone.', confirmText: 'Yes, Delete' });
        if (!ok) return;
        const endpoints = {
            education: '/education',
            certification: '/certifications',
            publication: '/publications',
            book: '/books',
            patent: '/patents',
            workshop: '/workshops',
            seminar: '/seminars',
        };
        try {
            await API.delete(`${endpoints[type]}/${itemId}`);
            toast.success('Deleted successfully');
            fetchAll();
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    const handleDownloadPDF = async (year) => {
        try {
            const params = year ? `?academicYear=${encodeURIComponent(year)}` : '';
            const response = await API.get(`/export/pdf/${facultyId}${params}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const yearSuffix = year ? `_${year.replace(/\//g, '-')}` : '';
            link.setAttribute('download', `${faculty?.name || 'profile'}${yearSuffix}_profile.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setPdfModalOpen(false);
            toast.success('PDF downloaded');
        } catch (err) {
            toast.error('PDF export failed');
        }
    };

    const openEditProfile = () => {
        setProfileForm({
            name: faculty.name || '',
            mobileNumber: faculty.mobileNumber || '',
            domain: faculty.domain || '',
            personalEmail: faculty.personalEmail || faculty.officialEmail || '',
            joiningDate: faculty.joiningDate ? faculty.joiningDate.split('T')[0] : '',
            address: faculty.address || '',
            orcidId: faculty.orcidId || '',
            googleScholarUrl: faculty.googleScholarUrl || '',
            scopusAuthorId: faculty.scopusAuthorId || '',
            vidhwanId: faculty.vidhwanId || '',
            researchGateUrl: faculty.researchGateUrl || '',
            linkedinUrl: faculty.linkedinUrl || '',
        });
        setEditProfileOpen(true);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await API.put(`/users/${facultyId}`, profileForm);
            setFaculty(data.data);
            setEditProfileOpen(false);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const TableActions = ({ type, item }) => canEdit ? (
        <div className="flex gap-1">
            <button onClick={() => openEditModal(type, item)} className="p-1.5 text-dark-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                <PencilSimple className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDelete(type, item._id)} className="p-1.5 text-dark-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                <Trash className="w-3.5 h-3.5" />
            </button>
        </div>
    ) : null;

    const SectionHeader = ({ type }) => canEdit ? (
        <button onClick={() => openAddModal(type)} className="btn-primary text-xs flex items-center gap-1.5 mt-3 mb-2">
            <Plus className="w-3.5 h-3.5" /> Add
        </button>
    ) : null;

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!faculty) {
        return <div className="text-center py-12 text-dark-400">Faculty not found</div>;
    }

    const renderModalForm = () => {
        switch (modalType) {
            case 'education':
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Degree *</label>
                                <select name="degree" value={formData.degree || ''} onChange={handleChange} className="select-field" required>
                                    <option value="">Select Degree</option>
                                    <option value="Post-Doc (PDF)">Post-Doc (PDF)</option>
                                    <option value="Ph.D">Ph.D</option>
                                    <option value="Postgraduate (PG)">Postgraduate (PG)</option>
                                    <option value="Undergraduate (UG)">Undergraduate (UG)</option>
                                    <option value="Intermediate (12th)">Intermediate (12th)</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="SSC (10th)">SSC (10th)</option>
                                </select></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">University *</label>
                                <input name="university" value={formData.university || ''} onChange={handleChange} className="input-field" required /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Specialization</label>
                                <input name="specialization" value={formData.specialization || ''} onChange={handleChange} className="input-field" /></div>
                            <div><label className="block text-sm font-medium text-dark-700 mb-1">Year</label>
                                <input name="year" value={formData.year || ''} onChange={handleChange} className="input-field" /></div>
                        </div>
                        {/* Highest Education Toggle */}
                        <div className="flex items-center gap-3 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isHighest: !formData.isHighest })}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                                    formData.isHighest ? 'bg-amber-500' : 'bg-dark-200'
                                }`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                    formData.isHighest ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                            </button>
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Highest Education</p>
                                <p className="text-xs text-amber-600">Mark this as your highest qualification</p>
                            </div>
                        </div>
                    </>
                );
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
            default: return null;
        }
    };

    return (
        <div>
            {/* Profile Header */}
            <div className="card p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <ProfilePicture
                            faculty={faculty}
                            canEdit={canEdit}
                            onUpdate={(updated) => setFaculty(updated)}
                        />
                        <div>
                            <h1 className="text-xl font-bold text-dark-900">{faculty.name}</h1>
                            <p className="text-dark-500 text-sm">{faculty.department} • {faculty.employeeId}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {faculty.designation && (
                                    <span className="badge bg-violet-100 text-violet-700 border border-violet-200 text-xs font-medium">
                                        {faculty.designation}
                                    </span>
                                )}
                                <span className={`badge ${faculty.role === 'hod' ? 'badge-warning' : 'badge-primary'}`}>
                                    {faculty.role.toUpperCase()}
                                </span>
                                {education.find(e => e.isHighest) && (
                                    <span className="badge bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold flex items-center gap-1">
                                        <GraduationCap className="w-4 h-4 text-amber-600" /> {education.find(e => e.isHighest).degree}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {canEdit && (
                            <button onClick={openEditProfile} className="btn-secondary flex items-center gap-2 text-sm">
                                <PencilSimple className="w-4 h-4" /> Edit Profile
                            </button>
                        )}
                        {canResetPassword && (
                            <button
                                onClick={() => setResetPasswordOpen(true)}
                                className="btn-secondary flex items-center gap-2 text-sm text-amber-700 border-amber-300 hover:bg-amber-50"
                            >
                                <Key className="w-4 h-4" /> Reset Password
                            </button>
                        )}
                        <button onClick={() => setPdfModalOpen(true)} className="btn-secondary flex items-center gap-2 text-sm">
                            <DownloadSimple className="w-4 h-4" /> Save PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Score Card */}
            <ScoreCard facultyId={facultyId} />

            {/* Sections */}
            <div className="space-y-3">
                {/* Basic Info */}
                <Accordion title="Basic Information" icon={User} defaultOpen>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                        {[
                            ['College Email (Login)', faculty.email], ['Mobile', faculty.mobileNumber],
                            ['Domain', faculty.domain], ['Joining Date', formatDate(faculty.joiningDate)],
                            ['Personal Email', faculty.personalEmail || faculty.officialEmail], ['Address', faculty.address],
                        ].map(([label, val]) => (
                            <div key={label}>
                                <p className="text-xs text-dark-400 font-medium uppercase tracking-wider">{label}</p>
                                <p className="text-sm text-dark-800 mt-0.5">{val || '-'}</p>
                            </div>
                        ))}
                    </div>
                    {/* Research IDs */}
                    {(faculty.orcidId || faculty.googleScholarUrl || faculty.scopusAuthorId || faculty.vidhwanId || faculty.researchGateUrl || faculty.linkedinUrl) && (
                        <div className="mt-4 pt-4 border-t border-dark-100">
                            <p className="text-xs text-dark-400 font-medium uppercase tracking-wider mb-2">Research Profiles</p>
                            <div className="flex flex-wrap gap-3">
                                {faculty.orcidId && (
                                    <a href={`https://orcid.org/${faculty.orcidId}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg transition-all hover:bg-primary-100">
                                        <ArrowSquareOut className="w-3.5 h-3.5" /> ORCID: {faculty.orcidId}
                                    </a>
                                )}
                                {faculty.googleScholarUrl && (
                                    <a href={faculty.googleScholarUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg transition-all hover:bg-primary-100">
                                        <ArrowSquareOut className="w-3.5 h-3.5" /> Google Scholar
                                    </a>
                                )}
                                {faculty.scopusAuthorId && (
                                    <a href={`https://www.scopus.com/authid/detail.uri?authorId=${faculty.scopusAuthorId}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg transition-all hover:bg-primary-100">
                                        <ArrowSquareOut className="w-3.5 h-3.5" /> Scopus: {faculty.scopusAuthorId}
                                    </a>
                                )}
                                {faculty.vidhwanId && (
                                    <a href={`https://vidwan.inflibnet.ac.in/profile/${faculty.vidhwanId}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg transition-all hover:bg-primary-100">
                                        <ArrowSquareOut className="w-3.5 h-3.5" /> Vidwan: {faculty.vidhwanId}
                                    </a>
                                )}
                                {faculty.researchGateUrl && (
                                    <a href={faculty.researchGateUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition-all hover:bg-emerald-100">
                                        <ArrowSquareOut className="w-3.5 h-3.5" /> ResearchGate
                                    </a>
                                )}
                                {faculty.linkedinUrl && (
                                    <a href={faculty.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-all hover:bg-blue-100">
                                        <ArrowSquareOut className="w-3.5 h-3.5" /> LinkedIn
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </Accordion>

                {/* Education */}
                <Accordion title="Education" icon={GraduationCap} count={education.length}>
                    <SectionHeader type="education" />
                    {education.length > 0 ? (
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-100">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Degree</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">University</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Specialization</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Year</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Highest</th>
                                    {canEdit && <th className="py-2 px-3" />}
                                </tr></thead>
                                <tbody>
                                    {education.map((e) => (
                                        <tr key={e._id} className="border-b border-dark-50 hover:bg-dark-50/50">
                                            <td className="py-2 px-3 text-dark-800">{e.degree}</td>
                                            <td className="py-2 px-3 text-dark-600">{e.university}</td>
                                            <td className="py-2 px-3 text-dark-600">{e.specialization || '-'}</td>
                                            <td className="py-2 px-3 text-dark-600">{e.year || '-'}</td>
                                            <td className="py-2 px-3">
                                                {e.isHighest ? (
                                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                                        ★ Highest
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            {canEdit && <td className="py-2 px-3"><TableActions type="education" item={e} /></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-dark-400 text-sm mt-2">No education records</p>}
                </Accordion>

                {/* Certifications */}
                <Accordion title="Certifications" icon={Certificate} count={certifications.length}>
                    <SectionHeader type="certification" />
                    {certifications.length > 0 ? (
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-100">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Title</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Issued By</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Type</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Enroll Date</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Issued Date</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Credential ID</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">File</th>
                                    {canEdit && <th className="py-2 px-3" />}
                                </tr></thead>
                                <tbody>
                                    {certifications.map((c) => (
                                        <tr key={c._id} className="border-b border-dark-50 hover:bg-dark-50/50">
                                            <td className="py-2 px-3 text-dark-800 font-semibold">{c.title}</td>
                                            <td className="py-2 px-3 text-dark-600">{c.issuedBy}</td>
                                            <td className="py-2 px-3"><span className="badge bg-primary-50 text-primary-700 border border-primary-100 text-xs font-semibold px-2 py-0.5 rounded-full">{c.certificateType || '-'}</span></td>
                                            <td className="py-2 px-3 text-dark-600">{formatDate(c.enrollDate)}</td>
                                            <td className="py-2 px-3 text-dark-600">{formatDate(c.issuedDate || c.date)}</td>
                                            <td className="py-2 px-3 text-dark-600">{c.credentialId || '-'}</td>
                                            <td className="py-2 px-3">{c.fileUrl ? <a href={c.fileUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700"><ArrowSquareOut className="w-4 h-4" /></a> : '-'}</td>
                                            {canEdit && <td className="py-2 px-3"><TableActions type="certification" item={c} /></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-dark-400 text-sm mt-2">No certifications</p>}
                </Accordion>

                {/* Publications */}
                <Accordion title="Publications" icon={BookOpen} count={publications.length}>
                    <SectionHeader type="publication" />
                    {publications.length > 0 ? (
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-100">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Title</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Journal</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Type</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Indexed</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Year</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">File</th>
                                    {canEdit && <th className="py-2 px-3" />}
                                </tr></thead>
                                <tbody>
                                    {publications.map((p) => (
                                        <tr key={p._id} className="border-b border-dark-50 hover:bg-dark-50/50">
                                            <td className="py-2 px-3">
                                                <div className="font-semibold text-dark-800 max-w-[200px] truncate">{p.title}</div>
                                                {p.indexedType === 'IEEE Conference' && p.conferenceDate && (
                                                    <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                                                        📅 Conf: {formatDate(p.conferenceDate)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2 px-3 text-dark-600">{p.journalName || '-'}</td>
                                            <td className="py-2 px-3"><span className="badge-primary">{p.publicationType || '-'}</span></td>
                                            <td className="py-2 px-3"><span className="badge-success">{p.indexedType || '-'}</span></td>
                                            <td className="py-2 px-3 text-dark-600">{p.academicYear || '-'}</td>
                                            <td className="py-2 px-3">{p.fileUrl ? <a href={p.fileUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700"><ArrowSquareOut className="w-4 h-4" /></a> : '-'}</td>
                                            {canEdit && <td className="py-2 px-3"><TableActions type="publication" item={p} /></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-dark-400 text-sm mt-2">No publications</p>}
                </Accordion>

                {/* Books & Chapters */}
                <Accordion title="Books & Chapters" icon={BookOpen} count={books.length}>
                    <SectionHeader type="book" />
                    {books.length > 0 ? (
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-100">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Title</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Publisher</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Type</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">ISBN / ISSN</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Year</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">File</th>
                                    {canEdit && <th className="py-2 px-3" />}
                                </tr></thead>
                                <tbody>
                                    {books.map((b) => (
                                        <tr key={b._id} className="border-b border-dark-50 hover:bg-dark-50/50">
                                            <td className="py-2 px-3 text-dark-800 font-semibold max-w-[200px] truncate">{b.title}</td>
                                            <td className="py-2 px-3 text-dark-600">{b.journalName || '-'}</td>
                                            <td className="py-2 px-3"><span className="badge-primary">{b.publicationType || '-'}</span></td>
                                            <td className="py-2 px-3"><span className="badge-success">{b.issn || '-'}</span></td>
                                            <td className="py-2 px-3 text-dark-600">{b.academicYear || '-'}</td>
                                            <td className="py-2 px-3">{b.fileUrl ? <a href={b.fileUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:text-primary-700"><ArrowSquareOut className="w-4 h-4" /></a> : '-'}</td>
                                            {canEdit && <td className="py-2 px-3"><TableActions type="book" item={b} /></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-dark-400 text-sm mt-2">No books or chapters</p>}
                </Accordion>

                {/* Patents */}
                <Accordion title="Patents" icon={Lightbulb} count={patents.length}>
                    <SectionHeader type="patent" />
                    {patents.length > 0 ? (
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-100">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Title</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Patent No.</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Status</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Filing</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Year</th>
                                    {canEdit && <th className="py-2 px-3" />}
                                </tr></thead>
                                <tbody>
                                    {patents.map((p) => (
                                        <tr key={p._id} className="border-b border-dark-50 hover:bg-dark-50/50">
                                            <td className="py-2 px-3 text-dark-800">{p.title}</td>
                                            <td className="py-2 px-3 text-dark-600">{p.patentNumber || '-'}</td>
                                            <td className="py-2 px-3"><span className="badge-warning">{p.status || '-'}</span></td>
                                            <td className="py-2 px-3 text-dark-600">{formatDate(p.filingDate)}</td>
                                            <td className="py-2 px-3 text-dark-600">{p.academicYear || '-'}</td>
                                            {canEdit && <td className="py-2 px-3"><TableActions type="patent" item={p} /></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-dark-400 text-sm mt-2">No patents</p>}
                </Accordion>

                {/* Workshops */}
                <Accordion title="Workshops" icon={Briefcase} count={workshops.length}>
                    <SectionHeader type="workshop" />
                    {workshops.length > 0 ? (
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-100">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Title</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Institution</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Role</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Mode</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Duration</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Date</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Year</th>
                                    {canEdit && <th className="py-2 px-3" />}
                                </tr></thead>
                                <tbody>
                                    {workshops.map((w) => (
                                        <tr key={w._id} className="border-b border-dark-50 hover:bg-dark-50/50">
                                            <td className="py-2 px-3 text-dark-800">{w.title}</td>
                                            <td className="py-2 px-3 text-dark-600">{w.institution || '-'}</td>
                                            <td className="py-2 px-3"><span className="badge-primary">{w.role || '-'}</span></td>
                                            <td className="py-2 px-3"><span className="badge bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-2 py-0.5 rounded-full">{w.mode || '-'}</span></td>
                                            <td className="py-2 px-3 text-dark-600">{w.durationDays || '-'}</td>
                                            <td className="py-2 px-3 text-dark-600">{formatDate(w.date)}</td>
                                            <td className="py-2 px-3 text-dark-600">{w.academicYear || '-'}</td>
                                            {canEdit && <td className="py-2 px-3"><TableActions type="workshop" item={w} /></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-dark-400 text-sm mt-2">No workshops</p>}
                </Accordion>

                {/* Seminars */}
                <Accordion title="Seminars" icon={Microphone} count={seminars.length}>
                    <SectionHeader type="seminar" />
                    {seminars.length > 0 ? (
                        <div className="overflow-x-auto mt-2">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-dark-100">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Topic</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Institution</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Role</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Mode</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Date</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Year</th>
                                    {canEdit && <th className="py-2 px-3" />}
                                </tr></thead>
                                <tbody>
                                    {seminars.map((s) => (
                                        <tr key={s._id} className="border-b border-dark-50 hover:bg-dark-50/50">
                                            <td className="py-2 px-3 text-dark-800">{s.topic}</td>
                                            <td className="py-2 px-3 text-dark-600">{s.institution || '-'}</td>
                                            <td className="py-2 px-3 text-dark-600">{s.role || '-'}</td>
                                            <td className="py-2 px-3"><span className="badge bg-green-50 text-green-700 border border-green-100 text-xs font-semibold px-2 py-0.5 rounded-full">{s.mode || '-'}</span></td>
                                            <td className="py-2 px-3 text-dark-600">{formatDate(s.date)}</td>
                                            <td className="py-2 px-3 text-dark-600">{s.academicYear || '-'}</td>
                                            {canEdit && <td className="py-2 px-3"><TableActions type="seminar" item={s} /></td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-dark-400 text-sm mt-2">No seminars</p>}
                </Accordion>
            </div>

            {/* CRUD Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${editItem ? 'Edit' : 'Add'} ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    {renderModalForm()}
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                            {editItem ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={editProfileOpen}
                onClose={() => setEditProfileOpen(false)}
                title="Edit Profile"
                size="lg"
            >
                <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">Full Name</label>
                            <input
                                name="name"
                                value={profileForm.name || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">Mobile Number</label>
                            <input
                                name="mobileNumber"
                                value={profileForm.mobileNumber || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, mobileNumber: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">Domain / Specialization</label>
                            <input
                                name="domain"
                                value={profileForm.domain || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, domain: e.target.value })}
                                className="input-field"
                                placeholder="e.g., Machine Learning"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">Personal Email <span className="text-xs text-dark-400 font-normal">(Gmail / personal)</span></label>
                            <input
                                name="personalEmail"
                                type="email"
                                value={profileForm.personalEmail || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, personalEmail: e.target.value })}
                                className="input-field"
                                placeholder="e.g., yourname@gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-700 mb-1">Joining Date</label>
                            <input
                                name="joiningDate"
                                type="date"
                                value={profileForm.joiningDate || ''}
                                onChange={(e) => setProfileForm({ ...profileForm, joiningDate: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-dark-700 mb-1">Address</label>
                        <textarea
                            name="address"
                            value={profileForm.address || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                            className="input-field"
                            rows={2}
                        />
                    </div>
                    <div className="mt-4 pt-4 border-t border-dark-100">
                        <p className="text-sm font-semibold text-dark-700 mb-3">Research Profile Links</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-dark-600 mb-1">ORCID ID</label>
                                <input
                                    name="orcidId"
                                    value={profileForm.orcidId || ''}
                                    onChange={(e) => setProfileForm({ ...profileForm, orcidId: e.target.value })}
                                    className="input-field"
                                    placeholder="0000-0000-0000-0000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-600 mb-1">Google Scholar URL</label>
                                <input
                                    name="googleScholarUrl"
                                    value={profileForm.googleScholarUrl || ''}
                                    onChange={(e) => setProfileForm({ ...profileForm, googleScholarUrl: e.target.value })}
                                    className="input-field"
                                    placeholder="https://scholar.google.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-600 mb-1">Scopus Author ID</label>
                                <input
                                    name="scopusAuthorId"
                                    value={profileForm.scopusAuthorId || ''}
                                    onChange={(e) => setProfileForm({ ...profileForm, scopusAuthorId: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., 57200012345"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-600 mb-1">Vidwan ID</label>
                                <input
                                    name="vidhwanId"
                                    value={profileForm.vidhwanId || ''}
                                    onChange={(e) => setProfileForm({ ...profileForm, vidhwanId: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g., 12345"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-600 mb-1">ResearchGate URL</label>
                                <input
                                    name="researchGateUrl"
                                    value={profileForm.researchGateUrl || ''}
                                    onChange={(e) => setProfileForm({ ...profileForm, researchGateUrl: e.target.value })}
                                    className="input-field"
                                    placeholder="https://www.researchgate.net/profile/..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-600 mb-1">LinkedIn URL</label>
                                <input
                                    name="linkedinUrl"
                                    value={profileForm.linkedinUrl || ''}
                                    onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                                    className="input-field"
                                    placeholder="https://www.linkedin.com/in/..."
                                />
                            </div>
                        </div>

                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setEditProfileOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal (admin/HOD only) */}
            {resetPasswordOpen && faculty && (
                <ResetPasswordModal
                    user={faculty}
                    onClose={() => setResetPasswordOpen(false)}
                />
            )}

            {/* PDF Year Picker Modal */}
            {pdfModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100 bg-primary-800">
                            <div className="flex items-center gap-2 text-white">
                                <DownloadSimple className="w-5 h-5" />
                                <h2 className="text-base font-semibold">Save Profile as PDF</h2>
                            </div>
                            <button onClick={() => setPdfModalOpen(false)} className="text-white/70 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="p-6">
                            <label className="block text-sm font-medium text-dark-700 mb-2">Select Academic Year</label>
                            <select
                                value={pdfYear}
                                onChange={(e) => setPdfYear(e.target.value)}
                                className="select-field w-full mb-5"
                            >
                                <option value="">All Years (Complete Profile)</option>
                                {academicYears.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <p className="text-xs text-dark-400 mb-5">
                                {pdfYear
                                    ? `PDF will include only ${pdfYear} research data (Education & Certifications always included).`
                                    : 'PDF will include all research data across all years.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPdfModalOpen(false)}
                                    className="btn-secondary flex-1 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDownloadPDF(pdfYear)}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                                >
                                    <DownloadSimple className="w-4 h-4" /> Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyProfile;
