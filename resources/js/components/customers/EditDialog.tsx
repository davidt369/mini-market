import React from 'react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { route } from 'ziggy-js'
import { toastError, toastWarning } from '@/components/ui/sonner'
import { Edit, Loader2, UserPen } from 'lucide-react'

export function EditDialog({ customer }: { customer: { id: number; full_name?: string; phone?: string; ci_number?: string } }) {
    const [open, setOpen] = React.useState(false)

    const { data, setData, put, processing, errors, reset } = useForm({
        full_name: customer.full_name || '',
        phone: customer.phone || '',
        ci_number: customer.ci_number || '',
    })



    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Mostrar advertencia si no hay cambios
        if (data.full_name === customer.full_name &&
            data.phone === customer.phone &&
            data.ci_number === customer.ci_number) {
            toastWarning(
                "Sin cambios detectados",
                "No se realizaron modificaciones en los datos del cliente.",
                {
                    duration: 4000,
                }
            )
            return
        }

        put(route('market.customers.update', customer.id), {
            preserveScroll: true,
            onSuccess: () => {
                toastWarning(
                    "Cliente actualizado con éxito",
                    "Los datos del cliente han sido actualizados correctamente.",
                    {
                        duration: 4000,
                    }
                )
                setOpen(false)
            },
            onError: (errors) => {
                console.error('Error al actualizar cliente:', errors)
                toastError(
                    "Error al actualizar cliente",
                    "Por favor verifica los datos e intenta nuevamente.",
                    {
                        duration: 6000,
                    }
                )
            },
        })
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen) {
            // Limpiar errores cuando se cierra el diálogo
            reset()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPen className="h-5 w-5" />
                        Editar Cliente
                    </DialogTitle>
                    <DialogDescription>
                        Modifica la información del cliente {customer.full_name}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre completo */}
                    <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-sm font-medium">
                            Nombre completo *
                        </Label>
                        <Input
                            id="full_name"
                            value={data.full_name}
                            onChange={(e) => setData('full_name', e.target.value)}
                            placeholder="Ej: Juan Pérez García"
                            required
                            disabled={processing}
                            className={errors.full_name ? "border-red-500" : ""}
                        />
                        {errors.full_name && (
                            <p className="text-sm text-red-600">{errors.full_name}</p>
                        )}
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                            Teléfono
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            placeholder="Ej: 77712345"
                            disabled={processing}
                            className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* CI */}
                    <div className="space-y-2">
                        <Label htmlFor="ci_number" className="text-sm font-medium">
                            Número de CI
                        </Label>
                        <Input
                            id="ci_number"
                            value={data.ci_number}
                            onChange={(e) => setData('ci_number', e.target.value)}
                            placeholder="Ej: 1234567 LP"
                            disabled={processing}
                            className={errors.ci_number ? "border-red-500" : ""}
                        />
                        {errors.ci_number && (
                            <p className="text-sm text-red-600">{errors.ci_number}</p>
                        )}
                    </div>

                    {/* Información de cambios */}
                    <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="text-muted-foreground">
                            <strong>Nota:</strong> El sistema detectará automáticamente si realizaste cambios antes de guardar.
                        </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="min-w-24"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Guardar
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}