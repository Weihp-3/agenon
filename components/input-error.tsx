export function InputError({ messages }: { messages?: string | string[] | null }) {
  if (!messages) return null;

  const list = Array.isArray(messages) ? messages : [messages];
  if (list.length === 0) return null;

  return (
    <ul className="space-y-1 text-sm text-status-danger-ink">
      {list.map((message, index) => (
        <li key={index}>{message}</li>
      ))}
    </ul>
  );
}
