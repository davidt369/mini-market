import * as React from "react"
import { useForm } from "@inertiajs/react"
import { route } from "ziggy-js"
import { Trash } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface Product {
    id: number
    name: string
}

interface DeleteDialogProps {
    product: Product
}

export function DeleteDialog({ product }: DeleteDialogProps) {
    const { delete: destroy, processing } = useForm()
    const [open, setOpen] = React.useState(false)

    const handleDelete = () => {
        destroy(route("market.products.destroy", product.id), {
            onSuccess: () => setOpen(false),
            onError: (err) => console.error("Error al eliminar:", err),
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation() // evita que el dropdown cierre antes
                        setOpen(true)
                    }}
                >
                    <Trash className="mr-2 h-4 w-4" />

                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar medicamento?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. El medicamento "{product.name}" será
                        eliminado permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {processing ? "Eliminando..." : "Eliminar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
