import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const pricing = await prisma.pricing.findMany({
        orderBy: [{ jenjang: "asc" }, { type: "asc" }]
    })

    return NextResponse.json(pricing)
}
