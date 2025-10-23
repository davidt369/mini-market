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
import { Badge } from "@/components/ui/badge"
import { ShowSaleDialog } from "./ShowSaleDialog"
import { DeleteDialog } from "./DeleteDialog"
import { EditSaleDialog } from './EditSaleDialog'
import { usePage } from "@inertiajs/react"
import { Role } from "@/types"





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

// Ajuste de tipos para que coincidan con lo que espera EditSaleDialog
type SaleItem = { id: number; product_id: number; product?: { name?: string }; product_name?: string; qty: number; unit_price: number; subtotal: number }
type SaleRow = { id: number; sale_date: string; customer?: { full_name?: string }; total: number; items?: SaleItem[] }

interface DataTableProps {
    data: SaleRow[]
    products?: { id: number; name: string; unit_price?: number; stock?: number }[]
    customers?: { id: number; full_name: string }[]
}

export function DataTable({ data, products = [], customers = [] }: DataTableProps) {
    const [editingId, setEditingId] = React.useState<number | null>(null)
    const [deletingId, setDeletingId] = React.useState<number | null>(null)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [search, setSearch] = React.useState<string>('')




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
        sale_date: "Fecha",
        "customer.full_name": "Cliente",
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

    const columns = React.useMemo<ColumnDef<SaleRow>[]>(
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
                accessorKey: "sale_date",
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
                    const rawDate = row.getValue("sale_date") as string
                    const formattedDate = rawDate
                        ? formatDate(rawDate)
                        : "—"
                    return <div>{formattedDate}</div>
                },
            },
            {
                accessorKey: "customer.full_name",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        <User className="mr-2 h-4 w-4" />
                        Cliente
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const customerName = row.original.customer?.full_name
                    return customerName ? (
                        <div>{customerName}</div>
                    ) : (
                        <Badge variant="outline" className="text-xs">
                            Sin cliente
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
                    const sale = row.original
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Abrir menú</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                                {/* Botón Ver usando ShowSaleDialog */}
                                <DropdownMenuItem asChild>
                                    <ShowSaleDialog sale={sale} />
                                </DropdownMenuItem>

                                {/* Botón Editar */}
                                <DropdownMenuItem onSelect={() => setEditingId(sale.id)}>
                                    Editar
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Botón Eliminar (controlado) */}
                                {isAdmin && (
                                    <DropdownMenuItem onSelect={() => setDeletingId(sale.id)}>
                                        Eliminar
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                },
            }
        ],
        []
    )

    // Apply a simple client-side search filter across several fields (id, customer name, product names)
    const filteredData = React.useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return data

        return data.filter((row) => {
            // search id
            if (String(row.id).includes(q)) return true
            // search customer
            if (row.customer?.full_name && row.customer.full_name.toLowerCase().includes(q)) return true
            // search product names inside items
            if (row.items && row.items.some(it => (it.product?.name ?? '').toLowerCase().includes(q))) return true
            return false
        })
    }, [data, search])

    const table = useReactTable({
        data: filteredData,
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
                    placeholder="Buscar ventas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                                <TableRow key={row.id}>
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
                                        <DollarSign className="h-12 w-12 mb-2 opacity-50" />
                                        <p>No se encontraron ventas</p>
                                        <p className="text-sm">Las ventas aparecerán aquí una vez registradas</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 🔄 Paginación */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Siguiente
                </Button>
            </div>

            {/* Render controlled dialogs outside of dropdowns */}
            {editingId !== null && (
                <EditSaleDialog
                    sale={data.find(d => d.id === editingId)!}
                    products={products}
                    customers={customers}
                    open={true}
                    onOpenChange={(v: boolean) => { if (!v) setEditingId(null) }}
                />
            )}
            {deletingId !== null && (
                <DeleteDialog
                    sale={data.find(d => d.id === deletingId)!}
                    open={true}
                    onOpenChange={(v: boolean) => { if (!v) setDeletingId(null) }}
                />
            )}
        </div>
    )
}