import { FightGoal } from "arena_swamp/goals/fightGoal";
import { HarvestGoal } from "arena_swamp/goals/harvestGoal";
import { StoreGoal } from "arena_swamp/goals/storeGoal";
import { Ticker } from "base/ticker";
import { WORK } from "game/constants";
import { Creep, RoomPosition, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { calcEnergyScore } from "../calculation";
import { Goal } from "../goals/goal";

export class CreepLogic implements Ticker {
  sources: (StructureContainer | Source)[] = [];
  spawn: StructureSpawn | undefined;
  threat = 0; power = 0;

  init(): void {
    this.spawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    let roomPos = { x: this.spawn?.x, y: this.spawn?.y } as RoomPosition;
    this.sources = getObjectsByPrototype(StructureContainer);
    this.sources = this.sources.concat(getObjectsByPrototype(Source));
    this.sources.sort((a, b) => calcEnergyScore(b, roomPos) - calcEnergyScore(a, roomPos));
    console.log(this.sources);
  }

  loop(): void {
    let roomPos = { x: this.spawn?.x, y: this.spawn?.y } as RoomPosition;
    this.sources.sort((a, b) => calcEnergyScore(b, roomPos) - calcEnergyScore(a, roomPos));
    for (let creep of global.myCreeps)
      this.processCreep(creep);
  }

  processCreep(creep: Creep) {
    if (creep.goal == undefined) {
      creep.goal = this.findNewGoal(creep);
      return;
    }
    creep.goal.step();
    if (creep.goal.complete())
      creep.goal = undefined;
  }

  findNewGoal(creep: Creep): Goal {
    if (creep.store.getUsedCapacity() && !creep.store.getFreeCapacity())
      return new StoreGoal(creep);
    if (creep.body.some(c => c.type == WORK)) {
      return new HarvestGoal(creep, this.sources[0]);
    }
    return new FightGoal(creep);
  }
}
