import { cstl_, cstle, cstls } from "./convertStringToList";

export type TModel = {
  key: string;
  value: string[];
};

export function clto(str: string): TModel[] {
  const hexList = cstls(str);

  const result = hexList.map((item) => {
    const equalList = cstle(item);
    const _List = cstl_(equalList[1]);
    return { key: equalList[0], value: _List };
  });
  console.log(result);
  return result;
}
