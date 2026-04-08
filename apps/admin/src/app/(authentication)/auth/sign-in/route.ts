import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { loginFormSchema } from "@/app/(authentication)/login/_components/schema";
import validateFormData from "@/helpers/validateFormData";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const { errors } = validateFormData(loginFormSchema, {
    email,
    password,
  });

  if (errors) {
    return NextResponse.json({ errors }, { status: 401 });
  }

  const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

  try {
    const response = await fetch(`${backendUrl}/api/v1/auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          errors: {
            password: "Server error. Please try again.",
          },
        },
        { status: 500 }
      );
    }

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          errors: {
            password: data.error?.message || data.error || "Invalid credentials",
          },
        },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, data.data.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, token: data.data.token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        errors: {
          password: "An error occurred during login",
        },
      },
      { status: 500 }
    );
  }
}
