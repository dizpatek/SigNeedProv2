
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { encrypt } from "@/src/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        const admin = await prisma.adminSettings.findUnique({
            where: { username: username || "admin" }
        });

        if (!admin) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, admin.password);

        if (!isValid) {
            return NextResponse.json({ error: "Hatalı şifre" }, { status: 401 });
        }

        // Login başarılı, token oluştur
        const session = await encrypt({ user: "admin", expires: new Date(Date.now() + 24 * 60 * 60 * 1000) });

        const response = NextResponse.json({ success: true });

        response.cookies.set("session", session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}
