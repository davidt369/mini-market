import * as React from "react"
import { useForm } from "@inertiajs/react"
import type { User as UserType } from "@/types"
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
import { Edit } from "lucide-react"
import { route } from "ziggy-js"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toastError, toastWarning } from "@/components/ui/sonner" // Solo importar de tu wrapper

export function EditDialog({ user, roles }: { user: UserType; roles?: string[] }) {
    const [open, setOpen] = React.useState(false)

    type FormFields = { name: string; email: string; password?: string; role?: string }

    const { data, setData, put, processing, errors, reset } = useForm<FormFields>({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: ((user as UserType & { roles?: string[] }).roles || [])[0] || "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        console.log('EditDialog: Iniciando submit...')

        put(route("market.users.update", user.id), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('EditDialog: onSuccess callback ejecutado')

                // Mostrar toast de éxito
                toastWarning(
                    "Usuario actualizado con éxito",
                    "Los datos del usuario han sido actualizados.",
                    {
                        duration: 4000,
                    }
                )

                // Cerrar diálogo y resetear
                setOpen(false)
                reset()
            },
            onError: (errors) => {
                console.log('EditDialog: onError callback ejecutado', errors)

                // Mostrar toast de error
                toastError(
                    "Error al actualizar usuario",
                    "Por favor verifica los datos e intenta nuevamente.",
                    {
                        duration: 6000,
                    }
                )
            },
        })
    }

    // Agregar un efecto para debuggear cuando el diálogo se abre/cierra
    React.useEffect(() => {
        console.log('EditDialog: open state changed to', open)
    }, [open])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2 py-1.5 text-sm">
                    <Edit className="mr-2 h-4 w-4 inline" /> Editar
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Usuario</DialogTitle>
                    <DialogDescription>Modifica los datos del usuario.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            required
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password (dejar vacío para no cambiar)</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            placeholder="Dejar vacío para mantener la contraseña actual"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    {roles && (
                        <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select value={data.role || ""} onValueChange={(value: string) => setData("role", value === "__none" ? "" : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="-- Ninguno --" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none">-- Ninguno --</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
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