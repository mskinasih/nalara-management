import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const student = await prisma.student.create({
            data: {
                name: body.name,
                jenjang: body.jenjang,
                type: body.type,
                kelas: body.kelas,
                isLongDistance: body.isLongDistance ?? false,
            },
        })

        return NextResponse.json(student, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
    }
}

export async function GET() {
    const students = await prisma.student.findMany({
        orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(students)
}
