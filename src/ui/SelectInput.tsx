import { Dispatch, SetStateAction, useState } from "react";
import chevrondown from "./icons/chevrondown";
import chevronup from "./icons/chevronup";

export type TSelectItem = {
  key: string;
  title: string;
};

type TSelectInput = {
  list: TSelectItem[];
  value: TSelectItem;
  setValue: Dispatch<SetStateAction<TSelectItem>>;
};

export default function SelectInput({ list, value, setValue }: TSelectInput) {
  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false);

  return (
    <ul
      onClick={() => setIsOpenDropdown(!isOpenDropdown)}
      className="flex flex-col gap-2 p-2 w-full dark:bg-neutral-800 outline-none rounded-md transition ease-in-out"
    >
      <li className="flex justify-between items-center text-lg uppercase font-burbankblack px-1 cursor-pointer">
        <span>{value.key === "" ? "Select your course" : value.title}</span>
        <span>{!isOpenDropdown ? chevrondown() : chevronup()}</span>
      </li>
      {isOpenDropdown && (
        <div className="max-h-24 overflow-y-scroll">
          {list.map((item) => (
            <li
              key={item.key}
              className="px-2 py-0.5 hover:bg-white/10 rounded-md transition-all ease-out cursor-pointer"
              onClick={() => setValue(item)}
            >
              {item.title}
            </li>
          ))}
        </div>
      )}
    </ul>
  );
}
