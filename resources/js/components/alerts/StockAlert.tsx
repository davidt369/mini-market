import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, X, Package, ArrowRight, AlertCircle } from 'lucide-react'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md mx-4 animate-in slide-in-from-bottom-5 duration-500">
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                <div className="relative rounded-full p-2 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                    Alertas de Stock Crítico
                                </CardTitle>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Requiere atención inmediata
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setVisible(false)}
                            className="h-8 w-8 p-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                <span className="font-semibold">{low.length} productos</span> necesitan reabastecimiento urgente
                            </p>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {low.slice(0, 8).map((product: LowStockProduct) => {
                                const stockLevel = getStockLevel(product)
                                const isOutOfStock = product.stock === 0
                                const isCritical = stockLevel === 'critical'
                                const isWarning = stockLevel === 'warning'

                                return (
                                    <div
                                        key={product.id}
                                        className={`group flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${isOutOfStock
                                            ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-300 dark:border-red-700'
                                            : isCritical
                                                ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-800/20 border-orange-300 dark:border-orange-700'
                                                : isWarning
                                                    ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-800/20 border-amber-300 dark:border-amber-700'
                                                    : 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/20 dark:to-gray-800/20 border-slate-300 dark:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`p-1.5 rounded-lg ${isOutOfStock
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    : isCritical
                                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                                        : isWarning
                                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                                    }`}>
                                                    <Package className="h-3.5 w-3.5" />
                                                </div>
                                                <div className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                                                    {product.name}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium">Stock:</span>
                                                    <span className={`font-bold ${isOutOfStock
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : isCritical
                                                            ? 'text-orange-600 dark:text-orange-400'
                                                            : isWarning
                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                : 'text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                        {product.stock}
                                                    </span>
                                                </div>
                                                {product.min_stock && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-medium">Mínimo:</span>
                                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                                            {product.min_stock}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            className={`ml-2 flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full border-0 ${isOutOfStock
                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                                : isCritical
                                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                                                    : isWarning
                                                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 shadow'
                                                        : 'bg-gradient-to-r from-slate-400 to-gray-400 text-white'
                                                }`}
                                        >
                                            {isOutOfStock ? 'AGOTADO' : isCritical ? 'CRÍTICO' : 'BAJO'}
                                        </Badge>
                                    </div>
                                )
                            })}
                        </div>

                        {low.length > 8 && (
                            <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    +{low.length - 8} productos más necesitan atención
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setVisible(false)}
                                className="flex-1 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cerrar
                            </Button>
                            <Link href={products.index()} className="flex-1">
                                <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                                    Reabastecer
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}