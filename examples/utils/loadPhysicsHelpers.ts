import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { Physics } from '@etherealengine/engine/src/physics/classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '@etherealengine/engine/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@etherealengine/engine/src/physics/functions/getInteractionGroups'
import { setTransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

export const createPhysicsObjects = (count: number) => {
  const entities = [] as Entity[]
  for (let i = 0; i < count; i++) {
    entities.push(createPhysicsObject())
  }
  return entities
}

export const createPhysicsObject = () => {
  const entity = createEntity()
  setTransformComponent(entity, new Vector3(2.5 - Math.random() * 5, 1 + Math.random() * 5, 2.5 - Math.random() * 5))

  const rigidBodyDesc = RigidBodyDesc.dynamic()
  const colliderDesc = ColliderDesc.ball(0.1)
  colliderDesc.setCollisionGroups(getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask))
  colliderDesc.setFriction(10).setRestitution(1)

  rigidBodyDesc.setCanSleep(false)

  Physics.createRigidBody(entity, Engine.instance.physicsWorld, rigidBodyDesc, [colliderDesc])

  return entity
}
