import React from 'react'
import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { DataTable, CreateDialog } from '@/components/purchases'
import { BreadcrumbItem, User } from '@/types'
import { route } from 'ziggy-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, Calendar, DollarSign, ShoppingCart } from 'lucide-react'
import { Product, Purchase } from '@/types/purchases'


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Compras', href: route('market.purchases.index') }
]

export default function PurchasesIndex({ purchases, products }: { purchases: Purchase[]; products: Product[] }) {
    const { auth } = usePage<{ auth: User }>().props;

    // Lógica robusta con tipos TypeScript correctos
    const isAdmin = ((): boolean => {
        if (!auth?.roles) return false;

        if (Array.isArray(auth.roles)) {
            return auth.roles.some((r: unknown) => {
                // Caso 1: r es string
                if (typeof r === 'string') {
                    return r === 'admin';
                }
                // Caso 2: r es objeto con propiedad name
                if (typeof r === 'object' && r !== null) {
                    const roleObj = r as { name?: string };
                    return roleObj.name === 'admin';
                }
                return false;
            });
        }

        // Caso 3: roles es string directo
        return auth.roles === 'admin';
    })();

    // Cálculos para las métricas
    const totalPurchases = purchases.length;

    // Compras de hoy
    const todayPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchase_date || '');
        const today = new Date();
        return purchaseDate.toDateString() === today.toDateString();
    }).length;

    // Compras de esta semana
    const thisWeekPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchase_date || '');
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return purchaseDate >= startOfWeek && purchaseDate <= endOfWeek;
    }).length;

    // Compras de este mes
    const thisMonthPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchase_date || '');
        const now = new Date();
        return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
    }).length;

    // Total gastado en compras
    const totalSpent = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);

    // Formatear precio en Bolivianos
    const formatPrice = (price: number) => {
        return `Bs ${Math.round(price).toLocaleString('es-ES')}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compras" />
            <div className="container mx-auto py-8">
                <Card className="max-w-12xl mx-auto border shadow-sm">
                    {/* Header */}
                    <CardHeader className="pb-6 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold tracking-tight">
                                            Gestión de Compras
                                        </CardTitle>
                                        <CardDescription className="text-base mt-1">
                                            Administra el inventario mediante compras de medicamentos y productos.
                                            Registra nuevas compras y consulta el historial completo.
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {totalPurchases} compras totales
                                    </span>
                                </div>
                                {isAdmin && <CreateDialog products={products} />}
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
                                            <p className="text-sm font-medium text-muted-foreground">Compras Hoy</p>
                                            <p className="text-2xl font-bold text-foreground">{todayPurchases}</p>
                                        </div>
                                        <div className="rounded-lg bg-green-500/10 p-3">
                                            <Calendar className="h-6 w-6 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Compras realizadas hoy
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                                            <p className="text-2xl font-bold text-foreground">{thisWeekPurchases}</p>
                                        </div>
                                        <div className="rounded-lg bg-blue-500/10 p-3">
                                            <ShoppingCart className="h-6 w-6 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Compras de esta semana
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Este Mes</p>
                                            <p className="text-2xl font-bold text-foreground">{thisMonthPurchases}</p>
                                        </div>
                                        <div className="rounded-lg bg-amber-500/10 p-3">
                                            <TrendingUp className="h-6 w-6 text-amber-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Compras del mes actual
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Total Gastado</p>
                                            <p className="text-2xl font-bold text-foreground">
                                                {formatPrice(totalSpent)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-purple-500/10 p-3">
                                            <DollarSign className="h-6 w-6 text-purple-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Inversión total en compras
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>

                    {/* Tabla de compras */}
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-foreground">Historial de Compras</h3>
                                <p className="text-sm text-muted-foreground">
                                    {totalPurchases} compras registradas en el sistema
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    <span>{products.length} productos</span>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-lg">
                            <DataTable data={purchases} products={products} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}