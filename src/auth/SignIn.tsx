import { SignInWithGoogle } from './oauth/SignInWIthGoogle'
import { Heading } from '~/components/ui/typography'
import { Card, CardAction, CardHeader } from '~/components/ui/card'

type SignInProps = {
    redirectTo?: string
}

export const SignIn: React.FC<SignInProps> = ({ redirectTo }) => {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Card className="w-96 gap-6 p-6">
                <CardHeader>
                    <Heading variant="h3" className="text-center">
                        Sign in or create an account to continue
                    </Heading>
                </CardHeader>
                <CardAction className="w-full">
                    <SignInWithGoogle redirectTo={redirectTo} />
                </CardAction>
            </Card>
        </div>
    )
}
