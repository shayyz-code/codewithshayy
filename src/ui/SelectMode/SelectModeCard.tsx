import PrimaryBtn from "@/ui/PrimaryBtn";
import Image from "next/image";

type PropsSelectModeCard = {
  imgSrc: string;
  displayText: string;
  href: string;
  bgGradient: "Purple" | "Blue";
};

export default function SelectModeCard({
  imgSrc,
  displayText,
  href,
  bgGradient = "Purple",
}: PropsSelectModeCard) {
  const handleOnClick = () => {};
  return (
    <div className="group relative">
      <div className="absolute top-0 left-0 transition-all duration-300 ease-in-out w-[175px] h-[250px] group-hover:h-[309px] group-hover:top-1 bg-selectModeBorder group-hover:bg-white group-hover:shadow-2xl scale-105 -z-10"></div>
      <div className="absolute top-8 left-0 transition-all duration-700 ease-in-out w-[175px] h-[250px] border-2 border-solid border-selectModeBorder bg-selectModeBorder group-hover:shadow-2xl -scale-50 group-hover:scale-x-[120%] group-hover:scale-y-[145%] -z-10"></div>
      <div
        className={`relative transition-all duration-300 ease-out pb-0.5 flex flex-col justify-end items-center w-[175px] h-[250px] hover:h-[315px] bg-gradient-to-b ${
          bgGradient === "Purple"
            ? "from-selectMode1BgFrom to-selectMode1BgTo"
            : "from-selectMode2BgFrom to-selectMode2BgTo"
        } cursor-pointer overflow-hidden`}
      >
        <Image
          src={imgSrc}
          alt="picture of mode"
          fill
          style={{ objectFit: "cover" }}
        />

        <div className="transform translate-y-8 group-hover:translate-y-0 transition group-hover:delay-700 ease-in-out w-[130px] text-3xl font-burbankblack uppercase text-white text-center z-10">
          {displayText}
        </div>
        <div className="transfrom translate-y-10 group-hover:-translate-y-1 invisible group-hover:visible z-20 transition group-hover:delay-700 ease-in-out">
          <PrimaryBtn handleOnClick={handleOnClick} size="sm" href={href}>
            select
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}
