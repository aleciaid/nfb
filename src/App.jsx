import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { EventProvider } from './context/EventContext';
import { Header, EventForm, EventList, EventModal, EventWidgets } from './components';

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

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Form Section */}
              <div className="xl:col-span-4">
                <div className="xl:sticky xl:top-28">
                  <EventForm />
                </div>
              </div>

              {/* List Section */}
              <div className="xl:col-span-8">
                <EventWidgets />
                <EventList />
              </div>
            </div>
          </main>

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

          {/* Modal */}
          <EventModal />
        </div>
      </EventProvider>
    </ThemeProvider>
  );
}

export default App;
