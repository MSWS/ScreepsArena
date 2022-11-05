import { ATTACK, HEAL, MOVE, RANGED_ATTACK, TOUGH, WORK } from "game/constants";
import { BodyPartType, Creep, RoomPosition, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

let MAX_DIST = 44.7;

export function calcEnergyScore(source: StructureContainer | Source, from?: RoomPosition): number {
  let energy = 0, cap = 0, myDist = 0;
  let rawWeigt = 1, percentWeight = 0.3, distWeight = 0.4;
  if (source instanceof StructureContainer) {
    energy = source.store.getUsedCapacity() || 0;
    cap = source.store.getCapacity() || 0;
  } else {
    energy = source.energy;
    cap = source.energyCapacity;
  }

  if (from)
    myDist = source.findPathTo(from).length;

  let enemyAmo = 0;
  let enemWeight = 1.2, absHealthWeight = 0.4, healthPercWeight = 0.3;
  let enemies = (getObjectsByPrototype(StructureSpawn) as (StructureSpawn | Creep)[]).concat(getObjectsByPrototype(Creep)).filter(s => !s.my);
  for (let enemy of enemies) {
    let dist = source.findPathTo(enemy).length;
    if (!enemy.hits || !enemy.hitsMax)
      continue;
    enemyAmo += (enemy.hitsMax / dist) * absHealthWeight + (enemy.hits / enemy.hitsMax) * healthPercWeight;
  }

  return -Math.max(energy / 3000, 1) * rawWeigt - ((energy / cap) * percentWeight) + Math.max(myDist / MAX_DIST, 1) * distWeight - enemyAmo * enemWeight;
}

export function calcThreat(creep?: Creep): number {
  if (creep) {
    let threat = 0;
    threat += creep.body.length;
    creep.body.forEach(b => threat += b.hits * calcBodyThreat(b.type));
    return threat;
  }
  let threat = 0;
  let spawn = getObjectsByPrototype(Creep).find(c => !c.my);
  for (let creep of getObjectsByPrototype(Creep).filter(c => !c.my)) {
    let t = calcThreat(creep);
    if (spawn)
      t /= Math.max(creep.findPathTo(spawn).length / MAX_DIST, 1.5);
    threat += t;
  }
  return threat;
}

export function calcPower(creep?: Creep): number {
  if (creep) {
    let threat = 0;
    threat += creep.body.length;
    creep.body.forEach(b => threat += b.hits * calcBodyThreat(b.type));
    return threat;
  }
  let threat = 0;
  let spawn = getObjectsByPrototype(Creep).find(c => !c.my);
  for (let creep of getObjectsByPrototype(Creep).filter(c => c.my)) {
    let t = calcThreat(creep);
    if (spawn)
      t /= Math.max(creep.findPathTo(spawn).length / MAX_DIST, 1.5);
    threat += t;
  }
  return threat;
}

export function calcBodyThreat(body: BodyPartType): number {
  switch (body) {
    case ATTACK:
      return 2;
    case RANGED_ATTACK:
      return 2.2;
    case HEAL:
      return 1;
    case TOUGH:
      return 0.8;
    case WORK:
      return 0.3;
    case MOVE:
      return 0.2;
  }
  return 0;
}
