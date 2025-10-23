import React from 'react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,

} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { route } from 'ziggy-js'
import { toastSuccess, toastError, toastWarning } from '@/components/ui/sonner'
import {
    Plus,
    Trash2,
    Truck,
    Package,
    Loader2,
    Calculator,
    User,
    DollarSign
} from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command'

interface Item {
    product_id: number
    qty: number
    unit_cost: number
    product_name?: string
}

interface CreateEditDialogProps {
    products: { id: number; name: string; unit_cost?: number; unit_price?: number; stock?: number }[]
}

export function CreateDialog({ products }: CreateEditDialogProps) {
    const [open, setOpen] = React.useState(false)
    const { data, setData, post, processing, reset, errors } = useForm<{
        supplier_name: string;
        items: Item[]
    }>({
        supplier_name: '',
        items: []
    })

    // Calcular totales
    const totals = React.useMemo(() => {
        const subtotal = (data.items || []).reduce((sum, item) => sum + (item.qty * item.unit_cost), 0)
        return {
            subtotal,
            itemsCount: (data.items || []).length
        }
    }, [data.items])

    // Resetear el formulario cuando se abre el diálogo
    React.useEffect(() => {
        if (open) {
            reset()
        }
    }, [open, reset])

    const addItem = () => {
        if (products.length === 0) {
            toastWarning("No hay productos", "No hay productos disponibles para agregar.")
            return
        }

        const newItems = [...(data.items || [])]
        const firstProduct = products[0]
        newItems.push({
            product_id: firstProduct.id,
            qty: 1,
            unit_cost: firstProduct.unit_cost || 0,
            product_name: firstProduct.name
        })
        setData('items', newItems)
    }

    const updateItem = (index: number, field: keyof Item, value: number) => {
        const items = [...(data.items || [])] as Item[]

        // Crear un nuevo objeto para evitar problemas de asignación directa
        const current = items[index] || { product_id: 0, qty: 1, unit_cost: 0 }

        if (field === 'product_id') {
            const product = products.find(p => p.id === Number(value))
            if (product) {
                items[index] = {
                    ...current,
                    product_id: product.id,
                    unit_cost: product.unit_cost || 0,
                    product_name: product.name,
                }
            } else {
                items[index] = { ...current, product_id: Number(value) }
            }
        } else {
            items[index] = { ...current, [field]: value } as Item
        }

        setData('items', items)
    }

    const removeItem = (index: number) => {
        const items = [...(data.items || [])]
        items.splice(index, 1)
        setData('items', items)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validaciones
        if (!data.supplier_name?.trim()) {
            toastWarning("Proveedor requerido", "Debe ingresar el nombre del proveedor.")
            return
        }

        if (!data.items || data.items.length === 0) {
            toastWarning("Items requeridos", "Debe agregar al menos un producto a la compra.")
            return
        }

        // Validar que todos los productos tengan cantidad válida
        const hasInvalidQuantities = data.items.some(item => item.qty <= 0)
        if (hasInvalidQuantities) {
            toastError("Cantidad inválida", "Todas las cantidades deben ser mayores a 0.")
            return
        }

        // Validar que todos los productos tengan costo válido
        const hasInvalidCosts = data.items.some(item => item.unit_cost < 0)
        if (hasInvalidCosts) {
            toastError("Costo inválido", "Todos los costos deben ser mayores o iguales a 0.")
            return
        }

        post(route('market.purchases.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess(
                    'Compra registrada exitosamente',
                    'La compra se ha registrado correctamente en el sistema.'
                )
                reset()
                setOpen(false)
            },
            onError: (errors) => {
                console.error('Error al registrar compra:', errors)
                toastError(
                    'Error al registrar compra',
                    'No se pudo completar la compra. Verifique los datos e intente nuevamente.'
                )
            }
        })
    }

    const resetForm = () => {
        reset()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                    <Truck className="h-4 w-4" />
                    Nueva Compra
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Registrar Nueva Compra
                    </DialogTitle>
                    <DialogDescription>
                        Complete la información para registrar una nueva compra de productos en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección Proveedor */}
                    <div className="space-y-3">
                        <Label htmlFor="supplier_name" className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Proveedor *
                        </Label>
                        <Input
                            id="supplier_name"
                            placeholder="Ingrese el nombre del proveedor..."
                            value={data.supplier_name}
                            onChange={(e) => setData('supplier_name', e.target.value)}
                            required
                            disabled={processing}
                            className={errors.supplier_name ? "border-red-500" : ""}
                        />
                        {errors.supplier_name && (
                            <p className="text-sm text-red-600">{errors.supplier_name}</p>
                        )}
                    </div>

                    {/* Sección Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Productos de la compra
                            </Label>
                            <Badge variant="secondary" className="px-2 py-1">
                                {totals.itemsCount} items
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {(data.items || []).map((item: Item, index: number) => (
                                <div key={index} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/20">
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-4">
                                        {/* Producto */}
                                        <div className="sm:col-span-4">
                                            <Label className="text-xs text-muted-foreground mb-2 block">
                                                Producto
                                            </Label>
                                            <ProductCombobox
                                                products={products}
                                                value={String(item.product_id)}
                                                onSelect={(pid) => {
                                                    updateItem(index, 'product_id', Number(pid))
                                                }}
                                            />
                                        </div>

                                        {/* Cantidad */}
                                        <div className="sm:col-span-2">
                                            <Label className="text-xs text-muted-foreground mb-2 block">
                                                Cantidad
                                            </Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.qty}
                                                onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                                                className="w-full"
                                                disabled={processing}
                                            />
                                        </div>

                                        {/* Costo Unitario */}
                                        <div className="sm:col-span-3">
                                            <Label className="text-xs text-muted-foreground mb-2 block">
                                                Costo Unitario (Bs.)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.unit_cost}
                                                onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
                                                className="w-full"
                                                disabled={processing}
                                            />
                                        </div>

                                        {/* Subtotal y Eliminar */}
                                        <div className="sm:col-span-3 flex flex-col gap-2">
                                            <Label className="text-xs text-muted-foreground mb-2 block">
                                                Subtotal
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="flex-1 justify-center py-1.5">
                                                    Bs. {(item.qty * item.unit_cost).toFixed(2)}
                                                </Badge>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeItem(index)}
                                                    disabled={processing}
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Botón Agregar Item */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                            className="w-full gap-2"
                            disabled={products.length === 0 || processing}
                        >
                            <Plus className="h-4 w-4" />
                            Agregar Producto
                        </Button>
                    </div>

                    {/* Resumen de Totales */}
                    {totals.itemsCount > 0 && (
                        <div className="p-4 border rounded-lg bg-muted/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Total de la compra:</span>
                                <span className="text-lg font-bold text-green-600">
                                    Bs. {totals.subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Total de productos:</span>
                                <span>{totals.itemsCount}</span>
                            </div>
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || totals.itemsCount === 0 || !data.supplier_name?.trim()}
                            className="gap-2 min-w-28"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Calculator className="h-4 w-4" />
                                    Registrar Compra
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// Componente ProductCombobox mejorado (Popover + Command para no cerrar el diálogo padre)
import type { Product } from '@/types/purchases'

export function ProductCombobox({ products, value, onSelect }: {
    products: Product[];
    value: string;
    onSelect: (productId: string, cost: number, name?: string) => void
}) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const selectedProduct = products.find((p) => String(p.id) === value)

    // Filtrar productos basado en la búsqueda
    const filteredProducts = React.useMemo(() => {
        if (!searchValue) return products
        return products.filter(product =>
            (product.name ?? '').toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [products, searchValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    <span className="truncate">
                        {selectedProduct ? selectedProduct.name : 'Seleccionar producto...'}
                    </span>
                    <DollarSign className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar producto..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                        autoFocus
                    />
                    <CommandList>
                        <CommandEmpty>No se encontraron productos.</CommandEmpty>
                        <CommandGroup>
                            {filteredProducts.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={String(product.id)}
                                    onSelect={(currentValue) => {
                                        const cost = product.unit_cost || 0
                                        onSelect(currentValue, cost, product.name)
                                        setOpen(false)
                                        setSearchValue("")
                                    }}
                                    className="flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{product.name}</span>
                                        {value === String(product.id) && <Badge className="h-4 w-4" />}
                                    </div>
                                    <Badge variant="secondary" className="ml-2">
                                        Bs. {Number(product.unit_cost ?? 0).toFixed(2)}
                                    </Badge>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}