import { Vec } from "./vec"

export enum Action {
  "pickup"
}

export interface Goal {
  localDestination: Vec
  action: Action | null
}

export interface Instruction {}

export interface MoveInstruction extends Instruction {
  type: "move"
  localDestination: Vec
}

export interface ActionInstruction extends Instruction {
  type: "action"
  action: Action
}

export interface Node {
  isAvailable: boolean
  isObstacle: boolean
}

export interface Graph {
  worldSize: Vec
  localSize: Vec
  nodes: Node[][]
}

export interface Bot {
  worldPosition: Vec
  localPosition: Vec
  goal: Goal | null
  instruction: Instruction | null
}

export interface Simulation {
  graph: Graph
  bots: Bot[]
}