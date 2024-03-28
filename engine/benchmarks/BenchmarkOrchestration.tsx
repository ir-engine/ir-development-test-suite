import { PresentationSystemGroup, SystemUUID, defineSystem } from '@etherealengine/ecs'
import { ParticleSystem } from '@etherealengine/engine'
import { SkinnedMeshTransformSystem } from '@etherealengine/engine/src/avatar/systems/AvatarAnimationSystem'
import { defineState, useMutableState } from '@etherealengine/hyperflux'
import { PhysicsPreTransformSystem, PhysicsSystem } from '@etherealengine/spatial'
import React, { useEffect } from 'react'
import { AvatarBenchmark, AvatarIKBenchmark } from './AvatarBenchmark'
import { ParticlesBenchmark } from './ParticlesBenchmark'
import { PhysicsBenchmark } from './PhysicsBenchmark'
import { ProfileState, SystemProfileData } from './Profiling'

type Benchmark = {
  benchmark: React.FC<{ onComplete: () => void }>
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
  BenchmarkStage.IK,
  BenchmarkStage.Particles,
  BenchmarkStage.Avatar,
  BenchmarkStage.Physics,
  BenchmarkStage.Animation,
  BenchmarkStage.Rendering
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

const useBenchmark = (): [React.FC<{ onComplete: () => void }> | undefined, () => void] => {
  const benchmarkState = useMutableState(BenchmarkState)
  const benchmarkStage = benchmarkOrder[benchmarkState.stageIndex.value]
  const benchmark = benchmarks[benchmarkStage]

  useEffect(() => {
    const stageIndex = benchmarkState.stageIndex.value
    console.log('Benchmark stage: ' + stageIndex)
    if (stageIndex > benchmarkOrder.length) {
      console.log('Benchmarks Complete', benchmarkState.value)
      // All benchmarks run, evaluate results
      return
    }

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
  }, [benchmarkState.stageIndex])

  const onComplete = () => {
    const systemUUIDs = benchmark?.systemUUIDs
    if (!systemUUIDs) return
    for (const systemUUID of systemUUIDs) {
      benchmarkState.data[systemUUID].after.set(ProfileState.GetProfileData(systemUUID))
    }
    benchmarkState.stageIndex.set(benchmarkState.stageIndex.value + 1)
  }

  return [benchmark?.benchmark, onComplete]
}

const reactor = () => {
  const [Benchmark, onComplete] = useBenchmark()
  return <>{Benchmark && <Benchmark onComplete={onComplete} />}</>
}

export default defineSystem({
  uuid: 'eepro.eetest.BenchmarkOrchestrationSystem',
  reactor,
  insert: { after: PresentationSystemGroup }
})
