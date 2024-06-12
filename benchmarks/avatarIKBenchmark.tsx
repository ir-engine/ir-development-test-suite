import React from 'react'

import { AvatarIKBenchmark } from '../engine/benchmarks/AvatarBenchmark'
import { useRouteScene } from '../sceneRoute'

export const metadata = {
  title: 'Avatar IK Benchmark',
  description: ''
}

export default function () {
  const sceneEntity = useRouteScene()
  return sceneEntity.value ? <AvatarIKBenchmark rootEntity={sceneEntity.value} onComplete={undefined as any} /> : null
}
