import { ERR_FULL, ERR_INVALID_TARGET, ERR_NOT_IN_RANGE, ERR_NO_BODYPART, RESOURCE_ENERGY } from "game/constants";
import { Creep, Source, StructureContainer } from "game/prototypes";
import { Goal } from "./goal";

export class HarvestGoal extends Goal {
  source: Source | StructureContainer;
  constructor(creep: Creep, source: Source | StructureContainer) {
    super(creep);
    this.source = source;
  }

  step(): void {
    let result;
    if (!this.source || !this.source.exists) {
      this.done = true;
      return;
    }

    if (!this.creep.store.getFreeCapacity()) {
      this.done = true;
      return;
    }

    if (this.source instanceof Source) {
      if (!this.source.energy) {
        this.done = true;
        return;
      }
      result = this.creep.harvest(this.source);
    } else {
      if (!this.source.store.getCapacity()) {
        this.done = true;
        return;
      }
      result = this.creep.withdraw(this.source, RESOURCE_ENERGY);
    }
    switch (result) {
      case ERR_NO_BODYPART:
      case ERR_INVALID_TARGET:
        this.done = true;
      case ERR_NOT_IN_RANGE:
        this.creep.moveTo(this.source);
      case ERR_FULL:
        break;
    }
  }
  interrupt(): void {
  }
}
