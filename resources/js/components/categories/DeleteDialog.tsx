"use client"

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
import { Trash2 } from "lucide-react"
import { route } from "ziggy-js"

export interface Category {
    id?: number
    name: string
    description?: string
}

interface DeleteDialogProps {
    category: Category
}

export function DeleteDialog({ category }: DeleteDialogProps) {
    const [open, setOpen] = React.useState(false)

    const { delete: destroy, processing } = useForm({})

    const handleDelete = () => {
        if (!category.id) return

        destroy(route("market.categories.destroy", category.id), {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
            onError: (errors) => console.error(errors),
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Eliminar Categoría</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro que deseas eliminar la categoría "{category.name}"? Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? "Eliminando..." : "Eliminar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
