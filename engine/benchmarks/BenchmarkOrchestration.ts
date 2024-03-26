import { PresentationSystemGroup, defineSystem } from '@etherealengine/ecs'
import { defineState, useMutableState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'

export interface Benchmark {
  begin: (end: () => void) => void
}

enum BenchmarkStages {
  Physics,
  Animation,
  Rendering,
  IK
}

const benchmarkOrder = [
  BenchmarkStages.Physics,
  BenchmarkStages.Animation,
  BenchmarkStages.Rendering,
  BenchmarkStages.IK
]

const benchmarkTimes = {
  [BenchmarkStages.Physics]: 2000,
  [BenchmarkStages.Animation]: 2000,
  [BenchmarkStages.Rendering]: 2000,
  [BenchmarkStages.IK]: 2000
}

const BenchmarkState = defineState({
  name: 'BenchmarkState',
  initial: () => {
    return {
      stage: benchmarkOrder[0]
    }
  }
})

const reactor = () => {
  console.log('Benchmark State Reactor')
  const benchmarkState = useMutableState(BenchmarkState)

  useEffect(() => {
    console.log('Benchmark stage: ' + benchmarkState.stage.value)
  }, [benchmarkState.stage])

  return null
}

export default defineSystem({
  uuid: 'eepro.eetest.BenchmarkOrchestrationSystem',
  reactor,
  insert: { after: PresentationSystemGroup }
})
