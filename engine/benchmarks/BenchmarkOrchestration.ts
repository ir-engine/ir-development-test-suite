import { PresentationSystemGroup, SystemUUID, defineSystem } from '@etherealengine/ecs'
import { defineState, useMutableState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import PhysicsBenchmark from './PhysicsBenchmark'
import { ProfileState, SystemProfileData } from './Profiling'

export interface IBenchmark {
  begin: (end: () => void) => void
}

type Benchmark = {
  benchmark: IBenchmark
  systemUUID: SystemUUID
}

enum BenchmarkStage {
  Physics,
  Animation,
  Rendering,
  IK
}

const benchmarkOrder = [BenchmarkStage.Physics, BenchmarkStage.Animation, BenchmarkStage.Rendering, BenchmarkStage.IK]

const benchmarks: { [key in BenchmarkStage]: Benchmark | null } = {
  [BenchmarkStage.Physics]: {
    benchmark: PhysicsBenchmark,
    systemUUID: 'ee.engine.PhysicsSystem' as SystemUUID
  },
  [BenchmarkStage.Animation]: null,
  [BenchmarkStage.Rendering]: null,
  [BenchmarkStage.IK]: null
}

type BenchmarkData = Record<
  SystemUUID,
  {
    before: SystemProfileData
    after: SystemProfileData
  }
>

const BenchmarkState = defineState({
  name: 'BenchmarkState',
  initial: () => {
    return {
      stageIndex: 0,
      data: {} as BenchmarkData
    }
  }
})

const reactor = () => {
  const benchmarkState = useMutableState(BenchmarkState)

  useEffect(() => {
    const stageIndex = benchmarkState.stageIndex.value
    console.log('Benchmark stage: ' + stageIndex)
    if (stageIndex > benchmarkOrder.length) {
      // Evaluate results
      return
    }
    const benchmarkStage = benchmarkOrder[stageIndex]
    const benchmark = benchmarks[benchmarkStage]
    if (!benchmark) return

    const systemUUID = benchmark.systemUUID
    const systemProfileData = ProfileState.GetProfileData(systemUUID)
    benchmarkState.data.merge({
      [systemUUID]: { before: systemProfileData, after: systemProfileData }
    })

    benchmark.benchmark.begin(() => {
      benchmarkState.data[systemUUID].after.set(ProfileState.GetProfileData(systemUUID))
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
