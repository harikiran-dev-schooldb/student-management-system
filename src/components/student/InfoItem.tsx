interface InfoItemProps {
  icon: "blood" | "calendar" | "mail" | "phone";
  value: string;
  large?: boolean;
  className?: string;
}

const InfoItem = ({
  icon,
  value,
  large = false,
  className = "",
}: InfoItemProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={`/${icon}.png`}
        className="w-4 h-4 opacity-70 shrink-0"
        alt=""
      />

      <span
        className={`truncate ${
          large
            ? "text-sm font-semibold text-gray-900 dark:text-gray-100"
            : "text-xs text-gray-600 dark:text-gray-300"
        }`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
};

export default InfoItem;
