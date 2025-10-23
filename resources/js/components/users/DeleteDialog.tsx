import * as React from "react"
import { useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"
import { route } from "ziggy-js"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import type { User as UserType } from "@/types"
import { toastSuccess, toastError } from "@/components/ui/sonner"

export function DeleteDialog({ user }: { user: UserType }) {
    const [open, setOpen] = React.useState(false)
    const { delete: destroy, processing } = useForm()

    const handleDelete = () => {
        destroy(route("market.users.destroy", user.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false)
                toastSuccess(
                    "Usuario eliminado",
                    "El usuario ha sido eliminado del sistema.",
                    {
                        duration: 4000,
                    }
                )
            },
            onError: (errors) => {
                console.error(errors)
                toastError(
                    "Error al eliminar usuario",
                    "No se pudo eliminar el usuario. Intenta nuevamente.",
                    {
                        duration: 6000,
                    }
                )
            },
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start px-2 py-1.5 text-sm"
                    disabled={processing}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                        <DialogTitle>Confirmar eliminación</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        ¿Estás seguro de que deseas eliminar al usuario <strong>{user.name}</strong> ({user.email})?
                        Esta acción no se puede deshacer y todos los datos asociados se perderán permanentemente.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                        className="sm:flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                        className="sm:flex-1"
                    >
                        {processing ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar usuario
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}