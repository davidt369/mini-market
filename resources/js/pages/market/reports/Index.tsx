import React, { useState, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { route } from 'ziggy-js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Download,
    Table,
    BarChart3,
    Package,
    Calendar,
    Users,
    Award
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';
import { dashboard } from '@/routes';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reportes', href: route('market.reports.index') },
];


interface StockItem {
    id: number;
    name: string;
    stock: number;
    min_stock: number;
    category: string;
    status: 'CRITICAL' | 'LOW' | 'NORMAL';
}

interface ExpiringItem {
    id: number;
    name: string;
    stock: number;
    expiry_date: string;
    days_remaining: number;
    category: string;
}

interface MarginByProduct {
    id: number;
    name: string;
    category: string;
    qty_sold: number;
    cost: number;
    revenue: number;
    gross_margin: number;
    margin_percentage: number;
}

interface Totals {
    total_sales: number;
    total_purchases: number;
    gross_profit: number;
    margin_percentage: number;
}

interface PurchasesSupplier {
    id: number;
    supplier_name: string;
    contact: string;
    purchases_count: number;
    total: number;
    last_purchase: string;
}

interface TopProduct {
    id: number;
    name: string;
    category: string;
    qty_sold: number;
    revenue: number;
    rank: number;
}

interface ReportsPayload {
    critical_stock?: StockItem[];
    expiring?: ExpiringItem[];
    margin?: { by_product?: MarginByProduct[]; totals?: Totals };
    purchases_by_supplier?: PurchasesSupplier[];
    top_products?: TopProduct[];
}

