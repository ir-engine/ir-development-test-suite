import { Quaternion } from 'three'

import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { V_010, V_100, Q_Y_180 } from '@etherealengine/engine/src/common/constants/MathConstants'
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
import { ikTargets } from '@etherealengine/engine/src/avatar/animation/Util'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

// quaternion that represents a 1 degree turn on the y axis
const q = new Quaternion()

const footRotationOffset = new Quaternion()
  .setFromAxisAngle(V_100, Math.PI / 2)
  .multiply(new Quaternion().setFromAxisAngle(V_010, Math.PI))
  // .multiply(new Quaternion().setFromAxisAngle(V_100, -Math.PI / 6))

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
    const headTargetEntity = UUIDComponent.getEntityByUUID((uuid + ikTargets.head) as EntityUUID)
    const ikTargetLeftHand = UUIDComponent.getEntityByUUID((uuid + ikTargets.leftHand) as EntityUUID)
    const ikTargetRightHand = UUIDComponent.getEntityByUUID((uuid + ikTargets.rightHand) as EntityUUID)
    const ikTargetLeftFoot = UUIDComponent.getEntityByUUID((uuid + ikTargets.leftFoot) as EntityUUID)
    const ikTargetRightFoot = UUIDComponent.getEntityByUUID((uuid + ikTargets.rightFoot) as EntityUUID)
    const transform = getComponent(entity, TransformComponent)
    const elapsedSeconds = getState(EngineState).elapsedSeconds
    const movementFactor = (Math.sin(elapsedSeconds * 2) + 1) * 0.5
    if (headTargetEntity) {
      const rigComponent = getComponent(entity, AvatarComponent)
      const head = getComponent(headTargetEntity, TransformComponent)
      head.position.copy(rigidbody.position)
      const headTargetY = (Math.sin(elapsedSeconds * 2) + 1) * 0.5
      head.position.y += headTargetY + 1
      head.rotation.copy(transform.rotation)
    }
    const avatar = getComponent(entity, AvatarComponent)
  
    if (ikTargetLeftHand) {
      const leftHandTransform = getComponent(ikTargetLeftHand, TransformComponent)
      leftHandTransform.position.set(0.4, 1.2, 0.1 + movementFactor * 0.3).applyQuaternion(transform.rotation).add(transform.position)
      leftHandTransform.rotation.multiplyQuaternions(transform.rotation, Q_Y_180).multiply(leftControllerOffset)
    }
    if (ikTargetRightHand) {
      const rightHandTransform = getComponent(ikTargetRightHand, TransformComponent)
      rightHandTransform.position.set(-0.4, 1.2, 0.1 + movementFactor * 0.3).applyQuaternion(transform.rotation).add(transform.position)
      rightHandTransform.rotation.multiplyQuaternions(transform.rotation, Q_Y_180).multiply(rightControllerOffset)
    }
    if (ikTargetLeftFoot) {
      const leftFootTransform = getComponent(ikTargetLeftFoot, TransformComponent)
      leftFootTransform.position.set(avatar.footGap, avatar.footHeight, 0).applyQuaternion(transform.rotation).add(transform.position)
      leftFootTransform.rotation.copy(transform.rotation).multiply(footRotationOffset)
    }
    if (ikTargetRightFoot) {
      const rightFootTransform = getComponent(ikTargetRightFoot, TransformComponent)
      rightFootTransform.position.set(-avatar.footGap, avatar.footHeight, 0).applyQuaternion(transform.rotation).add(transform.position)
      rightFootTransform.rotation.copy(transform.rotation).multiply(footRotationOffset)
    }
  }
}

export const SimulateAvatarMovementSystem = defineSystem({
  uuid: 'ee.development-test-suite.SimulateAvatarMovementSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
