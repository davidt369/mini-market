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
import { route } from 'ziggy-js'
import { toastSuccess, toastError, toastWarning } from '@/components/ui/sonner'
import { Trash2, AlertTriangle, Loader2, UserX } from 'lucide-react'

export function DeleteDialog({ customer }: { customer: { id: number; full_name?: string } }) {
    const [open, setOpen] = React.useState(false)
    const { delete: destroy, processing } = useForm()

    const handleDelete = () => {
        // Mostrar advertencia antes de eliminar
        toastWarning(
            "Eliminando cliente",
            `Procesando la eliminación de ${customer.full_name}...`,
            {
                duration: 3000,
            }
        )

        destroy(route('market.customers.destroy', customer.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false)
                toastSuccess(
                    "Cliente eliminado",
                    `${customer.full_name} ha sido eliminado del sistema correctamente.`,
                    {
                        duration: 5000,
                    }
                )
            },
            onError: (errors) => {
                console.error('Error al eliminar cliente:', errors)
                toastError(
                    "Error al eliminar cliente",
                    "No se pudo eliminar el cliente. Intenta nuevamente.",
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
                    size="sm"
                    className="w-full justify-start px-2 py-1.5 text-sm"
                    style={{ color: 'var(--color-destructive)' }}
                >
                    <Trash2 className="mr-2 h-4 w-4" style={{ color: 'var(--color-destructive)' }} />
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
                        Esta acción no se puede deshacer. Se eliminarán permanentemente todos los datos asociados al cliente.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg"
                        style={{ border: '1px solid var(--color-destructive)', }}>
                        <UserX className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-red-900">
                                {customer.full_name || 'Cliente sin nombre'}
                            </p>
                            <p className="text-sm text-red-700">
                                ID: {customer.id}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}>
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent-foreground)' }} />
                            <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--color-accent-foreground)' }}>
                                    Advertencia importante
                                </p>
                                <p className="text-sm mt-1" style={{ color: 'var(--color-accent-foreground)' }}>
                                    Esta acción eliminará permanentemente al cliente y toda su información asociada del sistema.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
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
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                        className="sm:flex-1"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Eliminando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Sí, eliminar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}