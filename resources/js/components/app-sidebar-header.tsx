import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { type BreadcrumbItem as BreadcrumbItemType } from "@/types";
import { NavUser } from "./nav-user";
import { ModeToggle } from "./ui/mode-toggle";

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header
            className="
        flex h-16 shrink-0 items-center justify-between
        border-b border-sidebar-border/50
        px-4 md:px-6
        transition-[width,height] ease-linear
        group-has-data-[collapsible=icon]/sidebar-wrapper:h-12
        bg-background/80 backdrop-blur-sm
      "
        >
            {/* === Izquierda: Sidebar + Breadcrumbs === */}
            <div className="flex items-center gap-2 min-w-0">
                {/* Botón de menú siempre visible */}
                <SidebarTrigger className="-ml-1" />

                {/* Ocultar breadcrumbs en pantallas pequeñas */}
                <div className="hidden sm:block truncate">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* === Derecha: acciones === */}
            <div className="flex items-center gap-2">
                <ModeToggle />
                <NavUser />
            </div>
        </header>
    );
}
