
import * as React from "react"
import { useForm } from "@inertiajs/react"
import { useDropzone } from "react-dropzone"
import { route } from "ziggy-js"
import { Check, ChevronsUpDown, Plus, Upload } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

interface Category {
    id: number
    name: string
}

interface CreateDialogProps {
    categories: Category[]
}

export function CreateDialog({ categories }: CreateDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedCategory, setSelectedCategory] =
        React.useState<Category | null>(null)

    const { data, setData, post, processing, reset, errors } = useForm({
        category_id: "",
        name: "",
        description: "",
        unit_cost: "",
        unit_price: "",
        stock: "",
        min_stock: "",
        expiry_date: "",
        image: null as File | null,
    })

    // --- Dropzone ---
    const { getRootProps, getInputProps } = useDropzone({
        accept: { "image/*": [] },
        onDrop: (acceptedFiles) => setData("image", acceptedFiles[0]),
    })

    // --- Combobox ---
    const [comboboxOpen, setComboboxOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    const handleSelectCategory = (cat: Category) => {
        setSelectedCategory(cat)
        setValue(cat.name)
        setData("category_id", String(cat.id))
        setComboboxOpen(false)
    }

    // --- Submit ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route("market.products.store"), {
            forceFormData: true,
            onSuccess: () => {
                reset()
                setSelectedCategory(null)
                setValue("")
                setOpen(false)
            },
            onError: (err) => console.error(err),
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Producto
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-5xl xl:max-w-6xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                <DialogHeader>
                    <DialogTitle>Nuevo Producto</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo medicamento o producto.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pb-4">
                    {/* Categoría */}
                    <div className="space-y-2">
                        <Label>Categoría</Label>
                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="w-full justify-between"
                                >
                                    {value || "Seleccionar categoría..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 max-h-60 overflow-y-auto">
                                <Command>
                                    <CommandInput placeholder="Buscar categoría..." className="h-9" />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                                        <CommandGroup>
                                            {categories?.length ? (
                                                categories.map((cat) => (
                                                    <CommandItem
                                                        key={cat.id}
                                                        onSelect={() => handleSelectCategory(cat)}
                                                    >
                                                        {cat.name}
                                                        <Check
                                                            className={cn(
                                                                "ml-auto h-4 w-4",
                                                                selectedCategory?.id === cat.id
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))
                                            ) : (
                                                <CommandEmpty>No hay categorías disponibles.</CommandEmpty>
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errors.category_id && (
                            <p className="text-sm text-red-500">{errors.category_id}</p>
                        )}
                    </div>

                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Ej. Paracetamol 500mg"
                            required
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Breve descripción del producto"
                        />
                    </div>

                    {/* Costos / Stock */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <Label htmlFor="unit_cost">Costo Unitario</Label>
                            <Input
                                id="unit_cost"
                                type="number"
                                step="0.01"
                                value={data.unit_cost}
                                onChange={(e) => setData("unit_cost", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="unit_price">Precio Unitario</Label>
                            <Input
                                id="unit_price"
                                type="number"
                                step="0.01"
                                value={data.unit_price}
                                onChange={(e) => setData("unit_price", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="stock">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={data.stock}
                                onChange={(e) => setData("stock", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="min_stock">Stock Mínimo</Label>
                            <Input
                                id="min_stock"
                                type="number"
                                value={data.min_stock}
                                onChange={(e) => setData("min_stock", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Fecha de vencimiento y Imagen */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Fecha de vencimiento */}
                        <div className="space-y-2">
                            <Label htmlFor="expiry_date">Fecha de vencimiento</Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) => setData("expiry_date", e.target.value)}
                            />
                        </div>

                        {/* Imagen */}
                        <div className="space-y-2">
                            <Label>Imagen del producto</Label>
                            <div
                                {...getRootProps({
                                    className:
                                        "border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center min-h-[120px]",
                                })}
                            >
                                <input {...getInputProps()} />
                                {data.image ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img
                                            src={URL.createObjectURL(data.image)}
                                            alt="Vista previa"
                                            className="max-h-32 max-w-full object-contain rounded-md"
                                        />
                                        <p className="text-sm text-green-600 truncate max-w-full">{data.image.name}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Arrastra o selecciona una imagen
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset()
                                setOpen(false)
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}