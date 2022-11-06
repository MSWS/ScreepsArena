import { Creep } from "game/prototypes";

export abstract class Goal {
  creep: Creep;
  done: boolean = false;
  constructor(creep: Creep) {
    this.creep = creep;
  }
  abstract step(): void;
  complete(): boolean {
    return this.done;
  }
  abstract interrupt(): void;
}
