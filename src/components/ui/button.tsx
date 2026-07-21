import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-tf-md text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 active:scale-[.98]", { variants: { variant: { primary: "bg-primary text-primary-foreground shadow-glow hover:bg-primary/90", secondary: "bg-muted text-foreground hover:bg-muted/75", outline: "border border-border bg-transparent text-foreground hover:border-primary/60 hover:bg-primary/10", ghost: "text-muted-foreground hover:bg-white/[.06] hover:text-foreground", danger: "bg-danger text-white hover:bg-danger/90" }, size: { sm: "h-9 px-3", md: "h-10 px-4", lg: "h-12 px-5 text-base", icon: "size-10" } }, defaultVariants: { variant: "primary", size: "md" } });
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; loading?: boolean; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => { const Comp = asChild ? Slot : "button"; return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>{loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}{children}</Comp>; });
Button.displayName = "Button";
