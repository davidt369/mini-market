import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, X, Package, TrendingDown, ArrowRight } from 'lucide-react'
import products from '@/routes/market/products'


type LowStockProduct = {
    id: number
    name: string
    stock: number
    min_stock?: number
}

type PageProps = {
    component?: string
    alerts?: {
        low_stock?: LowStockProduct[]
    }
}

export default function StockAlert() {
    const page = usePage<PageProps>()
    const comp = page.component
    const low = React.useMemo(() => page.props.alerts?.low_stock ?? [], [page.props.alerts])

    const [visible, setVisible] = React.useState(low.length > 0)

    React.useEffect(() => {
        if (low.length === 0) return
        setVisible(true)
        const t = setTimeout(() => setVisible(false), 3 * 60 * 1000)
        return () => clearTimeout(t)
    }, [low])

    // Determinar el nivel de alerta del producto
    const getStockLevel = (product: LowStockProduct) => {
        if (product.stock === 0) return 'out-of-stock'
        if (product.min_stock && product.stock <= product.min_stock) return 'critical'
        if (product.min_stock && product.stock <= product.min_stock * 2) return 'warning'
        return 'low'
    }

    // Only show alerts on the dashboard
    if (comp !== 'dashboard') return null
    if (!visible) return null

    return (
        <div className="fixed bottom-4 left-4 z-50 w-full max-w-md animate-in slide-in-from-left-5 duration-300">
            <Card
                style={{
                    backgroundColor: 'var(--color-card)',
                    color: 'var(--color-card-foreground)',
                    borderColor: 'var(--color-border)'
                }}
                className="backdrop-blur-sm shadow-lg"
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full p-1" style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}>
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Alertas de Stock
                            <Badge variant="outline" style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}>
                                {low.length}
                            </Badge>
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVisible(false)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm flex items-center gap-1" style={{ color: 'var(--color-muted-foreground)' }}>
                        <TrendingDown className="h-4 w-4" />
                        Medicamentos con stock bajo o agotado que requieren atención
                    </p>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {low.slice(0, 6).map((product: LowStockProduct) => {
                            const stockLevel = getStockLevel(product)
                            const isOutOfStock = product.stock === 0
                            const isCritical = stockLevel === 'critical'

                            return (
                                <div
                                    key={product.id}
                                    className={`flex items-center justify-between p-2 rounded-lg border ${isOutOfStock
                                        ? 'bg-red-100 border-red-200'
                                        : isCritical
                                            ? 'bg-orange-50 border-orange-200'
                                            : 'bg-white border-red-100'
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Package className={`h-3 w-3 flex-shrink-0`} style={{ color: isOutOfStock ? 'var(--color-destructive)' : 'var(--color-primary)' }} />
                                            <div className="font-medium text-sm truncate">
                                                {product.name}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                            <div>
                                                Stock actual: <span className="font-medium">{product.stock}</span>
                                            </div>
                                            {product.min_stock && (
                                                <div>
                                                    Mínimo: <span className="font-medium">{product.min_stock}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        className="ml-2 flex-shrink-0 text-xs"
                                        style={
                                            isOutOfStock
                                                ? { backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }
                                                : isCritical
                                                    ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }
                                                    : { backgroundColor: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }
                                        }
                                    >
                                        {isOutOfStock ? 'Agotado' : 'Bajo'}
                                    </Badge>
                                </div>
                            )
                        })}
                    </div>

                    {low.length > 6 && (
                        <div className="text-xs text-red-700 text-center pt-2 border-t border-red-200">
                            Mostrando 6 de {low.length} productos
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVisible(false)}

                        >
                            Cerrar
                        </Button>
                        <Link href={products.index()}>
                            <Button
                                size="sm"
                            >
                                Reabastecer
                                <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}