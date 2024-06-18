import React from 'react'

import '@etherealengine/client-core/src/world/LocationModule'
import AvatarMocapEntry from './examples/avatarMocap'
import AvatarTestEntry from './examples/avatarTest'
import ComponentExamplesRoute, { subComponentExamples } from './examples/componentExamples/componentExamples'
import GLTFViewer from './examples/gltf'
import Routes, { RouteData } from './sceneRoute'

export const examples: RouteData[] = [
  {
    name: 'Components Example',
    description: 'Component examples',
    entry: ComponentExamplesRoute,
    sub: subComponentExamples.map((sub) => ({
      name: sub.name,
      description: sub.description,
      props: { Reactor: sub.Reactor }
    }))
  },
  {
    name: 'Avatar Mocap',
    description: 'Avatar mocap example',
    entry: AvatarMocapEntry
  },
  {
    name: 'Avatar Test',
    description: 'Load many avatars',
    entry: AvatarTestEntry
  },
  {
    name: 'GLTF Viewer',
    description: 'Drag and drop GLTF files',
    entry: GLTFViewer
  }
]

const ExampleRoutes = () => {
  return <Routes routes={examples} header="Examples" />
}

export default ExampleRoutes
