import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                schedules: {
                    orderBy: { day: "asc" }
                },
                attendances: {
                    orderBy: { date: "desc" },
                    take: 10,
                },
                invoices: {
                    orderBy: { createdAt: "desc" },
                    take: 5,
                }
            }
        })

        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 })
        }

        return NextResponse.json(student)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        const updatedStudent = await prisma.student.update({
            where: { id },
            data: {
                name: body.name,
                jenjang: body.jenjang,
                type: body.type,
                kelas: body.kelas,
                isLongDistance: body.isLongDistance ?? false,
            },
        })

        return NextResponse.json(updatedStudent)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.student.delete({ where: { id } })

        return NextResponse.json({ message: "Student deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
    }
}
