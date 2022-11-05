import { Creep, Source, StructureContainer } from "game/prototypes";
import { HarvestGoal } from "./goal";

export function processCreep(creep: Creep, sources: (StructureContainer | Source)[]) {
  if (creep.goal == undefined) {
    creep.goal = new HarvestGoal(creep, sources[0]);
    return;
  }
  creep.goal.step();
  if (creep.goal.complete()) {
    creep.goal = undefined;
  }
}
