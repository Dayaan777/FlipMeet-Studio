const BADGES = [
  { title: "LIMITED DROP", subtitle: "100 pieces per look" },
  { title: "PREMIUM QUALITY", subtitle: "Handpicked fabrics" },
  { title: "SECURE PAYMENTS", subtitle: "100% safe & secure" },
  { title: "WORLDWIDE SHIPPING", subtitle: "Fast & reliable" },
];

export default function TrustBadges() {
  return (
    <section className="py-14 px-6 border-b border-base-border">
      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8">
        {BADGES.map((b) => (
          <div key={b.title} className="text-center md:text-left">
            <p className="text-text-primary text-sm tracking-wide">{b.title}</p>
            <p className="text-text-secondary text-xs mt-1">{b.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
