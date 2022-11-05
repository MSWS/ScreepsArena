import { ERR_FULL, ERR_INVALID_TARGET, ERR_NOT_IN_RANGE, ERR_NO_BODYPART, RESOURCE_ENERGY } from "game/constants";
import { Creep, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

export interface Goal {
  step(): void;
  complete(): boolean;
  interrupt(): void;
}

export class StoreGoal implements Goal {
  creep: Creep;
  target: StructureSpawn | StructureContainer | undefined;
  done = false;
  constructor(creep: Creep, target?: StructureSpawn | StructureContainer) {
    this.creep = creep;
    this.target = target || getObjectsByPrototype(StructureSpawn).find(s => s.my);
  }
  step(): void {
    if (this.target == undefined) return;
    if (this.creep.transfer(this.target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
      this.creep.moveTo(this.target);
    else
      this.done = true
  }
  complete(): boolean {
    return this.done;
  }
  interrupt(): void {
    throw new Error("Method not implemented.");
  }

}

export class HarvestGoal implements Goal {
  creep: Creep;
  source: Source | StructureContainer;
  done = false;
  constructor(creep: Creep, source: Source | StructureContainer) {
    this.creep = creep;
    this.source = source;
  }

  step(): void {
    let result;
    if (!this.source || !this.source.exists) {
      this.done = true;
      return;
    }

    if (!this.creep.store.getFreeCapacity()) {
      this.creep.goal = new StoreGoal(this.creep);
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
    console.log("Creep Harvest");
  }
  complete(): boolean {
    return this.done;
  }
  interrupt(): void {
    console.log("Creep Harvest");
  }
}
