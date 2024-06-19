import React from 'react'

import '@etherealengine/client-core/src/world/LocationModule'
import AvatarBenchmarkEntry from './benchmarks/avatarBenchmark'
import AvatarIKBenchmarkEntry from './benchmarks/avatarIKBenchmark'
import HeapBenchmarkEntry from './benchmarks/heapBenchmark'
import ParticlesBenchmarkEntry from './benchmarks/particlesBenchmark'
import PhysicsBenchmarkEntry from './benchmarks/physicsBenchmark'
import Routes, { RouteData } from './sceneRoute'

export const benchmarks: RouteData[] = [
  {
    name: 'Avatar Benchmark',
    description: '',
    entry: AvatarBenchmarkEntry
  },
  {
    name: 'Avatar IK Benchmark',
    description: '',
    entry: AvatarIKBenchmarkEntry
  },
  {
    name: 'Particles Benchmark',
    description: '',
    entry: ParticlesBenchmarkEntry
  },
  {
    name: 'Physics Benchmark',
    description: '',
    entry: PhysicsBenchmarkEntry
  },
  {
    name: 'Heap Benchmark',
    description: '',
    entry: HeapBenchmarkEntry
  }
]

const BenchmarkRoutes = () => {
  return <Routes routes={benchmarks} header="Benchmarks" />
}

export default BenchmarkRoutes
