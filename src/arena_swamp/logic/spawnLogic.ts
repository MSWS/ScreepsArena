import { Ticker } from "base/ticker";
import { WORK, ATTACK, RANGED_ATTACK, MOVE, TOUGH, CARRY } from "game/constants";
import { Creep, StructureSpawn } from "game/prototypes";

export class SpawnLogic implements Ticker {
  spawn: StructureSpawn;
  balHistory: number[] = [];
  harvs: Creep[] = [];
  attak: Creep[] = [];
  constructor(spawn: StructureSpawn) {
    this.spawn = spawn;
  }
  init(): void {
  }

  loop(): void {
    this.balHistory.push(global.balance);
    this.harvs = global.myCreeps.filter(c => c.body.some(b => b.type == WORK));
    this.attak = global.myCreeps.filter(c => c.body.some(b => b.type == ATTACK || b.type == RANGED_ATTACK));

    let losing = this.balHistory.filter(b => b < 0).length;
    let winning = this.balHistory.length - losing;

    let attakToHarv = 0.7;

    if (losing > winning) {
      attakToHarv += Math.min((losing - winning) / this.balHistory.length * 3, 3);
    } else {
      attakToHarv -= Math.min((winning - losing) / this.balHistory.length * 2, 3);
    }

    if (this.harvs.length * attakToHarv > this.attak.length) {
      if (Math.random() > .5) {
        this.spawn.spawnCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, TOUGH]);
      } else {
        this.spawn.spawnCreep([RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, TOUGH]);
      }
    } else {
      this.spawn.spawnCreep([MOVE, MOVE, CARRY, WORK]);
    }
  }
}
