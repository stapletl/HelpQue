import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

export const Route = createFileRoute('/privacy')({
    component: PrivacyPolicy,
})

function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        to="/"
                        className="hover:opacity-80 transition-opacity inline-block"
                    >
                        <h1 className="text-2xl font-bold">HelpQue</h1>
                    </Link>
                </div>
            </header>

            {/* Privacy Policy Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">
                            Privacy Policy
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            Last updated: October 27, 2025
                        </p>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                1. Information We Collect
                            </h2>
                            <p className="text-muted-foreground">
                                When you sign in with Google, we collect and
                                store the following information from your Google
                                account:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li>Your name</li>
                                <li>Your email address</li>
                                <li>Your profile picture (if available)</li>
                            </ul>
                            <p className="text-muted-foreground mt-2">
                                We also collect information about your usage of
                                HelpQue, including:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li>Queues you create or join</li>
                                <li>Queue entries and help requests</li>
                                <li>Timestamps of your activities</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                2. How We Use Your Information
                            </h2>
                            <p className="text-muted-foreground">
                                We use your information to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li>
                                    Provide and maintain the HelpQue service
                                </li>
                                <li>
                                    Identify you when you join or manage queues
                                </li>
                                <li>
                                    Display your name and profile information to
                                    teachers and other users in queue contexts
                                </li>
                                <li>Improve and optimize our service</li>
                                <li>
                                    Communicate with you about your account or
                                    the service
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                3. Information Sharing
                            </h2>
                            <p className="text-muted-foreground">
                                We do not sell, trade, or rent your personal
                                information to third parties. Your information
                                may be visible to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li>
                                    Teachers and administrators of queues you
                                    join
                                </li>
                                <li>
                                    Other students in queues (only your name and
                                    position)
                                </li>
                            </ul>
                            <p className="text-muted-foreground mt-2">
                                We may share anonymized, aggregated data that
                                cannot identify you personally.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                4. Data Storage and Security
                            </h2>
                            <p className="text-muted-foreground">
                                Your data is stored securely using Convex, a
                                cloud-based backend service. We implement
                                appropriate technical and organizational
                                measures to protect your information from
                                unauthorized access, alteration, disclosure, or
                                destruction.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                5. Your Rights and Data Deletion
                            </h2>
                            <p className="text-muted-foreground">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                                <li>Access your personal information</li>
                                <li>Request correction of your data</li>
                                <li>
                                    Request deletion of your account and data
                                </li>
                                <li>
                                    Revoke access to your Google account at any
                                    time
                                </li>
                            </ul>
                            <p className="text-muted-foreground mt-2">
                                Deltion of your account can be done in the
                                account settings. You may also contact us
                                directly for assistance with data deletion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                6. Google OAuth
                            </h2>
                            <p className="text-muted-foreground">
                                HelpQue uses Google OAuth for authentication. By
                                signing in with Google, you agree to Google's
                                Terms of Service and Privacy Policy. We only
                                request access to your basic profile information
                                (name, email, and profile picture) and do not
                                access any other Google services or data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                7. Cookies and Tracking
                            </h2>
                            <p className="text-muted-foreground">
                                We use essential cookies and local storage to
                                maintain your session and provide the service.
                                These are necessary for the application to
                                function and cannot be disabled.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                8. Children's Privacy
                            </h2>
                            <p className="text-muted-foreground">
                                HelpQue is designed for educational use and may
                                be used by students of all ages. We do not
                                knowingly collect additional personal
                                information from children beyond what is
                                necessary for the service. If you believe we
                                have collected inappropriate information from a
                                child, please contact us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                9. Changes to This Policy
                            </h2>
                            <p className="text-muted-foreground">
                                We may update this Privacy Policy from time to
                                time. We will notify you of any changes by
                                posting the new Privacy Policy on this page and
                                updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">
                                10. Contact Us
                            </h2>
                            <p className="text-muted-foreground">
                                If you have any questions about this Privacy
                                Policy or how we handle your data, please
                                contact us through the GitHub repository or by
                                email.
                            </p>
                        </section>

                        <div className="pt-6 border-t mt-8">
                            <Button asChild variant="outline">
                                <Link to="/">Back to Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
