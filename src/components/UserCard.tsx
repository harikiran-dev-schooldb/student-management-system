import Image from "next/image";

interface UserCardProps {
  type: "admin" | "teacher" | "student";
  count: number;
}

const UserCard = ({ type, count }: UserCardProps) => {
  return (
    <div className="rounded-2xl p-4 flex-1 min-w-[130px] 
                    odd:bg-LamaPurple even:bg-LamaYellow 
                    text-black">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] px-2 py-1 rounded-full bg-white text-green-600 font-semibold">
          2024/25
        </span>
        <Image src="/more.png" alt="More" width={20} height={20} />
      </div>

      {/* Count */}
      <h1 className="my-4 text-2xl font-semibold">{count}</h1>

      {/* Label */}
      <h2 className="text-sm font-medium capitalize">{type}s</h2>
    </div>
  );
};

export default UserCard;
