import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/prisma/client"
import { Prisma } from "@prisma/client"
import dayjs from "dayjs"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/app/api/auth/[...nextauth]/route"

import { createInvitationSchema } from "./schema"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findUnique({
    where: { email: session!.user!.email! },
  })

  const createdBy = user!.id

  const body = await request.json()

  const validation = createInvitationSchema.safeParse(body)

  if (!validation.success)
    return NextResponse.json(validation.error.errors, { status: 400 })

  const { email, role } = body

  const validThrough = dayjs().add(15, "day").format()

  try {
    const newInvitation = await prisma.invitation.create({
      data: { email, createdBy, validThrough, role },
    })

    return NextResponse.json(newInvitation, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(err.message)

      if (err.code === "P2002") {
        return NextResponse.json(
          { message: "An invitation with this email already exist" },
          { status: 409 }
        )
      }
    }
    throw err
  }
}
