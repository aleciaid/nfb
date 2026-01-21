import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getEventsFromStorage, saveEventsToStorage } from '../services/eventService';

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
    // Initialize events from localStorage
    const [events, setEvents] = useState(() => getEventsFromStorage());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [lastSyncInfo, setLastSyncInfo] = useState(null);

    const itemsPerPage = 10;

    // Save to localStorage whenever events change
    useEffect(() => {
        saveEventsToStorage(events);
    }, [events]);

    // Add event to local state
    const addEvent = useCallback((event) => {
        setEvents((prev) => [event, ...prev]);
    }, []);

    // Update event in local state
    const updateEvent = useCallback((updatedEvent) => {
        setEvents((prev) =>
            prev.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );
    }, []);

    // Remove event from local state
    const removeEvent = useCallback((eventId) => {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
    }, []);

    // Set all events (for sync)
    const syncEvents = useCallback((newEvents) => {
        setEvents(newEvents);
    }, []);

    // Filter and sort events
    const getFilteredEvents = useCallback(() => {
        let filtered = [...events];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (event) =>
                    event.namaAcara?.toLowerCase().includes(query) ||
                    event.lokasi?.toLowerCase().includes(query) ||
                    event.id?.includes(query)
            );
        }

        // Sort by date (tanggal + waktu)
        filtered.sort((a, b) => {
            const dateA = new Date(`${a.tanggal}T${a.waktu || '00:00'}`);
            const dateB = new Date(`${b.tanggal}T${b.waktu || '00:00'}`);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        return filtered;
    }, [events, searchQuery, sortOrder]);

    // Pagination
    const getPaginatedEvents = useCallback(() => {
        const filtered = getFilteredEvents();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filtered.slice(startIndex, endIndex);
    }, [getFilteredEvents, currentPage, itemsPerPage]);

    const getTotalPages = useCallback(() => {
        return Math.ceil(getFilteredEvents().length / itemsPerPage);
    }, [getFilteredEvents, itemsPerPage]);

    // Modal handlers
    const openDetailModal = useCallback((event) => {
        setSelectedEvent(event);
        setIsEditMode(false);
        setIsModalOpen(true);
    }, []);

    const openEditModal = useCallback((event) => {
        setSelectedEvent(event);
        setIsEditMode(true);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        setIsEditMode(false);
    }, []);

    // Form modal handlers
    const openFormModal = useCallback(() => {
        setIsFormModalOpen(true);
    }, []);

    const closeFormModal = useCallback(() => {
        setIsFormModalOpen(false);
    }, []);

    const value = {
        events,
        setEvents,
        isLoading,
        setIsLoading,
        error,
        setError,
        searchQuery,
        setSearchQuery,
        sortOrder,
        setSortOrder,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        selectedEvent,
        isModalOpen,
        isEditMode,
        isFormModalOpen,
        lastSyncInfo,
        setLastSyncInfo,
        addEvent,
        updateEvent,
        removeEvent,
        syncEvents,
        getFilteredEvents,
        getPaginatedEvents,
        getTotalPages,
        openDetailModal,
        openEditModal,
        closeModal,
        openFormModal,
        closeFormModal,
    };

    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvent = () => {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
};

export default EventContext;
