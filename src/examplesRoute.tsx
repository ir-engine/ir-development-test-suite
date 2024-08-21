import React from 'react'

import '@ir-engine/engine/src/EngineModule'
import AvatarMocapEntry from './examples/avatarMocap'
import AvatarTestEntry from './examples/avatarTest'
import ComponentExamplesRoute, { subComponentExamples } from './examples/componentExamples/componentExamples'
import GLTFViewer from './examples/gltf'
import ImmersiveAR from './examples/immersiveAR'
import ImmersiveVR from './examples/immersiveVR'
import MultipleScenesEntry from './examples/multipleScenes'
import Routes, { RouteCategories } from './sceneRoute'

export const examples: RouteCategories = [
  {
    category: 'WebXR',
    routes: [
      {
        name: 'Immersive AR',
        description: 'Immersive AR example',
        entry: ImmersiveAR,
        spawnAvatar: true
      },
      {
        name: 'Immersive VR',
        description: 'Immersive VR example',
        entry: ImmersiveVR,
        spawnAvatar: true
      }
    ]
  },
  {
    category: 'Components',
    routes: subComponentExamples.map((sub) => ({
      name: sub.name,
      description: sub.description,
      entry: () => <ComponentExamplesRoute Reactor={sub.Reactor} />
    }))
  },
  {
    category: 'Avatar',
    routes: [
      {
        name: 'Mocap',
        description: 'Avatar mocap example',
        entry: AvatarMocapEntry
      },
      {
        name: 'Test',
        description: 'Load many avatars',
        entry: AvatarTestEntry
      }
    ]
  },
  {
    category: 'Scene',
    routes: [
      {
        name: 'GLTF Viewer',
        description: 'Drag and drop GLTF files',
        entry: GLTFViewer
      },
      {
        name: 'Multiple',
        description: 'multiple scenes example',
        entry: MultipleScenesEntry
      }
    ]
  }
]

const ExampleRoutes = () => {
  return <Routes routeCategories={examples} header="Examples" />
}

export default ExampleRoutes
