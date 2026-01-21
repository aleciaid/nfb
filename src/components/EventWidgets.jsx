import { useState } from 'react';
import { Calendar, Clock, CalendarDays, X, MapPin, Shirt, Eye } from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { getDresscodeColor } from '../services/eventService';

const EventWidgets = () => {
    const { events, openDetailModal } = useEvent();
    const [activeWidget, setActiveWidget] = useState(null);

    // Get today's date at midnight
    const getToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    // Get tomorrow's date at midnight
    const getTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    };

    // Get next week range (next 7 days, excluding today and tomorrow)
    const getNextWeekRange = () => {
        const start = new Date();
        start.setDate(start.getDate() + 2); // Start from day after tomorrow
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setDate(end.getDate() + 8); // 7 days from now
        end.setHours(23, 59, 59, 999);

        return { start, end };
    };

    // Parse event date
    const parseEventDate = (tanggal) => {
        if (!tanggal) return null;
        const date = new Date(tanggal);
        date.setHours(0, 0, 0, 0);
        return date;
    };

    // Filter events for today
    const todayEvents = events.filter((event) => {
        const eventDate = parseEventDate(event.tanggal);
        const today = getToday();
        return eventDate && eventDate.getTime() === today.getTime();
    });

    // Filter events for tomorrow (soon)
    const tomorrowEvents = events.filter((event) => {
        const eventDate = parseEventDate(event.tanggal);
        const tomorrow = getTomorrow();
        return eventDate && eventDate.getTime() === tomorrow.getTime();
    });

    // Filter events for next week
    const nextWeekEvents = events.filter((event) => {
        const eventDate = parseEventDate(event.tanggal);
        const { start, end } = getNextWeekRange();
        return eventDate && eventDate >= start && eventDate <= end;
    });

    // Format date for display
    const formatDate = (tanggal) => {
        if (!tanggal) return '-';
        const parts = tanggal.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return tanggal;
    };

    // Widget data
    const widgets = [
        {
            id: 'today',
            title: 'Hari Ini',
            count: todayEvents.length,
            events: todayEvents,
            icon: Calendar,
            gradient: 'from-rose-500 to-pink-500',
            shadow: 'shadow-rose-500/30',
            bgLight: 'bg-rose-50',
            bgDark: 'dark:bg-rose-950/30',
            iconColor: 'text-rose-500',
            emptyText: 'Tidak ada acara hari ini'
        },
        {
            id: 'tomorrow',
            title: 'Besok (Soon)',
            count: tomorrowEvents.length,
            events: tomorrowEvents,
            icon: Clock,
            gradient: 'from-amber-500 to-orange-500',
            shadow: 'shadow-amber-500/30',
            bgLight: 'bg-amber-50',
            bgDark: 'dark:bg-amber-950/30',
            iconColor: 'text-amber-500',
            emptyText: 'Tidak ada acara besok'
        },
        {
            id: 'week',
            title: 'Minggu Depan',
            count: nextWeekEvents.length,
            events: nextWeekEvents,
            icon: CalendarDays,
            gradient: 'from-primary-500 to-primary-600',
            shadow: 'shadow-primary-500/30',
            bgLight: 'bg-primary-50',
            bgDark: 'dark:bg-primary-950/30',
            iconColor: 'text-primary-500',
            emptyText: 'Tidak ada acara minggu depan'
        }
    ];

    const handleWidgetClick = (widgetId) => {
        setActiveWidget(widgetId);
    };

    const closeModal = () => {
        setActiveWidget(null);
    };

    const activeWidgetData = widgets.find(w => w.id === activeWidget);

    return (
        <>
            {/* Widgets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {widgets.map((widget) => {
                    const Icon = widget.icon;
                    return (
                        <button
                            key={widget.id}
                            onClick={() => handleWidgetClick(widget.id)}
                            className={`group relative overflow-hidden rounded-2xl p-5 
                                ${widget.bgLight} ${widget.bgDark}
                                border border-dark-200 dark:border-dark-700
                                hover:scale-[1.02] transition-all duration-300 cursor-pointer
                                hover:shadow-lg ${widget.shadow}`}
                        >
                            {/* Background decoration */}
                            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full 
                                bg-gradient-to-br ${widget.gradient} opacity-10 
                                group-hover:opacity-20 transition-opacity`} />

                            <div className="relative flex items-center gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl 
                                    bg-gradient-to-br ${widget.gradient} 
                                    flex items-center justify-center shadow-lg ${widget.shadow}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>

                                <div className="text-left">
                                    <p className="text-sm font-medium text-dark-500 dark:text-dark-400">
                                        {widget.title}
                                    </p>
                                    <p className="text-2xl font-bold text-dark-800 dark:text-dark-100">
                                        {widget.count} <span className="text-base font-normal text-dark-500 dark:text-dark-400">acara</span>
                                    </p>
                                </div>
                            </div>

                            {/* Click indicator */}
                            <div className="absolute bottom-2 right-3 text-xs text-dark-400 dark:text-dark-500 
                                opacity-0 group-hover:opacity-100 transition-opacity">
                                Klik untuk detail →
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Detail Modal */}
            {activeWidget && activeWidgetData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
                    onClick={closeModal}
                >
                    <div
                        className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl 
                            bg-white dark:bg-dark-800 shadow-2xl border border-dark-200 dark:border-dark-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`sticky top-0 z-10 flex items-center justify-between p-6 
                            bg-gradient-to-r ${activeWidgetData.gradient} text-white`}>
                            <div className="flex items-center gap-3">
                                <activeWidgetData.icon className="w-6 h-6" />
                                <div>
                                    <h3 className="text-xl font-bold">{activeWidgetData.title}</h3>
                                    <p className="text-sm opacity-90">{activeWidgetData.count} acara ditemukan</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto max-h-[calc(80vh-88px)] p-4">
                            {activeWidgetData.events.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl 
                                        ${activeWidgetData.bgLight} ${activeWidgetData.bgDark}
                                        flex items-center justify-center`}>
                                        <activeWidgetData.icon className={`w-8 h-8 ${activeWidgetData.iconColor}`} />
                                    </div>
                                    <p className="text-dark-500 dark:text-dark-400">
                                        {activeWidgetData.emptyText}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeWidgetData.events.map((event, index) => (
                                        <div
                                            key={event.id}
                                            className="p-4 rounded-xl bg-dark-50 dark:bg-dark-900/50 
                                                border border-dark-100 dark:border-dark-700
                                                hover:shadow-md transition-all animate-fade-in"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-dark-800 dark:text-dark-100 truncate">
                                                            {event.namaAcara}
                                                        </h4>
                                                        <code className="px-2 py-0.5 bg-dark-200 dark:bg-dark-700 
                                                            rounded text-xs font-mono text-dark-500 dark:text-dark-400 flex-shrink-0">
                                                            #{event.id}
                                                        </code>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                        <div className="flex items-center gap-2 text-dark-600 dark:text-dark-300">
                                                            <Calendar className="w-4 h-4 text-dark-400 flex-shrink-0" />
                                                            <span>{formatDate(event.tanggal)} • {event.waktu || '-'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-dark-600 dark:text-dark-300">
                                                            <Shirt className="w-4 h-4 text-dark-400 flex-shrink-0" />
                                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getDresscodeColor(event.dresscode)}`}>
                                                                {event.dresscode || '-'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2 mt-2 text-sm text-dark-500 dark:text-dark-400">
                                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <span className="line-clamp-2">{event.lokasi}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        closeModal();
                                                        openDetailModal(event);
                                                    }}
                                                    className="flex-shrink-0 p-2 rounded-lg 
                                                        bg-primary-50 dark:bg-primary-900/20 
                                                        text-primary-600 dark:text-primary-400
                                                        hover:bg-primary-100 dark:hover:bg-primary-900/30 
                                                        transition-colors"
                                                    title="Lihat detail"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventWidgets;
