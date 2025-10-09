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
        up: { icon: TrendingUp, color: 'text-emerald-600' },
        down: { icon: TrendingDown, color: 'text-red-600' },
        neutral: { icon: Minus, color: 'text-slate-600' },
    };

    const TrendIcon = trendConfig[trend].icon;

    return (
        <Card
            className={cn(
                'relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
                <div className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-white/30">
                    {icon}
                </div>
            </CardHeader>

            <CardContent>
                {/* Valor principal */}
                <div className="text-3xl font-bold text-slate-800">{value}</div>

                {/* Tendencia + descripción */}
                <div className="flex items-center gap-2 mt-1">
                    {trendValue && (
                        <Badge
                            variant="secondary"
                            className={cn(
                                'px-2 py-0 text-xs font-semibold',
                                trend === 'up' && 'bg-emerald-100 text-emerald-700',
                                trend === 'down' && 'bg-red-100 text-red-700',
                                trend === 'neutral' && 'bg-slate-100 text-slate-700'
                            )}
                        >
                            <TrendIcon className="mr-1 h-3 w-3" />
                            {trendValue}
                        </Badge>
                    )}
                    {description && (
                        <p className="text-xs text-slate-500">{description}</p>
                    )}
                </div>

                {/* Sparkline simulado */}
                <div className="mt-3 h-10 flex items-end gap-0.5">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'flex-1 rounded-sm',
                                trend === 'up' && 'bg-emerald-400',
                                trend === 'down' && 'bg-red-400',
                                trend === 'neutral' && 'bg-slate-300',
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
export default function DashboardCards() {
    const stats = {
        totalCustomers: 3,
        totalSuppliers: 2,
        totalProducts: 10,
        totalInvoices: 4,
        totalStock: 298,
        soldStock: 124,
        currentStock: 174,
        totalSales: 41.5,
        totalPaid: 205.0,
        remainingAmount: 20.0,
        grossProfit: 65.5,
        netProfit: 45.5,
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Fila 1 */}
            <DashboardCard
                title="Clientes"
                value={stats.totalCustomers}
                icon={<User className="h-6 w-6 text-emerald-500" />}
                trend="up"
                trendValue="+12.5%"
                description="Número total de clientes"
            />
            <DashboardCard
                title="Proveedores"
                value={stats.totalSuppliers}
                icon={<Users className="h-6 w-6 text-orange-500" />}
                trend="down"
                trendValue="-20%"
                description="Número total de proveedores"
            />
            <DashboardCard
                title="Productos"
                value={stats.totalProducts}
                icon={<Package className="h-6 w-6 text-violet-500" />}
                trend="up"
                trendValue="+12.5%"
                description="Número total de productos"
            />
            <DashboardCard
                title="Facturas"
                value={stats.totalInvoices}
                icon={<FileText className="h-6 w-6 text-slate-500" />}
                trend="neutral"
                trendValue="0%"
                description="Número total de facturas"
            />

            {/* Fila 2 */}
            <DashboardCard
                title="Existencia total"
                value={stats.totalStock}
                icon={<ShoppingBag className="h-6 w-6 text-blue-500" />}
                trend="up"
                trendValue="+4.5%"
                description="Unidades en inventario"
            />
            <DashboardCard
                title="Existencia vendida"
                value={stats.soldStock}
                icon={<Truck className="h-6 w-6 text-pink-500" />}
                trend="up"
                trendValue="+8.2%"
                description="Unidades vendidas este mes"
            />
            <DashboardCard
                title="Existencia actual"
                value={stats.currentStock}
                icon={<BarChart className="h-6 w-6 text-sky-500" />}
                trend="neutral"
                trendValue="0%"
                description="Unidades disponibles"
            />
            <DashboardCard
                title="Importe vendido"
                value={`$ ${stats.totalSales.toFixed(2)}`}
                icon={<CreditCard className="h-6 w-6 text-amber-500" />}
                trend="up"
                trendValue="+3.1%"
                description="Ventas del período"
            />

            {/* Fila 3 */}
            <DashboardCard
                title="Importe pagado"
                value={`$ ${stats.totalPaid.toFixed(2)}`}
                icon={<DollarSign className="h-6 w-6 text-green-500" />}
                trend="up"
                trendValue="+5.7%"
                description="Cobros realizados"
            />
            <DashboardCard
                title="Importe restante"
                value={`$ ${stats.remainingAmount.toFixed(2)}`}
                icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
                trend="down"
                trendValue="-12.3%"
                description="Por cobrar"
            />
            <DashboardCard
                title="Beneficio bruto"
                value={`$ ${stats.grossProfit.toFixed(2)}`}
                icon={<Monitor className="h-6 w-6 text-yellow-500" />}
                trend="up"
                trendValue="+2.4%"
                description="Antes de gastos"
            />
            <DashboardCard
                title="Beneficio neto"
                value={`$ ${stats.netProfit.toFixed(2)}`}
                icon={<Calculator className="h-6 w-6 text-cyan-500" />}
                trend="up"
                trendValue="+1.8%"
                description="Después de gastos"
            />
        </div>
    );
}