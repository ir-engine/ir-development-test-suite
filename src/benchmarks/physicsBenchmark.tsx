import React from 'react'

import { PhysicsPreTransformSystem, PhysicsSystem } from '@ir-engine/spatial'
import { PhysicsBenchmark } from '../engine/benchmarks/PhysicsBenchmark'
import { useRouteScene } from '../sceneRoute'
import ProfilerUI from './utils/profilerUI'

export const metadata = {
  title: 'Physics Benchmark',
  description: ''
}

export default function PhysicsBenchmarkEntry() {
  const sceneEntity = useRouteScene()
  return sceneEntity.value ? (
    <>
      <PhysicsBenchmark rootEntity={sceneEntity.value} onComplete={undefined as any} />
      <ProfilerUI systemUUIDs={[PhysicsSystem, PhysicsPreTransformSystem]} />
    </>
  ) : null
}
