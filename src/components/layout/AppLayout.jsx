import TopNavbar from './TopNavbar';
import clsx from 'clsx';

export default function AppLayout({ children, fullWidth = false }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-indigo-500/30 overflow-x-hidden">
            <TopNavbar />
            <main className={clsx(
                "transition-all duration-300",
                fullWidth ? "pt-16 pb-0 px-0" : "pt-24 pb-12 px-6"
            )}>
                <div className={clsx(
                    "mx-auto",
                    fullWidth ? "w-full" : "max-w-7xl"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