export default function ReportsPage() {
    const { props } = usePage<{ reports?: ReportsPayload }>();
    const initial: ReportsPayload = useMemo(() => props.reports ?? {}, [props.reports]);

    // ...existing code for other states...
    const [stockItems, setStockItems] = useState<StockItem[]>(initial.critical_stock ?? []);
    const [expiringItems, setExpiringItems] = useState<ExpiringItem[]>(initial.expiring ?? []);
    const [marginData, setMarginData] = useState<MarginByProduct[]>(initial.margin?.by_product ?? []);
    const [totals, setTotals] = useState<Totals>(initial.margin?.totals ?? {
        total_sales: 0,
        total_purchases: 0,
        gross_profit: 0,
        margin_percentage: 0
    });
    const [suppliers, setSuppliers] = useState<PurchasesSupplier[]>(initial.purchases_by_supplier ?? []);
    const [topProducts, setTopProducts] = useState<TopProduct[]>(initial.top_products ?? []);
    const [loading, setLoading] = useState(false);








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

    if (!isAdmin) {
        router.get(dashboard());
        return null;
    }













    async function loadAllReports() {
        setLoading(true);
        try {
            await Promise.all([
                fetchCriticalStock(),
                fetchExpiring(),
                fetchMargin(),
                fetchPurchasesBySupplier(),
                fetchTopProducts(),
            ]);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    }


    async function fetchCriticalStock() {
        const res = await fetch(route('market.reports.critical_stock'));
        const json = await res.json();
        setStockItems(json);
    }

    async function fetchExpiring() {
        const res = await fetch(route('market.reports.expiring', { days: 30 }));
        const json = await res.json();
        setExpiringItems(json);
    }

    async function fetchMargin() {
        const res = await fetch(route('market.reports.margin', { period: 'monthly' }));
        const json = await res.json();
        setMarginData(json.by_product);
        setTotals(json.totals);
    }

    async function fetchPurchasesBySupplier() {
        const res = await fetch(route('market.reports.purchases_by_supplier', { period: 'monthly' }));
        const json = await res.json();
        setSuppliers(json);
    }

    async function fetchTopProducts() {
        const res = await fetch(route('market.reports.top_products', { limit: 10, period: 'monthly' }));
        const json = await res.json();
        setTopProducts(json);
    }

    // Funciones de exportación

    const exportStockReport = () => {
        const data = {
            title: 'Reporte de Stock Crítico',
            headers: ['Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Estado'],
            rows: stockItems.map(item => [
                item.name,
                item.category,
                item.stock,
                item.min_stock,
                item.status === 'CRITICAL' ? 'CRÍTICO' : 'BAJO'
            ]),
            summary: {
                'Total Productos Críticos': stockItems.filter(item => item.status === 'CRITICAL').length,
                'Total Productos Bajos': stockItems.filter(item => item.status === 'LOW').length,
                'Fecha de Reporte': new Date().toLocaleDateString()
            }
        };
        exportToExcel(data, 'stock_critico');
    };

    const exportExpiringReport = () => {
        const data = {
            title: 'Reporte de Productos por Caducar',
            headers: ['Producto', 'Categoría', 'Stock', 'Fecha Caducidad', 'Días Restantes', 'Estado'],
            rows: expiringItems.map(item => [
                item.name,
                item.category,
                item.stock,
                new Date(item.expiry_date).toLocaleDateString(),
                item.days_remaining,
                item.days_remaining <= 7 ? 'URGENTE' : item.days_remaining <= 30 ? 'ALERTA' : 'VIGILAR'
            ]),
            summary: {
                'Productos Urgentes (<=7 días)': expiringItems.filter(item => item.days_remaining <= 7).length,
                'Productos en Alerta (8-30 días)': expiringItems.filter(item => item.days_remaining > 7 && item.days_remaining <= 30).length,
                'Valor Total en Riesgo': 'Por calcular'
            }
        };
        exportToPDF(data);
    };

    const exportMarginReport = () => {
        const data = {
            title: 'Reporte de Margen de Ganancia',
            headers: ['Producto', 'Categoría', 'Cantidad Vendida', 'Costo Total', 'Ingresos', 'Margen Bruto', '% Margen'],
            rows: marginData.map(item => [
                item.name,
                item.category,
                item.qty_sold,
                `Bs. ${Number(item.cost ?? 0).toFixed(2)}`,
                `Bs. ${Number(item.revenue ?? 0).toFixed(2)}`,
                `Bs. ${Number(item.gross_margin ?? 0).toFixed(2)}`,
                `${Number(item.margin_percentage ?? 0).toFixed(1)}%`
            ]),
            summary: {
                'Margen Promedio': `${Number(totals.margin_percentage ?? 0).toFixed(1)}%`,
                'Utilidad Bruta Total': `Bs. ${Number(totals.gross_profit ?? 0).toFixed(2)}`,
                'Total Ventas': `Bs. ${Number(totals.total_sales ?? 0).toFixed(2)}`
            }
        };
        exportToExcel(data, 'margen_ganancia');
    };

    const exportSuppliersReport = () => {
        const data = {
            title: 'Reporte de Compras por Proveedor',
            headers: ['Proveedor', 'Contacto', 'N° Compras', 'Total Comprado (Bs.)', 'Última Compra'],
            rows: suppliers.map(item => [
                item.supplier_name,
                item.contact,
                item.purchases_count,
                `Bs. ${Number(item.total ?? 0).toFixed(2)}`,
                new Date(item.last_purchase).toLocaleDateString()
            ]),
            summary: {
                'Total Proveedores': suppliers.length,
                'Compras Totales': `Bs. ${Number(suppliers.reduce((sum, s) => sum + (s.total ?? 0), 0)).toFixed(2)}`,
                'Proveedor Principal': suppliers[0]?.supplier_name || 'N/A'
            }
        };
        exportToPDF(data);
    };

    const exportTopProductsReport = () => {
        const data = {
            title: 'Reporte de Top Productos Vendidos',
            headers: ['Puesto', 'Producto', 'Categoría', 'Cantidad Vendida', 'Ingresos (Bs.)'],
            rows: topProducts.map(item => [
                `#${item.rank}`,
                item.name,
                item.category,
                item.qty_sold,
                `Bs. ${Number(item.revenue ?? 0).toFixed(2)}`
            ]),
            summary: {
                'Período': 'Último Mes',
                'Total Productos': topProducts.length,
                'Ingresos Totales': `Bs. ${Number(topProducts.reduce((sum, p) => sum + (p.revenue ?? 0), 0)).toFixed(2)}`
            }
        };
        exportToExcel(data, 'top_productos');
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Reportes" />
                <div className="container mx-auto py-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Cargando reportes...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes - Farmacia" />
            <div className="container mx-auto py-8 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reportes Analíticos</h1>
                        <p className="text-muted-foreground mt-2">
                            Dashboard completo de métricas y análisis de la farmacia
                        </p>
                    </div>
                    <Button onClick={loadAllReports} variant="outline">
                        Actualizar Reportes
                    </Button>
                </div>

                <Tabs defaultValue="products" className="space-y-6">
                    <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="stock" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Stock
                        </TabsTrigger>
                        <TabsTrigger value="expiring" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Caducidad
                        </TabsTrigger>
                        <TabsTrigger value="margin" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Margen
                        </TabsTrigger>
                        <TabsTrigger value="suppliers" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Proveedores
                        </TabsTrigger>
                        <TabsTrigger value="products" className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Top Productos
                        </TabsTrigger>
                    </TabsList>


                    {/* Reporte de Stock Crítico */}
                    <TabsContent value="stock">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Reporte de Stock Crítico
                                    </CardTitle>
                                    <CardDescription>
                                        Productos con stock por debajo del nivel mínimo
                                    </CardDescription>
                                </div>
                                <Button onClick={exportStockReport} variant="outline" className="gap-2">
                                    <Table className="h-4 w-4" />
                                    Exportar Excel
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <Badge variant="destructive" className="px-3 py-1">
                                            Críticos: {stockItems.filter(item => item.status === 'CRITICAL').length}
                                        </Badge>
                                        <Badge variant="outline" className="px-3 py-1">
                                            Bajos: {stockItems.filter(item => item.status === 'LOW').length}
                                        </Badge>
                                    </div>

                                    <div className="border rounded-lg">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold">Producto</th>
                                                    <th className="text-left p-3 font-semibold">Categoría</th>
                                                    <th className="text-left p-3 font-semibold">Stock Actual</th>
                                                    <th className="text-left p-3 font-semibold">Stock Mínimo</th>
                                                    <th className="text-left p-3 font-semibold">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stockItems.map((item) => (
                                                    <tr key={item.id} className="border-t hover:bg-muted/50">
                                                        <td className="p-3">{item.name}</td>
                                                        <td className="p-3">{item.category}</td>
                                                        <td className="p-3">{item.stock}</td>
                                                        <td className="p-3">{item.min_stock}</td>
                                                        <td className="p-3">
                                                            <Badge
                                                                variant={item.status === 'CRITICAL' ? 'destructive' : 'outline'}
                                                            >
                                                                {item.status === 'CRITICAL' ? 'CRÍTICO' : 'BAJO'}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reporte de Caducidad */}
                    <TabsContent value="expiring">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Reporte de Productos por Caducar
                                    </CardTitle>
                                    <CardDescription>
                                        Productos que caducan en los próximos 30 días
                                    </CardDescription>
                                </div>
                                <Button onClick={exportExpiringReport} className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Exportar PDF
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <Badge variant="destructive" className="px-3 py-1">
                                            Urgentes (≤7 días): {expiringItems.filter(item => item.days_remaining <= 7).length}
                                        </Badge>
                                        <Badge variant="outline" className="px-3 py-1">
                                            En Alerta (8-30 días): {expiringItems.filter(item => item.days_remaining > 7 && item.days_remaining <= 30).length}
                                        </Badge>
                                    </div>

                                    <div className="border rounded-lg">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold">Producto</th>
                                                    <th className="text-left p-3 font-semibold">Categoría</th>
                                                    <th className="text-left p-3 font-semibold">Stock</th>
                                                    <th className="text-left p-3 font-semibold">Fecha Caducidad</th>
                                                    <th className="text-left p-3 font-semibold">Días Restantes</th>
                                                    <th className="text-left p-3 font-semibold">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expiringItems.map((item) => (
                                                    <tr key={item.id} className="border-t hover:bg-muted/50">
                                                        <td className="p-3">{item.name}</td>
                                                        <td className="p-3">{item.category}</td>
                                                        <td className="p-3">{item.stock}</td>
                                                        <td className="p-3">{new Date(item.expiry_date).toLocaleDateString()}</td>
                                                        <td className="p-3">
                                                            <Badge
                                                                variant={
                                                                    item.days_remaining <= 7 ? 'destructive' :
                                                                        item.days_remaining <= 15 ? 'default' : 'outline'
                                                                }
                                                            >
                                                                {item.days_remaining} días
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3">
                                                            {item.days_remaining <= 7 ? 'URGENTE' :
                                                                item.days_remaining <= 30 ? 'ALERTA' : 'VIGILAR'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reporte de Margen */}
                    <TabsContent value="margin">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Reporte de Margen de Ganancia
                                    </CardTitle>
                                    <CardDescription>
                                        Análisis de rentabilidad por producto
                                    </CardDescription>
                                </div>
                                <Button onClick={exportMarginReport} variant="outline" className="gap-2">
                                    <Table className="h-4 w-4" />
                                    Exportar Excel
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-4 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold text-green-600">
                                                Bs. {Number(totals.gross_profit ?? 0).toFixed(2)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Utilidad Bruta</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {Number(totals.margin_percentage ?? 0).toFixed(1)}%
                                            </div>
                                            <p className="text-sm text-muted-foreground">Margen Promedio</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold text-purple-600">
                                                Bs. {Number(totals.total_sales ?? 0).toFixed(2)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Total Ventas</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {marginData.length}
                                            </div>
                                            <p className="text-sm text-muted-foreground">Productos Analizados</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="h-80">
                                    <Bar
                                        data={{
                                            labels: marginData.slice(0, 10).map((m) => m.name),
                                            datasets: [
                                                {
                                                    label: 'Margen Bruto (Bs.)',
                                                    data: marginData.slice(0, 10).map((m) => m.gross_margin),
                                                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                                                    borderColor: 'rgba(34, 197, 94, 1)',
                                                    borderWidth: 1,
                                                },
                                            ],
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            indexAxis: 'y' as const,
                                            plugins: {
                                                legend: {
                                                    position: 'top' as const,
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Top 10 Productos por Margen Bruto',
                                                },
                                            },
                                        }}
                                    />
                                </div>

                                <div className="border rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="text-left p-3 font-semibold">Producto</th>
                                                <th className="text-left p-3 font-semibold">Categoría</th>
                                                <th className="text-left p-3 font-semibold">Cantidad Vendida</th>
                                                <th className="text-left p-3 font-semibold">Ingresos</th>
                                                <th className="text-left p-3 font-semibold">Margen Bruto</th>
                                                <th className="text-left p-3 font-semibold">% Margen</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {marginData.slice(0, 10).map((item) => (
                                                <tr key={item.id} className="border-t hover:bg-muted/50">
                                                    <td className="p-3">{item.name}</td>
                                                    <td className="p-3">{item.category}</td>
                                                    <td className="p-3">{item.qty_sold}</td>
                                                    <td className="p-3">Bs. {Number(item.revenue ?? 0).toFixed(2)}</td>
                                                    <td className="p-3">Bs. {Number(item.gross_margin ?? 0).toFixed(2)}</td>
                                                    <td className="p-3">
                                                        <Badge
                                                            variant={
                                                                item.margin_percentage > 30 ? 'default' :
                                                                    item.margin_percentage > 15 ? 'outline' : 'secondary'
                                                            }
                                                        >
                                                            {Number(item.margin_percentage ?? 0).toFixed(1)}%
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reporte de Proveedores */}
                    <TabsContent value="suppliers">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Reporte de Compras por Proveedor
                                    </CardTitle>
                                    <CardDescription>
                                        Análisis de compras y relación con proveedores
                                    </CardDescription>
                                </div>
                                <Button onClick={exportSuppliersReport} className="gap-2">
                                    <Download className="h-4 w-4" />
                                    Exportar PDF
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {suppliers.length}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Total Proveedores</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-green-600">
                                                    Bs. {Number(suppliers.reduce((sum, s) => sum + (s.total ?? 0), 0)).toFixed(2)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Total Compras</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {suppliers.reduce((sum, s) => sum + s.purchases_count, 0)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Total Órdenes</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="border rounded-lg">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold">Proveedor</th>
                                                    <th className="text-left p-3 font-semibold">Contacto</th>
                                                    <th className="text-left p-3 font-semibold">N° Compras</th>
                                                    <th className="text-left p-3 font-semibold">Total Comprado</th>
                                                    <th className="text-left p-3 font-semibold">Última Compra</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {suppliers.map((item) => (
                                                    <tr key={item.id} className="border-t hover:bg-muted/50">
                                                        <td className="p-3 font-medium">{item.supplier_name}</td>
                                                        <td className="p-3">{item.contact}</td>
                                                        <td className="p-3">{item.purchases_count}</td>
                                                        <td className="p-3">Bs. {Number(item.total ?? 0).toFixed(2)}</td>
                                                        <td className="p-3">{new Date(item.last_purchase).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reporte de Top Productos */}
                    <TabsContent value="products">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Reporte de Top Productos Vendidos
                                    </CardTitle>
                                    <CardDescription>
                                        Productos más vendidos por cantidad e ingresos
                                    </CardDescription>
                                </div>
                                <Button onClick={exportTopProductsReport} variant="outline" className="gap-2">
                                    <Table className="h-4 w-4" />
                                    Exportar Excel
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="h-64">
                                        <Doughnut
                                            data={{
                                                labels: topProducts.slice(0, 5).map(p => p.name),
                                                datasets: [
                                                    {
                                                        data: topProducts.slice(0, 5).map(p => p.qty_sold),
                                                        backgroundColor: [
                                                            'rgba(59, 130, 246, 0.8)',
                                                            'rgba(16, 185, 129, 0.8)',
                                                            'rgba(245, 158, 11, 0.8)',
                                                            'rgba(139, 92, 246, 0.8)',
                                                            'rgba(239, 68, 68, 0.8)',
                                                        ],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: 'bottom' as const,
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: 'Distribución de Ventas (Top 5)',
                                                    },
                                                },
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {topProducts.reduce((sum, p) => sum + p.qty_sold, 0)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Total Unidades Vendidas</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    Bs. {Number(topProducts.reduce((sum, p) => sum + (p.revenue ?? 0), 0)).toFixed(2)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div className="border rounded-lg">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="text-left p-3 font-semibold">Puesto</th>
                                                <th className="text-left p-3 font-semibold">Producto</th>
                                                <th className="text-left p-3 font-semibold">Categoría</th>
                                                <th className="text-left p-3 font-semibold">Cantidad Vendida</th>
                                                <th className="text-left p-3 font-semibold">Ingresos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map((item) => (
                                                <tr key={item.id} className="border-t hover:bg-muted/50">
                                                    <td className="p-3">
                                                        <Badge variant={item.rank <= 3 ? 'default' : 'outline'}>
                                                            #{item.rank}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 font-medium">{item.name}</td>
                                                    <td className="p-3">{item.category}</td>
                                                    <td className="p-3">{item.qty_sold}</td>
                                                    <td className="p-3">Bs. {Number(item.revenue ?? 0).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}