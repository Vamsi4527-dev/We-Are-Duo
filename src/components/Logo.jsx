export default function Logo({
  size = "base",
  animated = false,
}) {
  const sizeMap = {
    sm: {
      text: "text-base",
      mark: "w-7 h-5",
      circle: "w-5 h-5",
      border: "border-[2px]",
    },

    base: {
      text: "text-lg",
      mark: "w-8 h-6",
      circle: "w-6 h-6",
      border: "border-[2.5px]",
    },

    lg: {
      text: "text-2xl",
      mark: "w-10 h-8",
      circle: "w-8 h-8",
      border: "border-[3px]",
    },

    xl: {
      text: "text-4xl",
      mark: "w-14 h-10",
      circle: "w-10 h-10",
      border: "border-[4px]",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.base;

  return (
    <div
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-[#10201f] dark:text-white leading-none ${currentSize.text}`}
    >
      <span
        className={`relative flex-none ${currentSize.mark}`}
        aria-hidden="true"
      >
        <span
          className={`absolute left-0 top-0 ${currentSize.circle} rounded-full ${currentSize.border} border-teal-700 dark:border-teal-500 ${
            animated ? "animate-ring-left" : ""
          }`}
        />

        <span
          className={`absolute right-0 top-0 ${currentSize.circle} rounded-full ${currentSize.border} border-[#10201f] dark:border-white ${
            animated ? "animate-ring-right" : ""
          }`}
        />
      </span>

      <span>We Are Duo</span>
    </div>
  );
}