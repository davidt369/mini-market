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
import { ArrowUpDown, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,

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

import { EditDialog } from "./EditDialogProduct"
import { DeleteDialog } from "./DeleteDialog"

export interface Category {
    id: number
    name: string
}

export interface Product {
    id: number
    category: Category
    category_id: number
    name: string
    description?: string
    unit_cost: number
    unit_price: number
    stock: number
    min_stock: number
    expiry_date?: string
    image_url?: string
    created_at?: string
}

interface DataTableProps {
    data: Product[]
    categories: Category[]
}

export function DataTableProducts({ data, categories }: DataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

    const columns = React.useMemo<ColumnDef<Product>[]>(() => [
        {
            accessorKey: "image_url",
            header: "Imagen",
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    {row.original.image_url ? (
                        <img
                            src={row.original.image_url}
                            alt={row.original.name}
                            className="h-10 w-10 object-cover rounded-md"
                        />
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },

        {
            accessorFn: (row) => row.category.name,
            id: "category",
            header: "Categoría",
        },
        {
            accessorKey: "unit_cost",
            header: "Costo Unitario Compra",
        },
        {
            accessorKey: "unit_price",
            header: "Precio Unitario Venta",
        },
        {
            accessorKey: "stock",
            header: "Stock",
        },
        {
            accessorKey: "min_stock",
            header: "Stock Mínimo",
        },
        {
            accessorKey: "expiry_date",
            header: "Fecha de Vencimiento",
            cell: ({ row }) =>
                row.original.expiry_date
                    ? new Date(row.original.expiry_date).toLocaleDateString("es-BO")
                    : "—",
        },
        {
            accessorKey: "created_at",
            header: "Creado",
            cell: ({ row }) =>
                row.original.created_at
                    ? new Date(row.original.created_at).toLocaleDateString("es-BO")
                    : "—",
        },
        // {
        //     accessorKey: "description",
        //     header: "Descripción",
        //     cell: ({ row }) => <div>{row.original.description || "—"}</div>,
        // },
        {
            id: "actions",
            header: "Acciones",
            enableHiding: false,
            cell: ({ row }) => {
                const product = row.original

                return (
                    <>
                        <EditDialog product={product} categories={categories} />
                        <DeleteDialog product={product} />
                    </>


                )
            },
        },
    ], [categories])

    const table = useReactTable({
        data,
        columns,
        state: { sorting, columnFilters, columnVisibility },
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
            {/* Buscador y control de columnas */}
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Buscar productos..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            Columnas <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table.getAllColumns()
                            .filter((col) => col.getCanHide())
                            .map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col.id}
                                    className="capitalize"
                                    checked={col.getIsVisible()}
                                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                                >
                                    {col.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Tabla */}
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
                                    Sin resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
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
        </div>
    )
}
