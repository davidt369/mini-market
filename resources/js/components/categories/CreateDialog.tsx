
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
import { Plus } from "lucide-react"
import { route } from "ziggy-js"

export function CreateDialog() {
    const [open, setOpen] = React.useState(false)

    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        description: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route("market.categories.store"), {
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
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Categoría
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nueva Categoría</DialogTitle>
                    <DialogDescription>
                        Agrega una nueva categoría para organizar tus productos.
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



