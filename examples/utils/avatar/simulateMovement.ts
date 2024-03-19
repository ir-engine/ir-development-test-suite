import { Quaternion } from 'three'

import { EntityUUID } from '@etherealengine/ecs'
import { ikTargets } from '@etherealengine/engine/src/avatar/animation/Util'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { AvatarIKTargetComponent } from '@etherealengine/engine/src/avatar/components/AvatarIKComponents'
import {
  leftControllerOffset,
  rightControllerOffset
} from '@etherealengine/engine/src/avatar/functions/applyInputSourcePoseToIKTargets'
import { Q_Y_180, V_010, V_100 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { NetworkObjectComponent } from '@etherealengine/network'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { UUIDComponent } from '@etherealengine/ecs'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { lerp } from '@etherealengine/spatial/src/common/functions/MathLerpFunctions'

const q = new Quaternion()

const entitiesQuery = defineQuery([NetworkObjectComponent, RigidBodyComponent, AvatarComponent, AvatarRigComponent])

let enabled = true
window.addEventListener('keydown', (ev) => {
  if (ev.code !== 'KeyO') return
  enabled = !enabled
})

const execute = () => {
  const entities = entitiesQuery()
  //q.setFromAxisAngle(V_010, (Math.PI / 180) * getState(ECSState).deltaSeconds * 60)
  for (const entity of entities) {
    const ownerID = getComponent(entity, NetworkObjectComponent).ownerId
    const headTargetEntity = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.head)
    const ikTargetLeftHand = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.leftHand)
    const ikTargetRightHand = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.rightHand)
    const ikTargetLeftFoot = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.leftFoot)
    const ikTargetRightFoot = AvatarIKTargetComponent.getTargetEntity(ownerID, ikTargets.rightFoot)

    const strength = lerp(AvatarIKTargetComponent.blendWeight[headTargetEntity], enabled ? 1 : 0, getState(ECSState).deltaSeconds)
    if (headTargetEntity) AvatarIKTargetComponent.blendWeight[headTargetEntity] = strength
    if (ikTargetLeftHand) AvatarIKTargetComponent.blendWeight[ikTargetLeftHand] = strength
    if (ikTargetRightHand) AvatarIKTargetComponent.blendWeight[ikTargetRightHand] = strength
    if (ikTargetLeftFoot) AvatarIKTargetComponent.blendWeight[ikTargetLeftFoot] = strength
    if (ikTargetRightFoot) AvatarIKTargetComponent.blendWeight[ikTargetRightFoot] = strength

    if (!enabled) continue

    const rigidbody = getComponent(entity, RigidBodyComponent)
    //rigidbody.body.setTranslation(rigidbody.position, true)
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
      leftFootTransform.rotation.copy(transform.rotation)

    }
    if (ikTargetRightFoot) {
      const rightFootTransform = getComponent(ikTargetRightFoot, TransformComponent)
      rightFootTransform.position
        .set(-avatar.footGap, avatar.footHeight, 0)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
      rightFootTransform.rotation.copy(transform.rotation)
    }
  }
}

export const SimulateAvatarMovementSystem = defineSystem({
  uuid: 'ee.development-test-suite.SimulateAvatarMovementSystem',
  insert: { after: PresentationSystemGroup },
  execute
})
