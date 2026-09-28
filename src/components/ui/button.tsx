import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex cursor-pointer items-center justify-center gap-2 rounded whitespace-nowrap border-2 border-black font-head font-medium transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 active:translate-x-1 active:translate-y-1 active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg",
        outline: "bg-transparent shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-muted hover:shadow-lg",
        secondary: "bg-secondary text-secondary-foreground shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lg",
        ghost: "border-transparent bg-transparent shadow-none hover:bg-accent",
        destructive: "bg-destructive text-destructive-foreground shadow-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-lg",
        link: "border-transparent bg-transparent p-0 shadow-none hover:underline",
      },
      size: {
        default: "min-h-11 px-4 py-1.5 text-base",
        xs: "min-h-11 gap-1 px-3 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-11 gap-1 px-3 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-12 px-6 py-2 text-base lg:px-8 lg:py-3 lg:text-lg",
        icon: "size-11",
        "icon-xs": "size-11 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-11",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  type = "submit",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      type={type}
      {...props}
    />
  )
}

export { Button, buttonVariants }
