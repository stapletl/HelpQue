import { useAuthActions } from '@convex-dev/auth/react'
import { useEffect, useState } from 'react'
import { AuthLoadingSpinner } from './AuthLoadingSpinner'

/**
 * Component that automatically creates an anonymous session for students.
 * This allows students to use the app without creating a full account.
 */
export function ContinueAnonymouslyPage() {
    const [isSigningIn, setIsSigningIn] = useState(false)
    const { signIn } = useAuthActions()

    useEffect(() => {
        const signInAnonymously = async () => {
            if (isSigningIn) return

            setIsSigningIn(true)
            try {
                // Sign in anonymously - creates a persistent session
                await signIn('anonymous')
            } catch (error) {
                console.error('Failed to create account:', error)
                setIsSigningIn(false)
            }
        }

        signInAnonymously()
    }, [signIn, isSigningIn])

    return <AuthLoadingSpinner />
}
