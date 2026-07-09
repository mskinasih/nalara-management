import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    if (!year) {
        return NextResponse.json(
            { error: "year query parameter is required" },
            { status: 400 }
        )
    }

    const y = parseInt(year)
    const m = month ? parseInt(month) : null

    // Build invoice filter
    const where = {
        status: "paid" as const,
        year: y,
        ...(m ? { month: m } : {}),
    }

    // Aggregate paid invoices
    const paidAgg = await prisma.invoice.aggregate({
        where,
        _sum: { total: true },
        _count: { id: true },
    })

    const unpaidAgg = await prisma.invoice.aggregate({
        where: {
            status: "unpaid" as const,
            year: y,
            ...(m ? { month: m } : {}),
        },
        _sum: { total: true },
        _count: { id: true },
    })

    // Monthly breakdown (only if querying by year without specific month)
    let breakdown: { month: number; year: number; totalPaid: number; count: number }[] = []
    if (!m) {
        const monthlyData = await prisma.invoice.groupBy({
            by: ["month", "year"],
            where: { status: "paid", year: y },
            _sum: { total: true },
            _count: { id: true },
            orderBy: { month: "asc" },
        })

        breakdown = monthlyData.map((d) => ({
            month: d.month,
            year: d.year,
            totalPaid: d._sum.total ?? 0,
            count: d._count.id,
        }))
    }

    return NextResponse.json({
        totalPaid: paidAgg._sum.total ?? 0,
        paidCount: paidAgg._count.id,
        totalUnpaid: unpaidAgg._sum.total ?? 0,
        unpaidCount: unpaidAgg._count.id,
        ...(breakdown.length > 0 ? { breakdown } : {}),
    })
}
