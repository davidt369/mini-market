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
import { toastSuccess, toastError } from '../ui/sonner'
import { UserPlus, Loader2 } from 'lucide-react'

export function CreateDialog() {
    const [open, setOpen] = React.useState(false)

    const { data, setData, post, processing, errors, reset } = useForm({
        full_name: '',
        phone: '',
        ci_number: '',
    })



    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        post(route('market.customers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toastSuccess(
                    "Cliente creado con éxito",
                    "El nuevo cliente ha sido registrado en el sistema.",
                    {
                        duration: 4000,
                    }
                )
                // Reset form data and close dialog
                reset()
                setOpen(false)
            },
            onError: (errors) => {
                console.error('Error al crear cliente:', errors)
                toastError(
                    "Error al crear cliente",
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
                <Button variant="default" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Crear Nuevo Cliente
                    </DialogTitle>
                    <DialogDescription>
                        Completa la información para registrar un nuevo cliente en el sistema.
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
                            className="min-w-20"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear Cliente'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}