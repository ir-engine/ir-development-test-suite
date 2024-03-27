import { PresentationSystemGroup, SystemUUID, defineSystem } from '@etherealengine/ecs'
import { ParticleSystem } from '@etherealengine/engine'
import { SkinnedMeshTransformSystem } from '@etherealengine/engine/src/avatar/systems/AvatarAnimationSystem'
import { defineState, useMutableState } from '@etherealengine/hyperflux'
import { PhysicsPreTransformSystem, PhysicsSystem } from '@etherealengine/spatial'
import { useEffect } from 'react'
import { AvatarBenchmark, AvatarIKBenchmark } from './AvatarBenchmark'
import { ParticlesBenchmark } from './ParticlesBenchmark'
import { PhysicsBenchmark } from './PhysicsBenchmark'
import { ProfileState, SystemProfileData } from './Profiling'

export interface IBenchmark {
  start: () => Promise<void>
}

type Benchmark = {
  benchmark: IBenchmark
  systemUUIDs: SystemUUID[]
}

enum BenchmarkStage {
  Particles,
  Physics,
  Avatar,
  Animation,
  Rendering,
  IK
}

const benchmarkOrder = [
  BenchmarkStage.Particles,
  BenchmarkStage.Avatar,
  BenchmarkStage.Physics,
  BenchmarkStage.Animation,
  BenchmarkStage.Rendering,
  BenchmarkStage.IK
]

const benchmarks: { [key in BenchmarkStage]: Benchmark | null } = {
  [BenchmarkStage.Physics]: {
    benchmark: PhysicsBenchmark,
    systemUUIDs: [PhysicsSystem, PhysicsPreTransformSystem]
  },
  [BenchmarkStage.Avatar]: {
    benchmark: AvatarBenchmark,
    systemUUIDs: [SkinnedMeshTransformSystem]
  },
  [BenchmarkStage.Particles]: {
    benchmark: ParticlesBenchmark,
    systemUUIDs: [ParticleSystem]
  },
  [BenchmarkStage.Animation]: null,
  [BenchmarkStage.Rendering]: null,
  [BenchmarkStage.IK]: {
    benchmark: AvatarIKBenchmark,
    systemUUIDs: [SkinnedMeshTransformSystem]
  }
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
      console.log('Benchmarks Complete', benchmarkState.value)
      // All benchmarks run, evaluate results
      return
    }
    const benchmarkStage = benchmarkOrder[stageIndex]
    const benchmark = benchmarks[benchmarkStage]
    if (!benchmark) {
      benchmarkState.stageIndex.set(benchmarkState.stageIndex.value + 1)
      return
    }

    const systemUUIDs = benchmark.systemUUIDs
    for (const systemUUID of systemUUIDs) {
      const systemProfileData = ProfileState.GetProfileData(systemUUID)
      benchmarkState.data.merge({
        [systemUUID]: { before: systemProfileData, after: systemProfileData }
      })
    }

    benchmark.benchmark.start().then(() => {
      for (const systemUUID of systemUUIDs) {
        benchmarkState.data[systemUUID].after.set(ProfileState.GetProfileData(systemUUID))
      }
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
