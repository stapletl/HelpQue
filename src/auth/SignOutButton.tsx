import { useAuthActions } from '@convex-dev/auth/react'
import { Button } from '~/components/ui/button'

export const SignOutButton = () => {
    const { signOut } = useAuthActions()
    return (
        <Button
            variant={'default'}
            title="Sign out"
            onClick={() => void signOut()}
        >
            Sign out
        </Button>
    )
}
