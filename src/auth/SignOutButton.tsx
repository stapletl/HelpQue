import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'

type SignOutButtonProps = {
    redirectTo?: string
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({ redirectTo }) => {
    const { signOut } = useAuthActions()
    const navigate = useNavigate()

    /**
     * Handle sign out button click and navigate to specified page after signing out.
     */
    const handleClick = async () => {
        await signOut()
        if (redirectTo) {
            await navigate({ to: redirectTo })
        }
    }

    return (
        <Button
            variant={'default'}
            title="Sign out"
            onClick={() => void handleClick()}
        >
            Sign out
        </Button>
    )
}
