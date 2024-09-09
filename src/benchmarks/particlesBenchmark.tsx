import React from 'react'

import { ParticleSystem } from '@ir-engine/engine'
import { ParticlesBenchmark } from '../engine/benchmarks/ParticlesBenchmark'
import { useRouteScene } from '../sceneRoute'
import ProfilerUI from './utils/profilerUI'

export const metadata = {
  title: 'Particles Benchmark',
  description: ''
}

export default function ParticlesBenchmarkEntry() {
  const sceneEntity = useRouteScene()
  return sceneEntity ? (
    <>
      <ParticlesBenchmark rootEntity={sceneEntity} onComplete={() => {}} />
      <ProfilerUI systemUUIDs={[ParticleSystem]} />
    </>
  ) : null
}
