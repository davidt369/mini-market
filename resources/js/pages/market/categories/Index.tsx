// resources/js/Pages/Categories/Page.tsx
import React from "react"
import { Head } from "@inertiajs/react"

import AppLayout from "@/layouts/app-layout"
import { DataTable } from "@/components/categories/DataTable"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateDialog } from "@/components/categories/CreateDialog"
import { BreadcrumbItem } from "@/types"
import market from "@/routes/market"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categorías de Productos',
        href: market.categories.index.url(),
    },
];
export interface Category {
    id: number
    name: string
    description?: string
    created_at?: string
}

type Props = {
    categories: Category[]
}

export default function CategoriesPage({ categories }: Props) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías de Productos" />
            <div className="container mx-auto py-10">
                <Card className="max-w-12xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-semibold">Categorías de Productos</CardTitle>
                            <CardDescription>Gestiona las categorías de los productos en tu Mini Market</CardDescription>
                        </div>
                        <CreateDialog />
                    </CardHeader>
                    <CardContent>
                        <DataTable data={categories} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}