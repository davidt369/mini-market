import React from 'react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { route } from 'ziggy-js'
import { toastSuccess, toastError, toastWarning } from '@/components/ui/sonner'
import {
    AlertTriangle,
    Trash2,
    Receipt,
    Loader2,
    Calendar,
    User,
    Package
} from 'lucide-react'

type Sale = {
    id: number
    sale_date?: string
    customer?: { full_name?: string }
    total?: number
    items?: Array<{ product?: { name?: string }; qty: number; unit_price: number }>
}

export function DeleteDialog({ sale, open: openProp, onOpenChange }: { sale: Sale; open?: boolean; onOpenChange?: (v: boolean) => void }) {
    const [localOpen, setLocalOpen] = React.useState(false)
    const open = typeof openProp === 'boolean' ? openProp : localOpen
    const setOpen = (v: boolean) => {
        if (onOpenChange) onOpenChange(v)
        else setLocalOpen(v)
    }
    const { delete: destroy, processing } = useForm()

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const itemsCount = sale.items?.length || 0

    const handleDelete = () => {
        // Mostrar advertencia antes de anular
        toastWarning(
            "Anulando venta",
            `Procesando la anulación de la venta #${sale.id}...`,
            {
                duration: 3000,
            }
        )

        destroy(route('market.sales.destroy', sale.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false)
                toastSuccess(
                    'Venta anulada exitosamente',
                    `La venta #${sale.id} ha sido anulada correctamente.`
                )
            },
            onError: (errors) => {
                console.error('Error al anular venta:', errors)
                toastError(
                    'Error al anular venta',
                    'No se pudo anular la venta. Verifique e intente nuevamente.'
                )
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!onOpenChange && (
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-2 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Anular
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <DialogTitle>Confirmar anulación de venta</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Esta acción no se puede deshacer. Se anulará permanentemente la venta y todos sus datos asociados.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Información de la venta */}
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Venta #{sale.id}</span>
                            </div>
                            {sale.total && (
                                <div className="text-lg font-bold text-green-600">
                                    {formatCurrency(sale.total)}
                                </div>
                            )}
                        </div>

                        {/* Detalles de la venta */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {sale.sale_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-muted-foreground">Fecha</div>
                                        <div className="font-medium">{formatDate(sale.sale_date)}</div>
                                    </div>
                                </div>
                            )}

                            {sale.customer?.full_name && (
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <div className="text-muted-foreground">Cliente</div>
                                        <div className="font-medium">{sale.customer.full_name}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-muted-foreground">Productos</div>
                                    <div className="font-medium">
                                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de productos si está disponible */}
                    {sale.items && sale.items.length > 0 && (
                        <div className="border rounded-lg p-3">
                            <div className="text-sm font-medium mb-2">Productos en esta venta:</div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {sale.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm py-1">
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {item.product?.name || 'Producto no disponible'}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                                {item.qty} x {formatCurrency(item.unit_price)}
                                            </div>
                                        </div>
                                        <div className="font-medium">
                                            {formatCurrency(item.qty * item.unit_price)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advertencia importante */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                                <div className="font-medium text-red-900">
                                    Advertencia importante
                                </div>
                                <div className="text-sm text-red-800 space-y-1">
                                    <p>• Esta acción anulará permanentemente la venta</p>
                                    <p>• Los productos NO volverán al stock automáticamente</p>
                                    <p>• Se registrará la anulación en el historial del sistema</p>
                                    <p>• Esta operación no se puede deshacer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                        className="sm:flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                        className="sm:flex-1 gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Anulando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Sí, anular venta
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}