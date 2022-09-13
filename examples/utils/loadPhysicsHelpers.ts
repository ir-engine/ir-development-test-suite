import { Engine } from "@xrengine/engine/src/ecs/classes/Engine"
import { createEntity } from "@xrengine/engine/src/ecs/functions/EntityFunctions"
import { Physics } from "@xrengine/engine/src/physics/classes/Physics"
import { CollisionGroups, DefaultCollisionMask } from "@xrengine/engine/src/physics/enums/CollisionGroups"
import { getInteractionGroups } from "@xrengine/engine/src/physics/functions/getInteractionGroups"
import { setTransformComponent } from "@xrengine/engine/src/transform/components/TransformComponent"
import { Vector3 } from "three"
import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { Entity } from "@xrengine/engine/src/ecs/classes/Entity"

export const createPhysicsObjects = (count: number) => {
  const entities = [] as Entity[]
  for (let i = 0; i < count; i++) {
    entities.push(createPhysicsObject())
  }
  return entities
}

export const createPhysicsObject = () => {
  const world = Engine.instance.currentWorld

  const entity = createEntity()
  setTransformComponent(entity, new Vector3(2.5 - Math.random() * 5, Math.random() * 5, 2.5 - Math.random() * 5))
  
  const rigidBodyDesc = RigidBodyDesc.dynamic()
  const colliderDesc = ColliderDesc.ball(0.1)
  colliderDesc.setCollisionGroups(
    getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
  )
  colliderDesc.setFriction(10).setRestitution(1)

  rigidBodyDesc.setCanSleep(false)

  Physics.createRigidBody(entity, world.physicsWorld, rigidBodyDesc, [colliderDesc])

  return entity
}
