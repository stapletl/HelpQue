import { Spinner } from '~/components/ui/spinner'

export const AuthLoadingSpinner = () => (
    <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
            <Spinner className="size-8" />
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-muted-foreground">Loading your session...</p>
        </div>
    </div>
)
