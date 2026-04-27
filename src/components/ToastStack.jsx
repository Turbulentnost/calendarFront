export function ToastStack({ items }) {
  return (
    <div className="tt-toast-stack">
      {items.map((item) => (
        <div
          key={item.id}
          className={`tt-toast tt-toast--${item.type || "info"}`}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}
