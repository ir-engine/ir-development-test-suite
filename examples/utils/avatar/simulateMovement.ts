import { Quaternion } from 'three'

import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { V_010, Y_180 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { defineQuery, getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
import { RigidBodyComponent } from '@etherealengine/engine/src/physics/components/RigidBodyComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'
import { leftControllerOffset, rightControllerOffset } from '@etherealengine/engine/src/avatar/functions/applyInputSourcePoseToIKTargets'

// quaternion that represents a 1 degree turn on the y axis
const q = new Quaternion()

const entitiesQuery = defineQuery([NetworkObjectComponent, RigidBodyComponent, AvatarComponent, AvatarRigComponent])

const execute = () => {
  const entities = entitiesQuery()
  q.setFromAxisAngle(V_010, Math.PI / 180 * getState(EngineState).deltaSeconds * 60)
  for (const entity of entities) {
    const rigidbody = getComponent(entity, RigidBodyComponent)
    // rigidbody.position.x = x
    // rigidbody.targetKinematicPosition.x = x
    rigidbody.body.setTranslation(rigidbody.position, true)
    rigidbody.targetKinematicRotation.multiply(q)
    const uuid = getComponent(entity, UUIDComponent)
    const headTargetEntity = NameComponent.entitiesByName[uuid + '_head']?.[0]
    const ikTargetLeftHand = NameComponent.entitiesByName[uuid + '_leftHand']?.[0]
    const ikTargetRightHand = NameComponent.entitiesByName[uuid + '_rightHand']?.[0]
    const transform = getComponent(entity, TransformComponent)
    if (headTargetEntity) {
      const elapsedSeconds = getState(EngineState).elapsedSeconds
      const rigComponent = getComponent(entity, AvatarRigComponent)
      const limitMultiplier = 1.1
      const headToFeetLength =
        (rigComponent.torsoLength + rigComponent.upperLegLength + rigComponent.lowerLegLength) * limitMultiplier
      const pivotHalfLength = rigComponent.upperLegLength * 0.5
      const minHeadHeight = (pivotHalfLength + rigComponent.lowerLegLength + rigComponent.footHeight) / limitMultiplier
      const head = getComponent(headTargetEntity, TransformComponent)
      head.position.copy(rigidbody.position)
      // const headTargetY = (Math.sin(elapsedSeconds * 2) + 1) * 0.5 * (headToFeetLength - minHeadHeight) + minHeadHeight
      // head.position.y += headTargetY
      head.position.y += 2
      head.rotation.copy(transform.rotation)
    }
    if (ikTargetLeftHand) {
      const leftHandTransform = getComponent(ikTargetLeftHand, TransformComponent)
      leftHandTransform.position.set(0.4, 2, 0.2).applyQuaternion(transform.rotation).add(transform.position)
      leftHandTransform.rotation.multiplyQuaternions(transform.rotation, Y_180).multiply(leftControllerOffset)
    }
    if (ikTargetRightHand) {
      const rightHandTransform = getComponent(ikTargetRightHand, TransformComponent)
      rightHandTransform.position.set(-0.4, 2, 0.2).applyQuaternion(transform.rotation).add(transform.position)
      rightHandTransform.rotation.multiplyQuaternions(transform.rotation, Y_180).multiply(rightControllerOffset)
    }
  }
}

export const SimulateAvatarMovementSystem = defineSystem({
  uuid: 'ee.development-test-suite.SimulateAvatarMovementSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
