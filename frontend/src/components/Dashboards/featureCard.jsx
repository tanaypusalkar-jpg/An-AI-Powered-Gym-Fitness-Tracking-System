export default function FeatureCard({ icon, label, bg, iconBg, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-3 rounded-2xl p-4 text-left transition hover:brightness-95 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
      style={{ backgroundColor: bg }}
    >
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: iconBg }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
    </button>
  );
}