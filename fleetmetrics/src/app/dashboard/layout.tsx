import { Sidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full bg-[#050810] overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-[#050810]" />
                <div className="absolute inset-0 bg-grid opacity-[0.15]" style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)' }} />
                <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[80vw] h-[50vh] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vh] bg-[#3B82F6]/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[0%] right-[0%] w-[50vw] h-[50vh] bg-cyan-900/10 rounded-full blur-[100px]" />
            </div>

            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
