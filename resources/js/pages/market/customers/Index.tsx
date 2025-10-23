import React from "react"
import { Head } from "@inertiajs/react"

import AppLayout from "@/layouts/app-layout"
import { DataTable } from "@/components/customers/DataTable"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateDialog } from "@/components/customers/CreateDialog"
import { BreadcrumbItem } from "@/types"
import { route } from "ziggy-js"
import { Users, UserCheck, IdCard } from "lucide-react"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: route('market.customers.index'),
    },
];

export interface Customer {
    id: number
    full_name: string
    phone?: string
    ci_number?: string
    created_at?: string
}

type Props = {
    customers: Customer[]
}

export default function CustomersPage({ customers }: Props) {

    const now = new Date();

    const customersRegisteredToday = customers.filter(c => {
        if (!c.created_at) return false;
        const d = new Date(c.created_at);
        return d.toDateString() === now.toDateString();
    }).length;

    const customersRegisteredLast7Days = customers.filter(c => {
        if (!c.created_at) return false;
        const d = new Date(c.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo && d <= now;
    }).length;

    const customersRegisteredLast30Days = customers.filter(c => {
        if (!c.created_at) return false;
        const d = new Date(c.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return d >= thirtyDaysAgo && d <= now;
    }).length;

    const customersWithCI = customers.filter(c => !!c.ci_number).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />
            <div className="container mx-auto py-6">
                <Card className="max-w-12xl mx-auto shadow-sm border">
                    {/* Header Section */}
                    <CardHeader className="pb-4 border-b">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-foreground">Clientes</CardTitle>
                                        <CardDescription className="text-base">
                                            Gestiona los clientes de tu Mini Market
                                        </CardDescription>
                                    </div>
                                </div>
                            </div>
                            <CreateDialog />
                        </div>
                    </CardHeader>

                    {/* Stats Cards */}
                    <CardContent className="p-6 border-b">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Total Clientes</p>
                                            <p className="text-2xl font-bold text-foreground">{customers.length}</p>
                                        </div>
                                        <div className="rounded-lg bg-primary/10 p-3">
                                            <Users className="h-6 w-6 text-primary" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Registrados en el sistema
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Registrados Hoy</p>
                                            <p className="text-2xl font-bold text-foreground">{customersRegisteredToday}</p>
                                        </div>
                                        <div className="rounded-lg bg-green-500/10 p-3">
                                            <UserCheck className="h-6 w-6 text-green-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Clientes registrados en el día
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Últimos 7 días</p>
                                            <p className="text-2xl font-bold text-foreground">{customersRegisteredLast7Days}</p>
                                        </div>
                                        <div className="rounded-lg bg-blue-500/10 p-3">
                                            <IdCard className="h-6 w-6 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Clientes registrados en los últimos 7 días
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-background to-muted/50 border">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">Últimos 30 días</p>
                                            <p className="text-2xl font-bold text-foreground">{customersRegisteredLast30Days}</p>
                                        </div>
                                        <div className="rounded-lg bg-amber-500/10 p-3">
                                            <IdCard className="h-6 w-6 text-amber-500" />
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Clientes registrados en los últimos 30 días
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>

                    {/* Data Table Section */}
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold text-foreground">Lista de Clientes</h3>
                                <p className="text-sm text-muted-foreground">
                                    {customers.length} cliente{customers.length !== 1 ? 's' : ''} registrado{customers.length !== 1 ? 's' : ''} en el sistema · Con CI: {customersWithCI}
                                </p>
                            </div>
                        </div>

                        <div className="border rounded-lg">
                            <DataTable data={customers} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}