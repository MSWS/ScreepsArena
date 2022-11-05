import { ATTACK, CARRY, MOVE, RANGED_ATTACK, TOUGH, WORK } from "game/constants";
import { Creep, RoomPosition, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { calcEnergyScore, calcPower, calcThreat } from "./calculation";
import { processCreep } from "./creepLogic";
import { Goal } from "./goal";

export let energySources: (StructureContainer | Source)[] = [];
let spawn: StructureSpawn | undefined;
let firstLoop = true;
let MAX_DIST = 44.7;

declare module "game/prototypes" {
  interface Creep {
    goal: Goal | undefined;
  }
}

export function loop(): void {
  if (firstLoop)
    init();
  let allCreeps = getObjectsByPrototype(Creep);
  let myCreeps = allCreeps.filter(c => c.my);
  let enemies = allCreeps.filter(c => !c.my);

  let harvs = myCreeps.filter(c => c.body.some(b => b.type == WORK));
  let attak = myCreeps.filter(c => c.body.some(b => b.type == ATTACK || b.type == RANGED_ATTACK));

  let base = [MOVE];
  let threat = calcThreat();
  let power = calcPower();

  console.log("Threat: " + threat + " Power: " + power);
  let state = power - threat;

  if (harvs <= attak) {
    spawn?.spawnCreep(base.concat([WORK, CARRY]));
  } else {
    spawn?.spawnCreep(base.concat([ATTACK, TOUGH]));
  }

  for (let creep of myCreeps)
    processCreep(creep, energySources);
}

function init(): void {
  firstLoop = false;
  spawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
  let roomPos = { x: spawn?.x, y: spawn?.y } as RoomPosition;
  energySources = getObjectsByPrototype(StructureContainer);
  energySources = energySources.concat(getObjectsByPrototype(Source));
  energySources.sort((a, b) => calcEnergyScore(b, roomPos) - calcEnergyScore(a, roomPos));
  console.log(energySources);
}
