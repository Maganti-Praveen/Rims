import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Trash2, RotateCcw } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import getFileUrl from '../../utils/getFileUrl';
import { confirmDelete } from '../../utils/swal';

const ProfilePicture = ({ faculty, canEdit, onUpdate }) => {
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState('choose'); // choose | camera | preview
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const closeModal = () => {
        stopCamera();
        setShowModal(false);
        setMode('choose');
        setPreview(null);
    };

    const startCamera = async () => {
        setMode('camera');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            toast.error('Camera access denied. Please allow camera permission.');
            setMode('choose');
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        // Mirror the image for selfie
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreview(dataUrl);
        stopCamera();
        setMode('preview');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast.error('Only JPG, JPEG, and PNG files are allowed');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreview(ev.target.result);
            setMode('preview');
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!preview) return;
        setUploading(true);
        try {
            const { data } = await API.put(`/users/${faculty._id}/profile-picture`, {
                image: preview,
            });
            toast.success('Profile picture updated!');
            onUpdate(data.data);
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        const ok = await confirmDelete({ title: 'Remove profile picture?', text: 'Your avatar will be reset to initials.', confirmText: 'Yes, Remove' });
        if (!ok) return;
        try {
            const { data } = await API.delete(`/users/${faculty._id}/profile-picture`);
            toast.success('Profile picture removed');
            onUpdate(data.data);
        } catch (err) {
            toast.error('Failed to remove');
        }
    };

    return (
        <>
            {/* Avatar Display */}
            <div className="relative group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-800 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/25">
                    {faculty.profilePicture ? (
                        <img
                            src={getFileUrl(faculty.profilePicture)}
                            alt={faculty.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        faculty.name.charAt(0)
                    )}
                </div>
                {canEdit && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition-all"
                    >
                        <Camera className="w-3.5 h-3.5" />
                    </button>
                )}
                {canEdit && faculty.profilePicture && (
                    <button
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Upload Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-dark-900">
                                {mode === 'choose' && 'Update Profile Picture'}
                                {mode === 'camera' && 'Take Photo'}
                                {mode === 'preview' && 'Preview'}
                            </h3>
                            <button onClick={closeModal} className="p-1.5 hover:bg-dark-100 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>

                        {mode === 'choose' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={startCamera}
                                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-dark-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-medium text-dark-700">Take Photo</span>
                                    <span className="text-xs text-dark-400">Use camera</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-dark-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-medium text-dark-700">Upload File</span>
                                    <span className="text-xs text-dark-400">JPG, PNG (max 5MB)</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        )}

                        {mode === 'camera' && (
                            <div className="space-y-4">
                                <div className="relative rounded-xl overflow-hidden bg-dark-900 aspect-[4/3]">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                        style={{ transform: 'scaleX(-1)' }}
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => { stopCamera(); setMode('choose'); }}
                                        className="btn-secondary text-sm"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        className="btn-primary text-sm flex items-center gap-2"
                                    >
                                        <Camera className="w-4 h-4" /> Capture
                                    </button>
                                </div>
                            </div>
                        )}

                        {mode === 'preview' && (
                            <div className="space-y-4">
                                <div className="relative rounded-xl overflow-hidden bg-dark-100 aspect-square max-w-[280px] mx-auto">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => { setPreview(null); setMode('choose'); }}
                                        className="btn-secondary text-sm flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" /> Retake
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="btn-primary text-sm flex items-center gap-2"
                                    >
                                        {uploading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePicture;
