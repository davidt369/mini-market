<?php

// namespace Database\Seeders;

// use Illuminate\Database\Seeder;
// use Spatie\Permission\Models\Permission;
// use Spatie\Permission\Models\Role;

// class PermissionSeeder extends Seeder
// {
//     public function run(): void
//     {
//         // Lista completa de permisos
//         $permissions = [
//             // Usuarios
//             'view-users',
//             'create-user',
//             'edit-user',
//             'delete-user',

//             // Productos
//             'view-products',
//             'create-product',
//             'edit-product',
//             'delete-product',
//             'adjust-stock',

//             // Categorías
//             'manage-categories',

//             // Ventas (POS)
//             'make-sale',
//             'return-item',
//             'view-sales-history',
//             'cancel-sale',

//             // Compras
//             'view-purchases',
//             'create-edit-purchase',

//             // Alertas
//             'view-alert-dashboard',
//             'mark-alert-read',

//             // Caja registradora
//             'open-close-cashbox',
//             'cash-in-out',

//             // Reportes
//             'view-reports',
//             'export-reports',
//         ];

//         // Crear todos los permisos
//         foreach ($permissions as $permission) {
//             Permission::firstOrCreate(['name' => $permission]);
//         }

//         // Crear roles
//         $adminRole = Role::firstOrCreate(['name' => 'admin']);
//         $employeeRole = Role::firstOrCreate(['name' => 'employee']);

//         // Asignar permisos al rol admin (todos)
//         $adminRole->givePermissionTo($permissions);

//         // Asignar permisos al rol employee (según tabla)
//         $employeePermissions = [
//             'view-products',
//             'adjust-stock',
//             'make-sale',
//             'return-item',
//             'view-sales-history',
//             'view-purchases',
//             'view-alert-dashboard',
//             'mark-alert-read',
//             'open-close-cashbox',
//             'view-reports',
//         ];

//         $employeeRole->givePermissionTo($employeePermissions);
//     }
// }


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Crear roles si no existen
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'employee']);
    }
}
