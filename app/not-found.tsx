import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container-page py-32 text-center">
      <p className="eyebrow text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold">This page isn&apos;t in the drawing set.</h1>
      <Link href="/" className="btn-primary mt-8">Back to home</Link>
    </section>
  );
}
