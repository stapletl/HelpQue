import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '~/lib/utils'

const headingVariants = cva('font-semibold tracking-tight', {
    variants: {
        variant: {
            h1: 'text-4xl lg:text-5xl',
            h2: 'text-3xl lg:text-4xl',
            h3: 'text-2xl lg:text-3xl',
            h4: 'text-xl lg:text-2xl',
            h5: 'text-lg lg:text-xl',
            h6: 'text-base lg:text-lg',
        },
    },
    defaultVariants: {
        variant: 'h1',
    },
})

function Heading({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'h1'> &
    VariantProps<typeof headingVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild
        ? Slot
        : variant === 'h2'
          ? 'h2'
          : variant === 'h3'
            ? 'h3'
            : variant === 'h4'
              ? 'h4'
              : variant === 'h5'
                ? 'h5'
                : variant === 'h6'
                  ? 'h6'
                  : 'h1'

    return (
        <Comp
            data-slot="heading"
            className={cn(headingVariants({ variant, className }))}
            {...props}
        />
    )
}

const textVariants = cva('', {
    variants: {
        variant: {
            default: 'text-base leading-7',
            lead: 'text-xl text-muted-foreground leading-relaxed',
            large: 'text-lg font-semibold',
            small: 'text-sm font-medium leading-none',
            muted: 'text-sm text-muted-foreground',
            p: 'text-base leading-7',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
})

function Text({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'p'> &
    VariantProps<typeof textVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? Slot : 'p'

    return (
        <Comp
            data-slot="text"
            className={cn(textVariants({ variant, className }))}
            {...props}
        />
    )
}

const linkVariants = cva(
    'font-medium underline underline-offset-4 hover:no-underline transition-colors',
    {
        variants: {
            variant: {
                default: 'text-primary hover:text-primary/80',
                muted: 'text-muted-foreground hover:text-foreground',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
)

function TypographyLink({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'a'> &
    VariantProps<typeof linkVariants> & {
        asChild?: boolean
    }) {
    const Comp = asChild ? Slot : 'a'

    return (
        <Comp
            data-slot="link"
            className={cn(linkVariants({ variant, className }))}
            {...props}
        />
    )
}

export { Heading, Text, TypographyLink, headingVariants, textVariants, linkVariants }
