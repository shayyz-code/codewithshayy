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
    <div className="flex items-center group relative h-[309px] hover:shadow-3xl">
      <div
        className={`relative transition-all duration-300 ease-out pb-0.5 flex flex-col justify-end items-center w-[155px] h-[280px] hover:h-[315px] bg-gradient-to-b cursor-pointer overflow-hidden`}
      >
        <Image
          src={`/card${cImg}.jpeg`}
          alt="picture of mode"
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="border-4 border-black"
        />
        <div className="absolute -top-5">
          <div className="transform translate-y-8 transition group-hover:delay-700 ease-in-out w-[130px] text-2xl font-burbankblack uppercase text-black text-center z-10">
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
