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
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, Package2 } from 'lucide-react';
import AppLogo from './app-logo';

import {

    Users,
    Package,
    ShoppingCart,
    UserCog,

    BarChart3
} from 'lucide-react';
import market from '@/routes/market';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Gestión de Categorías',
        href: market.categories.index.url(),
        icon: Package2, // Icono de caja para productos
    },
    {
        title: 'Gestión de Productos',
        href: market.products.index.url(),
        icon: Package, // Icono de caja para productos
    },
    {
        title: 'Gestión de Clientes',
        href: '#',
        icon: Users, // Icono de grupo de usuarios para clientes
    },

    {
        title: 'Gestión de Ventas',
        href: '#',
        icon: ShoppingCart, // Icono de carrito de compras para ventas
    },
    {
        title: 'Gestión de Usuarios',
        href: '#',
        icon: UserCog, // Icono de usuario con engranaje para gestión
    },
    {
        title: 'Reportes',
        href: '#',
        icon: BarChart3, // Icono de gráfico para reportes
    }
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
