import { useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Shirt, FileText, Send, Loader2 } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import {
    generateUniqueId,
    parseLocalDateTime,
    isDateValid,
    postEvent,
    DRESSCODE_OPTIONS,
} from '../services/eventService';

const EventForm = () => {
    const { addEvent } = useEvent();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        namaAcara: '',
        tanggalWaktu: '', // datetime-local value: YYYY-MM-DDTHH:mm
        lokasi: '',
        dresscode: '',
        note: '',
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.namaAcara.trim()) {
            newErrors.namaAcara = 'Nama acara wajib diisi';
        }

        if (!formData.tanggalWaktu) {
            newErrors.tanggalWaktu = 'Tanggal & waktu wajib diisi';
        } else {
            const { tanggal, waktu } = parseLocalDateTime(formData.tanggalWaktu);
            if (!isDateValid(tanggal, waktu)) {
                newErrors.tanggalWaktu = 'Tanggal tidak boleh di masa lalu';
            }
        }

        if (!formData.lokasi.trim()) {
            newErrors.lokasi = 'Lokasi/alamat wajib diisi';
        }

        if (!formData.dresscode) {
            newErrors.dresscode = 'Dresscode wajib dipilih';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const resetForm = () => {
        setFormData({
            namaAcara: '',
            tanggalWaktu: '',
            lokasi: '',
            dresscode: '',
            note: '',
        });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Mohon lengkapi semua field yang wajib diisi');
            return;
        }

        setIsSubmitting(true);

        // Parse tanggal dan waktu dari datetime-local
        const { tanggal, waktu } = parseLocalDateTime(formData.tanggalWaktu);

        // Create event data with the new structure
        const eventData = {
            id: generateUniqueId(),
            namaAcara: formData.namaAcara.trim(),
            tanggal: tanggal,
            waktu: waktu,
            lokasi: formData.lokasi.trim(),
            dresscode: formData.dresscode,
            note: formData.note.trim(),
        };

        try {
            await postEvent(eventData);
            addEvent(eventData);
            toast.success('Acara berhasil ditambahkan!');
            resetForm();
        } catch (error) {
            console.error('Error submitting event:', error);
            toast.error(`Gagal menambahkan acara: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get minimum datetime (now)
    const getMinDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - offset * 60 * 1000);
        return local.toISOString().slice(0, 16);
    };

    return (
        <div className="glass rounded-2xl p-6 md:p-8 shadow-xl border border-dark-200 dark:border-dark-700">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-dark-800 dark:text-dark-50 mb-2">
                    Tambah Acara Baru
                </h2>
                <p className="text-dark-500 dark:text-dark-400">
                    Isi form di bawah untuk membuat acara baru
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nama Acara */}
                <div>
                    <label
                        htmlFor="namaAcara"
                        className="flex items-center gap-2 text-sm font-medium text-dark-700 dark:text-dark-200 mb-2"
                    >
                        <Calendar className="w-4 h-4" />
                        Nama Acara <span className="text-danger-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="namaAcara"
                        name="namaAcara"
                        value={formData.namaAcara}
                        onChange={handleChange}
                        placeholder="Contoh: Rapat Tahunan 2026"
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-800 border 
              ${errors.namaAcara ? 'border-danger-500' : 'border-dark-200 dark:border-dark-600'} 
              text-dark-800 dark:text-dark-100 placeholder-dark-400 dark:placeholder-dark-500
              input-focus focus:border-primary-500`}
                    />
                    {errors.namaAcara && (
                        <p className="mt-1 text-sm text-danger-500">{errors.namaAcara}</p>
                    )}
                </div>

                {/* Tanggal & Waktu */}
                <div>
                    <label
                        htmlFor="tanggalWaktu"
                        className="flex items-center gap-2 text-sm font-medium text-dark-700 dark:text-dark-200 mb-2"
                    >
                        <Calendar className="w-4 h-4" />
                        Tanggal & Waktu <span className="text-danger-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        id="tanggalWaktu"
                        name="tanggalWaktu"
                        value={formData.tanggalWaktu}
                        onChange={handleChange}
                        min={getMinDateTime()}
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-800 border 
              ${errors.tanggalWaktu ? 'border-danger-500' : 'border-dark-200 dark:border-dark-600'} 
              text-dark-800 dark:text-dark-100
              input-focus focus:border-primary-500`}
                    />
                    {errors.tanggalWaktu && (
                        <p className="mt-1 text-sm text-danger-500">{errors.tanggalWaktu}</p>
                    )}
                </div>

                {/* Lokasi */}
                <div>
                    <label
                        htmlFor="lokasi"
                        className="flex items-center gap-2 text-sm font-medium text-dark-700 dark:text-dark-200 mb-2"
                    >
                        <MapPin className="w-4 h-4" />
                        Tempat/Alamat <span className="text-danger-500">*</span>
                    </label>
                    <textarea
                        id="lokasi"
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Masukkan alamat lengkap lokasi acara"
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-800 border 
              ${errors.lokasi ? 'border-danger-500' : 'border-dark-200 dark:border-dark-600'} 
              text-dark-800 dark:text-dark-100 placeholder-dark-400 dark:placeholder-dark-500
              input-focus focus:border-primary-500 resize-none`}
                    />
                    {errors.lokasi && (
                        <p className="mt-1 text-sm text-danger-500">{errors.lokasi}</p>
                    )}
                </div>

                {/* Dresscode */}
                <div>
                    <label
                        htmlFor="dresscode"
                        className="flex items-center gap-2 text-sm font-medium text-dark-700 dark:text-dark-200 mb-2"
                    >
                        <Shirt className="w-4 h-4" />
                        Dresscode <span className="text-danger-500">*</span>
                    </label>
                    <select
                        id="dresscode"
                        name="dresscode"
                        value={formData.dresscode}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-800 border 
              ${errors.dresscode ? 'border-danger-500' : 'border-dark-200 dark:border-dark-600'} 
              text-dark-800 dark:text-dark-100
              input-focus focus:border-primary-500 cursor-pointer`}
                    >
                        <option value="">Pilih dresscode</option>
                        {DRESSCODE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.dresscode && (
                        <p className="mt-1 text-sm text-danger-500">{errors.dresscode}</p>
                    )}
                </div>

                {/* Note */}
                <div>
                    <label
                        htmlFor="note"
                        className="flex items-center gap-2 text-sm font-medium text-dark-700 dark:text-dark-200 mb-2"
                    >
                        <FileText className="w-4 h-4" />
                        Note/Catatan <span className="text-dark-400">(opsional)</span>
                    </label>
                    <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Catatan tambahan untuk acara ini"
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-800 border 
              border-dark-200 dark:border-dark-600 
              text-dark-800 dark:text-dark-100 placeholder-dark-400 dark:placeholder-dark-500
              input-focus focus:border-primary-500 resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 
            bg-gradient-to-r from-primary-500 to-primary-600 
            hover:from-primary-600 hover:to-primary-700
            text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25
            btn-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span>Simpan Acara</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default EventForm;
