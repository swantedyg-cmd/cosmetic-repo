import Link from "next/link";
import LayerStack from "./LayerStack";
import Reveal from "./Reveal";
import { getProduct } from "@/data/products";

const SAMPLE = ["dew-serum", "ember-facial-oil", "veil-barrier-cream"].map((s) => getProduct(s)!);

// Home-page doorway to the routine finder, previewing the layer stack it builds.
export default function RoutineTeaser() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-10">
      <div className="grid items-center gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
        <Reveal>
          <p className="text-sm text-smoke">Routine finder</p>
          <h2 className="display mt-3 text-[clamp(2.2rem,4.4vw,3.25rem)] text-balance">
            Three questions. One routine, in the order it goes on.
          </h2>
          <p className="mt-6 max-w-sm text-smoke">
            Tell us how your skin feels by midday and what you’d change first. We’ll stack the formulas that do it.
          </p>
          <Link href="/routine" className="btn mt-8">Find your routine</Link>
        </Reveal>
        <Reveal variant="clip" className="relative aspect-[5/4] overflow-hidden rounded-[15px] bg-[#fbe9dc]">
          <LayerStack steps={SAMPLE} className="absolute inset-0" />
        </Reveal>
      </div>
    </section>
  );
}
