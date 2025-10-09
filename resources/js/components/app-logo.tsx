export default function AppLogo() {
    return (
        <>
            <div className="flex items-center justify-center rounded-md text-sidebar-primary-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <img
                    src="/favicon.ico"
                    alt="Mi Salud Farmacia"
                    className="h-8 w-8 max-w-[32px] filter-invert transition-transform hover:scale-105"
                />
            </div>
            <div className="ml-2 grid flex-1 text-left">
                <span className="truncate font-bold tracking-tight text-foreground">
                    Mini Market
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                    Gustitos
                </span>
            </div>
        </>
    );
}