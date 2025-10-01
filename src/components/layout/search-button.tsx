import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSearch } from '@/contexts/search-provider'

type SearchProps = {
    className?: string
    type?: React.HTMLInputTypeAttribute
    placeholder?: string
}

export function Search({
    className = '',
    placeholder = 'Tìm kiếm mã cổ phiếu...',
}: SearchProps) {
    const { setOpen } = useSearch()
    return (
        <Button
            variant='ghost'
            className={cn(
                'bg-muted/25 group text-muted-foreground hover:bg-accent relative h-8 w-48 flex-1 justify-center lg:justify-start rounded-md text-sm font-normal sm:w-64 sm:pe-12 md:flex-none lg:w-80',
                'md:w-48 lg:w-80', // Show full width on md and larger
                'w-8 px-2', // Icon only on mobile
                className
            )}
            onClick={() => { setOpen(true) }}
        >
            <SearchIcon
                aria-hidden='true'
                className='md:absolute md:start-1.5 md:top-1/2 md:-translate-y-1/2'
                size={16}
            />
            <span className='hidden md:inline ms-4'>{placeholder}</span>
            <kbd className='bg-muted group-hover:bg-accent pointer-events-none absolute end-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex md:flex'>
                <span className='text-xs'>⌘</span>K
            </kbd>
        </Button>
    )
}
