import PrimaryBtn from "@/ui/PrimaryBtn";
import Image from "next/image";

type PropsCard = {
  cImg?: "Yellow" | "Red" | "Blue";
  displayText: string;
  href: string;
};

export default function Card({
  cImg = "Yellow",
  displayText,
  href,
}: PropsCard) {
  const handleOnClick = () => {};
  return (
    <div className="flex items-center group relative h-[309px]">
      <div className="absolute top-[14.5px] left-0 transition-all duration-300 ease-in-out w-[175px] h-[280px] group-hover:h-[309px] group-hover:top-0 bg-black group-hover:shadow-3xl scale-105 -z-10"></div>
      <div
        className={`relative transition-all duration-300 ease-out pb-0.5 flex flex-col justify-end items-center w-[175px] h-[280px] hover:h-[315px] bg-gradient-to-b cursor-pointer overflow-hidden`}
      >
        <Image
          src={`/card${cImg}.jpeg`}
          alt="picture of mode"
          fill
          style={{ objectFit: "cover" }}
        />
        <div className="absolute -top-5">
          <div className="transform translate-y-8 transition group-hover:delay-700 ease-in-out w-[130px] text-3xl font-burbankblack uppercase text-black text-center z-10">
            {displayText}
          </div>
          <div className="transfrom translate-y-44 invisible group-hover:visible z-20 transition group-hover:delay-700 ease-in-out">
            <PrimaryBtn handleOnClick={handleOnClick} size="sm" href={href}>
              select
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
