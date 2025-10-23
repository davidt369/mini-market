<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        // Cargar relaciones para evitar N+1 queries
        $users = User::with(['roles', 'permissions'])->get();

        // Mapear usuarios al formato esperado por el frontend (roles: string[], permissions: string[])
        $payload = $users->map(function (User $user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                // Spatie devuelve una colección de Role models; extraemos los nombres
                'roles' => $user->roles->pluck('name')->toArray(),
                // Para permisos directos asignados
                'permissions' => method_exists($user, 'getDirectPermissions') ? $user->getDirectPermissions()->pluck('name')->toArray() : [],
            ];
        });

        // También enviar lista completa de roles (solo nombres) si el frontend la necesita
        $roles = Role::all()->pluck('name');

        // Renderizar componente siguiendo la convención 'market/users/Index'
        return Inertia::render('market/users/Index', [
            'users' => $payload,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        if ($request->role) {
            $user->assignRole($request->role);
        }

        return redirect()->back()->with('success', 'Usuario creado correctamente.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', 'exists:roles,name'],
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
        }
        $user->save();

        if ($request->role) {
            $user->syncRoles([$request->role]);
        }

        return redirect()->back()->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->back()->with('success', 'Usuario eliminado correctamente.');
    }
    public function assignRole(Request $request, User $user)
    {
        $request->validate([
            'role' => ['required', 'exists:roles,name'], // Validamos por nombre
        ]);

        // syncRoles reemplaza todos los roles actuales con el nuevo.
        // Si quisieras añadir sin reemplazar, usa assignRole().
        $user->syncRoles([$request->role]);

        return redirect()->back()->with('success', 'Rol asignado correctamente.');
    }
}
