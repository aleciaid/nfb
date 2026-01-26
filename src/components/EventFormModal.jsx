import { X } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import EventForm from './EventForm';

const EventFormModal = () => {
    const { isFormModalOpen, closeFormModal } = useEvent();
    const { isAuthenticated } = useAuth();

    // SECURITY: Only render modal if user is authenticated AND modal is open
    if (!isFormModalOpen || !isAuthenticated) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={closeFormModal}
        >
            <div
                className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl 
                    bg-white dark:bg-dark-800 shadow-2xl border border-dark-200 dark:border-dark-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={closeFormModal}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full 
                        bg-dark-100 dark:bg-dark-700 
                        hover:bg-dark-200 dark:hover:bg-dark-600 
                        text-dark-500 dark:text-dark-400
                        transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Form Content */}
                <div className="overflow-y-auto max-h-[90vh] p-6">
                    <EventForm onSuccess={closeFormModal} />
                </div>
            </div>
        </div>
    );
};

export default EventFormModal;

