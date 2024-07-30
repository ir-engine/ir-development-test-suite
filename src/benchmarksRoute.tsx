import React from 'react'

import '@etherealengine/engine/src/EngineModule'
import AvatarBenchmarkEntry from './benchmarks/avatarBenchmark'
import AvatarIKBenchmarkEntry from './benchmarks/avatarIKBenchmark'
import HeapBenchmarkEntry from './benchmarks/heapBenchmark'
import ParticlesBenchmarkEntry from './benchmarks/particlesBenchmark'
import PhysicsBenchmarkEntry from './benchmarks/physicsBenchmark'
import Routes, { RouteCategories } from './sceneRoute'

export const benchmarks: RouteCategories = [
  {
    category: 'Avatar',
    routes: [
      {
        name: 'Basic Benchmark',
        description: '',
        entry: AvatarBenchmarkEntry
      },
      {
        name: 'IK Benchmark',
        description: '',
        entry: AvatarIKBenchmarkEntry
      }
    ]
  },
  {
    category: 'Core',
    routes: [
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
  }
]

const BenchmarkRoutes = () => {
  return <Routes routeCategories={benchmarks} header="Benchmarks" />
}

export default BenchmarkRoutes
