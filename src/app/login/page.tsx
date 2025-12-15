"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // we’ll manually redirect on success
      callbackUrl: "/",
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    // redirect manually
    window.location.href = res?.url ?? "/";
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border rounded p-6"
      >
        <h1 className="text-xl font-semibold">Login</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm">
          No account yet?{" "}
          <a className="underline" href="/register">
            Register
          </a>
        </p>
      </form>
    </main>
  );
}
