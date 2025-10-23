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
import { Plus } from "lucide-react"
import { route } from "ziggy-js"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toastSuccess } from "../ui/sonner"

export function CreateDialog({ roles }: { roles?: string[] }) {
    const [open, setOpen] = React.useState(false)

    const { data, setData, post, processing, reset, errors } = useForm({
        name: "",
        email: "",
        password: "",
        role: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(route("market.users.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                setOpen(false)
                toastSuccess(
                    "Usuario creado con éxito",
                    "El nuevo usuario ha sido creado.",
                    {
                        duration: 4000,
                    }
                )
            },
            onError: (errors) => console.error(errors),
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Nuevo Usuario</DialogTitle>
                    <DialogDescription>Crear un nuevo usuario del sistema.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} required />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={data.email} onChange={(e) => setData("email", e.target.value)} required />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={data.password} onChange={(e) => setData("password", e.target.value)} required />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Rol</Label>
                        <Select value={data.role || ""} onValueChange={(value: string) => setData("role", value === "__none" ? "" : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="-- Ninguno --" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none">-- Ninguno --</SelectItem>
                                {roles?.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" type="button" onClick={() => { setOpen(false); reset(); }}>
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
