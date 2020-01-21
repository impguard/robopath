import { curry } from "lodash/fp"

export interface Vec {
  x: number
  y: number
}

export const unary = (v: number): Vec => ({
  x: v,
  y: v,
})

export const mult = curry((v: number, vec: Vec): Vec => ({
  x: vec.x * v,
  y: vec.y * v,
}))

export const sum = curry((vec1: Vec, vec2: Vec): Vec => ({
  x: vec1.x + vec2.x,
  y: vec2.y + vec2.y,
}))