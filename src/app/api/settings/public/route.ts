
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const settings = await prisma.adminSettings.findFirst();
        return NextResponse.json({
            clientWelcomeMessage: settings?.clientWelcomeMessage || "Lütfen imzalamak veya görüntülemek istediğiniz belgeyi seçiniz."
        });
    } catch {
        // Fallback
        return NextResponse.json({
            clientWelcomeMessage: "Lütfen imzalamak veya görüntülemek istediğiniz belgeyi seçiniz."
        });
    }
}
