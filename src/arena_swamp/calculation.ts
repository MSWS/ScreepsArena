import { ATTACK, HEAL, MOVE, RANGED_ATTACK, TOUGH, WORK } from "game/constants";
import { BodyPartType, Creep, RoomPosition, Source, Structure, StructureContainer, StructureSpawn } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";
import { FightGoal } from "./goals/fightGoal";

let MAX_DIST = 44.7;

export function calcEnergyScore(source: StructureContainer | Source, from?: RoomPosition): number {
  let energy = 0, cap = 0, myDist = 0, spawnDist = 0;
  let rawWeigt = 3.2, percentWeight = 0.8, distWeight = 2.0;
  if (source instanceof StructureContainer) {
    energy = source.store.getUsedCapacity() || 0;
    cap = source.store.getCapacity() || 0;
  } else {
    energy = source.energy;
    cap = source.energyCapacity;
  }

  if (!energy)
    return -Number.MIN_VALUE;

  if (from)
    myDist = source.getRangeTo(from);
  let spawn = getObjectsByPrototype(StructureSpawn).find(c => c.my);
  if (spawn)
    spawnDist = source.getRangeTo(spawn);

  let enemyAmo = 0;
  let enemWeight = 1.0, absHealthWeight = 0.6, healthPercWeight = 0.2;
  let enemies = (getObjectsByPrototype(StructureSpawn) as (StructureSpawn | Creep)[]).concat(getObjectsByPrototype(Creep)).filter(s => !s.my);
  for (let enemy of enemies) {
    let dist = source.getRangeTo(enemy);
    if (!enemy.hits || !enemy.hitsMax)
      continue;
    enemyAmo += (enemy.hitsMax / dist) * absHealthWeight + (enemy.hits / enemy.hitsMax) * healthPercWeight;
  }

  return energy / cap - (spawnDist / MAX_DIST) * 4;
}

export function calcThreat(creep?: Creep): number {
  if (creep) {
    let threat = 0;
    threat += creep.body.length;
    creep.body.forEach(b => threat += b.hits * calcBodyThreat(b.type));
    return threat;
  }
  let threat = 0;
  let spawn = getObjectsByPrototype(Creep).find(c => c.my);
  for (let creep of getObjectsByPrototype(Creep).filter(c => !c.my)) {
    let t = calcThreat(creep);
    if (spawn)
      t /= Math.min(creep.getRangeTo(spawn) / MAX_DIST, 1.5);
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
      t /= Math.min(creep.getRangeTo(spawn) / MAX_DIST, 1.5);
    threat += t;
  }
  return threat;
}

let cachedValues = new Map();

export function calcNextTarget(creep: Creep): Creep | Structure | undefined {
  let enemySpawn = getObjectsByPrototype(StructureSpawn).find(c => !c.my);

  if (!global.enemyCreeps.length)
    return enemySpawn;
  let sorted = global.enemyCreeps.sort((a, b) => a.getRangeTo(creep) - b.getRangeTo(creep));
  return sorted[0];

  // let targeted = new Set();
  // for (let creep of global.myCreeps.filter(c => c.goal instanceof FightGoal)) {
  //   targeted.add((creep.goal as FightGoal).target);
  // }
  // targeted.delete(undefined);
  // if (targeted.size >= global.enemyCreeps.length)
  //   return enemySpawn;

  // let sortedEnemies = global.enemyCreeps.sort((a, b) => calcTargetValue(creep, b) - calcTargetValue(creep, a));
  // return sortedEnemies[0];
}

export function calcTargetValue(source: Creep, target: Creep, deep = true): number {
  if (cachedValues.has(source.id + target.id))
    return cachedValues.get(source.id + target.id);
  let value = -source.getRangeTo(target);
  let myPower = calcPower(source), theirPower = calcPower(target);
  if (myPower > theirPower)
    value += 3;
  else
    value -= theirPower - myPower;

  if (!deep)
    return value;
  for (let creep of global.myCreeps.filter(c => c.goal instanceof FightGoal)) {
    if (creep == source)
      continue;
    let fg = creep.goal as FightGoal;
    if (fg.target == target)
      value += calcTargetValue(creep, target, false);
  }
  cachedValues.set(source.id + target.id, value);
  return value;
}

export function clearCache() {
  cachedValues.clear();
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
