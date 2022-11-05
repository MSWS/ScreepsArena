import { Creep } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

export function example(): Creep[] {
  let creeps = getObjectsByPrototype(Creep);
  return creeps;
}
