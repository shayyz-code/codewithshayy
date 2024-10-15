export function cstlc(text: string): string[] {
  // Comma ", "
  return text.split(", ");
}

export function cstlf(text: string): string[] {
  // FullStop ". "
  return text.split(". ");
}

export function cstls(text: string): string[] {
  // Hex "#"
  return text.split("#");
}

export function cstl_(text: string): string[] {
  // Underscore "_"
  return text.split("_");
}

export function cstle(text: string): string[] {
  // Equal "="
  return text.split("=");
}
