import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-[#F0AE55] hover:bg-[#F3BC72] text-[#0D0E10] font-medium shadow-[0_0_14px_-2px_rgba(240,174,85,0.36)] hover:shadow-[0_0_20px_rgba(240,174,85,0.5)] active:scale-98 transition-all",
  destructive:
    "bg-[#1B1D21] border border-[#C77A82]/30 text-[#C77A82] hover:bg-[#C77A82]/15 shadow-[0_0_12px_rgba(199,122,130,0.12)] transition-all",
  outline:
    "border border-[#282A2F] bg-transparent hover:bg-[#1B1D21] hover:border-[#32343A] text-[#E8E8E8] transition-colors",
  secondary:
    "bg-[#1B1D21] hover:bg-[#222327] border border-[#282A2F] text-[#E8E8E8] transition-colors",
  ghost:
    "hover:bg-[#1B1D21] text-[#9A9DA5] hover:text-[#E8E8E8] transition-colors",
  link: "text-[#F0AE55] underline-offset-4 hover:underline hover:text-[#F3BC72]",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 py-2 rounded-[14px]",
  sm: "h-8 rounded-[10px] px-3 text-xs font-medium",
  lg: "h-11 rounded-[16px] px-8 text-base font-medium",
  icon: "h-9 w-9 rounded-[12px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F0AE55]/40 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
