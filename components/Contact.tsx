import { profile } from "@/content/profile";
import CopyButton from "@/components/CopyButton";

export default function Contact() {
  return (
    <section id="contact" className="blueprint scroll-mt-16 text-white" aria-labelledby="contact-title">
      <div className="container-page grid gap-10 py-20 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow text-accent-onDark">Contact</p>
          <h2 id="contact-title" className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-tight">
            Building something for the built environment? I would like to hear about it.
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Roles I am open to">
            {profile.roles.map((r) => (
              <li key={r} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-white/75">{r}</li>
            ))}
          </ul>
          <p className="mt-4 max-w-xl text-white/70">
            I am open to roles in AI and computer vision, digital construction and BIM, and technology consulting. Email, phone or LinkedIn all reach me directly.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-4">
            <a href={`mailto:${profile.email}`} className="min-w-0 overflow-hidden hover:text-accent-onDark">
              <span className="block font-mono text-[11px] uppercase tracking-wider text-white/60">Email</span>
              <span className="mt-0.5 block select-all whitespace-nowrap text-[15px] font-medium sm:text-[17px]">{profile.email}</span>
            </a>
            <CopyButton text={profile.email} />
          </div>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] px-5 py-4 hover:bg-white/[0.08]">
            <span>
              <span className="block font-mono text-[11px] uppercase tracking-wider text-white/60">LinkedIn</span>
              <span className="mt-0.5 block whitespace-nowrap text-[13px] sm:text-[15px]">{profile.linkedinLabel}</span>
            </span>
            <span aria-hidden className="text-accent-onDark transition-transform group-hover:translate-x-1">↗</span>
          </a>
          {profile.phones.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.phones.map((ph) => (
                <a key={ph.tel} href={`tel:${ph.tel}`} className="group flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.04] px-5 py-4 hover:bg-white/[0.08]">
                  <span>
                    <span className="block font-mono text-[11px] uppercase tracking-wider text-white/60">Phone · {ph.label}</span>
                    <span className="mt-0.5 block whitespace-nowrap text-[15px]">{ph.display}</span>
                  </span>
                  <span aria-hidden className="text-accent-onDark transition-transform group-hover:translate-x-1">↗</span>
                </a>
              ))}
            </div>
          ) : null}
          <div className="flex items-center justify-between px-1 pt-1 text-sm text-white/60">
            <span>{profile.location}</span>
            <a href={profile.cvHref} download className="text-accent-onDark hover:underline">Download CV (PDF)</a>
          </div>
        </div>
      </div>
    </section>
  );
}
