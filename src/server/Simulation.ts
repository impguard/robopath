import * as state from "../shared/state"
import * as _ from "lodash"
import { Vec2 } from "../shared/vec"
import { generateUniqueId } from "../shared/util"


class Robot {
  private state: state.Robot

  constructor(state: state.Robot) {
    this.state = state
  }

  get ready() {
    return this.state.status === "ready"
  }

  get arrived() {
    const moving = this.state.status === "moving"
    const arrived = this.state.nodes.length === 1 && this.state.nodes[0] === this.state.goal

    return moving && arrived
  }

  setStatus(status: "ready" | "moving" | "action" | "disabled") {
    this.state.status = status
  }

  assign(instruction: state.Instruction) {
    if (instruction.robot) {
      throw new Error(
        `Instruction for ${instruction.goal} already assigned to ` +
        `${instruction.robot}. Cannot be assigned to ${this.state.id}`
      )
    }

    this.state.goal = instruction.goal
    instruction.robot = this.state.id
  }
}

export default class Simulation {
  private state: state.Simulation
  private robots: {
    [id: number]: Robot
  }

  constructor(state: state.Simulation) {
    this.state = state

    this.robots = {}
    _.forEach(this.state.robots, state => {
      const robot = new Robot(state)
      this.robots[state.id] = robot
    })
  }

  accept(instruction: state.Instruction) {
    this.state.instructions.queued.push(instruction)
  }

  createRobot(pos: Vec2, size: Vec2, nodes: number[]) {
    const id = generateUniqueId()
    const state: state.Robot = {
      id,
      status: "disabled",
      nodes,
      pos,
      size,
      dest: null,
      goal: null,
    }

    this.robots[id] = new Robot(state)
    this.state.robots[id] = state
  }

  readyRobot(id: number) {
    this.robots[id].setStatus("ready")
  }

  tick() {
    // Update statuses of robots arriving at their destination
    _.forEach(this.robots, robot => {
      if (robot.arrived) {
        robot.setStatus("action")
      }
    })

    // Assign queued instructions to robots.
    _.forEach(this.robots, robot => {
      if (!robot.ready) {
        return
      }

      const instruction = this.state.instructions.queued.pop()

      if (!instruction) {
        return false
      }

      robot.assign(instruction)
      this.state.instructions.pending.push(instruction)
    })

    // Assign destinations to each robot
    _.forEach(this.robots, robot => {


    })
  }

  snapshot() {
    return _.clone(this.state)
  }
}