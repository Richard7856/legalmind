import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

// Since I didn't install cva (class-variance-authority), I will use a simpler approach or install it.
// Actually, cva is standard for shadcn-like components. I should install it.
// But to save time/steps, I can write a simple version or just install cva.
// Let's install cva and @radix-ui/react-slot for better components.
// Wait, I didn't install @radix-ui/react-slot either.
// I will install them now.

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        // Manual variant handling without cva for now to avoid extra install step if possible, 
        // but cva is much cleaner. I'll just use a simple switch or map.

        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            default: "neo-button bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]",
            destructive: "neo-button bg-destructive text-white hover:bg-destructive/90",
            outline: "neo-button border border-input bg-background text-primary hover:bg-accent hover:text-primary hover:border-primary",
            secondary: "neo-button bg-secondary text-white hover:bg-secondary/80 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]",
            ghost: "hover:bg-accent hover:text-primary",
            link: "text-primary underline-offset-4 hover:underline gold-accent",
        }

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        }

        return (
            <Comp
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
