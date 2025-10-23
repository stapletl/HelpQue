import { Link, createFileRoute } from '@tanstack/react-router'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/typography'
import { AuroraText } from '~/components/ui/aurora-text'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
            {/* Hero Section */}
            <div className="max-w-5xl mx-auto text-center space-y-12">
                {/* Main Title with Aurora Effect */}
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
                        <AuroraText
                            colors={[
                                '#FF0080',
                                '#7928CA',
                                '#0070F3',
                                '#38bdf8',
                            ]}
                            speed={1.5}
                        >
                            HelpQue
                        </AuroraText>
                    </h1>
                    <Text className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                        Digital queue management for classrooms and help desks
                    </Text>
                </div>

                {/* Live Indicator */}
                <div className="flex items-center justify-center gap-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <Text
                            variant="small"
                            className="text-accent-foreground"
                        >
                            Real-time Updates
                        </Text>
                    </div>
                </div>

                {/* Role Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-8">
                    {/* Teacher Card */}
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                        <CardHeader>
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-primary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </div>
                            <CardTitle className="text-2xl text-center">
                                Teacher
                            </CardTitle>
                            <CardDescription className="text-center">
                                Manage queues, view statistics, and help
                                students
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>Create and manage queues</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>Call next student</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>View queue statistics</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>Track wait times</span>
                                </div>
                            </div>
                            <Button asChild className="w-full" size="lg">
                                <Link to="/teacher">Access Teacher View</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Student Card */}
                    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                        <CardHeader>
                            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-accent-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <CardTitle className="text-2xl text-center">
                                Student
                            </CardTitle>
                            <CardDescription className="text-center">
                                Join queues and track your position in line
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                                    <span>View available queues</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                                    <span>Join help queues</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                                    <span>Track your position</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />
                                    <span>Real-time notifications</span>
                                </div>
                            </div>
                            <Button
                                asChild
                                className="w-full"
                                size="lg"
                                variant="outline"
                            >
                                <Link to="/student">Access Student View</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
                    <Badge variant="secondary" className="font-mono text-xs">
                        Real-time Sync
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                        Serverless Backend
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                        Queue Management
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                        Live Updates
                    </Badge>
                </div>
            </div>

            {/* Subtle Background Gradient */}
            <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        </main>
    )
}
