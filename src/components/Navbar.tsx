import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="relative bg-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">
          <Link href="/" className="font-semibold">
            SBOM Browser
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 text-sm">
          {!user ? (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-gray-300">{user.email}</span>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white hover:cursor-pointer"
                >
                  Logout
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
