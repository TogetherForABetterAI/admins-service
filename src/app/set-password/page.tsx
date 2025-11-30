"use client";
import { SetPasswordCard } from "@/components/set-password-card";
import { Suspense } from "react";


export default function SetPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <SetPasswordCard />
            </Suspense>
        </div>
    );
}
