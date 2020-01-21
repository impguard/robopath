import { Vec } from "./vec";
import { Graph, Node } from "./state";

export const create = (localSize: Vec, worldSize: Vec): Graph => {
  const nodes: Node[][] = []

  for (let i = 0; i < localSize.x; i++) {
    const row: Node[] = []

    for (let j = 0; j < localSize.y; j++) {
      const node: Node = {
        isAvailable: true,
        isObstacle: false,
      }

      row.push(node)
    }

    nodes.push(row)
  }

  return {
    localSize,
    worldSize,
    nodes,
  }
}