import React from 'react'

import '@etherealengine/client-core/src/world/LocationModule'
import Routes, { RouteData } from './sceneRoute'

const prefix = './benchmarks/'

//@ts-ignore
const importedMetadata = import.meta.glob<any>('./benchmarks/*.tsx', {
  import: 'metadata',
  eager: true
})

//@ts-ignore
const imports = import.meta.glob<any>('./benchmarks/*.tsx')
const routes = Object.entries(imports).reduce(
  (prev, [route, lazy]) => ({
    ...prev,
    [route]: { page: React.lazy(lazy), metadata: importedMetadata[route] } as RouteData
  }),
  {}
) as Record<string, RouteData>

const BenchmarkRoutes = () => {
  return <Routes routes={routes} prefix={prefix} header="Benchmarks" />
}

export default BenchmarkRoutes
