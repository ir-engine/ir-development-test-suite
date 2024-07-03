import React from 'react'

import '@etherealengine/engine/src/EngineModule'
import AvatarMocapEntry from './examples/avatarMocap'
import AvatarTestEntry from './examples/avatarTest'
import ComponentExamplesRoute, { subComponentExamples } from './examples/componentExamples/componentExamples'
import GLTFViewer from './examples/gltf'
import ImmersiveVR from './examples/immersiveVR'
import MultipleScenesEntry from './examples/multipleScenes'
import Routes, { RouteData } from './sceneRoute'
import ImmersiveAR from './examples/immersiveAR'

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
  },
  {
    name: 'Multiple Scenes',
    description: 'multiple scenes example',
    entry: MultipleScenesEntry
  },
  {
    name: 'Immersive AR',
    description: 'Immersive AR example',
    entry: ImmersiveAR
  },
  {
    name: 'Immersive VR',
    description: 'Immersive VR example',
    entry: ImmersiveVR
  }
]

const ExampleRoutes = () => {
  return <Routes routes={examples} header="Examples" />
}

export default ExampleRoutes
