import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Konfigurasi session (2 jam dalam milliseconds)
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 jam

// Storage keys
const STORAGE_KEYS = {
    AUTH_SESSION: 'event_manager_auth_session',
    AUTH_EXPIRY: 'event_manager_auth_expiry',
};

// Nomor admin untuk menerima OTP
const ADMIN_PHONE = '62895803292514';

// Webhook URL untuk mengirim OTP (menggunakan n8n workflow)
const OTP_WEBHOOK_URL = import.meta.env.VITE_OTP_WEBHOOK_URL;

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [sessionExpiry, setSessionExpiry] = useState(null);
    const [error, setError] = useState(null);

    // Check session on mount
    useEffect(() => {
        checkSession();
    }, []);

    // Session expiry checker - runs every minute
    useEffect(() => {
        if (!isAuthenticated) return;

        const interval = setInterval(() => {
            checkSession();
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    /**
     * Check if session is still valid
     */
    const checkSession = useCallback(() => {
        try {
            const session = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
            const expiry = localStorage.getItem(STORAGE_KEYS.AUTH_EXPIRY);

            if (session && expiry) {
                const expiryTime = parseInt(expiry);
                const now = Date.now();

                if (now < expiryTime) {
                    setIsAuthenticated(true);
                    setSessionExpiry(expiryTime);
                } else {
                    // Session expired
                    logout();
                }
            }
        } catch (error) {
            console.error('Error checking session:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Generate random 6-digit OTP
     */
    const generateOtp = () => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
    };

    /**
     * Request OTP - sends to admin's WhatsApp
     */
    const requestOtp = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const otp = generateOtp();
            setGeneratedOtp(otp);

            // Send OTP via webhook (n8n will send to WhatsApp)
            if (OTP_WEBHOOK_URL) {
                const response = await fetch(OTP_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: ADMIN_PHONE,
                        otp: otp,
                        message: `🔐 *Kode OTP Event Manager*\n\nKode OTP Anda: *${otp}*\n\nKode ini berlaku selama 5 menit.\n\n_Jangan bagikan kode ini kepada siapapun._`,
                        timestamp: new Date().toISOString(),
                    }),
                });

                if (!response.ok) {
                    throw new Error('Gagal mengirim OTP');
                }
            } else {
                // Development mode - just log the OTP
                console.log('Development Mode - OTP:', otp);
            }

            setOtpSent(true);
            return { success: true, message: 'OTP berhasil dikirim ke nomor admin' };
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError('Gagal mengirim OTP. Silakan coba lagi.');
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verify OTP and create session
     */
    const verifyOtp = async (inputOtp) => {
        setError(null);
        setIsLoading(true);

        try {
            if (!generatedOtp) {
                throw new Error('OTP belum dikirim. Silakan request OTP terlebih dahulu.');
            }

            if (inputOtp !== generatedOtp) {
                throw new Error('Kode OTP tidak valid. Silakan coba lagi.');
            }

            // Create session
            const expiryTime = Date.now() + SESSION_DURATION_MS;
            const sessionData = {
                loginTime: Date.now(),
                expiryTime: expiryTime,
            };

            localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
            localStorage.setItem(STORAGE_KEYS.AUTH_EXPIRY, expiryTime.toString());

            setIsAuthenticated(true);
            setSessionExpiry(expiryTime);
            setOtpSent(false);
            setGeneratedOtp(null);

            return { success: true, message: 'Login berhasil!' };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError(error.message);
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Logout and clear session
     */
    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
        localStorage.removeItem(STORAGE_KEYS.AUTH_EXPIRY);
        setIsAuthenticated(false);
        setSessionExpiry(null);
        setOtpSent(false);
        setGeneratedOtp(null);
        setError(null);
    }, []);

    /**
     * Get remaining session time in minutes
     */
    const getSessionTimeRemaining = useCallback(() => {
        if (!sessionExpiry) return 0;
        const remaining = sessionExpiry - Date.now();
        return Math.max(0, Math.ceil(remaining / 60000)); // in minutes
    }, [sessionExpiry]);

    /**
     * Format session expiry for display
     */
    const getSessionExpiryDisplay = useCallback(() => {
        if (!sessionExpiry) return null;
        const date = new Date(sessionExpiry);
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, [sessionExpiry]);

    /**
     * Reset OTP state (for retry)
     */
    const resetOtpState = useCallback(() => {
        setOtpSent(false);
        setGeneratedOtp(null);
        setError(null);
    }, []);

    const value = {
        isAuthenticated,
        isLoading,
        otpSent,
        sessionExpiry,
        error,
        requestOtp,
        verifyOtp,
        logout,
        checkSession,
        getSessionTimeRemaining,
        getSessionExpiryDisplay,
        resetOtpState,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
