import { useAuth } from '../context/AuthContext';
import FacultyProfile from './FacultyProfile';
import { Shield, Envelope, Buildings, User } from '@phosphor-icons/react';

const MyProfile = () => {
    const { user } = useAuth();

    // Admin basic profile
    if (user?.role === 'admin') {
        return (
            <div>
                <div className="card p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                            {user.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-dark-900">{user.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="badge badge-warning text-xs font-semibold">ADMIN</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                            <Envelope className="w-5 h-5 text-primary-600" />
                            <div>
                                <p className="text-[10px] text-dark-400 font-medium uppercase tracking-wider">Email</p>
                                <p className="text-sm text-dark-800 font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                            <Shield className="w-5 h-5 text-primary-600" />
                            <div>
                                <p className="text-[10px] text-dark-400 font-medium uppercase tracking-wider">Role</p>
                                <p className="text-sm text-dark-800 font-medium">Administrator</p>
                            </div>
                        </div>
                        {user.department && (
                            <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                                <Buildings className="w-5 h-5 text-primary-600" />
                                <div>
                                    <p className="text-[10px] text-dark-400 font-medium uppercase tracking-wider">Department</p>
                                    <p className="text-sm text-dark-800 font-medium">{user.department}</p>
                                </div>
                            </div>
                        )}
                        {user.employeeId && (
                            <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl">
                                <User className="w-5 h-5 text-primary-600" />
                                <div>
                                    <p className="text-[10px] text-dark-400 font-medium uppercase tracking-wider">Employee ID</p>
                                    <p className="text-sm text-dark-800 font-medium">{user.employeeId}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-lg font-bold text-dark-900 mb-2">Admin Privileges</h2>
                    <p className="text-sm text-dark-500 mb-4">As an administrator, you have access to:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            'Manage all faculty profiles',
                            'Create & bulk upload accounts',
                            'View institutional dashboard',
                            'Export reports & analytics',
                            'Manage academic years',
                            'Configure research scores',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-2 text-sm text-dark-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return <FacultyProfile />;
};

export default MyProfile;
