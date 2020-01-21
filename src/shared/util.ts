import { flow } from "lodash/fp"


let counter = 0
export const generateUniqueId = () => counter++

export const flowa = (funcs: any, value: any) => flow(funcs)(value)