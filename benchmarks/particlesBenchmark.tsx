import React from 'react'

import { ParticlesBenchmark } from '../engine/benchmarks/ParticlesBenchmark'
import { useRouteScene } from '../sceneRoute'

export const metadata = {
  title: 'Particles Benchmark',
  description: ''
}

export default function () {
  const sceneEntity = useRouteScene()
  return sceneEntity.value ? <ParticlesBenchmark rootEntity={sceneEntity.value} onComplete={undefined as any} /> : null
}
