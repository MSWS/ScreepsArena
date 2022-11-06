import { Creep, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype, getTicks } from "game/utils";
import { calcPower, calcThreat, clearCache } from "./calculation";
import { Goal } from "./goals/goal";
import { CreepLogic } from "./logic/creepLogic";
import { SpawnLogic } from "./logic/spawnLogic";

let firstLoop = true;
let cLogic = new CreepLogic();
let sLogic: SpawnLogic[] = [];

declare module "game/prototypes" {
  interface Creep {
    goal: Goal | undefined;
  }
}

declare global {
  namespace NodeJS {
    interface Global {
      power: number;
      threat: number;
      balance: number;
      allCreeps: Creep[];
      myCreeps: Creep[];
      enemyCreeps: Creep[];
    }
  }
}

export function loop(): void {
  if (firstLoop)
    init();

  updateGlobals();
  clearCache();

  cLogic.loop();
  for (let spawn of sLogic)
    spawn.loop();

  if (getTicks() % 50 == 0)
    console.log("Balance: %f", global.balance);
}

function init(): void {
  firstLoop = false;
  for (let spawn of getObjectsByPrototype(StructureSpawn).filter(s => s.my))
    sLogic.push(new SpawnLogic(spawn));

  cLogic.init();
}

function updateGlobals(): void {
  global.threat = calcThreat();
  global.power = calcPower();
  global.balance = global.power - global.threat;
  global.allCreeps = getObjectsByPrototype(Creep);
  global.myCreeps = global.allCreeps.filter(c => c.my);
  global.enemyCreeps = global.allCreeps.filter(c => !c.my);
}
