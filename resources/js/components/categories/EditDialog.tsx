
import * as React from "react"
import { useForm } from "@inertiajs/react"
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
import { PenSquare } from "lucide-react"
import { route } from "ziggy-js"

export interface Category {
    id?: number
    name: string
    description?: string
}

interface EditDialogProps {
    category: Category
}

export function EditDialog({ category }: EditDialogProps) {
    const [open, setOpen] = React.useState(false)

    const { data, setData, put, processing, reset, errors } = useForm({
        name: category.name,
        description: category.description || "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        put(route("market.categories.update", category.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                setOpen(false)
            },
            onError: (errors) => {
                console.error(errors)
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <PenSquare className="mr-2 h-4 w-4" />
                    Editar
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Categoría</DialogTitle>
                    <DialogDescription>
                        Modifica la información de la categoría.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Ej. Cuidado personal"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            placeholder="Describe brevemente la categoría"
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => {
                                setOpen(false)
                                reset()
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
