import React from "react";
import { Head, router, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbItem } from "@/types";
import { route } from 'ziggy-js';

import { DataTable } from "@/components/users/DataTable";
import { CreateDialog } from "@/components/users/CreateDialog";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Usuarios del Sistema",
        href: route('market.users.index'),
    },
];

import type { User, User as UserType } from "@/types"
import { dashboard } from "@/routes";

type Props = {
    users: UserType[]
    roles: string[]
}

export default function UsersPage({ users, roles }: Props) {
    const { auth } = usePage<{ auth: User }>().props;

    // Lógica robusta con tipos TypeScript correctos
    const isAdmin = ((): boolean => {
        if (!auth?.roles) return false;

        if (Array.isArray(auth.roles)) {
            return auth.roles.some((r: unknown) => {
                // Caso 1: r es string
                if (typeof r === 'string') {
                    return r === 'admin';
                }
                // Caso 2: r es objeto con propiedad name
                if (typeof r === 'object' && r !== null) {
                    const roleObj = r as { name?: string };
                    return roleObj.name === 'admin';
                }
                return false;
            });
        }

        // Caso 3: roles es string directo
        return auth.roles === 'admin';
    })();

    if (!isAdmin) {
        router.get(dashboard());
        return null;
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios del Sistema" />
            <div className="container mx-auto py-10">
                <Card className="max-w-7xl mx-auto">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-2xl font-semibold">Usuarios del Sistema</CardTitle>
                            <CardDescription>Gestiona los usuarios y sus roles en el sistema.</CardDescription>
                        </div>
                        <CreateDialog roles={roles} />
                    </CardHeader>
                    <CardContent>
                        <DataTable data={users} roles={roles} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}