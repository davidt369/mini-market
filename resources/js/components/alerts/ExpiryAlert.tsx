import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, AlertCircle, Calendar, Package, ArrowRight } from 'lucide-react'
import { route } from 'ziggy-js'

type ExpiringProduct = {
    id: number
    name: string
    expiry_date: string
    stock?: number
}

type PageProps = {
    component?: string
    alerts?: {
        expiring?: ExpiringProduct[]
        expired?: ExpiringProduct[]
    }
}

export default function ExpiryAlert() {
    const page = usePage<PageProps>()
    const comp = page.component
    const expiring = React.useMemo(() => page.props.alerts?.expiring ?? [], [page.props.alerts])
    const expired = React.useMemo(() => page.props.alerts?.expired ?? [], [page.props.alerts])

    const [visible, setVisible] = React.useState(expiring.length > 0)

    React.useEffect(() => {
        if (expiring.length === 0) return
        setVisible(true)
        const t = setTimeout(() => setVisible(false), 3 * 60 * 1000) // 3 minutos
        return () => clearTimeout(t)
    }, [expiring])

    // Calcular días restantes para cada producto
    const getDaysRemaining = (expiryDate: string) => {
        const expiry = new Date(expiryDate)
        const today = new Date()
        const diffTime = expiry.getTime() - today.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    // Only show alerts on the dashboard page
    if (comp !== 'dashboard') return null
    if (!visible) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-md animate-in slide-in-from-right-5 duration-300">
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
                        <div className="rounded-full p-1" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-foreground)' }}>
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Alertas de Caducidad
                            <Badge variant="outline" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-accent-foreground)' }}>
                                {expiring.length + expired.length}
                            </Badge>
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVisible(false)}
                        className="h-8 w-8 p-0 hover:bg-amber-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {expired.length > 0 && (
                        <div>
                            <div className="text-sm font-medium mb-2 text-destructive">Vencidos</div>
                            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                                {expired.slice(0, 6).map((product: ExpiringProduct) => {
                                    const daysRemaining = getDaysRemaining(product.expiry_date)
                                    // daysRemaining will be negative for expired
                                    const daysPast = Math.abs(daysRemaining)
                                    return (
                                        <div key={product.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-red-100">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Package className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--color-destructive)' }} />
                                                    <div className="font-medium text-sm truncate">{product.name}</div>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                                    <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(product.expiry_date).toLocaleDateString()}</div>
                                                    <div>Stock: {product.stock}</div>
                                                </div>
                                            </div>
                                            <Badge className="ml-2 flex-shrink-0 text-xs" style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}>Vencido hace {daysPast}d</Badge>
                                        </div>
                                    )
                                })}
                                {expired.length > 6 && (<div className="text-xs text-muted-foreground text-center">Mostrando 6 de {expired.length} vencidos</div>)}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="text-sm font-medium mb-2">Por vencer (30d)</div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {expiring.slice(0, 6).map((product: ExpiringProduct) => {
                                const daysRemaining = getDaysRemaining(product.expiry_date)

                                return (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-100"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Package className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                                                <div className="font-medium text-sm truncate">
                                                    {product.name}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(product.expiry_date).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    Stock: {product.stock}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge
                                            className="ml-2 flex-shrink-0 text-xs"
                                            style={
                                                daysRemaining <= 7
                                                    ? { backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }
                                                    : daysRemaining <= 15
                                                        ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }
                                                        : { backgroundColor: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }
                                            }
                                        >
                                            {daysRemaining}d
                                        </Badge>
                                    </div>
                                )
                            })}
                        </div>

                        {expiring.length > 6 && (
                            <div className="text-xs text-amber-700 text-center pt-2 border-t border-amber-200">
                                Mostrando 6 de {expiring.length} productos
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVisible(false)}

                        >
                            Cerrar
                        </Button>
                        <Link href={route('market.products.index')}>
                            <Button
                                size="sm"
                            >
                                Ver inventario de Medicamentos
                                <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}