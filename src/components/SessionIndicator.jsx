import { useState, useEffect } from 'react';
import { Clock, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SessionIndicator = () => {
    const { isAuthenticated, logout, getSessionTimeRemaining, getSessionExpiryDisplay } = useAuth();
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isWarning, setIsWarning] = useState(false);

    // Update time remaining every minute
    useEffect(() => {
        if (!isAuthenticated) return;

        const updateTime = () => {
            const remaining = getSessionTimeRemaining();
            setTimeRemaining(remaining);
            setIsWarning(remaining <= 15); // Warning when 15 minutes or less

            // Notify when session is about to expire
            if (remaining === 15) {
                toast('⏰ Session akan berakhir dalam 15 menit', {
                    duration: 5000,
                    icon: '⚠️',
                });
            } else if (remaining === 5) {
                toast('⏰ Session akan berakhir dalam 5 menit!', {
                    duration: 5000,
                    icon: '🚨',
                    style: {
                        background: '#fef2f2',
                        color: '#dc2626',
                    },
                });
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);

        return () => clearInterval(interval);
    }, [isAuthenticated, getSessionTimeRemaining]);

    const handleLogout = () => {
        logout();
        toast.success('Berhasil logout', {
            icon: '👋',
        });
    };

    if (!isAuthenticated) return null;

    const formatTime = (minutes) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}j ${mins}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
            transition-all duration-300
            ${isWarning
                ? 'bg-warning-500/20 text-warning-600 dark:text-warning-400 animate-pulse'
                : 'bg-success-500/15 text-success-600 dark:text-success-400'
            }`}
        >
            <Shield className="w-4 h-4" />
            <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeRemaining)}</span>
            </div>
            <div className="w-px h-4 bg-current opacity-30" />
            <button
                onClick={handleLogout}
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                title="Logout"
            >
                <LogOut className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

export default SessionIndicator;
