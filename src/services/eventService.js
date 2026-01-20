// API Service untuk Event Management
// Menangani semua komunikasi dengan webhook dan localStorage cache

const WEBHOOK_GET_URL = import.meta.env.VITE_WEBHOOK_GET_URL;
const WEBHOOK_POST_URL = import.meta.env.VITE_WEBHOOK_POST_URL;
const CACHE_DURATION_MINUTES = parseInt(import.meta.env.VITE_CACHE_DURATION_MINUTES) || 10;

// LocalStorage keys
const STORAGE_KEYS = {
    EVENTS: 'event_manager_events',
    LAST_SYNC: 'event_manager_last_sync',
};

/**
 * Generate unique 6-digit random ID
 * @returns {string} 6-digit random ID
 */
export const generateUniqueId = () => {
    const min = 100000;
    const max = 999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

/**
 * Format date to YYYY-MM-DD format
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Format time to HH:mm format
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Parse datetime-local input value to separate date and time
 * @param {string} value - datetime-local input value (YYYY-MM-DDTHH:mm)
 * @returns {{tanggal: string, waktu: string}}
 */
export const parseLocalDateTime = (value) => {
    if (!value) return { tanggal: '', waktu: '' };
    const [tanggal, waktu] = value.split('T');
    return { tanggal, waktu };
};

/**
 * Combine tanggal and waktu to datetime-local format
 * @param {string} tanggal - YYYY-MM-DD format
 * @param {string} waktu - HH:mm format
 * @returns {string} - YYYY-MM-DDTHH:mm format
 */
export const toLocalDateTimeFormat = (tanggal, waktu) => {
    if (!tanggal || !waktu) return '';
    return `${tanggal}T${waktu}`;
};

/**
 * Validate if date is not in the past
 * @param {string} tanggal - YYYY-MM-DD format
 * @param {string} waktu - HH:mm format
 * @returns {boolean}
 */
export const isDateValid = (tanggal, waktu) => {
    const inputDate = new Date(`${tanggal}T${waktu}`);
    const now = new Date();
    return inputDate >= now;
};

// ==================== LocalStorage Functions ====================

/**
 * Get events from localStorage
 * @returns {Array}
 */
export const getEventsFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
};

/**
 * Save events to localStorage
 * @param {Array} events 
 */
