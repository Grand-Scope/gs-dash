import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Registration attempt for:", body.email, body.username);
    
    const { name, username, email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        console.warn("Registration failed: Email already exists", email);
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }
      console.warn("Registration failed: Username already exists", username);
      return NextResponse.json(
        { error: "User with this username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    console.log("User registered successfully:", user.id);
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error details:", error);
    
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues[0].message;
      console.warn("Registration validation failed:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Log the full error object for debugging in production
    console.error("Unexpected registration error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

    return NextResponse.json(
      { error: "Registration failed. Please check server logs for details." },
      { status: 500 }
    );
  }
}
