import { signIn, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "./login.css";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const error = params.error;
  const registered = params.registered;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Image
            src="/Brand/logo-dark.png"
            alt="GrandScope Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <span className="login-logo-text">GrandScope</span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">
          Sign in to manage your projects and collaborate with your team
        </p>

        {registered && (
          <div className="login-success" style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius)',
            fontSize: '0.875rem',
            marginBottom: 'var(--space-4)',
            textAlign: 'center'
          }}>
            Account created successfully! Please sign in.
          </div>
        )}

        {error && (
          <div className="login-error">
            {error === "CredentialsSignin"
              ? "Invalid email or password."
              : "An error occurred during sign in. Please try again."}
          </div>
        )}

        <form
          action={async (formData) => {
            "use server";
            try {
              await signIn("credentials", formData);
            } catch (error) {
              if (error instanceof AuthError) {
                redirect(`/login?error=${error.type}`);
              }
              throw error;
            }
          }}
          className="login-form"
        >
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
