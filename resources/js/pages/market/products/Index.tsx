import React from "react"
import { Head } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTableProducts } from "@/components/productos/DataTableProducts"
import { CreateDialog } from "@/components/productos/CreateDialog"

import { BreadcrumbItem } from "@/types"
import market from "@/routes/market"
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos del Mini Market Gustitos',
        href: market.products.index.url(),
    },
];
export interface Category {
    id: number
    name: string
    description?: string
}

export interface Product {
    category: Category
    id: number
    category_id: number
    name: string
    description?: string
    unit_cost: number
    unit_price: number
    stock: number
    min_stock: number
    expiry_date?: string
    image_url?: string
    created_at?: string
}

type Props = {
    products: Product[]
    categories: Category[]
}

export default function ProductsPage({ products, categories }: Props) {
    console.log(products);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />
            <div className="container mx-auto py-10">
                <Card className="max-w-18xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-semibold">Gestiona Productos</CardTitle>
                            <CardDescription>Gestiona los productos de tu Mini Market</CardDescription>
                        </div>

                        {/* ✅ Pasamos categorías directamente del backend */}
                        <CreateDialog categories={categories} />
                    </CardHeader>

                    <CardContent>
                        <DataTableProducts data={products} categories={categories} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}
