import { useState } from "react";

type PropsCheckbox = {
  labelVal: string;
  labelForVal: string;
  value: string[];
  setValue: (val: string[]) => void;
};

export default function Checkbox({
  labelVal,
  labelForVal,
  value,
  setValue,
}: PropsCheckbox) {
  const [checked, setChecked] = useState<boolean>(false);
  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;

    if (checked) {
      if (value.includes(selectedValue)) {
        setValue(value.filter((item) => item !== selectedValue));
      }
      setChecked(false);
    } else if (!checked) {
      if (!value.includes(selectedValue)) {
        setValue([selectedValue, ...value]);
      }
      setChecked(true);
    }
  };
  return (
    <div className="relative flex items-start py-4 ml-2">
      <input
        id={labelForVal}
        type="checkbox"
        className="hidden peer"
        name="preferred_activities[]"
        value={labelVal}
        checked={checked}
        onChange={handleOnChange}
      />
      <label
        htmlFor={labelForVal}
        className="inline-flex items-center justify-between w-auto py-1 px-2 font-burbankblack tracking-wider border-2 border-solid rounded-md cursor-pointer border-transparent bg-slate-300 dark:bg-slate-600 peer-checked:border-indigo-500"
      >
        <div className="flex items-center justify-center w-full">
          <div className="text-lg tracking-widest">{labelVal}</div>
        </div>
      </label>
    </div>
  );
}
