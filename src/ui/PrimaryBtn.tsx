import Link from "next/link";
import { PropsWithChildren } from "react";

type PropsPrimaryBtn = {
  handleOnClick?: (e?: any) => void;
  href?: string;
  size?: "sm" | "md" | "lg";
  status?: "loading" | "uploaded" | "failed" | "idle" | null;
  type?: "button" | "submit";
};

export default function PrimaryBtn({
  handleOnClick,
  href = "",
  size = "lg",
  status = null,
  type = "button",
  children,
}: PropsWithChildren<PropsPrimaryBtn>) {
  if (href === "") {
    return (
      <button
        className={`bg-primary ${
          size === "lg"
            ? "w-[250px] h-[70px] text-btn-lg"
            : size === "md"
            ? "w-[185px] h-[50px] text-btn-md"
            : "w-[130px] h-[30px] text-btn-sm"
        } font-burbankblack text-black uppercase pt-1 border-4 flex items-center justify-center border-black transition ease-in-out hover:transform hover:scale-110 z-20`}
        onClick={handleOnClick}
        type={type}
      >
        {status === null && children}
        {status === "idle" ? children : status}
      </button>
    );
  } else {
    return (
      <Link href={href}>
        <button
          className={`bg-primary ${
            size === "lg"
              ? "w-[250px] h-[70px] text-btn-lg"
              : size === "md"
              ? "w-[185px] h-[50px] text-btn-md"
              : "w-[130px] h-[30px] text-btn-sm"
          } font-burbankblack text-black uppercase pt-1 border-4 flex items-center justify-center border-black transition ease-in-out hover:transform hover:scale-110 z-20`}
        >
          {children}
        </button>
      </Link>
    );
  }
}
