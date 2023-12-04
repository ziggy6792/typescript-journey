import Link from "next/link";

import { getServerAuthSession } from "./server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <>
      <h1>Nextjs App Router</h1>

      <span>Logged in as {JSON.stringify(session)}</span>

      <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
        {session ? "Sign out" : "Sign in"}
      </Link>
    </>
  );
}
