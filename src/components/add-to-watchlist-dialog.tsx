import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, AlertTriangle } from 'lucide-react'
import { addToWatchlist, type AddWatchlistRequest } from '@/lib/api/watchlist'

interface AddToWatchlistDialogProps {
  children?: React.ReactNode
}

export function AddToWatchlistDialog({ children }: AddToWatchlistDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    symbolCode: '',
    customName: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addToWatchlistMutation = useMutation({
    mutationFn: (data: AddWatchlistRequest) => addToWatchlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] })
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      setOpen(false)
      setFormData({ symbolCode: '', customName: '', notes: '' })
      setErrors({})
    },
    onError: (error: any) => {
      setErrors({
        general: error.message || 'Không thể thêm cổ phiếu vào danh sách theo dõi'
      })
    }
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.symbolCode.trim()) {
      newErrors.symbolCode = 'Vui lòng nhập mã cổ phiếu'
    } else if (!/^[A-Z]{3,4}$/.test(formData.symbolCode.trim().toUpperCase())) {
      newErrors.symbolCode = 'Mã cổ phiếu không hợp lệ (3-4 ký tự)'
    }

    if (formData.customName && formData.customName.length > 100) {
      newErrors.customName = 'Tên tùy chỉnh không được vượt quá 100 ký tự'
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Ghi chú không được vượt quá 500 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const requestData: AddWatchlistRequest = {
      symbolCode: formData.symbolCode.trim().toUpperCase(),
      customName: formData.customName.trim() || undefined,
      notes: formData.notes.trim() || undefined
    }

    addToWatchlistMutation.mutate(requestData)
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Thêm mã
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm cổ phiếu vào danh sách theo dõi</DialogTitle>
            <DialogDescription>
              Nhập thông tin cổ phiếu bạn muốn theo dõi. Bạn có thể thêm ghi chú và tên tùy chỉnh.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {errors.general && (
              <div className="flex items-center gap-2 p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                <AlertTriangle className="h-4 w-4" />
                {errors.general}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="symbolCode">
                Mã cổ phiếu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="symbolCode"
                placeholder="VD: VNM, FPT, VIC..."
                value={formData.symbolCode}
                onChange={(e) => handleInputChange('symbolCode', e.target.value)}
                className={errors.symbolCode ? 'border-red-500' : ''}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.symbolCode && (
                <p className="text-sm text-red-500">{errors.symbolCode}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customName">Tên tùy chỉnh</Label>
              <Input
                id="customName"
                placeholder="VD: Vinamilk - Sữa hàng đầu"
                value={formData.customName}
                onChange={(e) => handleInputChange('customName', e.target.value)}
                className={errors.customName ? 'border-red-500' : ''}
              />
              {errors.customName && (
                <p className="text-sm text-red-500">{errors.customName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Để trống để sử dụng tên mặc định từ hệ thống
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Thêm ghi chú về cổ phiếu này..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className={errors.notes ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.notes.length}/500 ký tự
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={addToWatchlistMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={addToWatchlistMutation.isPending}
            >
              {addToWatchlistMutation.isPending ? 'Đang thêm...' : 'Thêm vào danh sách'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}