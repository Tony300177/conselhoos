export type StatusTone = "confirmed" | "review" | "pending" | "neutral" | "private" | "danger";

export const statusStyles: Record<StatusTone, string> = {
  confirmed: "bg-[#E9F1E9] text-[#285A43] before:bg-[#3A8865]",
  review: "bg-[#F6EEE4] text-[#9B5A3C] before:bg-[#C46C4B]",
  pending: "bg-[#F9F2D8] text-[#83651B] before:bg-[#BA9028]",
  neutral: "bg-[#ECEFEA] text-[#566459] before:bg-[#718072]",
  private: "bg-[#EFEDE9] text-[#6F6A61] before:bg-[#8C877C]",
  danger: "bg-[#FAE8E2] text-[#9B4E36] before:bg-[#C0452E]",
};

export const metricIconTones: Record<"green" | "clay" | "gold" | "sage", string> = {
  green: "bg-[#E6EFE8] text-[#1F5840]",
  clay: "bg-[#F4E6DF] text-[#9B4E36]",
  gold: "bg-[#F3EBD7] text-[#8A6A1D]",
  sage: "bg-[#E9EEE6] text-[#667B61]",
};