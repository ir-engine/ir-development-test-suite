import { Quaternion } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ikTargets } from '@etherealengine/engine/src/avatar/animation/Util'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { AvatarIKTargetComponent } from '@etherealengine/engine/src/avatar/components/AvatarIKComponents'
import {
  leftControllerOffset,
  rightControllerOffset
} from '@etherealengine/engine/src/avatar/functions/applyInputSourcePoseToIKTargets'
import { Q_Y_180, V_010, V_100 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { EngineState } from '@etherealengine/engine/src/EngineState'
import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
import { RigidBodyComponent } from '@etherealengine/engine/src/physics/components/RigidBodyComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'
import { ECSState } from '@etherealengine/ecs/src/ECSState'

const q = new Quaternion()

const footRotationOffset = new Quaternion()
  .setFromAxisAngle(V_100, Math.PI / 2)
  .multiply(new Quaternion().setFromAxisAngle(V_010, Math.PI))

const entitiesQuery = defineQuery([NetworkObjectComponent, RigidBodyComponent, AvatarComponent, AvatarRigComponent])

let enabled = true
window.addEventListener('keydown', (ev) => {
  if (ev.code !== 'KeyO') return
  enabled = !enabled
})

const execute = () => {
  const entities = entitiesQuery()
  q.setFromAxisAngle(V_010, (Math.PI / 180) * getState(ECSState).deltaSeconds * 60)
  for (const entity of entities) {
    const uuid = getComponent(entity, UUIDComponent)
    const headTargetEntity = UUIDComponent.getEntityByUUID((uuid + ikTargets.head) as EntityUUID)
    const ikTargetLeftHand = UUIDComponent.getEntityByUUID((uuid + ikTargets.leftHand) as EntityUUID)
    const ikTargetRightHand = UUIDComponent.getEntityByUUID((uuid + ikTargets.rightHand) as EntityUUID)
    const ikTargetLeftFoot = UUIDComponent.getEntityByUUID((uuid + ikTargets.leftFoot) as EntityUUID)
    const ikTargetRightFoot = UUIDComponent.getEntityByUUID((uuid + ikTargets.rightFoot) as EntityUUID)

    if (headTargetEntity) AvatarIKTargetComponent.blendWeight[headTargetEntity] = enabled ? 1 : 0
    if (ikTargetLeftHand) AvatarIKTargetComponent.blendWeight[ikTargetLeftHand] = enabled ? 1 : 0
    if (ikTargetRightHand) AvatarIKTargetComponent.blendWeight[ikTargetRightHand] = enabled ? 1 : 0
    if (ikTargetLeftFoot) AvatarIKTargetComponent.blendWeight[ikTargetLeftFoot] = enabled ? 1 : 0
    if (ikTargetRightFoot) AvatarIKTargetComponent.blendWeight[ikTargetRightFoot] = enabled ? 1 : 0

    if (!enabled) continue

    const rigidbody = getComponent(entity, RigidBodyComponent)
    // rigidbody.position.x = x
    // rigidbody.targetKinematicPosition.x = x
    rigidbody.body.setTranslation(rigidbody.position, true)
    rigidbody.targetKinematicRotation.multiply(q)
    const transform = getComponent(entity, TransformComponent)
    const elapsedSeconds = getState(ECSState).elapsedSeconds
    const movementFactor = (Math.sin(elapsedSeconds * 2) + 1) * 0.5
    if (headTargetEntity) {
      const head = getComponent(headTargetEntity, TransformComponent)
      head.position.copy(rigidbody.position)
      const headTargetY = (Math.sin(elapsedSeconds * 2) + 1) * 0.5
      head.position.y += headTargetY + 1
      head.rotation.copy(transform.rotation)
    }
    const avatar = getComponent(entity, AvatarComponent)

    if (ikTargetLeftHand) {
      const leftHandTransform = getComponent(ikTargetLeftHand, TransformComponent)
      leftHandTransform.position
        .set(0.4, 1.2, 0.1 + movementFactor * 0.3)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      leftHandTransform.rotation.multiplyQuaternions(transform.rotation, Q_Y_180).multiply(leftControllerOffset)
    }
    if (ikTargetRightHand) {
      const rightHandTransform = getComponent(ikTargetRightHand, TransformComponent)
      rightHandTransform.position
        .set(-0.4, 1.2, 0.1 + movementFactor * 0.3)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      rightHandTransform.rotation.multiplyQuaternions(transform.rotation, Q_Y_180).multiply(rightControllerOffset)
    }
    if (ikTargetLeftFoot) {
      const leftFootTransform = getComponent(ikTargetLeftFoot, TransformComponent)
      leftFootTransform.position
        .set(avatar.footGap, avatar.footHeight, 0)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      leftFootTransform.rotation.copy(transform.rotation).multiply(footRotationOffset)
    }
    if (ikTargetRightFoot) {
      const rightFootTransform = getComponent(ikTargetRightFoot, TransformComponent)
      rightFootTransform.position
        .set(-avatar.footGap, avatar.footHeight, 0)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      rightFootTransform.rotation.copy(transform.rotation).multiply(footRotationOffset)
    }
  }
}

export const SimulateAvatarMovementSystem = defineSystem({
  uuid: 'ee.development-test-suite.SimulateAvatarMovementSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
