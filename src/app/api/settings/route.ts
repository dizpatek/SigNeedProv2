
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getSession } from "@/src/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const settings = await prisma.adminSettings.findFirst();
    return NextResponse.json({
        clientWelcomeMessage: settings?.clientWelcomeMessage || "",
        // Şifreyi asla dönme
    });
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { password, clientWelcomeMessage } = body;

        const data: any = { clientWelcomeMessage };

        if (password && password.length > 0) {
            data.password = await bcrypt.hash(password, 10);
        }

        // İlk kaydı güncelle veya oluştur
        const first = await prisma.adminSettings.findFirst();

        let settings;
        if (first) {
            settings = await prisma.adminSettings.update({
                where: { id: first.id },
                data,
            });
        } else {
            // Eğer yoksa (nadiren olur seed çalışmadıysa)
            if (!data.password) data.password = await bcrypt.hash("superpassword", 10); // fallback
            settings = await prisma.adminSettings.create({
                data: {
                    username: "admin",
                    ...data
                }
            });
        }

        return NextResponse.json({ success: true, settings });

    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: "Güncelleme başarısız" }, { status: 500 });
    }
}
