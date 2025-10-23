import React from 'react'
import { Button } from '@/components/ui/button'
import type { Purchase } from '@/types/purchases'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { toastSuccess, toastError } from '@/components/ui/sonner'

export function DeleteDialog({ purchase, open: openProp, onOpenChange }: { purchase: Purchase | { id: number }; open?: boolean; onOpenChange?: (v: boolean) => void }) {
    const [localOpen, setLocalOpen] = React.useState(false)
    const open = typeof openProp === 'boolean' ? openProp : localOpen
    const setOpen = (v: boolean) => {
        if (onOpenChange) onOpenChange(v)
        else setLocalOpen(v)
    }
    const { delete: destroy, processing } = useForm()

    const confirm = (e: React.FormEvent) => {
        e.preventDefault()
        destroy(route('market.purchases.destroy', purchase.id), {
            onSuccess: () => {
                toastSuccess('Compra eliminada', 'La compra fue eliminada correctamente')
                setOpen(false)
            },
            onError: () => toastError('Error', 'No se pudo eliminar la compra')
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Only render trigger when uncontrolled */}
            {!onOpenChange && (
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">Eliminar</Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Compra #{purchase.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>¿Estás seguro de eliminar esta compra? Esta acción revertirá el stock asociado.</p>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <form onSubmit={confirm}>
                            <Button type="submit" disabled={processing}>Confirmar</Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
