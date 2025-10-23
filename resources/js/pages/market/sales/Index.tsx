import React from 'react'
import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DataTable, CreateSaleDialog } from '@/components/sales'
import { BreadcrumbItem } from '@/types'
import { route } from 'ziggy-js'
import { ShoppingCart, TrendingUp } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Ventas (POS)', href: route('market.sales.index') },
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ventas - Punto de Venta" />
            <div className="container mx-auto py-8">
                <Card className="max-w-12xl mx-auto border shadow-sm">
                    <CardHeader className="pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <ShoppingCart className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold tracking-tight">
                                        Punto de Venta (POS)
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-base max-w-2xl">
                                    Sistema de ventas integrado para medicamentos y productos de farmacia.
                                    Registra ventas rápidamente y gestiona el historial completo.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {sales.length} ventas registradas
                                    </span>
                                </div>
                                <CreateSaleDialog products={products} customers={customers} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6">
                        <DataTable data={sales} products={products} customers={customers} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}