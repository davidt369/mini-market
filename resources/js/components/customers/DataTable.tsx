import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { EditDialog } from "./EditDialog"
import { DeleteDialog } from "./DeleteDialog"
import { usePage } from "@inertiajs/react"
import { User } from "@/types"

export interface Customer {
    id: number
    full_name: string
    phone?: string
    ci_number?: string
    created_at?: string
}

interface DataTableProps {
    data: Customer[]
}

export function DataTable({ data }: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})





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




    // Mapeo de IDs de columnas a nombres en español para el dropdown
    const columnNamesInSpanish: Record<string, string> = {
        full_name: "Nombre completo",
        phone: "Teléfono",
        ci_number: "CI",
        created_at: "Fecha de creación",
        actions: "Acciones"
    }

    const columns = React.useMemo<ColumnDef<Customer>[]>(
        () => [
            {
                accessorKey: "full_name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Nombre completo
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium">{row.getValue("full_name")}</div>
                ),
            },
            {
                accessorKey: "phone",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Teléfono
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const phone = row.getValue("phone") as string
                    return <div>{phone || "—"}</div>
                },
            },
            {
                accessorKey: "ci_number",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        CI
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const ci = row.getValue("ci_number") as string
                    return <div>{ci || "—"}</div>
                },
            },
            {
                accessorKey: "created_at",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Fecha de creación
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const rawDate = row.getValue("created_at") as string
                    const formattedDate = rawDate
                        ? new Date(rawDate).toLocaleDateString("es-BO", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                        })
                        : "—"
                    return <div className="text-muted-foreground">{formattedDate}</div>
                },
            },
            {
                id: "actions",
                header: "Acciones",
                enableHiding: false,
                cell: ({ row }) => {
                    const customer = row.original
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {/* Botón Editar usando EditDialog */}
                                <DropdownMenuItem asChild>
                                    <EditDialog customer={customer} />
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <div>
                                        <DropdownMenuSeparator />

                                        <DeleteDialog customer={customer} />
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            }
        ],
        []
    )

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="w-full">
            {/* 🔍 Buscador y control de columnas */}
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Buscar clientes..."
                    value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => table.getColumn("full_name")?.setFilterValue(e.target.value)}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columnas <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((col) => col.getCanHide())
                            .map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    className="capitalize"
                                    checked={col.getIsVisible()}
                                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                                >
                                    {columnNamesInSpanish[col.id] || col.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* 📋 Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No se encontraron clientes.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 🔄 Paginación */}
            <div className="flex items-center justify-between px-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Mostrando {table.getFilteredRowModel().rows.length} cliente(s)
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Anterior
                    </Button>
                    <div className="text-sm font-medium">
                        Página {table.getState().pagination.pageIndex + 1} de{" "}
                        {table.getPageCount()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    )
}