import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

import { Entity } from '@etherealengine/ecs/src/Entity'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { CollisionGroups, DefaultCollisionMask } from '@etherealengine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@etherealengine/spatial/src/physics/functions/getInteractionGroups'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'

export const createPhysicsObjects = (count: number) => {
  const entities = [] as Entity[]
  for (let i = 0; i < count; i++) {
    entities.push(createPhysicsObject())
  }
  return entities
}

export const createPhysicsObject = () => {
  const entity = createEntity()
  setComponent(entity, TransformComponent, { 
    position: new Vector3(2.5 - Math.random() * 5, 1 + Math.random() * 5, 2.5 - Math.random() * 5)
  })

  const rigidBodyDesc = RigidBodyDesc.dynamic()
  const colliderDesc = ColliderDesc.ball(0.1)
  colliderDesc.setCollisionGroups(getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask))
  colliderDesc.setFriction(10).setRestitution(1)

  rigidBodyDesc.setCanSleep(false)

  const physicsWorld = getState(PhysicsState).physicsWorld
  const body = Physics.createRigidBody(entity, physicsWorld, rigidBodyDesc)
  physicsWorld.createCollider(colliderDesc, body)

  return entity
}
