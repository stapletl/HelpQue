import { Link } from '@tanstack/react-router'
import { SignInWithGoogle } from './oauth/SignInWIthGoogle'
import { Heading } from '~/components/ui/typography'
import { Card, CardAction, CardFooter, CardHeader } from '~/components/ui/card'

type SignInProps = {
    redirectTo?: string
}

export const SignInPage: React.FC<SignInProps> = ({ redirectTo }) => {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Card className="w-96 gap-6 py-6">
                <CardHeader>
                    <Heading variant="h3" className="text-center">
                        Sign in or create an account to continue
                    </Heading>
                </CardHeader>
                <CardAction className="w-full px-6">
                    <SignInWithGoogle redirectTo={redirectTo} />
                </CardAction>
                <CardFooter className="justify-center">
                    <p className="text-xs text-center text-muted-foreground ">
                        By creating an account, you agree to our{' '}
                        <Link
                            to="/privacy"
                            className="underline hover:text-foreground transition-colors"
                        >
                            Privacy Policy
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
