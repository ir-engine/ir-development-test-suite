import React from 'react'

import { PhysicsBenchmark } from '../engine/benchmarks/PhysicsBenchmark'
import { useRouteScene } from '../sceneRoute'

export const metadata = {
  title: 'Physics Benchmark',
  description: ''
}

export default function () {
  const sceneEntity = useRouteScene()
  return sceneEntity.value ? <PhysicsBenchmark rootEntity={sceneEntity.value} onComplete={undefined as any} /> : null
}
