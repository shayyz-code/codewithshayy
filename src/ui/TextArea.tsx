type PropsTextArea = {
  labelVal: string;
  labelForVal: string;
  value: string;
  setValue: (val: string) => void;
};

export default function TextArea({
  labelVal,
  labelForVal,
  value,
  setValue,
}: PropsTextArea) {
  return (
    <div className="relative text-md font-burbankmedium mb-5">
      <textarea
        id={labelForVal}
        className="p-2 w-full bg-slate-300 dark:bg-slate-600 outline-none rounded-md rounded-bl-none transition ease-in-out peer focus:rounded-bl-none placeholder-shown:rounded-bl-md resize-none"
        rows={4}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder=" "
        required
      />
      <label
        htmlFor={labelForVal}
        className="absolute text-lg uppercase font-burbankblack rounded-md rounded-t-none tracking-widest duration-300 transform translate-y-32 scale-75 -top-5 left-0 bg-slate-300 dark:bg-slate-600 z-10 origin-[0] px-3 peer-focus:px-3  peer-focus:bg-slate-300 dark:peer-focus:bg-slate-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-12 peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-focus:-top-5 peer-focus:left-0 peer-focus:scale-75 peer-focus:translate-y-32 cursor-text"
      >
        {labelVal}
      </label>
    </div>
  );
}
