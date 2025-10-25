<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $this->call([

            PermissionSeeder::class,
        ]);

        // Crear usuarios con roles
        $adminUser = User::firstOrCreate(
            ['email' => 'jose@example.com'],
            [
                'name' => 'jose antonio',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $adminUser->assignRole('admin');

        $employeeUser = User::firstOrCreate(
            ['email' => 'alberto@example.com'],
            [
                'name' => 'alberto gonzalez',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $employeeUser->assignRole('employee');
    }
}
