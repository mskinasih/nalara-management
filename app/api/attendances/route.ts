import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    // Build date range filter if month/year provided
    let dateFilter: { gte?: Date; lte?: Date } | undefined = undefined
    if (month && year) {
        const m = parseInt(month)
        const y = parseInt(year)
        const start = new Date(y, m - 1, 1)
        const end = new Date(y, m, 0, 23, 59, 59)
        dateFilter = { gte: start, lte: end }
    } else if (year) {
        const y = parseInt(year)
        dateFilter = { gte: new Date(y, 0, 1), lte: new Date(y, 11, 31, 23, 59, 59) }
    }

    const attendances = await prisma.attendance.findMany({
        where: {
            ...(studentId ? { studentId } : {}),
            ...(dateFilter ? { date: dateFilter } : {}),
        },
        include: {
            student: { select: { id: true, name: true, kelas: true } }
        },
        orderBy: { date: "desc" }
    })

    return NextResponse.json(attendances)
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { studentId, date, status, notes } = body

        if (!studentId || !date || !status) {
            return NextResponse.json(
                { error: "studentId, date, and status are required" },
                { status: 400 }
            )
        }

        // Validate status enum
        if (!Object.values(AttendanceStatus).includes(status as AttendanceStatus)) {
            return NextResponse.json(
                { error: `status must be one of: ${Object.values(AttendanceStatus).join(", ")}` },
                { status: 400 }
            )
        }

        const student = await prisma.student.findUnique({ where: { id: studentId } })
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 })
        }

        const attendance = await prisma.attendance.create({
            data: {
                studentId,
                date: new Date(date),
                status,
                notes: notes ?? null,
            },
            include: {
                student: { select: { id: true, name: true, kelas: true } }
            }
        })

        return NextResponse.json(attendance, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 })
    }
}
