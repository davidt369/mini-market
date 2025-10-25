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
    Award,
    AlertTriangle,
    ShoppingCart,
    DollarSign
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';
import { dashboard } from '@/routes';
import { Separator } from '@/components/ui/separator';

import { ScrollArea } from '@/components/ui/scroll-area';

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
            rows: expiringItems.map(item => {
                const days = Math.round(item.days_remaining ?? 0);
                const status = days <= 0 ? 'VENCIDO' : days <= 7 ? 'URGENTE' : days <= 30 ? 'ALERTA' : 'VIGILAR';
                const daysText = days < 0 ? `Vencido ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}` : `${days} día${days === 1 ? '' : 's'}`;
                return [
                    item.name,
                    item.category,
                    item.stock,
                    new Date(item.expiry_date).toLocaleDateString(),
                    daysText,
                    status,
                ];
            }),
            summary: {
                'Productos Urgentes (<=7 días o vencidos)': expiringItems.filter(item => Math.round(item.days_remaining ?? 0) <= 7).length,
                'Productos en Alerta (8-30 días)': expiringItems.filter(item => {
                    const d = Math.round(item.days_remaining ?? 0);
                    return d > 7 && d <= 30;
                }).length,
                'Valor Total en Riesgo': 'Por calcular'
            }
        };
        exportToPDF(data, [249, 168, 37]); // Naranja
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
        exportToPDF(data, [22, 160, 133]); // Verde esmeralda
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
            <Head title="Reportes - Market" />
            <div className="container mx-auto py-8 space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reportes Analíticos</h1>
                        <p className="text-muted-foreground mt-2">
                            Dashboard completo de métricas y análisis del Mini Market Gustitos
                        </p>
                    </div>
                    <Button onClick={loadAllReports} variant="outline">
                        Actualizar Reportes
                    </Button>
                </div>

                <Tabs defaultValue="products" className="space-y-6">
                    <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="products" className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Top Productos
                        </TabsTrigger>
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

                    </TabsList>



                    {/* Reporte de Stock Crítico */}
                    <TabsContent value="stock">
                        <Card className="border shadow-sm">
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <div className="rounded-lg bg-red-500/10 p-2">
                                            <Package className="h-5 w-5 text-red-600" />
                                        </div>
                                        Reporte de Stock Crítico
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Productos con stock por debajo del nivel mínimo establecido
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={exportStockReport}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-dashed"
                                >
                                    <Table className="h-4 w-4" />
                                    Exportar Excel
                                </Button>
                            </CardHeader>

                            <Separator />

                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-4 p-4 rounded-lg  dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                                            <div className="rounded-full bg-red-500/20 p-3">
                                                <AlertTriangle className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                                    Productos Críticos
                                                </p>
                                                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                                                    {stockItems.filter(item => item.status === 'CRITICAL').length}
                                                </p>
                                                <p className="text-xs text-red-600 dark:text-red-400">
                                                    Requieren atención inmediata
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 rounded-lg  dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                            <div className="rounded-full bg-amber-500/20 p-3">
                                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                    Productos Bajos
                                                </p>
                                                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                                                    {stockItems.filter(item => item.status === 'LOW').length}
                                                </p>
                                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                                    Monitoreo requerido
                                                </p>
                                            </div>
                                        </div>
                                    </div>



                                    {/* Tabla de productos */}
                                    <div className="rounded-lg border">
                                        <ScrollArea className="h-[400px]">
                                            <table className="w-full">
                                                <thead className="bg-muted/50 sticky top-0">
                                                    <tr>
                                                        <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                                            Producto
                                                        </th>
                                                        <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                                            Categoría
                                                        </th>
                                                        <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                                            Stock Actual
                                                        </th>
                                                        <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                                            Stock Mínimo
                                                        </th>
                                                        <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                                            Diferencia
                                                        </th>
                                                        <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                                                            Estado
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {stockItems.map((item) => {
                                                        const difference = item.stock - item.min_stock;
                                                        return (
                                                            <tr
                                                                key={item.id}
                                                                className="border-t hover:bg-muted/25 transition-colors group"
                                                            >
                                                                <td className="p-4 font-medium">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`rounded-full p-1 ${item.status === 'CRITICAL'
                                                                            ? 'bg-red-100 dark:bg-red-900/30'
                                                                            : 'bg-amber-100 dark:bg-amber-900/30'
                                                                            }`}>
                                                                            <Package className={`h-3 w-3 ${item.status === 'CRITICAL'
                                                                                ? 'text-red-600'
                                                                                : 'text-amber-600'
                                                                                }`} />
                                                                        </div>
                                                                        {item.name}
                                                                    </div>
                                                                </td>
                                                                <td className="p-4 text-muted-foreground">
                                                                    {item.category}
                                                                </td>
                                                                <td className="p-4">
                                                                    <span className={`font-semibold ${item.stock === 0
                                                                        ? 'text-destructive'
                                                                        : 'text-foreground'
                                                                        }`}>
                                                                        {item.stock}
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 text-muted-foreground">
                                                                    {item.min_stock}
                                                                </td>
                                                                <td className="p-4">
                                                                    <Badge
                                                                        variant={difference >= 0 ? "outline" : "destructive"}
                                                                        className={
                                                                            difference >= 0
                                                                                ? "text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20"
                                                                                : ""
                                                                        }
                                                                    >
                                                                        {difference >= 0 ? `+${difference}` : difference}
                                                                    </Badge>
                                                                </td>
                                                                <td className="p-4">
                                                                    <Badge
                                                                        variant={item.status === 'CRITICAL' ? 'destructive' : 'outline'}
                                                                        className={`capitalize font-medium ${item.status === 'CRITICAL'
                                                                            ? ''
                                                                            : 'text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-300'
                                                                            }`}
                                                                    >
                                                                        {item.status === 'CRITICAL' ? (
                                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                                        ) : (
                                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                                        )}
                                                                        {item.status === 'CRITICAL' ? 'Crítico' : 'Bajo'}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </ScrollArea>
                                    </div>

                                    {/* Resumen al final */}
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span>Crítico: Stock menor al mínimo</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                            <span>Bajo: Stock cercano al mínimo</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reporte de Caducidad */}
                    <TabsContent value="expiring">
                        <Card className="border-l-4 border-l-orange-500 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-2xl bg-orange-500/20 p-3">
                                            <Calendar className="h-7 w-7 text-orange-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                                Productos por Caducar
                                            </CardTitle>
                                            <CardDescription className="text-orange-700 dark:text-orange-300 text-base">
                                                Control de productos con fecha de caducidad próxima
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={exportExpiringReport}
                                        className="gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                                    >
                                        <Download className="h-4 w-4" />
                                        Exportar PDF
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-6">
                                {/* Tarjetas de resumen */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                                                        Urgentes
                                                    </span>
                                                </div>
                                                <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                                                    {expiringItems.filter(item => item.days_remaining <= 7).length}
                                                </p>
                                                <p className="text-xs text-red-600 dark:text-red-400">
                                                    ≤ 7 días restantes
                                                </p>
                                            </div>
                                            <AlertTriangle className="h-8 w-8 text-red-400" />
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                                        En Alerta
                                                    </span>
                                                </div>
                                                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                                                    {expiringItems.filter(item => item.days_remaining > 7 && item.days_remaining <= 30).length}
                                                </p>
                                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                                    8-30 días restantes
                                                </p>
                                            </div>
                                            <Calendar className="h-8 w-8 text-amber-400" />
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                                        Total
                                                    </span>
                                                </div>
                                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                                                    {expiringItems.length}
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                                    Productos monitoreados
                                                </p>
                                            </div>
                                            <Package className="h-8 w-8 text-blue-400" />
                                        </div>
                                    </div>
                                </div>



                                {/* Tabla de productos */}
                                <div className="rounded-2xl border border-orange-200 dark:border-orange-800 overflow-hidden">
                                    <ScrollArea className="h-[500px]">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 sticky top-0">
                                                <tr>
                                                    <th className="text-left p-4 font-bold text-orange-900 dark:text-orange-100 text-sm uppercase tracking-wider">
                                                        Producto
                                                    </th>
                                                    <th className="text-left p-4 font-bold text-orange-900 dark:text-orange-100 text-sm uppercase tracking-wider">
                                                        Categoría
                                                    </th>
                                                    <th className="text-left p-4 font-bold text-orange-900 dark:text-orange-100 text-sm uppercase tracking-wider">
                                                        Stock
                                                    </th>
                                                    <th className="text-left p-4 font-bold text-orange-900 dark:text-orange-100 text-sm uppercase tracking-wider">
                                                        Fecha Caducidad
                                                    </th>
                                                    <th className="text-left p-4 font-bold text-orange-900 dark:text-orange-100 text-sm uppercase tracking-wider">
                                                        Días Restantes
                                                    </th>
                                                    <th className="text-left p-4 font-bold text-orange-900 dark:text-orange-100 text-sm uppercase tracking-wider">
                                                        Prioridad
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expiringItems.map((item) => {
                                                    const getPriorityColor = (rawDays: number) => {
                                                        const days = Math.round(rawDays ?? 0);
                                                        if (days <= 0) return 'bg-red-700'; // expired
                                                        if (days <= 7) return 'bg-red-500';
                                                        if (days <= 15) return 'bg-amber-500';
                                                        if (days <= 30) return 'bg-blue-500';
                                                        return 'bg-green-500';
                                                    };

                                                    const getStatusVariant = (rawDays: number) => {
                                                        const days = Math.round(rawDays ?? 0);
                                                        if (days <= 0) return 'destructive';
                                                        if (days <= 7) return 'destructive';
                                                        if (days <= 15) return 'default';
                                                        if (days <= 30) return 'secondary';
                                                        return 'outline';
                                                    };

                                                    const getStatusText = (rawDays: number) => {
                                                        const days = Math.round(rawDays ?? 0);
                                                        if (days <= 0) return 'VENCIDO';
                                                        if (days <= 7) return 'URGENTE';
                                                        if (days <= 15) return 'ALTA';
                                                        if (days <= 30) return 'MEDIA';
                                                        return 'BAJA';
                                                    };

                                                    const formatDaysText = (rawDays: number) => {
                                                        const days = Math.round(rawDays ?? 0);
                                                        if (days < 0) return `Vencido ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`;
                                                        return `${days} día${days === 1 ? '' : 's'}`;
                                                    };

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="border-t border-orange-100 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-200 group"
                                                        >
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.days_remaining)}`}></div>
                                                                    <span className="font-semibold text-foreground group-hover:text-orange-700 dark:group-hover:text-orange-300">
                                                                        {item.name}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <Badge variant="outline" className="text-muted-foreground">
                                                                    {item.category}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="font-medium">{item.stock}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="text-sm font-medium">
                                                                    {new Date(item.expiry_date).toLocaleDateString('es-ES', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric'
                                                                    })}
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <Badge
                                                                    variant={getStatusVariant(item.days_remaining)}
                                                                    className={`font-bold ${Math.round(item.days_remaining ?? 0) <= 7
                                                                        ? 'animate-pulse'
                                                                        : Math.round(item.days_remaining ?? 0) <= 15
                                                                            ? 'bg-amber-500 text-white'
                                                                            : ''
                                                                        }`}
                                                                >
                                                                    {formatDaysText(item.days_remaining)}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.days_remaining)}`}></div>
                                                                    <span className={`font-semibold text-sm ${Math.round(item.days_remaining ?? 0) <= 0
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : Math.round(item.days_remaining ?? 0) <= 7
                                                                            ? 'text-red-600 dark:text-red-400'
                                                                            : Math.round(item.days_remaining ?? 0) <= 15
                                                                                ? 'text-amber-600 dark:text-amber-400'
                                                                                : Math.round(item.days_remaining ?? 0) <= 30
                                                                                    ? 'text-blue-600 dark:text-blue-400'
                                                                                    : 'text-green-600 dark:text-green-400'
                                                                        }`}>
                                                                        {getStatusText(item.days_remaining)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </ScrollArea>
                                </div>

                                {/* Leyenda */}
                                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Leyenda de Prioridades</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <span className="text-sm font-medium text-red-700 dark:text-red-300">Urgente (0-7 días)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Alta (8-15 días)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Media (16-30 días)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Baja (+30 días)</span>
                                        </div>
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

                    <TabsContent value="suppliers">
                        <Card className="border-t-4 border-t-emerald-500 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 pb-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="rounded-2xl bg-emerald-500/20 p-3">
                                                <Users className="h-8 w-8 text-emerald-600" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                                        </div>
                                        <div className="space-y-2">
                                            <CardTitle className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                                Análisis de Proveedores
                                            </CardTitle>
                                            <CardDescription className="text-emerald-700 dark:text-emerald-300 text-base">
                                                Desempeño y relación comercial con proveedores
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={exportSuppliersReport}
                                        className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <Download className="h-4 w-4" />
                                        Exportar Reporte
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 space-y-8">
                                {/* Tarjetas de métricas principales */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-5 w-5 text-blue-600" />
                                                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                                                        Proveedores Activos
                                                    </span>
                                                </div>
                                                <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                                                    {suppliers.length}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">
                                                        Relaciones comerciales
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingCart className="h-5 w-5 text-green-600" />
                                                    <span className="text-sm font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                                                        Inversión Total
                                                    </span>
                                                </div>
                                                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                                                    Bs. {Number(suppliers.reduce((sum, s) => sum + (s.total ?? 0), 0)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        Volumen de compras
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-5 w-5 text-purple-600" />
                                                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                                                        Órdenes Totales
                                                    </span>
                                                </div>
                                                <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">
                                                    {suppliers.reduce((sum, s) => sum + s.purchases_count, 0)}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                    <p className="text-xs text-purple-600 dark:text-purple-400">
                                                        Transacciones realizadas
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gráfico de distribución */}
                                {suppliers.length > 0 && (
                                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">
                                            Distribución por Proveedor
                                        </h3>
                                        <div className="space-y-3">
                                            {suppliers.slice(0, 5).map((supplier, index) => {
                                                const totalAll = suppliers.reduce((sum, s) => sum + (s.total ?? 0), 0);
                                                const percentage = totalAll > 0 ? (supplier.total / totalAll) * 100 : 0;
                                                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

                                                return (
                                                    <div key={supplier.id} className="flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-3 h-3 rounded-full ${colors[index] || 'bg-gray-500'}`}></div>
                                                            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                                                {supplier.supplier_name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 flex-1 max-w-md">
                                                            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${colors[index] || 'bg-gray-500'} transition-all duration-1000`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-16 text-right">
                                                                {percentage.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Tabla de proveedores */}
                                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 overflow-hidden shadow-lg">
                                    <ScrollArea className="h-[600px]">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 sticky top-0">
                                                <tr>
                                                    <th className="text-left p-5 font-bold text-emerald-900 dark:text-emerald-100 text-sm uppercase tracking-wider">
                                                        Proveedor
                                                    </th>
                                                    <th className="text-left p-5 font-bold text-emerald-900 dark:text-emerald-100 text-sm uppercase tracking-wider">
                                                        Contacto
                                                    </th>
                                                    <th className="text-left p-5 font-bold text-emerald-900 dark:text-emerald-100 text-sm uppercase tracking-wider">
                                                        Compras
                                                    </th>
                                                    <th className="text-left p-5 font-bold text-emerald-900 dark:text-emerald-100 text-sm uppercase tracking-wider">
                                                        Inversión
                                                    </th>
                                                    <th className="text-left p-5 font-bold text-emerald-900 dark:text-emerald-100 text-sm uppercase tracking-wider">
                                                        Última Compra
                                                    </th>
                                                    <th className="text-left p-5 font-bold text-emerald-900 dark:text-emerald-100 text-sm uppercase tracking-wider">
                                                        Estado
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {suppliers.map((item, index) => {
                                                    const getRecencyStatus = (lastPurchase: string) => {
                                                        const lastDate = new Date(lastPurchase);
                                                        const today = new Date();
                                                        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
                                                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                        if (diffDays <= 7) return { text: 'Activo', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' };
                                                        if (diffDays <= 30) return { text: 'Regular', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' };
                                                        return { text: 'Inactivo', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-900/30' };
                                                    };

                                                    const status = getRecencyStatus(item.last_purchase);
                                                    const isTopSupplier = index < 3;

                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className="border-t border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/10 transition-all duration-200 group"
                                                        >
                                                            <td className="p-5">
                                                                <div className="flex items-center gap-3">
                                                                    {isTopSupplier && (
                                                                        <Award className="h-4 w-4 text-amber-500" />
                                                                    )}
                                                                    <div>
                                                                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                                                                            {item.supplier_name}
                                                                        </div>
                                                                        {isTopSupplier && (
                                                                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                                                                Top {index + 1}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-5">
                                                                <div className="text-sm text-slate-700 dark:text-slate-300">
                                                                    {item.contact}
                                                                </div>
                                                            </td>
                                                            <td className="p-5">
                                                                <Badge variant="secondary" className="font-mono font-bold">
                                                                    {item.purchases_count}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-5">
                                                                <div className="space-y-1">
                                                                    <div className="font-bold text-slate-900 dark:text-slate-100">
                                                                        Bs. {Number(item.total ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                        Por compra: Bs. {Number((item.total ?? 0) / item.purchases_count).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-5">
                                                                <div className="space-y-1">
                                                                    <div className="font-medium text-slate-900 dark:text-slate-100">
                                                                        {new Date(item.last_purchase).toLocaleDateString('es-ES', {
                                                                            day: '2-digit',
                                                                            month: 'short',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                        {new Date(item.last_purchase).toLocaleDateString('es-ES', {
                                                                            weekday: 'short'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-5">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`${status.bg} ${status.color} border-transparent font-medium`}
                                                                >
                                                                    {status.text}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </ScrollArea>
                                </div>

                                {/* Resumen ejecutivo */}
                                {suppliers.length > 0 && (
                                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4">
                                            Resumen Ejecutivo
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Proveedor Principal</span>
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {suppliers[0]?.supplier_name || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Inversión Promedio</span>
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        Bs. {Number(suppliers.reduce((sum, s) => sum + (s.total ?? 0), 0) / suppliers.length).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Compras Promedio</span>
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {Math.round(suppliers.reduce((sum, s) => sum + s.purchases_count, 0) / suppliers.length)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Proveedores Activos</span>
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {suppliers.filter(s => {
                                                            const lastDate = new Date(s.last_purchase);
                                                            const today = new Date();
                                                            const diffDays = Math.ceil(Math.abs(today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                                                            return diffDays <= 30;
                                                        }).length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reporte de Top Productos */}
                    <TabsContent value="products">
                        <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-card dark:border">
                            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b dark:border-border">
                                <div className="space-y-2">
                                    <CardTitle className="flex items-center gap-3 text-2xl">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                            <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                            Reporte de Top Productos
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-base dark:text-muted-foreground">
                                        Análisis de productos más vendidos por volumen e ingresos
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={exportTopProductsReport}
                                    variant="outline"
                                    className="gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white transition-colors"
                                >
                                    <Table className="h-4 w-4" />
                                    Exportar Excel
                                </Button>
                            </CardHeader>

                            <CardContent className="space-y-8 p-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Gráfico mejorado */}
                                    <div className="bg-white dark:bg-background rounded-xl p-4 border dark:border-border shadow-sm">
                                        <div className="h-64">
                                            <Doughnut
                                                data={{
                                                    labels: topProducts.slice(0, 5).map(p => p.name),
                                                    datasets: [
                                                        {
                                                            data: topProducts.slice(0, 5).map(p => p.qty_sold),
                                                            backgroundColor: [
                                                                'rgba(59, 130, 246, 0.9)',
                                                                'rgba(16, 185, 129, 0.9)',
                                                                'rgba(245, 158, 11, 0.9)',
                                                                'rgba(139, 92, 246, 0.9)',
                                                                'rgba(239, 68, 68, 0.9)',
                                                            ],
                                                            borderColor: [
                                                                'rgba(59, 130, 246, 1)',
                                                                'rgba(16, 185, 129, 1)',
                                                                'rgba(245, 158, 11, 1)',
                                                                'rgba(139, 92, 246, 1)',
                                                                'rgba(239, 68, 68, 1)',
                                                            ],
                                                            borderWidth: 2,
                                                            borderRadius: 8,
                                                        },
                                                    ],
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    cutout: '55%',
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom' as const,
                                                            labels: {
                                                                padding: 20,
                                                                usePointStyle: true,
                                                                color: 'hsl(var(--foreground))',
                                                            },
                                                        },
                                                        title: {
                                                            display: true,
                                                            text: 'Distribución de Ventas (Top 5)',
                                                            font: {
                                                                size: 16,
                                                                weight: 'bold',
                                                            },
                                                            color: 'hsl(var(--foreground))',
                                                            padding: 20,
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Métricas destacadas */}
                                    <div className="space-y-4">
                                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                                                            {topProducts.reduce((sum, p) => sum + p.qty_sold, 0).toLocaleString()}
                                                        </div>
                                                        <p className="text-sm text-green-600 dark:text-green-300 font-medium">
                                                            Total Unidades Vendidas
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                                                        <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                                                            Bs. {Number(topProducts.reduce((sum, p) => sum + (p.revenue ?? 0), 0)).toFixed(2)}
                                                        </div>
                                                        <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                                                            Ingresos Totales
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                                        <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Tabla mejorada */}
                                <div className="border dark:border-border rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/50 border-b dark:border-border p-4">
                                        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                                            Ranking de Productos
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-700 dark:to-indigo-700">
                                                <tr>
                                                    <th className="text-left p-4 font-semibold text-white">Puesto</th>
                                                    <th className="text-left p-4 font-semibold text-white">Producto</th>
                                                    <th className="text-left p-4 font-semibold text-white">Categoría</th>
                                                    <th className="text-left p-4 font-semibold text-white">Cantidad Vendida</th>
                                                    <th className="text-left p-4 font-semibold text-white">Ingresos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {topProducts.map((item, index) => (
                                                    <tr
                                                        key={item.id}
                                                        className={`hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors ${index % 2 === 0
                                                            ? 'bg-white dark:bg-background'
                                                            : 'bg-gray-50 dark:bg-muted/50'
                                                            }`}
                                                    >
                                                        <td className="p-4">
                                                            <Badge
                                                                variant={item.rank <= 3 ? 'default' : 'outline'}
                                                                className={`
                                                ${item.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800' : ''}
                                                ${item.rank === 2 ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700' : ''}
                                                ${item.rank === 3 ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800' : ''}
                                                ${item.rank > 3 ? 'dark:border-gray-600 dark:text-gray-300' : ''}
                                                font-bold text-sm
                                            `}
                                                            >
                                                                #{item.rank}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
                                                            {item.name}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">
                                                            {item.qty_sold.toLocaleString()}
                                                        </td>
                                                        <td className="p-4 font-bold text-green-600 dark:text-green-400">
                                                            Bs. {Number(item.revenue ?? 0).toFixed(2)}
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
                </Tabs>
            </div>
        </AppLayout>
    );
}