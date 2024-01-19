import React from 'react'

import { useLocationSpawnAvatar } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { QueryReactor } from '@etherealengine/engine/src/ecs/functions/QueryFunctions'
import { XRDetectedMeshComponent } from '@etherealengine/engine/src/xr/XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from '@etherealengine/engine/src/xr/XRDetectedPlaneComponent'
import { LightProbe } from './XRLightEstimation'
import { DetectedMeshes, DetectedPlanes } from './XRMeshes'
import { Template } from './utils/template'

/**
 * All supported WebXR Features
 * - light estimation
 * - detected planes
 * @todo
 * - grabbables in hand
 * - depth occlusion
 * - hit test on detected planes and meshes
 * - hand tracking
 * - raw camera access
 * - layers
 */
export default function XRSuite() {
  useLocationSpawnAvatar()
  return (
    <>
      <Template />
      <QueryReactor Components={[XRDetectedPlaneComponent]} ChildEntityReactor={DetectedPlanes} />
      <QueryReactor Components={[XRDetectedMeshComponent]} ChildEntityReactor={DetectedMeshes} />
      <LightProbe />
    </>
  )
}
