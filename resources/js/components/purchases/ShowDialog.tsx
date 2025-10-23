import React from 'react'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Eye,
    Truck,
    Calendar,
    User,
    Package,

    Receipt
} from 'lucide-react'

type PurchaseItem = {
    id: number
    product?: { name?: string }
    qty: number
    unit_cost: number
    subtotal: number
}

export function ShowDialog({ purchase }: { purchase: unknown }) {
    const purchaseObj = purchase as {
        id: number
        supplier_name?: string
        purchase_date?: string
        total?: number
        items?: PurchaseItem[]
    }
    const [open, setOpen] = React.useState(false)

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

    const items: PurchaseItem[] = (purchaseObj.items ?? []) as PurchaseItem[]
    const itemsCount: number = items.length
    const hasSupplier = !!purchaseObj.supplier_name

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs gap-1"
                >
                    <Eye className="h-3 w-3" />
                    Ver
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        <DialogTitle>Detalle de Compra</DialogTitle>
                    </div>
                    <DialogDescription>
                        Información completa de la compra registrada en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Encabezado de la compra */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Truck className="h-5 w-5" />
                                        Compra #{purchaseObj.id}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                                        </Badge>
                                        {purchaseObj.total && (
                                            <Badge variant="outline" className="text-xs">
                                                {formatCurrency(purchaseObj.total)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Información del proveedor */}
                            {hasSupplier && (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Proveedor</p>
                                        <p className="text-sm text-muted-foreground">
                                            {purchaseObj.supplier_name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Fecha de la compra */}
                            {purchaseObj.purchase_date && (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Fecha de Compra</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(purchaseObj.purchase_date)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items de la compra */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Productos Comprados
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-4 p-6">
                                {items.length > 0 ? (
                                    items.map((item: PurchaseItem, index: number) => (
                                        <div key={item.id} className="space-y-3">
                                            {/* Item individual */}
                                            <div className="flex items-start justify-between p-4 border rounded-lg bg-card">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                        <h4 className="font-medium text-sm">
                                                            {item.product?.name || 'Producto no disponible'}
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                                        <div className="space-y-1">
                                                            <span className="text-muted-foreground">Cantidad:</span>
                                                            <div className="font-medium">{item.qty} unidad(es)</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-muted-foreground">Costo unitario:</span>
                                                            <div className="font-medium">{formatCurrency(item.unit_cost)}</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-muted-foreground">Subtotal:</span>
                                                            <div className="font-medium text-green-600">
                                                                {formatCurrency(item.subtotal)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Separador entre items (excepto el último) */}
                                            {index < items.length - 1 && (
                                                <Separator />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No hay productos en esta compra</p>
                                    </div>
                                )}
                            </div>

                            {/* Total de la compra */}
                            {items.length > 0 && purchaseObj.total && (
                                <>
                                    <Separator />
                                    <div className="p-6 bg-muted/20">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <div className="text-sm text-muted-foreground">
                                                    Total de la compra
                                                </div>
                                                <div className="text-2xl font-bold text-primary">
                                                    {formatCurrency(purchaseObj.total)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="default" className="text-sm px-3 py-1 mb-2">
                                                    {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
                                                </Badge>
                                                <div className="text-xs text-muted-foreground">
                                                    Incluye todos los items
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumen final */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Número de compra:</span>
                                    <span className="font-mono font-medium">#{purchaseObj.id.toString().padStart(6, '0')}</span>
                                </div>
                                {purchaseObj.purchase_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Registrada el:</span>
                                        <span className="font-medium">
                                            {new Date(purchaseObj.purchase_date).toLocaleDateString('es-BO')}
                                        </span>
                                    </div>
                                )}
                                {hasSupplier && (
                                    <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t">
                                        <span className="text-muted-foreground">Proveedor:</span>
                                        <span className="font-medium text-right">
                                            {purchaseObj.supplier_name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}