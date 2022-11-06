import { calcNextTarget } from "arena_swamp/calculation";
import { ERR_NOT_IN_RANGE, RANGED_ATTACK } from "game/constants";
import { Creep, RoomPosition, Structure } from "game/prototypes";
import { Goal } from "./goal";

export class FightGoal extends Goal {
  target: Creep | Structure | undefined;
  ranged: boolean;
  constructor(creep: Creep, target?: Creep) {
    super(creep);
    this.target = target || calcNextTarget(creep);
    this.ranged = creep.body.some(b => b.type == RANGED_ATTACK);
  }
  step(): void {
    if (!this.target?.exists) {
      this.done = true;
      return;
    }
    this.target = calcNextTarget(this.creep);
    if (this.ranged) {
      this.rangedLogic();
    } else {
      this.meleeLogic();
    }
  }

  rangedLogic(): void {
    if (!this.target?.exists)
      return;

    let enemPos: RoomPosition[] = [];
    for (let enemy of global.enemyCreeps)
      enemPos.push({ x: enemy.x, y: enemy.y });
    enemPos = this.creep.findInRange(enemPos, 5);
    if (enemPos.length == 0)
      enemPos.push({ x: this.target.x, y: this.target.y });
    if (enemPos.length > 1) {
      let closest = this.creep.findClosestByPath(enemPos);
      if (closest == null)
        return;
      this.creep.moveTo(closest, { flee: true });
    } else {
      if (this.creep.getRangeTo(enemPos[0]) <= 2) {
        this.creep.moveTo(this.target, { flee: true });
      } else {
        let result = this.creep.rangedAttack(this.target);
        if (result == ERR_NOT_IN_RANGE)
          this.creep.moveTo(this.target);
      }
    }
  }

  meleeLogic(): void {
    if (!this.target?.exists)
      return;

    if (this.creep.attack(this.target) == ERR_NOT_IN_RANGE)
      this.creep.moveTo(this.target);
  }

  interrupt(): void {
    throw new Error("Method not implemented.");
  }
}
