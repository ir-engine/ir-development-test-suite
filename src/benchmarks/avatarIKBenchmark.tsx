import React from 'react'

import { SkinnedMeshTransformSystem } from '@etherealengine/engine/src/avatar/systems/AvatarAnimationSystem'
import { AvatarIKBenchmark } from '../engine/benchmarks/AvatarBenchmark'
import { useRouteScene } from '../sceneRoute'
import ProfilerUI from './utils/profilerUI'

export const metadata = {
  title: 'Avatar IK Benchmark',
  description: ''
}

export default function AvatarIKBenchmarkEntry() {
  const sceneEntity = useRouteScene()
  return sceneEntity ? (
    <>
      <AvatarIKBenchmark rootEntity={sceneEntity} onComplete={undefined as any} />
      <ProfilerUI systemUUIDs={[SkinnedMeshTransformSystem]} />
    </>
  ) : null
}
