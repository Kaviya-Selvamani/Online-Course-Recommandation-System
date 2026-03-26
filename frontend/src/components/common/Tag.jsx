export default function Tag({ children }) {
  return (
    <span className="rounded-full border border-slate-700/60 bg-slate-800/50 px-3 py-1 text-xs font-semibold text-slate-200">
      {children}
    </span>
  );
}
