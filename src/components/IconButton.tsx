import { LucideIcon } from "lucide-react";

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
}

// Version 1: Primary (Solid Color, Circular)
// Best for: Main actions (e.g., "Add New", "Save")
const IconButton = ({ icon: Icon, className, ...props }: IconButtonProps) => {
  return (
    <button
      className={`flex items-center justify-center p-2 rounded-full bg-LamaBlue text-white hover:opacity-90 transition-opacity ${
        className || ""
      }`}
      {...props}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

// Version 2: Secondary (Outlined, Circular)
// Best for: Secondary actions (e.g., "Filter", "Edit" in a list)
export const IconButton2 = ({
  icon: Icon,
  className,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={`h-8 w-8 rounded-md
                       bg-blue-500 hover:bg-blue-700
                       text-white flex items-center justify-center ${
                         className || ""
                       }`}
      {...props}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

// Version 3: Tertiary (Soft/Ghost, Rounded Square)
// Best for: Dense grids, rows, or less prominent actions (e.g., "View", "Delete")
export const IconButton3 = ({
  icon: Icon,
  className,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={`flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ${
        className || ""
      }`}
      {...props}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

// Version 3: Tertiary (Soft/Ghost, Rounded Square)
// Best for: Dense grids, rows, or less prominent actions (e.g., "View", "Delete")
export const IconButton4 = ({
  icon: Icon,
  className,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={`flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors ${
        className || ""
      }`}
      {...props}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

export default IconButton;
