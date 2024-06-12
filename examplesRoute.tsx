import React from 'react'

import '@etherealengine/client-core/src/world/LocationModule'
import Routes, { RouteData } from './sceneRoute'

const prefix = './examples/'
//@ts-ignore
const importedMetadata = import.meta.glob<any>(
  ['./examples/componentExamples.tsx', './examples/avatarMocap.tsx', './examples/gltf.tsx'],
  {
    import: 'metadata',
    eager: true
  }
)

//@ts-ignore
const imports = import.meta.glob<any>('./examples/*.tsx')
const routes = Object.entries(imports).reduce(
  (prev, [route, lazy]) => ({
    ...prev,
    [route]: { page: React.lazy(lazy), metadata: importedMetadata[route] } as RouteData
  }),
  {}
) as Record<string, RouteData>

const ExampleRoutes = () => {
  return <Routes routes={routes} prefix={prefix} header="Examples" />
}

export default ExampleRoutes
