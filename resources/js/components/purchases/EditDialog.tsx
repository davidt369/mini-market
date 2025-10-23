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
import { toastSuccess, toastError, toastWarning } from '@/components/ui/sonner'
import { route } from 'ziggy-js'
import { ProductCombobox } from './CreateDialog'
import type { Purchase, Product } from '@/types/purchases'
import { Edit, Plus, Trash2, Loader2, Package, User } from 'lucide-react'

type LocalItem = { product_id?: number; qty: number; unit_cost?: number; product_name?: string }
type PurchaseForm = { supplier_name: string; items: LocalItem[] }

export function EditDialog({ purchase, products, open: openProp, onOpenChange }: { purchase: Purchase; products: Product[]; open?: boolean; onOpenChange?: (v: boolean) => void }) {
    const [localOpen, setLocalOpen] = React.useState(false)
    const open = typeof openProp === 'boolean' ? openProp : localOpen
    const setOpen = (v: boolean) => {
        if (onOpenChange) onOpenChange(v)
        else setLocalOpen(v)
    }

    const { data, setData, put, processing, reset, errors } = useForm<PurchaseForm>({
        supplier_name: '',
        items: []
    })

    // Calcular total
    const total = React.useMemo(() => {
        return (data.items || []).reduce((sum, item) => sum + (item.qty * (item.unit_cost || 0)), 0)
    }, [data.items])

    React.useEffect(() => {
        if (open) {
            const p = purchase as Purchase
            const items: LocalItem[] = (p.items ?? []).map((i) => ({
                product_id: i.product_id,
                qty: i.qty,
                unit_cost: i.unit_cost,
                product_name: i.product?.name
            }))
            setData('supplier_name', p.supplier_name ?? '')
            setData('items', items)
        }
    }, [open, purchase, setData])

    const addItem = () => {
        if (products.length === 0) {
            toastWarning("No hay productos", "No hay productos disponibles para agregar.")
            return
        }

        const items = [...(data.items || [])]
        const first = products[0]
        items.push({
            product_id: first?.id,
            qty: 1,
            unit_cost: first?.unit_cost || 0,
            product_name: first?.name
        })
        setData('items', items)
    }

    const updateItem = (index: number, field: keyof LocalItem, value: number | string) => {
        const items = [...(data.items || [])] as LocalItem[]
        const currentItem = items[index] || { product_id: 0, qty: 1, unit_cost: 0 }

        if (field === 'product_id') {
            const product = products.find(p => p.id === Number(value))
            items[index] = {
                ...currentItem,
                product_id: product?.id,
                unit_cost: product?.unit_cost || currentItem.unit_cost,
                product_name: product?.name
            } as LocalItem
        } else {
            items[index] = { ...currentItem, [field]: value } as LocalItem
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

        put(route('market.purchases.update', purchase.id), {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess(
                    'Compra actualizada exitosamente',
                    'Los cambios en la compra se han guardado correctamente.'
                )
                reset()
                setOpen(false)
            },
            onError: (errors) => {
                console.error('Error al actualizar compra:', errors)
                toastError(
                    'Error al actualizar compra',
                    'No se pudieron guardar los cambios. Verifique los datos e intente nuevamente.'
                )
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Only render trigger when uncontrolled (no onOpenChange passed) */}
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
                        Editar Compra #{purchase.id}
                    </DialogTitle>
                    <DialogDescription>
                        Modifica la información de la compra registrada en el sistema.
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
                                {(data.items || []).length} items
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {(data.items || []).map((item: LocalItem, index: number) => (
                                <div key={index} className="flex gap-3 items-start p-4 border rounded-lg bg-muted/20">
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-4">
                                        {/* Producto */}
                                        <div className="sm:col-span-5">
                                            <Label className="text-xs text-muted-foreground mb-2 block">
                                                Producto
                                            </Label>
                                            <ProductCombobox
                                                products={products}
                                                value={String(item.product_id || '')}
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
                                        <div className="sm:col-span-2 flex flex-col gap-2">
                                            <Label className="text-xs text-muted-foreground mb-2 block">
                                                Subtotal
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="flex-1 justify-center py-1.5">
                                                    Bs. {((item.qty || 0) * (item.unit_cost || 0)).toFixed(2)}
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

                    {/* Resumen de Total */}
                    {(data.items || []).length > 0 && (
                        <div className="p-4 border rounded-lg bg-muted/10">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total de la compra:</span>
                                <span className="text-lg font-bold text-green-600">
                                    Bs. {total.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Botones de Acción */}
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                            className="sm:flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || (data.items || []).length === 0 || !data.supplier_name?.trim()}
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