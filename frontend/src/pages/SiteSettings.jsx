import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Gear, Envelope, ArrowCounterClockwise, CheckCircle, Palette, MagicWand } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import collegeLogo from '../assets/rcee.png';
import { confirmAction } from '../utils/swal';

const SiteSettings = () => {
    const [activeTab, setActiveTab] = useState('email-templates');
    const [templates, setTemplates] = useState([]);
    const [selectedKey, setSelectedKey] = useState('welcome');
    
    const [formData, setFormData] = useState({
        subject: '',
        headlineText: '',
        messageText: '',
        buttonText: '',
        footerNotice: '',
        primaryColor: '#c2410c',
        secondaryColor: '#ea580c',
        buttonColor: '#ea580c',
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const { data } = await API.get('/email-templates');
            setTemplates(data.data || []);
            const current = (data.data || []).find(t => t.key === selectedKey) || data.data[0];
            if (current) {
                setSelectedKey(current.key);
                populateForm(current);
            }
        } catch (err) {
            toast.error('Failed to load email templates');
        } finally {
            setLoading(false);
        }
    };

    const populateForm = (tpl) => {
        setFormData({
            subject: tpl.subject || '',
            headlineText: tpl.headlineText || '',
            messageText: tpl.messageText || '',
            buttonText: tpl.buttonText || '',
            footerNotice: tpl.footerNotice || '',
            primaryColor: tpl.primaryColor || '#c2410c',
            secondaryColor: tpl.secondaryColor || '#ea580c',
            buttonColor: tpl.buttonColor || '#ea580c',
        });
    };

    const currentTemplate = templates.find(t => t.key === selectedKey);

    const handleSelectTemplate = (key) => {
        setSelectedKey(key);
        const tpl = templates.find(t => t.key === key);
        if (tpl) {
            populateForm(tpl);
        }
    };

    const handleInsertPlaceholder = (field, placeholder) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] || '') + placeholder
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data } = await API.put(`/email-templates/${selectedKey}`, formData);
            toast.success('Email template & theme colors saved successfully!');
            setTemplates(prev => prev.map(t => t.key === selectedKey ? data.data : t));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save template');
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefault = async () => {
        const ok = await confirmAction({
            title: 'Reset Template & Colors?',
            text: 'Are you sure you want to reset this email template and its color theme back to factory defaults?',
            confirmText: 'Yes, Reset Default',
            icon: 'warning',
        });
        if (!ok) return;
        try {
            const { data } = await API.post(`/email-templates/${selectedKey}/reset`);
            toast.success('Template reset to factory default');
            populateForm(data.data);
            setTemplates(prev => prev.map(t => t.key === selectedKey ? data.data : t));
        } catch (err) {
            toast.error('Failed to reset template');
        }
    };

    const formatValue = (str) => {
        if (!str) return '';
        const dummy = {
            name: 'Dr. Praveen Maganti',
            email: 'praveen@rcee.ac.in',
            department: 'CSE',
            role: 'Faculty',
            password: 'TempPassword123',
            loginUrl: '#',
            resetUrl: '#',
            title: 'Annual Research Review Reminder',
            message: 'Please update your journal publications and patent filings before the upcoming academic review deadline.'
        };
        let res = str;
        Object.keys(dummy).forEach(k => {
            const regex = new RegExp(`\\{${k}\\}`, 'g');
            res = res.replace(regex, dummy[k]);
        });
        return res;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Gear className="w-7 h-7 text-primary-600" />
                <div>
                    <h1 className="text-2xl font-bold text-dark-900">Site Settings</h1>
                    <p className="text-dark-500 text-sm">Customize email messages, color themes, and brand appearance</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-dark-200 mb-6 gap-6">
                <button
                    onClick={() => setActiveTab('email-templates')}
                    className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'email-templates' ? 'border-primary-600 text-primary-600' : 'border-transparent text-dark-500 hover:text-dark-900'}`}
                >
                    <Envelope className="w-4 h-4" /> Email Templates & Color Pickers
                </button>
                <button
                    onClick={() => setActiveTab('general-settings')}
                    className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'general-settings' ? 'border-primary-600 text-primary-600' : 'border-transparent text-dark-500 hover:text-dark-900'}`}
                >
                    <Gear className="w-4 h-4" /> General Settings
                </button>
            </div>

            {/* EMAIL TEMPLATES TAB */}
            {activeTab === 'email-templates' && (
                <div>
                    {loading ? (
                        <div className="card p-12 text-center text-dark-400">Loading email customizer...</div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Left Col: Template List & Interactive Color Pickers */}
                            <div className="lg:col-span-3 space-y-4">
                                <div className="card p-4">
                                    <p className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-3">Select Template</p>
                                    <div className="space-y-2">
                                        {templates.map((tpl) => (
                                            <button
                                                key={tpl.key}
                                                onClick={() => handleSelectTemplate(tpl.key)}
                                                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedKey === tpl.key ? 'bg-primary-50/80 border-primary-300 shadow-sm text-primary-800' : 'bg-white border-dark-100 hover:bg-dark-50 text-dark-700'}`}
                                            >
                                                <p className="font-bold text-sm">{tpl.name}</p>
                                                <p className="text-xs text-dark-400 mt-0.5 truncate">{tpl.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Pickers Block */}
                                <div className="card p-4 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-dark-100 pb-2.5">
                                        <Palette className="w-4 h-4 text-primary-600" />
                                        <p className="text-xs font-bold text-dark-800 uppercase tracking-wider">Template Color Pickers</p>
                                    </div>

                                    {/* Color Picker 1: Primary Header */}
                                    <div className="bg-dark-50 p-3 rounded-xl border border-dark-100 space-y-1.5">
                                        <label className="text-xs font-bold text-dark-800 block">Header Primary Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={formData.primaryColor}
                                                onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                                className="w-10 h-10 rounded-lg cursor-pointer border border-dark-300 shrink-0 p-0.5 bg-white shadow-2xs"
                                            />
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={formData.primaryColor}
                                                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                                    className="input-field text-xs font-mono py-1 px-2.5"
                                                    placeholder="#c2410c"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Picker 2: Secondary Gradient Accent */}
                                    <div className="bg-dark-50 p-3 rounded-xl border border-dark-100 space-y-1.5">
                                        <label className="text-xs font-bold text-dark-800 block">Header Gradient Accent</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={formData.secondaryColor}
                                                onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                                                className="w-10 h-10 rounded-lg cursor-pointer border border-dark-300 shrink-0 p-0.5 bg-white shadow-2xs"
                                            />
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={formData.secondaryColor}
                                                    onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                                                    className="input-field text-xs font-mono py-1 px-2.5"
                                                    placeholder="#ea580c"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Color Picker 3: CTA Button */}
                                    <div className="bg-dark-50 p-3 rounded-xl border border-dark-100 space-y-1.5">
                                        <label className="text-xs font-bold text-dark-800 block">Button / CTA Accent</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={formData.buttonColor}
                                                onChange={e => setFormData({ ...formData, buttonColor: e.target.value })}
                                                className="w-10 h-10 rounded-lg cursor-pointer border border-dark-300 shrink-0 p-0.5 bg-white shadow-2xs"
                                            />
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={formData.buttonColor}
                                                    onChange={e => setFormData({ ...formData, buttonColor: e.target.value })}
                                                    className="input-field text-xs font-mono py-1 px-2.5"
                                                    placeholder="#ea580c"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Col: Text Editor */}
                            <div className="lg:col-span-5 card p-6 space-y-4">
                                {currentTemplate && (
                                    <>
                                        <div className="flex items-center justify-between border-b border-dark-100 pb-3">
                                            <div>
                                                <h2 className="text-base font-bold text-dark-900">Customize Messages</h2>
                                                <p className="text-xs text-dark-500">Edit message content directly</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleResetDefault}
                                                className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                                            >
                                                <ArrowCounterClockwise className="w-3.5 h-3.5" /> Reset Default
                                            </button>
                                        </div>

                                        {/* Subject Line */}
                                        <div>
                                            <label className="label">Subject Line</label>
                                            <input
                                                type="text"
                                                value={formData.subject}
                                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                                className="input-field"
                                            />
                                        </div>

                                        {/* Greeting / Headline Text */}
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="label mb-0">Greeting / Headline Text</label>
                                                <span className="text-2xs text-dark-400">Heading at top of email</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.headlineText}
                                                onChange={e => setFormData({ ...formData, headlineText: e.target.value })}
                                                className="input-field font-semibold"
                                                placeholder="e.g. Welcome, {name}! 🎉"
                                            />
                                        </div>

                                        {/* Dynamic Placeholder Shortcuts */}
                                        {currentTemplate.availablePlaceholders?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-dark-600 mb-1.5 flex items-center gap-1">
                                                    <MagicWand className="w-3.5 h-3.5 text-amber-500" /> Dynamic Variable Pills (Click to add into Message Body):
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {currentTemplate.availablePlaceholders.map(p => (
                                                        <button
                                                            key={p.variable}
                                                            type="button"
                                                            onClick={() => handleInsertPlaceholder('messageText', p.variable)}
                                                            className="px-2 py-0.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-md text-xs font-semibold hover:bg-primary-100 transition-colors"
                                                            title={p.description}
                                                        >
                                                            + {p.variable}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Main Message Body Text */}
                                        <div>
                                            <label className="label">Main Message Body Text</label>
                                            <textarea
                                                rows={5}
                                                value={formData.messageText}
                                                onChange={e => setFormData({ ...formData, messageText: e.target.value })}
                                                className="input-field text-sm leading-relaxed"
                                                placeholder="Enter main email description..."
                                            />
                                        </div>

                                        {/* CTA Button Text */}
                                        <div>
                                            <label className="label">Call to Action Button Label</label>
                                            <input
                                                type="text"
                                                value={formData.buttonText}
                                                onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                                                className="input-field"
                                                placeholder="e.g. Login to RIMS →"
                                            />
                                        </div>

                                        {/* Footer Notice Text */}
                                        <div>
                                            <label className="label">Footer Note / Expiry Notice</label>
                                            <input
                                                type="text"
                                                value={formData.footerNotice}
                                                onChange={e => setFormData({ ...formData, footerNotice: e.target.value })}
                                                className="input-field text-xs"
                                                placeholder="e.g. Please update your profile after logging in..."
                                            />
                                        </div>

                                        {/* Save Button */}
                                        <div className="flex justify-end pt-3 border-t border-dark-100">
                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="btn-primary flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Customized Template'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right Col: Live Visual Render Preview Card */}
                            <div className="lg:col-span-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-dark-500 uppercase tracking-wider">Real-time Visual Email Preview</p>
                                    <span className="text-2xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">Live Render</span>
                                </div>

                                <div className="border border-dark-200 rounded-2xl overflow-hidden bg-stone-100 p-4 shadow-sm">
                                    <div className="max-w-[420px] mx-auto bg-white rounded-xl overflow-hidden shadow-md">
                                        
                                        {/* Live Dynamic Gradient Header */}
                                        <div
                                            className="p-5"
                                            style={{ background: `linear-gradient(135deg, ${formData.primaryColor} 0%, ${formData.secondaryColor} 100%)` }}
                                        >
                                            <img src={collegeLogo} alt="RCEE" className="h-10 object-contain mb-2" />
                                            <p className="m-0 text-lg font-bold text-white tracking-tight">RCEE RIMS</p>
                                            <p className="m-0 text-2xs text-white opacity-85">Research Information Management System</p>
                                        </div>

                                        {/* Live Dynamic Body */}
                                        <div className="p-5 text-dark-800 text-xs leading-relaxed space-y-3">
                                            {formData.headlineText && (
                                                <p className="font-bold text-sm m-0" style={{ color: formData.primaryColor }}>
                                                    {formatValue(formData.headlineText)}
                                                </p>
                                            )}

                                            <p className="text-dark-600 m-0 whitespace-pre-wrap">
                                                {formatValue(formData.messageText)}
                                            </p>

                                            {/* Dummy Info Table if Welcome Email */}
                                            {selectedKey === 'welcome' && (
                                                <table className="w-full text-2xs border-collapse my-2">
                                                    <tbody>
                                                        <tr>
                                                            <td className="p-1.5 font-semibold border" style={{ color: formData.primaryColor, backgroundColor: '#fff7ed', borderColor: '#fed7aa', width: '35%' }}>Name</td>
                                                            <td className="p-1.5 border" style={{ borderColor: '#fed7aa' }}>Dr. Praveen Maganti</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-1.5 font-semibold border" style={{ color: formData.primaryColor, backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>Email</td>
                                                            <td className="p-1.5 border" style={{ borderColor: '#fed7aa' }}>praveen@rcee.ac.in</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-1.5 font-semibold border" style={{ color: formData.primaryColor, backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>Department</td>
                                                            <td className="p-1.5 border" style={{ borderColor: '#fed7aa' }}>CSE</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-1.5 font-semibold border" style={{ color: formData.primaryColor, backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>Password</td>
                                                            <td className="p-1.5 border" style={{ borderColor: '#fed7aa' }}><span className="font-mono bg-orange-100 text-orange-700 px-1 py-0.5 rounded font-bold">TempPass123</span></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            )}

                                            {/* Live Dynamic CTA Button */}
                                            {formData.buttonText && (
                                                <div className="text-center py-2">
                                                    <a
                                                        href="#"
                                                        onClick={e => e.preventDefault()}
                                                        className="inline-block px-5 py-2.5 text-white font-bold text-xs rounded-lg shadow-sm"
                                                        style={{ backgroundColor: formData.buttonColor }}
                                                    >
                                                        {formData.buttonText}
                                                    </a>
                                                </div>
                                            )}

                                            {/* Live Footer Notice */}
                                            {formData.footerNotice && (
                                                <div className="p-2.5 bg-orange-50/70 border-l-2 text-2xs text-stone-600 rounded-r-md" style={{ borderColor: formData.primaryColor }}>
                                                    {formatValue(formData.footerNotice)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Template Footer */}
                                        <div className="bg-orange-50/50 border-t border-orange-200 p-3 text-center text-2xs text-stone-400">
                                            <p className="m-0 font-medium">© {new Date().getFullYear()} <strong style={{ color: formData.primaryColor }}>Ramachandra College of Engineering</strong></p>
                                            <p className="m-0 text-3xs mt-0.5">Support: rcee.rims@gmail.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            )}

            {/* GENERAL SETTINGS TAB */}
            {activeTab === 'general-settings' && (
                <div className="card p-6 space-y-6 max-w-2xl">
                    <h2 className="text-lg font-bold text-dark-900 border-b border-dark-100 pb-3">Institutional Information</h2>
                    <div>
                        <label className="label">Institution Name</label>
                        <input type="text" readOnly value="Ramachandra College of Engineering" className="input-field bg-dark-50 text-dark-600" />
                    </div>
                    <div>
                        <label className="label">System Name</label>
                        <input type="text" readOnly value="RCEE RIMS (Research Information Management System)" className="input-field bg-dark-50 text-dark-600" />
                    </div>
                    <div>
                        <label className="label">Support Email Contact</label>
                        <input type="text" readOnly value="rcee.rims@gmail.com" className="input-field bg-dark-50 text-dark-600" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SiteSettings;
