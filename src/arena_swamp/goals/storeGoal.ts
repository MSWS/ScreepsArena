import { RESOURCE_ENERGY, ERR_NOT_IN_RANGE } from "game/constants";
import { Creep, StructureSpawn, StructureContainer } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { Goal } from "./goal";

export class StoreGoal extends Goal {
  target: StructureSpawn | StructureContainer | undefined;
  constructor(creep: Creep, target?: StructureSpawn | StructureContainer) {
    super(creep);
    this.target = target || getObjectsByPrototype(StructureSpawn).find(s => s.my);
  }
  step(): void {
    if (this.target == undefined) return;
    if (this.creep.transfer(this.target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
      this.creep.moveTo(this.target);
    else
      this.done = true;
  }
  interrupt(): void {
    throw new Error("Method not implemented.");
  }
}
