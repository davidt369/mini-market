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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Calendar, User, DollarSign, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,

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
import { Badge } from "@/components/ui/badge"
import { ShowDialog } from "./ShowDialog"
import { EditDialog } from './EditDialog'
import { DeleteDialog } from './DeleteDialog'
import type { Purchase, Product } from '@/types/purchases'
import { usePage } from "@inertiajs/react"
import { Role } from "@/types"

interface DataTableProps {
    data: Purchase[]
    products?: Product[]
}
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string; // o Date
    updated_at: string; // o Date
    two_factor_confirmed_at: string | null;
    two_factor_recovery_codes: string | null;
    two_factor_secret?: string | null;
    roles: Role[];
}
export function DataTable({ data, products = [] }: DataTableProps) {
    const [editingId, setEditingId] = React.useState<number | null>(null)
    const [deletingId, setDeletingId] = React.useState<number | null>(null)
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
        id: "ID",
        purchase_date: "Fecha",
        supplier_name: "Proveedor",
        total: "Total",
        items_count: "Items",
        actions: "Acciones"
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: 'BOB',
            minimumFractionDigits: 2
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-BO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    const columns = React.useMemo<ColumnDef<Purchase>[]>(
        () => [
            {
                accessorKey: "id",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        ID
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ getValue }) => (
                    <div className="font-mono font-medium">
                        #{getValue() as string}
                    </div>
                ),
            },
            {
                accessorKey: "purchase_date",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Fecha
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const rawDate = row.getValue("purchase_date") as string
                    const formattedDate = rawDate
                        ? formatDate(rawDate)
                        : "—"
                    return <div>{formattedDate}</div>
                },
            },
            {
                accessorKey: "supplier_name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <User className="mr-2 h-4 w-4" />
                        Proveedor
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const supplierName = row.getValue("supplier_name") as string
                    return supplierName ? (
                        <div>{supplierName}</div>
                    ) : (
                        <Badge variant="outline" className="text-xs">
                            Sin proveedor
                        </Badge>
                    )
                },
            },
            {
                accessorKey: "total",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <DollarSign className="mr-2 h-4 w-4" />
                        Total
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ getValue }) => (
                    <div className="font-bold text-green-600">
                        {formatCurrency(getValue() as number)}
                    </div>
                ),
            },
            {
                id: "items_count",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <Package className="mr-2 h-4 w-4" />
                        Items
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const itemsCount = row.original.items?.length || 0
                    return (
                        <Badge variant="secondary">
                            {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </Badge>
                    )
                },
            },
            {
                id: "actions",
                header: "Acciones",
                enableHiding: false,
                cell: ({ row }) => {
                    const purchase = row.original
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            {isAdmin && (
                                <DropdownMenuContent align="end">
                                    {/* Botón Ver usando ShowDialog */}
                                    <DropdownMenuItem asChild>
                                        <ShowDialog purchase={purchase} />
                                    </DropdownMenuItem>

                                    {/* Botón Editar: abrimos el diálogo controlado en el nivel superior */}
                                    <DropdownMenuItem
                                        onSelect={() => setEditingId(purchase.id)}
                                    >
                                        Editar
                                    </DropdownMenuItem>

                                    {/* Botón Eliminar: abrimos el diálogo controlado en el nivel superior */}
                                    <DropdownMenuItem
                                        onSelect={() => setDeletingId(purchase.id)}
                                    >
                                        Eliminar
                                    </DropdownMenuItem>


                                </DropdownMenuContent>
                            )}
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

    // compras actualmente seleccionadas para los diálogos (evita casts a `any`)
    const editingPurchase = editingId !== null ? data.find((d) => d.id === editingId) : undefined
    const deletingPurchase = deletingId !== null ? data.find((d) => d.id === deletingId) : undefined

    return (
        <div className="w-full">
            {/* 🔍 Buscador y control de columnas */}
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Buscar compras por proveedor..."
                    value={(table.getColumn("supplier_name")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => table.getColumn("supplier_name")?.setFilterValue(e.target.value)}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
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
                        {table.getHeaderGroups().map((group) => (
                            <TableRow key={group.id}>
                                {group.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-muted/50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Package className="h-12 w-12 mb-2 opacity-50" />
                                        <p>No se encontraron compras</p>
                                        <p className="text-sm">Las compras aparecerán aquí una vez registradas</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 🔄 Paginación */}
            <div className="flex items-center justify-between px-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Mostrando {table.getFilteredRowModel().rows.length} compra(s)
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
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
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

            {/* Render controlled dialogs outside of dropdowns so opening them doesn't close menus */}
            {editingPurchase !== undefined && (
                <EditDialog
                    purchase={editingPurchase}
                    products={products}
                    open={true}
                    onOpenChange={(v: boolean) => { if (!v) setEditingId(null) }}
                />
            )}
            {deletingPurchase !== undefined && (
                <DeleteDialog
                    purchase={deletingPurchase}
                    open={true}
                    onOpenChange={(v: boolean) => { if (!v) setDeletingId(null) }}
                />
            )}
        </div>
    );
}