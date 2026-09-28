export default function SectionHeading({
  index, label, title, intro, dark = false, id, as = "h2",
}: { index?: string; label: string; title: string; intro?: string; dark?: boolean; id?: string; as?: "h1" | "h2" }) {
  const H = as;
  return (
    <div className="mb-10 max-w-3xl" id={id}>
      <p className="eyebrow flex items-center gap-2.5 text-accent">
        <span className="pulse-dot" aria-hidden />
        {index ? <span className="opacity-70">{index}</span> : null}
        {label}
      </p>
      <div className="glow-line mt-3 w-28" aria-hidden />
      <H className={`mt-5 text-3xl font-semibold tracking-tight sm:text-[2.35rem] sm:leading-[1.15] ${dark ? "text-white" : "text-ink"}`}>{title}</H>
      {intro ? <p className={`mt-4 text-[17px] leading-relaxed ${dark ? "text-white/70" : "text-ink-soft"}`}>{intro}</p> : null}
    </div>
  );
}
