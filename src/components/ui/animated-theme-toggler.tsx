import { useCallback, useRef } from 'react'
import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'

import { useTheme } from 'next-themes'
import { Button } from './button'
import { cn } from '~/lib/utils'

interface AnimatedThemeTogglerProps
    extends React.ComponentPropsWithoutRef<'button'> {
    duration?: number
}

export const AnimatedThemeToggler = ({
    className,
    duration = 400,
    ...props
}: AnimatedThemeTogglerProps) => {
    const { resolvedTheme, setTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'
    const buttonRef = useRef<HTMLButtonElement>(null)

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return

        await document.startViewTransition(() => {
            flushSync(() => {
                // Toggle between light and dark only (ignoring system)
                const newTheme = isDark ? 'light' : 'dark'
                setTheme(newTheme)
            })
        }).ready

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect()
        const x = left + width / 2
        const y = top + height / 2
        const maxRadius = Math.hypot(
            Math.max(left, window.innerWidth - left),
            Math.max(top, window.innerHeight - top),
        )

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            },
        )
    }, [isDark, setTheme, duration])

    return (
        <Button
            variant="outline"
            size="icon"
            title="Toggle theme"
            ref={buttonRef}
            onClick={toggleTheme}
            className={cn(className)}
            {...props}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
