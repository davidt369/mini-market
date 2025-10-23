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
    DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { route } from 'ziggy-js'
import { toastSuccess, toastError, toastWarning } from '@/components/ui/sonner'
import {
    Edit,
    Plus,
    Trash2,

    User,
    Package,
    Loader2,
    ChevronsUpDown,

    Check
} from 'lucide-react'

type SaleItem = { product_id: number; qty: number; unit_price: number; product_name?: string }
type Sale = { id: number; sale_date?: string; customer_id?: number | null; customer?: { full_name?: string }; total?: number; items?: SaleItem[] }
type Product = { id: number; name: string; unit_price?: number; stock?: number }
type Customer = { id: number; full_name: string }

export function EditSaleDialog({ sale, products, customers, open: openProp, onOpenChange }: { sale: Sale; products: Product[]; customers: Customer[]; open?: boolean; onOpenChange?: (v: boolean) => void }) {
    const [localOpen, setLocalOpen] = React.useState(false)
    const open = typeof openProp === 'boolean' ? openProp : localOpen
    const setOpen = (v: boolean) => {
        if (onOpenChange) onOpenChange(v)
        else setLocalOpen(v)
    }

    const { data, setData, put, processing, reset, errors } = useForm<{ customer_id: string | number | null; items: SaleItem[] }>({
        customer_id: '',
        items: []
    })

    // Calcular totales
    const totals = React.useMemo(() => {
        const subtotal = (data.items || []).reduce((sum, item) => sum + (item.qty * item.unit_price), 0)
        return {
            subtotal,
            itemsCount: (data.items || []).length
        }
    }, [data.items])

    React.useEffect(() => {
        if (open) {
            setData('customer_id', sale.customer_id ? String(sale.customer_id) : '')
            const items: SaleItem[] = (sale.items ?? []).map(i => ({
                product_id: i.product_id,
                qty: i.qty,
                unit_price: i.unit_price,
                product_name: i.product_name
            }))
            setData('items', items)
        }
    }, [open, sale, setData])

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
            unit_price: Number(firstProduct.unit_price ?? 0),
            product_name: firstProduct.name
        })
        setData('items', newItems)
    }

    const updateItem = (index: number, field: keyof SaleItem, value: string | number) => {
        const items = [...(data.items || [])] as SaleItem[]

        // Create a new item object to avoid direct indexed assignment issues
        const current = items[index] || { product_id: 0, qty: 1, unit_price: 0 }

        if (field === 'product_id') {
            const product = products.find(p => p.id === Number(value))
            if (product) {
                items[index] = {
                    ...current,
                    product_id: product.id,
                    unit_price: Number(product.unit_price ?? 0),
                    product_name: product.name,
                }
            } else {
                items[index] = { ...current, product_id: Number(value) }
            }
        } else if (field === 'qty' || field === 'unit_price') {
            // numeric fields
            items[index] = { ...current, [field]: Number(value) } as SaleItem
        } else {
            items[index] = { ...current, [field]: value } as SaleItem
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
        if (!data.items || data.items.length === 0) {
            toastWarning("Items requeridos", "Debe agregar al menos un producto a la venta.")
            return
        }

        // Validar stock disponible
        const hasStockIssues = data.items.some(item => {
            const product = products.find(p => p.id === item.product_id)
            return product?.stock !== undefined && item.qty > product.stock
        })

        if (hasStockIssues) {
            toastError("Stock insuficiente", "Algunos productos no tienen suficiente stock.")
            return
        }

        put(route('market.sales.update', sale.id), {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess(
                    'Venta actualizada exitosamente',
                    'Los cambios en la venta se han guardado correctamente.'
                )
                reset()
                setOpen(false)
            },
            onError: (errors) => {
                console.error('Error al actualizar venta:', errors)
                toastError(
                    'Error al actualizar venta',
                    'No se pudieron guardar los cambios. Verifique los datos e intente nuevamente.'
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
            {!onOpenChange && (
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start px-2 py-1.5 text-sm"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Editar Venta #{sale.id}
                    </DialogTitle>
                    <DialogDescription>
                        Modifica los productos y datos del cliente de esta venta.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sección Cliente */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Cliente (opcional)
                        </Label>
                        <CustomerCombobox
                            customers={customers}
                            value={data.customer_id ? String(data.customer_id) : ''}
                            onChange={(v) => setData('customer_id', v === '' ? null : Number(v))}
                        />
                        {errors.customer_id && (
                            <p className="text-sm text-red-600">{errors.customer_id}</p>
                        )}
                    </div>

                    {/* Sección Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Productos de la venta
                            </Label>
                            <Badge variant="secondary" className="px-2 py-1">
                                {totals.itemsCount} items
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {(data.items || []).map((item: SaleItem, index: number) => (
                                <div key={index} className="flex gap-3 items-start p-3 border rounded-lg bg-muted/20">
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                        {/* Producto */}
                                        <div className="sm:col-span-5">
                                            <Label className="text-xs text-muted-foreground mb-1 block">
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
                                            <Label className="text-xs text-muted-foreground mb-1 block">
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

                                        {/* Precio Unitario */}
                                        <div className="sm:col-span-3">
                                            <Label className="text-xs text-muted-foreground mb-1 block">
                                                Precio Unitario (Bs.)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                                                className="w-full"
                                                disabled={processing}
                                            />
                                        </div>

                                        {/* Subtotal y Eliminar */}
                                        <div className="sm:col-span-2 flex flex-col gap-1">
                                            <Label className="text-xs text-muted-foreground mb-1 block">
                                                Subtotal
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="flex-1 justify-center">
                                                    Bs. {(item.qty * item.unit_price).toFixed(2)}
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
                                <span className="text-sm font-medium">Total de la venta:</span>
                                <span className="text-lg font-bold text-green-600">
                                    Bs. {totals.subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Total de items:</span>
                                <span>{totals.itemsCount}</span>
                            </div>
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            disabled={processing}
                            className="sm:flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || totals.itemsCount === 0}
                            className="sm:flex-1 gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Edit className="h-4 w-4" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// Componente CustomerCombobox (mismo que en CreateSaleDialog)
function CustomerCombobox({ customers, value, onChange }: { customers: Customer[]; value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const selectedCustomer = customers.find((c) => String(c.id) === value)

    // Filtrar clientes basado en la búsqueda
    const filteredCustomers = React.useMemo(() => {
        if (!searchValue) return customers
        return customers.filter(customer =>
            customer.full_name.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [customers, searchValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    <span className="truncate">
                        {selectedCustomer ? selectedCustomer.full_name : 'Seleccionar cliente...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar cliente..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value=""
                                onSelect={() => {
                                    onChange('');
                                    setOpen(false)
                                    setSearchValue("")
                                }}
                                className="flex items-center gap-2"
                            >
                                <User className="h-4 w-4" />
                                Sin cliente
                                {value === "" && <Check className="ml-auto h-4 w-4" />}
                            </CommandItem>
                            {filteredCustomers.map((customer) => (
                                <CommandItem
                                    key={customer.id}
                                    value={String(customer.id)}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue);
                                        setOpen(false)
                                        setSearchValue("")
                                    }}
                                >
                                    {customer.full_name}
                                    {value === String(customer.id) && <Check className="ml-auto h-4 w-4" />}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

// Componente ProductCombobox (mismo que en CreateSaleDialog)
function ProductCombobox({ products, value, onSelect }: { products: Product[]; value: string; onSelect: (productId: string, price: number, name: string) => void }) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const selectedProduct = products.find((p) => String(p.id) === value)

    // Filtrar productos basado en la búsqueda
    const filteredProducts = React.useMemo(() => {
        if (!searchValue) return products
        return products.filter(product =>
            product.name.toLowerCase().includes(searchValue.toLowerCase())
        )
    }, [products, searchValue])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                    <span className="truncate">
                        {selectedProduct ? selectedProduct.name : 'Seleccionar producto...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar producto..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>No se encontraron productos.</CommandEmpty>
                        <CommandGroup>
                            {filteredProducts.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    value={String(product.id)}
                                    onSelect={(currentValue) => {
                                        // Ensure we pass a numeric unit_price to the parent
                                        const unitPrice = Number(product.unit_price ?? 0)
                                        onSelect(currentValue, unitPrice, product.name);
                                        setOpen(false)
                                        setSearchValue("")
                                    }}
                                    className="flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{product.name}</span>
                                        {value === String(product.id) && <Check className="h-4 w-4" />}
                                    </div>
                                    <Badge variant="secondary" className="ml-2">
                                        Bs. {Number(product.unit_price ?? 0).toFixed(2)}
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