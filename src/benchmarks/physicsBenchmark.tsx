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
  return sceneEntity ? (
    <>
      <PhysicsBenchmark rootEntity={sceneEntity} onComplete={() => {}} />
      <ProfilerUI systemUUIDs={[PhysicsSystem, PhysicsPreTransformSystem]} />
    </>
  ) : null
}
