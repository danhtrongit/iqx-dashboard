import { cn } from "@/lib/utils"

export default function Title({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2 className={cn("text-lg lg:text-xl font-semibold mb-4 uppercase", className)}>{children}</h2>
  )
}