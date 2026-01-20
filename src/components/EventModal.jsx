import { useEffect } from 'react';
import {
    X,
    Calendar,
    Clock,
    MapPin,
    Shirt,
    FileText,
    Hash,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { getDresscodeColor } from '../services/eventService';

const EventModal = () => {
    const { isModalOpen, selectedEvent, closeModal } = useEvent();

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [closeModal]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    if (!isModalOpen || !selectedEvent) return null;

    // Format date for display (tanggal: YYYY-MM-DD -> DD-MM-YYYY)
    const formatDate = (tanggal) => {
        if (!tanggal) return '-';
        const parts = tanggal.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return tanggal;
    };

    // Format time for display
    const formatTime = (waktu) => {
        if (!waktu) return '-';
        return waktu;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm animate-fade-in"
                onClick={closeModal}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-dark-800 rounded-2xl shadow-2xl animate-fade-in overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4 border-b border-dark-100 dark:border-dark-700">
                    <div className="pr-10">
                        <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-3 ${getDresscodeColor(selectedEvent.dresscode)}`}
                        >
                            {selectedEvent.dresscode || '-'}
                        </span>
                        <h2 className="text-xl font-bold text-dark-800 dark:text-dark-50">
                            {selectedEvent.namaAcara}
                        </h2>
                    </div>

                    <button
                        onClick={closeModal}
                        className="absolute top-6 right-6 p-2 rounded-lg text-dark-400 
              hover:text-dark-600 dark:hover:text-dark-200
              hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-5">
                    {/* ID */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-dark-100 dark:bg-dark-700 
              flex items-center justify-center flex-shrink-0">
                            <Hash className="w-5 h-5 text-dark-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">
                                ID Acara
                            </p>
                            <code className="px-3 py-1.5 bg-dark-100 dark:bg-dark-700 rounded-lg 
                text-sm font-mono text-dark-700 dark:text-dark-200">
                                {selectedEvent.id}
                            </code>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 
              flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">
                                Tanggal
                            </p>
                            <p className="text-dark-800 dark:text-dark-100 font-medium">
                                {formatDate(selectedEvent.tanggal)}
                            </p>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-400/20 dark:bg-accent-500/20 
              flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">
                                Waktu
                            </p>
                            <p className="text-dark-800 dark:text-dark-100 font-medium">
                                {formatTime(selectedEvent.waktu)}
                            </p>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-success-500/20 
              flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-success-600 dark:text-success-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">
                                Lokasi
                            </p>
                            <p className="text-dark-800 dark:text-dark-100 whitespace-pre-wrap">
                                {selectedEvent.lokasi}
                            </p>
                        </div>
                    </div>

                    {/* Dresscode */}
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-warning-500/20 
              flex items-center justify-center flex-shrink-0">
                            <Shirt className="w-5 h-5 text-warning-600 dark:text-warning-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">
                                Dresscode
                            </p>
                            <p className="text-dark-800 dark:text-dark-100">
                                {selectedEvent.dresscode || '-'}
                            </p>
                        </div>
                    </div>

                    {/* Note */}
                    {selectedEvent.note && (
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-dark-100 dark:bg-dark-700 
                flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-dark-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-dark-500 dark:text-dark-400 mb-1">
                                    Catatan
                                </p>
                                <p className="text-dark-800 dark:text-dark-100 whitespace-pre-wrap">
                                    {selectedEvent.note}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-dark-50 dark:bg-dark-900/50 border-t border-dark-100 dark:border-dark-700">
                    <button
                        onClick={closeModal}
                        className="w-full py-2.5 px-4 rounded-xl bg-dark-200 dark:bg-dark-700 
              text-dark-700 dark:text-dark-200 font-medium
              hover:bg-dark-300 dark:hover:bg-dark-600 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
