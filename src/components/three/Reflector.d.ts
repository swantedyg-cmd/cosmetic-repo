import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { MeshReflectorMaterial as DreiReflector } from "@react-three/drei";

type DreiProps = React.ComponentProps<typeof DreiReflector>;
/** drei's MeshReflectorMaterial plus `every`: redraw the reflection every N frames. */
export const MeshReflectorMaterial: ForwardRefExoticComponent<DreiProps & { every?: number } & RefAttributes<unknown>>;
