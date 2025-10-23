import React from "react"
import { Head } from "@inertiajs/react"

import AppLayout from "@/layouts/app-layout"
import { DataTable } from "@/components/customers/DataTable"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateDialog } from "@/components/customers/CreateDialog"
import { BreadcrumbItem } from "@/types"
import { route } from "ziggy-js"

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />
            <div className="container mx-auto py-10">
                <Card className="max-w-12xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-semibold">Clientes</CardTitle>
                            <CardDescription>Gestiona los clientes de tu Farmacia</CardDescription>
                        </div>
                        <CreateDialog />
                    </CardHeader>
                    <CardContent>
                        <DataTable data={customers} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
