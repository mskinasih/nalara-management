import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await req.json()

        if (!body.status || !["paid", "unpaid"].includes(body.status)) {
            return NextResponse.json(
                { error: "status must be 'paid' or 'unpaid'" },
                { status: 400 }
            )
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: { status: body.status },
            include: {
                student: { select: { id: true, name: true, kelas: true } }
            }
        })

        return NextResponse.json(invoice)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to update invoice status" }, { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.invoice.delete({ where: { id } })
        return NextResponse.json({ message: "Invoice deleted successfully" })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
    }
}
