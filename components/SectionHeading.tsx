export default function SectionHeading({
  index, label, title, intro, dark = false, id,
}: { index?: string; label: string; title: string; intro?: string; dark?: boolean; id?: string }) {
  return (
    <div className="mb-10 max-w-3xl" id={id}>
      <p className={`eyebrow ${dark ? "text-accent-onDark" : "text-accent"}`}>
        {index ? <span className="mr-2 opacity-70">{index}</span> : null}
        {label}
      </p>
      <div className={`dimline mt-3 w-24 ${dark ? "text-white" : "text-ink"}`} aria-hidden />
      <h2 className={`mt-5 text-3xl font-semibold tracking-tight sm:text-[2.35rem] sm:leading-[1.15] ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
      {intro ? <p className={`mt-4 text-[17px] leading-relaxed ${dark ? "text-white/70" : "text-ink-soft"}`}>{intro}</p> : null}
    </div>
  );
}
