// @/components/app-sidebar.tsx
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { Role, User, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, PackagePlus } from 'lucide-react';
import AppLogo from './app-logo';

import {
    Users,
    Package,
    ShoppingCart,
    BarChart3,
} from 'lucide-react';
import categories from '@/routes/market/categories';
import products from '@/routes/market/products';
import users from '@/routes/market/users';
import customers from '@/routes/market/customers';
import sales from '@/routes/market/sales';
import purchases from '@/routes/market/purchases';
import reports from '@/routes/market/reports';

// Definición de los ítems del menú con control de roles
const mainNavItems: NavItem[] = [
    {
        title: 'Panel de control',
        href: dashboard(),
        icon: LayoutGrid,
        allowedRoles: ['admin', 'employee'],
    },
    {
        title: 'Categorías',
        href: categories.index(),
        icon: Package,
        allowedRoles: ['admin'],
    },
    {
        title: 'Gestión de Productos',
        href: products.index(),
        icon: Package,
        allowedRoles: ['admin', 'employee'],
    },
    {
        title: 'Clientes',
        href: customers.index(),
        icon: Users,
        allowedRoles: ['admin', 'employee'],
    },
    {
        title: 'Ventas',
        href: sales.index(),
        icon: ShoppingCart,
        allowedRoles: ['employee', 'admin'],
    },
    {
        title: 'Compras',
        href: purchases.index(),
        icon: PackagePlus,
        allowedRoles: ['admin', 'employee'],
    },
    {
        title: 'Reportes',
        href: reports.index(),
        icon: BarChart3,
        allowedRoles: ['admin'],
    },
    {
        title: 'Usuarios del Sistema',
        href: users.index(),
        icon: Users,
        allowedRoles: ['admin'],
    },
];

const footerNavItems: NavItem[] = [];
// Puedes agregar ítems aquí si lo deseas

export function AppSidebar() {
    const { auth } = usePage<{ auth: User }>().props;

    // Filtrar ítems según los roles del usuario
    const visibleNavItems = mainNavItems.filter((item) => {
        if (!item.allowedRoles) return true; // Si no hay restricción, mostrar a todos
        return item.allowedRoles.some((role) => auth.roles.includes(role as unknown as Role));
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}