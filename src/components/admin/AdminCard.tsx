interface AdminCardProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

export default function AdminCard({ label, value, sub, className = "" }: AdminCardProps) {
  return (
    <div className={`glass-surface rounded-2xl p-5 border border-border-subtle/40 hover:border-primary/30 transition-all duration-200 specular-top-border ${className}`}>
      <p className="text-[10px] font-mono font-medium text-primary tracking-widest uppercase mb-1.5">{label}</p>
      <p className="font-display text-3xl font-light text-text-primary tracking-tight">{value}</p>
      {sub && <p className="text-xs text-text-tertiary mt-1 font-sans">{sub}</p>}
    </div>
  );
}
