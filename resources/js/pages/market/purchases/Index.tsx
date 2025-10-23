import React from 'react'
import { Head, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { DataTable, CreateDialog } from '@/components/purchases'
import { BreadcrumbItem, User } from '@/types'
import { route } from 'ziggy-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp } from 'lucide-react'
import type { Purchase, Product } from '@/types/purchases'

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compras" />
            <div className="container mx-auto py-8">
                <Card className="max-w-12xl mx-auto border shadow-sm">
                    <CardHeader className="pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Package className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-2xl font-bold tracking-tight">
                                        Gestión de Compras
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-base max-w-2xl">
                                    Administra el inventario mediante compras de medicamentos y productos.
                                    Registra nuevas compras y consulta el historial completo.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        {purchases.length} compras registradas
                                    </span>
                                </div>
                                {isAdmin && <CreateDialog products={products} />}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6">
                        <DataTable data={purchases} products={products} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}