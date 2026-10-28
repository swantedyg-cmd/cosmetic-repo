import type { Metadata } from "next";
import RoutineFinder from "@/components/RoutineFinder";

export const metadata: Metadata = {
  title: "Find your routine",
  description: "Three questions about your skin, and the formulas to layer, in order.",
};

export default function RoutinePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-36 md:px-10">
      <p className="text-sm text-smoke">Routine finder</p>
      <h1 className="display mt-3 max-w-3xl text-[clamp(2.6rem,5vw,4.25rem)] text-balance">
        Find your routine
      </h1>
      <div className="mt-14">
        <RoutineFinder />
      </div>
    </div>
  );
}
