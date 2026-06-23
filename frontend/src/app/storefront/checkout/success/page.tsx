"use client";

import Link from "next/link";

export default function OrderSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-10">
            <h1 className="text-4xl font-bold text-green-600 mb-4">ස්තුතියි!</h1>
            <p className="text-lg text-gray-700 mb-8">ඔබේ ඇණවුම සාර්ථකව ලැබුණා.</p>
            <Link href="/" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
                තව තවත් සාප්පු සවාරි යන්න
            </Link>
        </div>
    );
}