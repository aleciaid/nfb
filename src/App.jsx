import { Toaster } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { EventProvider, useEvent } from './context/EventContext';
import { Header, EventList, EventModal, EventWidgets, EventFormModal } from './components';

// Separate component to use useEvent hook
const MainContent = () => {
  const { openFormModal } = useEvent();

  return (
    <>
      {/* Main Content - Full Width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Widgets */}
        <EventWidgets />

        {/* Event List */}
        <EventList />
      </main>

      {/* Floating Add Button */}
      <button
        onClick={openFormModal}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 py-3 px-5
          bg-gradient-to-r from-primary-500 to-primary-600 
          hover:from-primary-600 hover:to-primary-700
          text-white font-semibold rounded-full shadow-2xl shadow-primary-500/40
          hover:scale-105 active:scale-100 transition-all duration-200
          group"
      >
        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span className="hidden sm:inline">Tambah Acara</span>
      </button>

      {/* Form Modal */}
      <EventFormModal />

      {/* Detail Modal */}
      <EventModal />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <EventProvider>
        <div className="min-h-screen bg-gradient-to-br from-dark-50 via-primary-50/30 to-accent-400/10 
          dark:from-dark-950 dark:via-dark-900 dark:to-primary-900/20
          transition-colors duration-300">
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #1f2937)',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Header */}
          <Header />

          {/* Main Content with EventProvider context */}
          <MainContent />

          {/* Footer */}
          <footer className="py-8 border-t border-dark-200 dark:border-dark-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  © 2026 Event Manager. Semua hak dilindungi.
                </p>
                <p className="text-sm text-dark-400 dark:text-dark-500">
                  Dibuat dengan ❤️ menggunakan React + Tailwind CSS
                </p>
              </div>
            </div>
          </footer>
        </div>
      </EventProvider>
    </ThemeProvider>
  );
}

export default App;
