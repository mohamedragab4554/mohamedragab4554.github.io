import Link from "next/link";
import { profile } from "@/content/profile";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0A1220] text-white/60">
      <div className="container-page flex flex-col gap-3 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {profile.name}. Every figure comes from my own project files. Each case study lists its sources.</p>
        <div className="flex gap-4">
          <Link className="hover:text-white" href="/about/">About</Link>
          <a className="hover:text-white" href={`mailto:${profile.email}`}>Email</a>
          <a className="hover:text-white" href={profile.linkedin} rel="noopener noreferrer" target="_blank">LinkedIn</a>
          <a className="hover:text-white" href={profile.cvHref} download>CV</a>
        </div>
      </div>
    </footer>
  );
}
