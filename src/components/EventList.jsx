import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    RefreshCw,
    Search,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Calendar,
    Clock,
    MapPin,
    Loader2,
    FolderOpen,
    Database,
    Wifi,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import {
    getEvents,
    getDresscodeColor,
    isCacheValid,
    getLastSyncDisplay,
    getTimeUntilNextSync,
    getCacheDuration,
} from '../services/eventService';

const EventList = () => {
    const {
        events,
        isLoading,
        setIsLoading,
        searchQuery,
        setSearchQuery,
        sortOrder,
        setSortOrder,
        currentPage,
        setCurrentPage,
        getPaginatedEvents,
        getTotalPages,
        getFilteredEvents,
        syncEvents,
        openDetailModal,
        lastSyncInfo,
        setLastSyncInfo,
    } = useEvent();

    const [timeUntilSync, setTimeUntilSync] = useState(getTimeUntilNextSync());

    // Update countdown timer every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeUntilSync(getTimeUntilNextSync());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [lastSyncInfo]);

    // Auto-load from cache on mount
    useEffect(() => {
        const loadInitialData = async () => {
            // Only auto-sync if cache is invalid
            if (!isCacheValid() && events.length === 0) {
                handleSync(false);
            } else {
                setLastSyncInfo({
                    fromCache: true,
                    lastSync: getLastSyncDisplay(),
                    nextSyncIn: getTimeUntilNextSync(),
                });
            }
        };
        loadInitialData();
    }, []);

    const handleSync = async (forceRefresh = true) => {
        setIsLoading(true);
        try {
            const result = await getEvents(forceRefresh);
            syncEvents(result.events);
            setLastSyncInfo({
                fromCache: result.fromCache,
                lastSync: result.lastSync,
                nextSyncIn: result.nextSyncIn,
            });
            setTimeUntilSync(result.nextSyncIn);

            if (result.fromCache) {
                toast.success(`${result.events.length} acara dimuat dari cache`, {
                    icon: '📦',
                });
            } else {
                toast.success(`${result.events.length} acara berhasil disinkronkan`, {
                    icon: '🔄',
                });
            }
        } catch (error) {
            console.error('Error syncing events:', error);
            toast.error(`Gagal menyinkronkan: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSort = () => {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const paginatedEvents = getPaginatedEvents();
    const totalPages = getTotalPages();
    const filteredCount = getFilteredEvents().length;
    const cacheIsValid = isCacheValid();

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, setCurrentPage]);

    // Format date for display (tanggal: YYYY-MM-DD -> DD-MM-YYYY)
    const formatDate = (tanggal) => {
        if (!tanggal) return '-';
        // tanggal format: YYYY-MM-DD
        const parts = tanggal.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return tanggal;
    };

    // Format time for display (waktu: HH:mm)
    const formatTime = (waktu) => {
        if (!waktu) return '-';
        return waktu;
    };

    return (
        <div className="glass rounded-2xl shadow-xl border border-dark-200 dark:border-dark-700 overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-dark-200 dark:border-dark-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-dark-800 dark:text-dark-50 mb-1">
                            Daftar Acara
                        </h2>
                        <p className="text-dark-500 dark:text-dark-400 text-sm">
                            {events.length} acara terdaftar
                            {searchQuery && ` • ${filteredCount} hasil pencarian`}
                        </p>
                    </div>

                    <button
                        onClick={() => handleSync(true)}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 py-2.5 px-5 
              bg-gradient-to-r from-accent-500 to-accent-600 
              hover:from-accent-600 hover:to-accent-600
              text-white font-medium rounded-xl shadow-lg shadow-accent-500/25
              btn-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-5 h-5" />
                        )}
                        <span>{isLoading ? 'Menyinkronkan...' : 'Sinkron'}</span>
                    </button>
                </div>

                {/* Cache Status */}
                <div className="mt-4 p-3 rounded-xl bg-dark-100/50 dark:bg-dark-800/50 border border-dark-200 dark:border-dark-700">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-dark-600 dark:text-dark-300">
                            <Database className="w-4 h-4 text-primary-500" />
                            <span>
                                {cacheIsValid ? (
                                    <span className="text-success-600 dark:text-success-500">Cache aktif</span>
                                ) : (
                                    <span className="text-warning-600 dark:text-warning-500">Cache kadaluarsa</span>
                                )}
                            </span>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 text-dark-500 dark:text-dark-400">
                            <Clock className="w-4 h-4" />
                            <span>Terakhir: {lastSyncInfo?.lastSync || getLastSyncDisplay()}</span>
                        </div>

                        {cacheIsValid && timeUntilSync > 0 && (
                            <div className="flex items-center gap-2 text-dark-500 dark:text-dark-400">
                                <Wifi className="w-4 h-4" />
                                <span>Update berikutnya: {timeUntilSync} menit</span>
                            </div>
                        )}

                        <div className="hidden md:flex items-center gap-2 text-dark-400 dark:text-dark-500 text-xs">
                            <span>Cache duration: {getCacheDuration()} menit</span>
                        </div>
                    </div>
                </div>

                {/* Search & Sort */}
                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama acara, lokasi, atau ID..."
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white dark:bg-dark-800 
                border border-dark-200 dark:border-dark-600 
                text-dark-800 dark:text-dark-100 placeholder-dark-400 dark:placeholder-dark-500
                input-focus focus:border-primary-500"
                        />
                    </div>

                    <button
                        onClick={toggleSort}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 
              bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-600
              text-dark-700 dark:text-dark-200 font-medium rounded-xl
              hover:bg-dark-50 dark:hover:bg-dark-700 transition-colors"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        <span>Tanggal: {sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-container">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                        <p className="text-dark-500 dark:text-dark-400">Memuat data acara...</p>
                    </div>
                ) : paginatedEvents.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-dark-100 dark:bg-dark-800 
              flex items-center justify-center mx-auto mb-4">
                            <FolderOpen className="w-8 h-8 text-dark-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-200 mb-1">
                            {searchQuery ? 'Tidak ada hasil' : 'Belum ada acara'}
                        </h3>
                        <p className="text-dark-500 dark:text-dark-400 mb-4">
                            {searchQuery
                                ? 'Coba kata kunci pencarian lain'
                                : 'Tambahkan acara baru atau klik tombol Sinkron'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => handleSync(true)}
                                className="inline-flex items-center gap-2 py-2 px-4 
                  bg-primary-500 hover:bg-primary-600 text-white 
                  font-medium rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Sinkron Sekarang
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <table className="w-full hidden lg:table">
                            <thead>
                                <tr className="bg-dark-50 dark:bg-dark-800/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        Nama Acara
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        Tanggal & Waktu
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        Lokasi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        Dresscode
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-100 dark:divide-dark-700">
                                {paginatedEvents.map((event, index) => (
                                    <tr
                                        key={event.id}
                                        className="hover:bg-dark-50/50 dark:hover:bg-dark-800/30 transition-colors animate-fade-in"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-dark-100 dark:bg-dark-800 rounded text-sm font-mono text-dark-600 dark:text-dark-300">
                                                {event.id}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-dark-800 dark:text-dark-100">
                                                {event.namaAcara}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                                                    <Calendar className="w-4 h-4 text-dark-400" />
                                                    {formatDate(event.tanggal)}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                                                    <Clock className="w-4 h-4 text-dark-400" />
                                                    {formatTime(event.waktu)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 text-sm text-dark-600 dark:text-dark-300 max-w-xs">
                                                <MapPin className="w-4 h-4 text-dark-400 flex-shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{event.lokasi}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDresscodeColor(event.dresscode)}`}
                                            >
                                                {event.dresscode || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => openDetailModal(event)}
                                                    className="flex items-center gap-2 py-2 px-4 rounded-lg 
                            bg-primary-50 dark:bg-primary-900/20 
                            text-primary-600 dark:text-primary-400 text-sm font-medium
                            hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-dark-100 dark:divide-dark-700">
                            {paginatedEvents.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="p-4 animate-fade-in"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-dark-800 dark:text-dark-100 mb-1">
                                                {event.namaAcara}
                                            </h3>
                                            <code className="px-2 py-0.5 bg-dark-100 dark:bg-dark-800 rounded text-xs font-mono text-dark-500">
                                                #{event.id}
                                            </code>
                                        </div>
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getDresscodeColor(event.dresscode)}`}
                                        >
                                            {event.dresscode || '-'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-dark-600 dark:text-dark-300 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-dark-400" />
                                                {formatDate(event.tanggal)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-dark-400" />
                                                {formatTime(event.waktu)}
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-dark-400 flex-shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{event.lokasi}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-dark-100 dark:border-dark-700">
                                        <button
                                            onClick={() => openDetailModal(event)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 
                        rounded-lg bg-primary-50 dark:bg-primary-900/20 
                        text-primary-600 dark:text-primary-400 text-sm font-medium
                        hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Lihat Detail
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-dark-200 dark:border-dark-700">
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                        Halaman {currentPage} dari {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-dark-200 dark:border-dark-600
                text-dark-600 dark:text-dark-300 
                hover:bg-dark-50 dark:hover:bg-dark-700
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                      ${currentPage === pageNum
                                                ? 'bg-primary-500 text-white'
                                                : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-dark-200 dark:border-dark-600
                text-dark-600 dark:text-dark-300 
                hover:bg-dark-50 dark:hover:bg-dark-700
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventList;
