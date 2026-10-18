export default function Logo({ size = "base", animated = false }) {
  const sizeMap = {
    sm: {
      text: "text-base",
      mark: "w-[1.95em] h-[1.3em]",
      circle: "w-[1.3em] h-[1.3em]",
      border: "border-[0.16em]",
    },
    base: {
      text: "text-lg",
      mark: "w-[1.95em] h-[1.3em]",
      circle: "w-[1.3em] h-[1.3em]",
      border: "border-[0.16em]",
    },
    lg: {
      text: "text-2xl",
      mark: "w-[1.95em] h-[1.3em]",
      circle: "w-[1.3em] h-[1.3em]",
      border: "border-[0.16em]",
    },
    xl: {
      text: "text-[2.5rem]",
      mark: "w-[1.95em] h-[1.3em]",
      circle: "w-[1.3em] h-[1.3em]",
      border: "border-[0.16em]",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.base;

  return (
    <div className={`inline-flex items-center gap-[0.6em] font-bold tracking-tight text-[#10201f] leading-none ${currentSize.text}`}>
      <span className={`relative flex-none ${currentSize.mark}`} aria-hidden="true">
        <span
          className={`absolute left-0 top-0 bottom-0 ${currentSize.circle} rounded-full ${currentSize.border} border-teal-700 ${
            animated ? "animate-ring-left" : ""
          }`}
        ></span>
        <span
          className={`absolute right-0 top-0 bottom-0 ${currentSize.circle} rounded-full ${currentSize.border} border-[#10201f] ${
            animated ? "animate-ring-right" : ""
          }`}
        ></span>
      </span>
      <span>We Are Duo</span>
    </div>
  );
}
