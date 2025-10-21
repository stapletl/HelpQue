import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { Button } from '~/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Heading, Text, TypographyLink } from '~/components/ui/typography'

export const Route = createFileRoute('/')({
    component: Home,
})

function Home() {
    const {
        data: { viewer, numbers },
    } = useSuspenseQuery(
        convexQuery(api.myFunctions.listNumbers, { count: 10 }),
    )

    const addNumber = useMutation(api.myFunctions.addNumber)

    return (
        <main className="p-8 flex flex-col gap-16">
            <Heading variant="h1" className="text-center">
                Convex + Tanstack Start
            </Heading>
            <div className="flex flex-col gap-8 max-w-lg mx-auto">
                <Text>Welcome {viewer ?? 'Anonymous'}!</Text>
                <Text>
                    Click the button below and open this page in another window
                    - this data is persisted in the Convex cloud database!
                </Text>
                <div>
                    <Button
                        onClick={() => {
                            void addNumber({
                                value: Math.floor(Math.random() * 10),
                            })
                        }}
                    >
                        Add a random number
                    </Button>
                </div>
                <Text>
                    Numbers:{' '}
                    {numbers.length === 0
                        ? 'Click the button!'
                        : numbers.join(', ')}
                </Text>
                <Text>
                    Edit{' '}
                    <Badge variant="secondary" className="font-mono">
                        convex/myFunctions.ts
                    </Badge>{' '}
                    to change your backend
                </Text>
                <Text>
                    Edit{' '}
                    <Badge variant="secondary" className="font-mono">
                        src/routes/index.tsx
                    </Badge>{' '}
                    to change your frontend
                </Text>
                <Text>
                    Open{' '}
                    <TypographyLink asChild>
                        <Link to="/anotherPage">another page</Link>
                    </TypographyLink>{' '}
                    to send an action.
                </Text>
                <div className="flex flex-col">
                    <Heading variant="h4">Useful resources:</Heading>
                    <div className="flex gap-2">
                        <div className="flex flex-col gap-2 w-1/2">
                            <ResourceCard
                                title="Convex docs"
                                description="Read comprehensive documentation for all Convex features."
                                href="https://docs.convex.dev/home"
                            />
                            <ResourceCard
                                title="Stack articles"
                                description="Learn about best practices, use cases, and more from a growing
            collection of articles, videos, and walkthroughs."
                                href="https://www.typescriptlang.org/docs/handbook/2/basic-types.html"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-1/2">
                            <ResourceCard
                                title="Templates"
                                description="Browse our collection of templates to get started quickly."
                                href="https://www.convex.dev/templates"
                            />
                            <ResourceCard
                                title="Discord"
                                description="Join our developer community to ask questions, trade tips & tricks,
            and show off your projects."
                                href="https://www.convex.dev/community"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

function ResourceCard({
    title,
    description,
    href,
}: {
    title: string
    description: string
    href: string
}) {
    return (
        <Card className="h-28 overflow-auto py-4">
            <CardHeader>
                <CardTitle>
                    <TypographyLink href={href} className="text-sm">
                        {title}
                    </TypographyLink>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <CardDescription className="text-xs">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    )
}
