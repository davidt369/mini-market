'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    User,
    Users,
    Package,
    FileText,
    ShoppingBag,
    Truck,
    BarChart,
    CreditCard,
    DollarSign,
    AlertTriangle,
    Monitor,
    Calculator,
    TrendingUp,
    TrendingDown,
    Minus,
} from 'lucide-react';

/* ---------- TIPOS ---------- */
type Trend = 'up' | 'down' | 'neutral';

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: Trend;
    trendValue?: string;
    description?: string;
    className?: string;
}

interface Stats {
    totalCustomers?: number;
    totalSuppliers?: number;
    totalProducts?: number;
    totalInvoices?: number;
    totalStock?: number;
    soldStock?: number;
    currentStock?: number;
    totalSales?: number;
    totalPaid?: number;
    remainingAmount?: number;
    salesThisMonth?: number;
    avgSale?: number;
    grossProfit?: number;
    netProfit?: number;
}

/* ---------- CARD REUTILIZABLE ---------- */
const DashboardCard = ({
    title,
    value,
    icon,
    trend = 'neutral',
    trendValue,
    description,
    className,
}: DashboardCardProps) => {
    const trendConfig = {
        up: {
            icon: TrendingUp,
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        },
        down: {
            icon: TrendingDown,
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        },
        neutral: {
            icon: Minus,
            color: 'text-muted-foreground',
            bgColor: 'bg-muted text-muted-foreground'
        },
    };

    const TrendIcon = trendConfig[trend].icon;

    return (
        <Card
            className={cn(
                'relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border',
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground/80">
                    {title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border">
                    {icon}
                </div>
            </CardHeader>

            <CardContent>
                {/* Valor principal */}
                <div className="text-3xl font-bold text-card-foreground">
                    {value}
                </div>

                {/* Tendencia + descripción */}
                <div className="flex items-center gap-2 mt-1">
                    {trendValue && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                'px-2 py-0 text-xs font-semibold border-0',
                                trendConfig[trend].bgColor
                            )}
                        >
                            <TrendIcon className="mr-1 h-3 w-3" />
                            {trendValue}
                        </Badge>
                    )}
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                </div>

                {/* Sparkline simulado */}
                <div className="mt-3 h-10 flex items-end gap-0.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'flex-1 rounded-sm',
                                trend === 'up' && 'bg-green-400 dark:bg-green-500',
                                trend === 'down' && 'bg-red-400 dark:bg-red-500',
                                trend === 'neutral' && 'bg-muted-foreground/30',
                                i % 3 === 0 && 'h-3',
                                i % 3 === 1 && 'h-5',
                                i % 3 === 2 && 'h-7'
                            )}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

/* ---------- DASHBOARD ---------- */
export default function DashboardCards({ stats }: { stats: Stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fila 1 - Información General */}
            <DashboardCard
                title="Total de Clientes"
                value={stats.totalCustomers ?? 0}
                icon={<User className="h-6 w-6 text-green-600" />}
                trend="up"
                trendValue="+12.5%"
                description="Clientes registrados en el sistema"
            />
            <DashboardCard
                title="Total de Proveedores"
                value={stats.totalSuppliers ?? 0}
                icon={<Users className="h-6 w-6 text-orange-600" />}
                trend="down"
                trendValue="-5.2%"
                description="Proveedores activos en el sistema"
            />
            <DashboardCard
                title="Productos en Catálogo"
                value={stats.totalProducts ?? 0}
                icon={<Package className="h-6 w-6 text-violet-600" />}
                trend="up"
                trendValue="+8.7%"
                description="Tipos de productos diferentes"
            />
            <DashboardCard
                title="Facturas Registradas"
                value={stats.totalInvoices ?? 0}
                icon={<FileText className="h-6 w-6 text-slate-600" />}
                trend="up"
                trendValue="+15.3%"
                description="Total de compras registradas"
            />

            {/* Fila 2 - Inventario y Stock */}
            <DashboardCard
                title="Stock Total"
                value={stats.totalStock ?? 0}
                icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
                trend="up"
                trendValue="+4.5%"
                description="Unidades totales en inventario"
            />
            <DashboardCard
                title="Unidades Vendidas"
                value={stats.soldStock ?? 0}
                icon={<Truck className="h-6 w-6 text-pink-600" />}
                trend="up"
                trendValue="+18.2%"
                description="Ventas totales en unidades"
            />
            <DashboardCard
                title="Stock Disponible"
                value={stats.currentStock ?? 0}
                icon={<BarChart className="h-6 w-6 text-sky-600" />}
                trend="neutral"
                trendValue="+1.2%"
                description="Unidades actuales en almacén"
            />
            <DashboardCard
                title="Ingresos Totales"
                value={`Bs. ${Number(stats.totalSales ?? 0).toFixed(2)}`}
                icon={<CreditCard className="h-6 w-6 text-amber-600" />}
                trend="up"
                trendValue="+22.1%"
                description="Total facturado en ventas"
            />

            {/* Fila 3 - Finanzas y Rentabilidad */}
            <DashboardCard
                title="Ventas del Mes"
                value={`Bs. ${Number(stats.salesThisMonth ?? 0).toFixed(2)}`}
                icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
                trend="up"
                trendValue="+12.7%"
                description="Ingresos del mes actual"
            />
            <DashboardCard
                title="Ticket Promedio"
                value={`Bs. ${Number(stats.avgSale ?? 0).toFixed(2)}`}
                icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
                trend="down"
                trendValue="-3.4%"
                description="Valor promedio por venta"
            />
            <DashboardCard
                title="Beneficio Bruto"
                value={`Bs. ${Number(stats.grossProfit ?? 0).toFixed(2)}`}
                icon={<Monitor className="h-6 w-6 text-yellow-600" />}
                trend="up"
                trendValue="+8.9%"
                description="Utilidad antes de gastos"
            />
            <DashboardCard
                title="Beneficio Neto"
                value={`Bs. ${Number(stats.netProfit ?? 0).toFixed(2)}`}
                icon={<Calculator className="h-6 w-6 text-cyan-600" />}
                trend="up"
                trendValue="+6.3%"
                description="Utilidad después de gastos"
            />
        </div>
    );
}