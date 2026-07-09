import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"
import { NextResponse } from "next/server"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { date, status, notes } = body

        if (status && !Object.values(AttendanceStatus).includes(status as AttendanceStatus)) {
            return NextResponse.json(
                { error: `status must be one of: ${Object.values(AttendanceStatus).join(", ")}` },
                { status: 400 }
            )
        }

        const attendance = await prisma.attendance.update({
            where: { id },
            data: {
                ...(date ? { date: new Date(date) } : {}),
                ...(status ? { status } : {}),
                ...(notes !== undefined ? { notes } : {}),
            },
            include: {
                student: { select: { id: true, name: true, kelas: true } }
            }
        })

        return NextResponse.json(attendance)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.attendance.delete({ where: { id } })
        return NextResponse.json({ message: "Attendance deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 })
    }
}
