import '@ir-engine/engine/src/EngineModule'
import { setComponent } from '@ir-engine/ecs'
import React, { useEffect } from 'react'
import { BenchmarkComponent } from './engine/Register'
import { useRouteScene } from './sceneRoute'

const BenchmarkAllRoute = () => {
  const sceneEntity = useRouteScene()

  useEffect(() => {
    if (!sceneEntity.value) return

    setComponent(sceneEntity.value, BenchmarkComponent)
    import('./engine/benchmarks/BenchmarkOrchestration')
  }, [sceneEntity])

  return <></>
}

export default BenchmarkAllRoute
