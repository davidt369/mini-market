import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    User,
    Calendar,
    Package,
    Receipt,
    Tag,
    ShoppingCart
} from 'lucide-react'

type SaleItem = {
    id: number;
    product?: { name?: string };
    qty: number;
    unit_price: number;
    subtotal: number
}

type Sale = {
    id: number;
    items?: SaleItem[];
    total: number;
    customer?: { full_name?: string };
    sale_date?: string
}

export function ShowSaleDialog({ sale }: { sale: Sale }) {
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

    const itemsCount = sale.items?.length || 0

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
                        <DialogTitle>Detalle de Venta</DialogTitle>
                    </div>
                    <DialogDescription>
                        Información completa de la venta registrada en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Encabezado de la venta */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Venta #{sale.id}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs">
                                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {formatCurrency(sale.total)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Información del cliente */}
                            {sale.customer?.full_name && (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Cliente</p>
                                        <p className="text-sm text-muted-foreground">
                                            {sale.customer.full_name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Fecha de la venta */}
                            {sale.sale_date && (
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Fecha y Hora</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(sale.sale_date)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Items de la venta */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Productos Vendidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="space-y-4 p-6">
                                {sale.items && sale.items.length > 0 ? (
                                    sale.items.map((item, index) => (
                                        <div key={item.id} className="space-y-3">
                                            {/* Item individual */}
                                            <div className="flex items-start justify-between p-4 border rounded-lg bg-card">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="h-4 w-4 text-muted-foreground" />
                                                        <h4 className="font-medium text-sm">
                                                            {item.product?.name || 'Producto no disponible'}
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className="space-y-1">
                                                            <span className="text-muted-foreground">Cantidad:</span>
                                                            <div className="font-medium">{item.qty} unidad(es)</div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-muted-foreground">Precio unitario:</span>
                                                            <div className="font-medium">{formatCurrency(item.unit_price)}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right ml-4">
                                                    <div className="text-sm text-muted-foreground mb-1">Subtotal</div>
                                                    <div className="text-lg font-bold text-primary">
                                                        {formatCurrency(item.subtotal)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Separador entre items (excepto el último) */}
                                            {index < itemsCount - 1 && (
                                                <Separator />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No hay productos en esta venta</p>
                                    </div>
                                )}
                            </div>

                            {/* Total de la venta */}
                            {sale.items && sale.items.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="p-6 bg-muted/20">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <div className="text-sm text-muted-foreground">
                                                    Total de la venta
                                                </div>
                                                <div className="text-2xl font-bold text-primary">
                                                    {formatCurrency(sale.total)}
                                                </div>
                                            </div>
                                            <Badge variant="default" className="text-sm px-3 py-1">
                                                {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
                                            </Badge>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumen final */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Número de venta:</span>
                                <span className="font-mono font-medium">#{sale.id.toString().padStart(6, '0')}</span>
                            </div>
                            {sale.sale_date && (
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-muted-foreground">Registrada el:</span>
                                    <span className="font-medium">
                                        {new Date(sale.sale_date).toLocaleDateString('es-BO')}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}