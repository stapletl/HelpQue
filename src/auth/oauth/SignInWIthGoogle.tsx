import { useAuthActions } from '@convex-dev/auth/react'
import { GoogleLogo } from '~/components/Icons/GoogleLogo'
import { RainbowButton } from '~/components/ui/rainbow-button'

type SignInWithGoogleProps = {
    redirectTo?: string
}

export const SignInWithGoogle: React.FC<SignInWithGoogleProps> = ({
    redirectTo,
}) => {
    const handleClick = async () =>
        await signIn('google', redirectTo ? { redirectTo } : undefined)

    const { signIn } = useAuthActions()
    return (
        <RainbowButton
            className="flex w-full justify-center"
            variant="default"
            type="button"
            onClick={handleClick}
        >
            <GoogleLogo className="mr-2 h-4 w-4" /> Google
        </RainbowButton>
    )
}
