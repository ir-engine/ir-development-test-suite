import { PresentationSystemGroup, defineSystem } from '@etherealengine/ecs'
import { defineState, useMutableState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import PhysicsBenchmark from './PhysicsBenchmark'

export interface Benchmark {
  begin: (end: () => void) => void
}

enum BenchmarkStage {
  Physics,
  Animation,
  Rendering,
  IK
}

const benchmarkOrder = [BenchmarkStage.Physics, BenchmarkStage.Animation, BenchmarkStage.Rendering, BenchmarkStage.IK]

const benchmarks: { [key in BenchmarkStage]: Benchmark | null } = {
  [BenchmarkStage.Physics]: PhysicsBenchmark,
  [BenchmarkStage.Animation]: null,
  [BenchmarkStage.Rendering]: null,
  [BenchmarkStage.IK]: null
}

const BenchmarkState = defineState({
  name: 'BenchmarkState',
  initial: () => {
    return {
      stageIndex: 0
    }
  }
})

const reactor = () => {
  console.log('Benchmark State Reactor')
  const benchmarkState = useMutableState(BenchmarkState)

  useEffect(() => {
    console.log('Benchmark stage: ' + benchmarkState.stageIndex.value)
    const benchmarkStage = benchmarkOrder[benchmarkState.stageIndex.value]
    const benchmark = benchmarks[benchmarkStage]
    benchmark?.begin(() => {
      benchmarkState.stageIndex.set(benchmarkState.stageIndex.value + 1)
    })
  }, [benchmarkState.stageIndex])

  return null
}

export default defineSystem({
  uuid: 'eepro.eetest.BenchmarkOrchestrationSystem',
  reactor,
  insert: { after: PresentationSystemGroup }
})
