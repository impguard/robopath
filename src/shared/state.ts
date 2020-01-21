import { Vec2 } from "./vec"

/**
 * Represents a node that a robot is allowed to occupy
 */
export interface Node {
  id: number
  pos: Vec2
  size: Vec2
  nodes: number[]
  robot: number
}

/**
 * Represents a robot
 */
export interface Robot {
  id: number
  pos: Vec2
  size: Vec2
  status: "ready" | "moving" | "action" | "disabled"
  nodes: number[]
  dest: Vec2
  goal: number
}

/**
 * An instruction that can be accepted by the simulation
 */
export interface Instruction {
  goal: number
  robot?: number
}

/**
 * The top level simulation state
 */
export interface Simulation {
  settings: {
    width: number
    height: number
  }
  instructions: {
    completed: Instruction[]
    pending: Instruction[]
    queued: Instruction[]
  }
  nodes: {
    [id: number]: Node
  }
  robots: {
    [id: number]: Robot
  }
}