export const saveEventsToStorage = (events) => {
    try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

/**
 * Add single event to localStorage
 * @param {Object} event 
 */
export const addEventToStorage = (event) => {
    const events = getEventsFromStorage();
    events.unshift(event);
    saveEventsToStorage(events);
};

/**
 * Remove event from localStorage
 * @param {string} eventId 
 */
export const removeEventFromStorage = (eventId) => {
    const events = getEventsFromStorage();
    const filtered = events.filter(e => String(e.id) !== String(eventId));
    saveEventsToStorage(filtered);
};

/**
 * Update event in localStorage
 * @param {Object} updatedEvent 
 */
export const updateEventInStorage = (updatedEvent) => {
    const events = getEventsFromStorage();
    const updated = events.map(e => String(e.id) === String(updatedEvent.id) ? updatedEvent : e);
    saveEventsToStorage(updated);
};

/**
 * Get last sync timestamp
 * @returns {number|null}
 */
export const getLastSyncTime = () => {
    try {
        const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        return timestamp ? parseInt(timestamp) : null;
    } catch {
        return null;
    }
};

/**
 * Set last sync timestamp
 */
export const setLastSyncTime = () => {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
};

/**
 * Check if cache is still valid (within configured minutes)
 * @returns {boolean}
 */
export const isCacheValid = () => {
    const lastSync = getLastSyncTime();
    if (!lastSync) return false;

    const now = Date.now();
    const diffMinutes = (now - lastSync) / (1000 * 60);
    return diffMinutes < CACHE_DURATION_MINUTES;
};

/**
 * Get time remaining until next sync (in minutes)
 * @returns {number}
 */
export const getTimeUntilNextSync = () => {
    const lastSync = getLastSyncTime();
    if (!lastSync) return 0;

    const now = Date.now();
    const diffMinutes = (now - lastSync) / (1000 * 60);
    const remaining = CACHE_DURATION_MINUTES - diffMinutes;
    return Math.max(0, Math.ceil(remaining));
};

/**
 * Format last sync time for display
 * @returns {string}
 */
export const getLastSyncDisplay = () => {
    const lastSync = getLastSyncTime();
    if (!lastSync) return 'Belum pernah sinkron';

    const date = new Date(lastSync);
    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ==================== Data Transformation ====================

/**
 * Transform event from API format to internal format
 * API format: { "row_number", "id", "nama acara", "tanggal", "waktu", "lokasi", "dresscode", "note" }
 * @param {Object} apiEvent 
 * @returns {Object}
 */
export const transformFromApi = (apiEvent) => {
    return {
        id: String(apiEvent.id),
        rowNumber: apiEvent.row_number,
        namaAcara: apiEvent['nama acara'] || apiEvent.namaAcara || '',
        tanggal: apiEvent.tanggal || '',
        waktu: apiEvent.waktu || '',
        lokasi: apiEvent.lokasi || '',
        dresscode: apiEvent.dresscode || '',
        note: apiEvent.note || '',
    };
};

/**
 * Transform event from internal format to API format for POST
 * @param {Object} internalEvent 
 * @returns {Object}
 */
export const transformToApi = (internalEvent) => {
    return {
        id: internalEvent.id,
        'nama acara': internalEvent.namaAcara,
        tanggal: internalEvent.tanggal,
        waktu: internalEvent.waktu,
        lokasi: internalEvent.lokasi,
        dresscode: internalEvent.dresscode,
        note: internalEvent.note,
    };
};

// ==================== API Functions ====================

/**
 * POST event data to webhook
 * @param {Object} eventData - Event data to submit (internal format)
 * @returns {Promise<Object>}
 */
export const postEvent = async (eventData) => {
    if (!WEBHOOK_POST_URL) {
        throw new Error('Webhook POST URL tidak dikonfigurasi. Periksa file .env');
    }

    // Transform to API format
    const apiData = transformToApi(eventData);

    const response = await fetch(WEBHOOK_POST_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Also save to localStorage (internal format)
    addEventToStorage(eventData);

    // Try to parse response, but don't fail if it's not JSON
    try {
        return await response.json();
    } catch {
        return { success: true };
    }
};

/**
 * GET events from webhook (with cache check)
 * @param {boolean} forceRefresh - Force refresh even if cache is valid
 * @returns {Promise<{events: Array, fromCache: boolean, lastSync: string}>}
 */
export const getEvents = async (forceRefresh = false) => {
    // Check if cache is valid and not forcing refresh
    if (!forceRefresh && isCacheValid()) {
        const cachedEvents = getEventsFromStorage();
        return {
            events: cachedEvents,
            fromCache: true,
            lastSync: getLastSyncDisplay(),
            nextSyncIn: getTimeUntilNextSync(),
        };
    }

    // Fetch from webhook
    if (!WEBHOOK_GET_URL) {
        throw new Error('Webhook GET URL tidak dikonfigurasi. Periksa file .env');
    }

    const response = await fetch(WEBHOOK_GET_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const rawEvents = Array.isArray(data) ? data : data.data || data.events || [];

    // Transform events from API format to internal format
    const events = rawEvents.map(transformFromApi);

    // Save to localStorage and update last sync time
    saveEventsToStorage(events);
    setLastSyncTime();

    return {
        events,
        fromCache: false,
        lastSync: getLastSyncDisplay(),
        nextSyncIn: CACHE_DURATION_MINUTES,
    };
};

/**
 * DELETE event (removes from local storage only)
 * @param {string} eventId - Event ID to delete
 * @returns {Promise<Object>}
 */
export const deleteEvent = async (eventId) => {
    // Remove from localStorage
    removeEventFromStorage(eventId);
    return { success: true };
};

/**
 * Dresscode options
 */
export const DRESSCODE_OPTIONS = [
    { value: 'Formal', label: 'Formal' },
    { value: 'Semi-Formal', label: 'Semi-Formal' },
    { value: 'Casual', label: 'Casual' },
    { value: 'Tradisional', label: 'Tradisional' },
];

/**
 * Get dresscode badge color
 * @param {string} dresscode 
 * @returns {string} - Tailwind color classes
 */
export const getDresscodeColor = (dresscode) => {
    const colors = {
        'Formal': 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
        'Semi-Formal': 'bg-accent-400/20 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400',
        'Casual': 'bg-success-500/20 text-success-600 dark:bg-success-500/20 dark:text-success-500',
        'Tradisional': 'bg-warning-500/20 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500',
    };
    return colors[dresscode] || 'bg-dark-200 text-dark-600 dark:bg-dark-700 dark:text-dark-300';
};

/**
 * Get cache duration in minutes
 * @returns {number}
 */
export const getCacheDuration = () => CACHE_DURATION_MINUTES;
