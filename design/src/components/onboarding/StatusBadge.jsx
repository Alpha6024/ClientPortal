const STATUS_STYLES = {
  draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-500" },
  sent:      { label: "Sent",      cls: "bg-blue-50 text-blue-500" },
  viewed:    { label: "Viewed",    cls: "bg-purple-50 text-purple-500" },
  signed:    { label: "Signed",    cls: "bg-green-50 text-green-600" },
  completed: { label: "Completed", cls: "bg-teal-50 text-teal-600" },
  pending:   { label: "Pending",   cls: "bg-yellow-50 text-yellow-600" },
  paid:      { label: "Paid",      cls: "bg-green-50 text-green-600" },
  overdue:   { label: "Overdue",   cls: "bg-red-50 text-red-500" },
};

export default function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { label: status, cls: "bg-gray-100 text-gray-500" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}
