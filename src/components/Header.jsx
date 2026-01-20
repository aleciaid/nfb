import { Moon, Sun, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-40 glass border-b border-dark-200 dark:border-dark-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl 
              bg-gradient-to-br from-primary-500 to-primary-700 
              flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold text-dark-800 dark:text-dark-50">
                                Event Manager
                            </h1>
                            <p className="hidden sm:block text-xs text-dark-500 dark:text-dark-400">
                                Kelola acara dengan mudah
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-dark-100 dark:bg-dark-700 
                text-dark-600 dark:text-dark-300
                hover:bg-dark-200 dark:hover:bg-dark-600 
                transition-all duration-200 btn-hover"
                            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
                        >
                            {isDark ? (
                                <Sun className="w-5 h-5" />
                            ) : (
                                <Moon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
