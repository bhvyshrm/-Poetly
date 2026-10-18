interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
}

export default function AdminTable({ headers, children }: AdminTableProps) {
  return (
    <div className="overflow-x-auto glass-surface rounded-2xl border border-border-subtle/40 specular-top-border">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle/30 bg-surface-secondary/40">
            {headers.map((h) => (
              <th
                key={h}
                className="py-3 px-4 text-[10px] font-mono font-medium text-text-tertiary tracking-widest uppercase first:pl-5 last:pr-5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle/20">{children}</tbody>
      </table>
    </div>
  );
}

interface AdminTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function AdminTableRow({ children, onClick }: AdminTableRowProps) {
  return (
    <tr
      className={`transition-colors ${onClick ? "cursor-pointer hover:bg-surface-secondary/60" : "hover:bg-surface-secondary/30"}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function AdminTableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-3.5 px-4 text-xs sm:text-sm text-text-secondary first:pl-5 last:pr-5 font-sans ${className}`}>{children}</td>;
}
