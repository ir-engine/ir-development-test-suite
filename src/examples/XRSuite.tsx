import React from 'react'

import { QueryReactor } from '@etherealengine/ecs/src/QueryFunctions'
import { XRDetectedMeshComponent } from '@etherealengine/spatial/src/xr/XRDetectedMeshComponent'
import { XRDetectedPlaneComponent } from '@etherealengine/spatial/src/xr/XRDetectedPlaneComponent'
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
  return (
    <>
      <Template />
      <QueryReactor Components={[XRDetectedPlaneComponent]} ChildEntityReactor={DetectedPlanes} />
      <QueryReactor Components={[XRDetectedMeshComponent]} ChildEntityReactor={DetectedMeshes} />
      <LightProbe />
    </>
  )
}
