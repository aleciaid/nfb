import { useState, useRef, useEffect } from 'react';
import { Shield, KeyRound, Loader2, Phone, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose }) => {
    const { requestOtp, verifyOtp, otpSent, isLoading, error, resetOtpState } = useAuth();
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('request'); // 'request' | 'verify'
    const inputRefs = useRef([]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setOtpDigits(['', '', '', '', '', '']);
            setStep(otpSent ? 'verify' : 'request');
        }
    }, [isOpen, otpSent]);

    // Focus first input when entering verify step
    useEffect(() => {
        if (step === 'verify' && inputRefs.current[0]) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    const handleRequestOtp = async () => {
        const result = await requestOtp();
        if (result.success) {
            setStep('verify');
            toast.success('OTP telah dikirim ke WhatsApp admin!', {
                icon: '📱',
                duration: 4000,
            });
        } else {
            toast.error(result.message);
        }
    };

    const handleOtpChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newDigits = [...otpDigits];

        // Handle paste
        if (value.length > 1) {
            const pastedDigits = value.slice(0, 6).split('');
            pastedDigits.forEach((digit, i) => {
                if (index + i < 6) {
                    newDigits[index + i] = digit;
                }
            });
            setOtpDigits(newDigits);

            // Focus last filled or next empty
            const nextIndex = Math.min(index + pastedDigits.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        newDigits[index] = value;
        setOtpDigits(newDigits);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            toast.error('Masukkan 6 digit kode OTP');
            return;
        }

        const result = await verifyOtp(otp);
        if (result.success) {
            toast.success('Login berhasil! Selamat datang.', {
                icon: '🎉',
                duration: 3000,
            });
            onClose?.();
        } else {
            toast.error(result.message);
            setOtpDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    const handleBack = () => {
        resetOtpState();
        setStep('request');
        setOtpDigits(['', '', '', '', '', '']);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && !isLoading && onClose?.()}
        >
            <div
                className="relative w-full max-w-md overflow-hidden rounded-3xl 
                    bg-gradient-to-br from-white to-dark-50 dark:from-dark-800 dark:to-dark-900
                    shadow-2xl border border-dark-200/50 dark:border-dark-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl 
                            bg-gradient-to-br from-primary-500 to-primary-600 
                            shadow-lg shadow-primary-500/30 mb-6">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-2">
                            {step === 'request' ? 'Autentikasi Diperlukan' : 'Masukkan Kode OTP'}
                        </h2>
                        <p className="text-sm text-dark-500 dark:text-dark-400">
                            {step === 'request'
                                ? 'Login diperlukan untuk mengakses fitur menambahkan acara'
                                : 'Kode OTP telah dikirim ke WhatsApp admin'
                            }
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-error-500/10 border border-error-500/30 
                            flex items-center gap-3 text-error-600 dark:text-error-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {step === 'request' ? (
                        /* Request OTP Step */
                        <div className="space-y-6">
                            {/* Info Card */}
                            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Phone className="w-5 h-5 text-primary-500" />
                                    <span className="text-sm font-medium text-dark-700 dark:text-dark-200">
                                        OTP akan dikirim ke:
                                    </span>
                                </div>
                                <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 ml-8">
                                    +62 ••• •••• ••14
                                </p>
                            </div>

                            <button
                                onClick={handleRequestOtp}
                                disabled={isLoading}
                                className="w-full py-4 px-6 rounded-xl font-semibold text-white
                                    bg-gradient-to-r from-primary-500 to-primary-600
                                    hover:from-primary-600 hover:to-primary-700
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30
                                    transform hover:scale-[1.02] active:scale-[0.98]
                                    transition-all duration-200
                                    flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Mengirim OTP...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-5 h-5" />
                                        Kirim Kode OTP
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Verify OTP Step */
                        <div className="space-y-6">
                            {/* OTP Input */}
                            <div className="flex justify-center gap-2 sm:gap-3">
                                {otpDigits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        disabled={isLoading}
                                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold
                                            rounded-xl border-2 border-dark-200 dark:border-dark-600
                                            bg-white dark:bg-dark-700
                                            text-dark-900 dark:text-white
                                            focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20
                                            disabled:opacity-50
                                            transition-all duration-200"
                                    />
                                ))}
                            </div>

                            {/* Session Info */}
                            <div className="text-center p-4 rounded-xl bg-success-500/10 border border-success-500/20">
                                <p className="text-sm text-dark-600 dark:text-dark-300">
                                    <CheckCircle2 className="w-4 h-4 inline-block mr-2 text-success-500" />
                                    Session akan aktif selama <strong>2 jam</strong>
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isLoading || otpDigits.join('').length !== 6}
                                    className="w-full py-4 px-6 rounded-xl font-semibold text-white
                                        bg-gradient-to-r from-primary-500 to-primary-600
                                        hover:from-primary-600 hover:to-primary-700
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30
                                        transform hover:scale-[1.02] active:scale-[0.98]
                                        transition-all duration-200
                                        flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Memverifikasi...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Verifikasi & Login
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleBack}
                                    disabled={isLoading}
                                    className="w-full py-3 px-6 rounded-xl font-medium
                                        text-dark-600 dark:text-dark-300
                                        hover:bg-dark-100 dark:hover:bg-dark-700
                                        disabled:opacity-50
                                        transition-all duration-200
                                        flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Kirim Ulang OTP
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
