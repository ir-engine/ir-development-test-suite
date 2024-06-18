import React from 'react'

import { ParticleSystem } from '@etherealengine/engine'
import { ParticlesBenchmark } from '../engine/benchmarks/ParticlesBenchmark'
import { useRouteScene } from '../sceneRoute'
import ProfilerUI from './utils/profilerUI'

export const metadata = {
  title: 'Particles Benchmark',
  description: ''
}

export default function ParticlesBenchmarkEntry() {
  const sceneEntity = useRouteScene()
  return sceneEntity.value ? (
    <>
      <ParticlesBenchmark rootEntity={sceneEntity.value} onComplete={undefined as any} />
      <ProfilerUI systemUUIDs={[ParticleSystem]} />
    </>
  ) : null
}
