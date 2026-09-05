export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/admin-auth";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // Use SSL for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { name, email, phone, city, message, surface } = await req.json();

    if (!name || !email || !message) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const request = await prisma.contactRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        city: city || null,
        surface: surface || null,
        message,
        status: "pending"
      }
    });

    // Send Notification Email to Admin
    try {
      await transporter.sendMail({
        from: `"SPORTSURF Inquiries" <${process.env.SMTP_USER}>`,
        to: `${process.env.SMTP_USER}, web.thirdeye@gmail.com`, // Send to Admin
        subject: `New Lead: ${name} is interested in ${surface || "Sports Turf"}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">New Lead Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "N/A"}</p>
            <p><strong>City:</strong> ${city || "N/A"}</p>
            <p><strong>Interest:</strong> ${surface || "N/A"}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f3f4f6; padding: 10px; border-left: 4px solid #6366f1;">${message}</blockquote>
          </div>
        `
      });

      // Send Autoreply to Client
      await transporter.sendMail({
        from: `"SPORTSURF" <${process.env.SMTP_USER}>`,
        to: email, // Send to User
        subject: "We've received your inquiry!",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">Thank you for contacting SPORTSURF</h2>
            <p>Hello ${name},</p>
            <p>We've received your request regarding <strong>${surface || "Sports Infrastructure"}</strong> and will get back to you shortly.</p>
            <p>Best Regards,<br />Team SPORTSURF</p>
          </div>
        `
      });
    } catch (mailErr: any) {
      console.error("📩 Mail Sending Failed:", mailErr.message);
    }

    return NextResponse.json({ success: true, id: request.id });
  } catch (err: any) {
    return new NextResponse(err.message || "Something went wrong", { status: 500 });
  }
}

export async function GET() {
  try {
    const submissions = await prisma.contactRequest.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(submissions);
  } catch (err: any) {
    return new NextResponse(err.message || "Error fetching", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await req.json();
    const allowedStatuses = ["pending", "approved", "completed", "rejected"];

    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "A valid request ID and status are required" }, { status: 400 });
    }

    const request = await prisma.contactRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(request);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unable to update request" }, { status: 500 });
  }
}

