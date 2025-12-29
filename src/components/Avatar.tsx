import { UserRound } from "lucide-react";
import Link from "next/link";

type Gender = "Male" | "Female";

type AvatarProps = {
  src?: string | null;
  name?: string;
  gender?: Gender | string | null;
  size?: number; // px
  className?: string;

  /** clickable options */
  href?: string;
  onClick?: () => void;
};

export default function Avatar({
  src,
  name = "User",
  gender,
  size = 40,
  className = "",
  href,
  onClick,
}: AvatarProps) {
  const resolvedGender: Gender | null =
    gender === "Male" || gender === "Female" ? gender : null;

  const iconColor =
    resolvedGender === "Male"
      ? "text-blue-500"
      : resolvedGender === "Female"
      ? "text-pink-500"
      : "text-gray-500";

  const avatar = (
    <div
      className={`flex items-center justify-center rounded-full
                  bg-gray-100 dark:bg-gray-800
                  transition
                  ${href || onClick ? "cursor-pointer hover:opacity-90" : ""}
                  ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <UserRound className={`w-5 h-5 ${iconColor}`} />
      )}
    </div>
  );

  return href ? (
    <Link href={href} aria-label={`View profile of ${name}`}>
      {avatar}
    </Link>
  ) : (
    avatar
  );
}
