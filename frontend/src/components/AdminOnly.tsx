"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminOnly({ children }: { children: ReactNode }) {
    const { isAdmin, isLoading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !isLoading && !isAdmin) {
            router.push("/");
        }
    }, [isClient, isLoading, isAdmin, router]);

    if (!isClient || isLoading) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="p-10 text-center text-red-600">
                <p>Access denied. Admin only.</p>
            </div>
        );
    }

    return <>{children}</>;
}
