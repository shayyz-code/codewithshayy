type PropsTextInput = {
  type: "text" | "email";
  labelVal: string;
  labelForVal: string;
  value: string;
  setValue: (val: string) => void;
};

export default function TextInput({
  type,
  labelVal,
  labelForVal,
  value,
  setValue,
}: PropsTextInput) {
  return (
    <div className="relative text-md font-burbankmedium mb-6">
      <input
        type={type}
        id={labelForVal}
        className="p-2 w-full bg-slate-300 dark:bg-neutral-800 outline-none rounded-md rounded-bl-none transition ease-in-out peer focus:rounded-bl-none placeholder-shown:rounded-bl-md"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder=" "
        required
      />
      <label
        htmlFor={labelForVal}
        className="absolute text-lg uppercase font-burbankblack rounded-md rounded-t-none tracking-widest duration-300 transform translate-y-9 scale-75 top-0 left-0 bg-slate-300 dark:bg-neutral-800 z-10 origin-[0] px-3 peer-focus:px-3  peer-focus:bg-slate-300 dark:peer-focus:bg-neutral-800 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-3 peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-focus:top-0 peer-focus:left-0 peer-focus:scale-75 peer-focus:translate-y-9 cursor-text"
      >
        {labelVal}
      </label>
    </div>
  );
}
