export const AuthLoadingSpinner = () => (
    <div className="w-full h-screen flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-muted-foreground">Loading your session...</p>
        </div>
    </div>
)
