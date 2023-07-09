import React, { useEffect, useRef } from 'react'

import { Template } from './utils/template'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { NO_PROXY, defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { createEntity, entityExists, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addObjectToGroup, removeGroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { AVATAR_FILE_ALLOWED_EXTENSIONS } from '@etherealengine/common/src/constants/AvatarConstants'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { SkeletonUtils } from '@etherealengine/engine/src/avatar/SkeletonUtils'
import { Bone, BufferGeometry, ConeGeometry, Group, Mesh, MeshBasicMaterial, Object3D, Quaternion, Scene, SkeletonHelper, SphereGeometry, Vector3 } from 'three'
import { setupAvatarModel } from '@etherealengine/engine/src/avatar/functions/avatarFunctions'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { GLTF } from '@etherealengine/engine/src/assets/loaders/gltf/GLTFLoader'
import createGLTFExporter from '@etherealengine/engine/src/assets/functions/createGLTFExporter'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { BoneNames } from '@etherealengine/engine/src/avatar/AvatarBoneMatching'
import { resetAnimationLogic } from '@etherealengine/client-core/src/user/components/Panel3D/helperFunctions'
import { setVisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'

const bones = Object.keys(AvatarRigComponent.schema.rig)
console.log({ bones })

const BoneMatchedState = defineState({
  name: 'BoneMatchedState',
  initial: {} as Record<BoneNames, boolean>,
})


const sphere = new Mesh(new SphereGeometry(0.1, 8, 8), new MeshBasicMaterial({ color: 'purple' }))
sphere.visible = false

/**
 * @todo
 * - add button to select bone
 * - make bone green once it's rigged (or red if it's not)
 */

export const loadAvatarModelAsset = async (model: Scene) => {
  const scene = model
  if (!scene) return
  const parent = new Group()
  parent.name = 'model-parent'
  const root = new Group()
  root.name = 'model-root'
  root.add(scene)
  parent.add(root)
  parent.userData = scene.userData

  scene.traverse((obj: Mesh<BufferGeometry, MeshBasicMaterial>) => {
    //TODO: To avoid the changes of the source material
    if (obj.material && obj.material.clone) {
      obj.material = obj.material.clone()
      //TODO: to fix alphablend issue of some models (mostly fbx converted models)
      if (obj.material.opacity != 0) {
        obj.material.depthWrite = true
      } else {
        obj.material.depthWrite = false
      }
      obj.material.depthTest = true
    }
    // Enable shadow for avatars
    obj.castShadow = true
  })
  return SkeletonUtils.clone(parent) as Object3D
}

export const loadAvatarForPreview = async (entity: Entity, object: Scene) => {
  const parent = await loadAvatarModelAsset(object)
  if (!parent) return
  setupAvatarModel(entity)(parent)
  removeGroupComponent(entity)
  addObjectToGroup(entity, parent)
  // parent.traverse((obj: Object3D) => {
  //   obj.layers.set(ObjectLayers.Panel)
  // })
  // parent.removeFromParent()
  // animateModel(entity)
  return parent
}

const RetargetingDND = () => {
  const assetFile = useHookstate(null as null | File)
  const assetObject = useHookstate(null as null | GLTF)
  const boneState = useHookstate(getMutableState(BoneMatchedState))

  const handleChangeFile = (e) => {
    const { files } = e.target

    if (files.length === 0) {
      return
    }

    assetFile.set(files[0])
  }

  const onTryRigging = async () => {
    const scene = assetObject.value?.scene
    if (!scene) return

    

    const entity = createEntity()

    resetAnimationLogic(entity)

    const avatar = await loadAvatarForPreview(entity, scene)
    if (!entityExists(entity)) return

    if (!avatar) {
      removeEntity(entity)
      return
    }

    addObjectToGroup(entity, avatar)
    setVisibleComponent(entity, true)
    setComponent(entity, NameComponent, assetFile.value!.name)

    return () => {
      removeEntity(entity)
    }
  }

  const onSave = async () => {
    const scene = assetObject.value?.scene
    if (!scene) return

    const exporter = createGLTFExporter()
    const isGLTF = /\.gltf$/.test(assetFile.value?.name!)
    const glb: ArrayBuffer = await new Promise((resolve) => {
      exporter.parse(
        scene,
        (gltf: ArrayBuffer) => {
          resolve(gltf)
        },
        (error) => {
          throw error
        },
        {
          binary: !isGLTF,
          embedImages: !isGLTF,
          includeCustomExtensions: true,
        }
      )
    })

    const file = new File([glb], assetFile.value?.name!)

    const blobUrl = URL.createObjectURL(file)

    const link = document.createElement('a')

    link.href = blobUrl
    link.download = assetFile.value?.name!

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  }

  useEffect(() => {
    if (!assetFile.value) return
    const url = URL.createObjectURL(assetFile.value) + '#' + assetFile.value.name
    AssetLoader.loadAsync(url).then((asset: GLTF) => {
      assetObject.set(asset)

      const rootBone = asset.scene.getObjectByProperty('type', 'Bone')
      if (!rootBone) return

      const clone = rootBone.clone()
      Engine.instance.scene.add(clone)
      clone.updateMatrixWorld(true)

      const helper = new SkeletonHelper(clone)
      helper.updateMatrixWorld(true)
      Engine.instance.scene.add(helper)

      clone.traverse((bone: Bone) => {
        /** bones are oriented to the average position direction of their children from their position */
        const childAveragePosition = bone.children.reduce((acc, child) => {
          const childPosition = child.getWorldPosition(new Vector3())
          return acc.add(childPosition)
        }, new Vector3()).divideScalar(bone.children.length)

        const boneLength = bone.getWorldPosition(new Vector3()).distanceTo(childAveragePosition)

        const boneDirection = new Quaternion().setFromUnitVectors(
          bone.getWorldPosition(new Vector3()).sub(childAveragePosition).normalize(),
          new Vector3(0, 1, 0)
        ).invert()

        const helper = new Mesh(new ConeGeometry(0.1, 1, 8), new MeshBasicMaterial({ color: 'red' }))
        helper.geometry.scale(1, -1, 1)
        helper.geometry.translate(0, -0.5, 0)
        helper.scale.setScalar(boneLength)
        bone.getWorldPosition(helper.position)
        helper.quaternion.copy(boneDirection)
        helper.updateMatrixWorld(true)
        helper.name = bone.name + '--helper'
        Engine.instance.scene.add(helper)

        if (bones.includes(bone.name)) getMutableState(BoneMatchedState)[bone.name].set(true)
      })
      Engine.instance.scene.add(sphere)
    })
  }, [assetFile])

  const nextUnmatchedBone = (boneName?: BoneNames) => {
    if (boneName && boneState.value[boneName]) return null
    const boneIndex = boneName ? bones.indexOf(boneName) : 0
    for (let i = boneIndex + 1; i < bones.length; i++) {
      if (!boneState.value[bones[i]]) return bones[i]
    }
    return null
  }

  const BonesTree = (props: { bone: Bone }) => {
    const { bone } = props
    const boneName = useHookstate(bone?.name)
    if (!bone) return null
    const boneHelper = Engine.instance.scene.getObjectByName(bone.name + '--helper') as Mesh<ConeGeometry, MeshBasicMaterial>
    const isBone = bone.type === 'Bone'

    const mouseOver = useHookstate(false)
    const boneState = useHookstate(getMutableState(BoneMatchedState))

    const nextUnmatchedBoneName = nextUnmatchedBone(bone.name as BoneNames)

    useEffect(() => {
      if (!isBone) return
      bone.name = boneName.value
      boneHelper.name = boneName.value + '--helper'
    }, [boneName])

    useEffect(() => {
      if (!isBone || !boneHelper?.material) return
      if (nextUnmatchedBoneName) {
        if (mouseOver.value) {
          boneHelper.material.color.set('yellow')
          boneHelper.getWorldPosition(sphere.position)
          sphere.scale.setScalar(boneHelper.scale.x)
          sphere.updateMatrixWorld(true)
          sphere.visible = true
          return () => {
            sphere.visible = false
          }
        } else {
          boneHelper.material.color.set('red')
        }
      } else {
        boneHelper.material.color.set('green')
      }
    }, [mouseOver, boneName, boneState])

    const onMouseEnter = () => {
      mouseOver.set(true)
    }

    const onMouseLeave = () => {
      mouseOver.set(false)
    }

    const boneMatch = () => {
      if (!nextUnmatchedBoneName) return
      getMutableState(BoneMatchedState)[nextUnmatchedBoneName].set(true)
      boneName.set(nextUnmatchedBoneName)
    }

    const changeBoneName = (ev) => {
      if (getState(BoneMatchedState)[ev.target.value]) return
      boneName.set(ev.target.value)
    }

    return <>
      <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} >
        {bone.type} - <input className='outline outline-1' style={{ color: bone.isBone ? nextUnmatchedBoneName ? mouseOver.value ? '#999900' : 'red' : 'green' : 'black' }} type='text' value={boneName.value} onChange={changeBoneName}
        /> {mouseOver.value && nextUnmatchedBoneName && <button style={{ color: 'lightblue' }} onClick={boneMatch}>- Make {nextUnmatchedBoneName}</button>}
      </div>
      <div key={bone.uuid} style={{ paddingLeft: '5px' }}>
        {bone.children.map((child: Bone) => <BonesTree key={child.uuid} bone={child} />)}
      </div>
    </>
  }

  const onSkip = () => {
    if (!nextUnmatchedBoneName) return
    boneState[nextUnmatchedBoneName].set(true)
  }

  const nextUnmatchedBoneName = nextUnmatchedBone()

  const assetScene = assetObject.value?.scene as any as Bone

  return <div style={{ fontSize: '16px' }} >
    <input
      type="file"
      name="avatarFile"
      accept={AVATAR_FILE_ALLOWED_EXTENSIONS}
      onChange={handleChangeFile}
    />
    {assetScene && <>
      {nextUnmatchedBoneName && <div><button className='outline outline-1' onClick={onSkip}>Skip <span style={{ color: 'red' }}>{nextUnmatchedBoneName}</span></button></div>}
      {<div><button className='outline outline-1' onClick={onTryRigging}>Try Rig</button></div>}
      {!nextUnmatchedBoneName && <div style={{ color: 'green' }}>Success!</div>}
      <div><button className='outline outline-1' onClick={onSave}>Save</button></div>
      <br />
      <div>-- Tree --</div>
      <BonesTree bone={assetScene} />
    </>}
  </div>
}

export default function Retargeting() {
  return (
    <div id="dnd-container" style={{ background: 'white', width: 'fit-content', pointerEvents: 'all', overflow: 'auto', height: '95%' }}>
      <DndWrapper id="dnd-container">
        <Template />
        <RetargetingDND />
      </DndWrapper>
    </div>
  )
}
