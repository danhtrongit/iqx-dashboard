import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSearch } from "@/contexts/search-provider"
import { useSearchSymbols } from "@/hooks/use-symbol"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { type BoardType, type SymbolType } from "@/types/symbol"

export default function SearchDialog() {
  const { open, setOpen } = useSearch()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")

  const { data: symbols = [], isLoading } = useSearchSymbols(searchQuery, {
    enabled: open && searchQuery.trim().length > 0,
    staleTime: 30000,
    limit: 10,
  })

  useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  const handleSelectStock = (symbol: string) => {
    setOpen(false)
    navigate(`/co-phieu/${symbol}`)
  }

  const getBoardColor = (board: BoardType): string => {
    switch (board) {
      case 'HSX':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'HNX':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'UPCOM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: SymbolType): string => {
    switch (type) {
      case 'STOCK':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      case 'BOND':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'FU':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleNavigate = (path: string) => {
    setOpen(false)
    navigate(path)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-xl">
      <CommandInput
        placeholder="Tìm kiếm mã cổ phiếu hoặc tên công ty…"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? "Đang tìm kiếm..." : "Không có kết quả"}
        </CommandEmpty>

        {symbols.length > 0 && (
          <>
            <CommandGroup heading="Cổ phiếu">
              {symbols.map((symbol) => (
                <CommandItem
                  key={symbol.id}
                  value={`${symbol.symbol} ${symbol.organName} ${symbol.organShortName} ${symbol.enOrganName}`}
                  onSelect={() => handleSelectStock(symbol.symbol)}
                  className="flex items-center justify-between p-3 cursor-pointer"
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{symbol.symbol}</span>
                      <Badge className={getBoardColor(symbol.board)} variant="outline">
                        {symbol.board}
                      </Badge>
                      <Badge className={getTypeColor(symbol.type)} variant="outline">
                        {symbol.type}
                      </Badge>
                    </div>
                    {(symbol.organShortName || symbol.organName) && (
                      <span className="text-xs text-muted-foreground truncate">
                        {symbol.organShortName || symbol.organName}
                      </span>
                    )}
                    {symbol.enOrganName && symbol.enOrganName !== symbol.organName && (
                      <span className="text-xs text-muted-foreground/80 truncate italic">
                        {symbol.enOrganName}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Điều hướng">
          <CommandItem onSelect={() => handleNavigate("/")}>
            <span>📊 Bảng điều khiển</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/bo-loc-co-phieu")}>
            <span>🔍 Bộ lọc cổ phiếu</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/tin-tuc")}>
            <span>📰 Tin tức</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/ca-nhan")}>
            <span>👤 Cá nhân</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Hành động">
          <CommandItem onSelect={() => setOpen(false)}>
            <span>📁 Tạo danh mục mới</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <span>📄 Xuất báo cáo</span>
          </CommandItem>
          <CommandItem onSelect={() => handleNavigate("/settings")}>
            <span>⚙️ Cài đặt</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}


