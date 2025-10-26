import { useCallback, useRef } from 'react'
import { Moon, Sun } from 'lucide-react'
import { flushSync } from 'react-dom'

import { useTheme } from 'tanstack-theme-kit'
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
    const { theme, setTheme } = useTheme()
    const isDark = theme === 'dark'
    const buttonRef = useRef<HTMLButtonElement>(null)

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return

        await document.startViewTransition(() => {
            flushSync(() => {
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
    }, [isDark, duration])

    return (
        <Button
            variant="outline"
            ref={buttonRef}
            onClick={toggleTheme}
            className={cn('h-10 w-10', className)}
            {...props}
        >
            {isDark ? <Sun /> : <Moon />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
