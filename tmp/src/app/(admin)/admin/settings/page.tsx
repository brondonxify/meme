export default function AdminSettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">System <span className="text-orange-500">Settings</span></h1>
                <p className="text-slate-500 font-mono text-xs mt-1">OS_CONFIGURATION // KERNEL_MODIFICATION_LOCKED</p>
            </div>

            <div className="grid gap-6">
                <div className="p-8 border border-slate-800 bg-slate-900/50 rounded-3xl text-center space-y-4">
                    <div className="h-16 w-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                        <span className="text-orange-500 text-2xl">🔒</span>
                    </div>
                    <div className="space-y-2">
                        <p className="font-black uppercase tracking-widest text-white">Kernel Access Resticted</p>
                        <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
                            Advanced system-wide settings are currently managed by the central Maximus Telecom maintenance protocols.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
