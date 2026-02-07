import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Hello Forum (V0)</h1>
      <p>PR2 auth wiring is in progress.</p>
      <p>
        <Link href="/hello-forum">Hello Forum</Link> | <Link href="/auth/login">Login</Link> |{" "}
        <Link href="/auth/signup">Sign up</Link> | <Link href="/protected">Protected</Link> |{" "}
        <Link href="/forum">Forum</Link> | <Link href="/newsletter">Newsletter</Link>
      </p>
    </main>
  );
}
