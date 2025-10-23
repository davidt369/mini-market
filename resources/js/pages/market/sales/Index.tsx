import React from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DataTable, CreateSaleDialog } from '@/components/sales'
import { BreadcrumbItem } from '@/types'
import { route } from 'ziggy-js'
import { ShoppingCart, TrendingUp, DollarSign, Package, Users, Calendar, CreditCard } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ventas del Mini Market', href: route('market.sales.index') },
]

type Sale = {
    id: number;
    sale_date: string;
    customer?: { full_name?: string };
    total: number;
    items?: {
        id: number;
        product_id: number;
        product?: { name?: string };
        product_name?: string;
        qty: number;
        unit_price: number;
        subtotal: number;
    }[]
}
type Product = { id: number; name: string; unit_price: number; stock?: number }
type Customer = { id: number; full_name: string }

export default function SalesIndex({ sales, products, customers }: { sales: Sale[]; products: Product[]; customers: Customer[] }) {

    // Cálculos para las métricas
    const totalSales = sales.length;
    const toNumber = (v: number | string | null | undefined): number => {
        const n = Number(v ?? 0)
        return Number.isFinite(n) ? n : 0
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + toNumber(sale.total), 0);

    // Ventas del mes actual
    const currentMonthSales = sales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        const now = new Date();
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    }).length;

    // Productos con stock bajo (menos de 10 unidades)
    const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;

    // Venta más alta
    const highestSale = (() => {
        if (totalSales === 0) return 0
        const nums = sales.map(sale => toNumber(sale.total))
        const m = nums.length ? Math.max(...nums) : 0
        return Number.isFinite(m) ? m : 0
    })();

    // Formatear precio en Bolivianos
    const formatPrice = (price: number | undefined | null) => {
        const n = toNumber(price)
        return `Bs ${Math.round(n).toLocaleString('es-ES')}`
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas - Punto de Venta" />
            <div className="container mx-auto py-8">
                <Card className="max-w-12xl mx-auto border shadow-sm">
                    {/* Header */}
                    <CardHeader className="pb-6 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <ShoppingCart className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold tracking-tight">
                                            Punto de Venta Mini Market
                                        </CardTitle>
                                        <CardDescription className="text-base mt-1">
                                            Sistema de ventas integrado para productos del Mini Market.
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {totalSales} ventas totales
                                    </span>
                                </div>
                                <CreateSaleDialog products={products} customers={customers} />
                            </div>
                        </div>
                    </CardHeader>

                    {/* Métricas */}
                    <CardContent className="p-6 border-b">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                                            <p className="text-2xl font-bold text-foreground">
                                                {formatPrice(totalRevenue)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-green-500/10 p-3">
                                            <DollarSign className="h-6 w-6 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Todas las ventas registradas
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Ventas del Mes</p>
                                            <p className="text-2xl font-bold text-foreground">{currentMonthSales}</p>
                                        </div>
                                        <div className="rounded-lg bg-blue-500/10 p-3">
                                            <Calendar className="h-6 w-6 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Este mes
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Venta Más Alta</p>
                                            <p className="text-2xl font-bold text-foreground">
                                                {formatPrice(highestSale)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-amber-500/10 p-3">
                                            <CreditCard className="h-6 w-6 text-amber-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Mayor transacción
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
                                            <p className="text-2xl font-bold text-foreground">{lowStockProducts}</p>
                                        </div>
                                        <div className="rounded-lg bg-red-500/10 p-3">
                                            <Package className="h-6 w-6 text-red-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Productos por reponer
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>

                    {/* Información adicional y tabla */}
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-foreground">Historial de Ventas</h3>
                                <p className="text-sm text-muted-foreground">
                                    {totalSales} ventas registradas en el sistema
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{customers.length} clientes</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    <span>{products.length} productos</span>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-lg">
                            <DataTable data={sales} products={products} customers={customers} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}