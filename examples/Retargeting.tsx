import React, { useEffect } from 'react'
import {
  Bone,
  BufferGeometry,
  ConeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Scene,
  SkeletonHelper,
  SphereGeometry,
  Vector3
} from 'three'
import { VRM } from '@pixiv/three-vrm'

import { loadAvatarForPreview, resetAnimationLogic } from '@etherealengine/client-core/src/user/components/Panel3D/helperFunctions'
import { AVATAR_FILE_ALLOWED_EXTENSIONS } from '@etherealengine/common/src/constants/AvatarConstants'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import createGLTFExporter from '@etherealengine/engine/src/assets/functions/createGLTFExporter'
import { GLTF } from '@etherealengine/engine/src/assets/loaders/gltf/GLTFLoader'
import { BoneNames } from '@etherealengine/engine/src/avatar/AvatarBoneMatching'
import { AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { SkeletonUtils } from '@etherealengine/engine/src/avatar/SkeletonUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { setComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, entityExists, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addObjectToGroup, removeGroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { setVisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { defineState, getMutableState, getState, NO_PROXY, none, useHookstate } from '@etherealengine/hyperflux'

import { Template } from './utils/template'
import { rigAvatarModel } from '@etherealengine/engine/src/avatar/functions/avatarFunctions'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'

const bones = Object.keys(AvatarRigComponent.schema.rig)
console.log({ bones })

const BoneMatchedState = defineState({
  name: 'BoneMatchedState',
  initial: {} as Record<BoneNames, boolean>
})

const overrideNames = [] as string[]

const sphere = new Mesh(new SphereGeometry(0.1, 8, 8), new MeshBasicMaterial({ color: 'purple' }))
sphere.visible = false

// export const loadAvatarModelAsset = async (model: Scene) => {
//   const scene = model
//   if (!scene) return
//   const parent = new Group()
//   parent.name = 'model-parent'
//   const root = new Group()
//   root.name = 'model-root'
//   root.add(scene)
//   parent.add(root)
//   parent.userData = scene.userData

//   scene.traverse((obj: Mesh<BufferGeometry, MeshBasicMaterial>) => {
//     //TODO: To avoid the changes of the source material
//     if (obj.material && obj.material.clone) {
//       obj.material = obj.material.clone()
//       //TODO: to fix alphablend issue of some models (mostly fbx converted models)
//       if (obj.material.opacity != 0) {
//         obj.material.depthWrite = true
//       } else {
//         obj.material.depthWrite = false
//       }
//       obj.material.depthTest = true
//     }
//     // Enable shadow for avatars
//     obj.castShadow = true
//   })
//   return SkeletonUtils.clone(parent) as Object3D
// }

// export const loadAvatarForPreview = async (entity: Entity, object: Scene) => {
//   const loaded = await loadAvatarModelAsset(object) as VRM
//   if (!loaded) return
//   let scene = undefined! as Object3D
//   if (loaded.scene) scene = loaded.scene
//   else scene = loaded

//   //setupAvatarModel(entity)(loaded)
//   removeGroupComponent(entity)

//   if (scene) addObjectToGroup(entity, scene)
//   scene.traverse((obj: Object3D) => {
//     obj.layers.set(ObjectLayers.Panel)
//   })
//   scene.removeFromParent()

//   // face the camera
//   scene.rotateY(Math.PI)

//   return loaded
// }

const RetargetingDND = () => {
  const assetFile = useHookstate(null as null | File)
  const assetObject = useHookstate(null as null | GLTF)
  const boneState = useHookstate(getMutableState(BoneMatchedState))
  const rigTestEntity = useHookstate(null as null | Entity)

  const handleChangeFile = (e) => {
    const { files } = e.target
    if (files.length === 0) return
    assetFile.set(files[0])
  }

  const onTryRigging = async () => {
    if (rigTestEntity.value) {
      removeEntity(rigTestEntity.value)
      rigTestEntity.set(null)
      return
    }

    const scene = assetObject.value?.scene
    if (!scene) return

    const entity = createEntity()

    resetAnimationLogic(entity)

    const avatar = await loadAvatarForPreview(entity, SkeletonUtils.clone(scene))
    if (!entityExists(entity)) return

    if (!avatar) {
      removeEntity(entity)
      return
    }

    rigTestEntity.set(entity)

    addObjectToGroup(entity, avatar)
    setVisibleComponent(entity, true)
    setComponent(entity, NameComponent, assetFile.value!.name)
  }

  const onLoadNameMap = (ev) => {
    const file = ev.target.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      const json = JSON.parse(reader.result as string)
      overrideNames.push(...json)
      console.log('Loaded Name Map', json)
    }
    reader.readAsText(file)
  }

  const onSaveNameMap = () => {
    const fileNameWithoutExtension = assetFile.value?.name.split('.').slice(0, -1).join('.')
    const rootBone = assetObject.value!.scene.getObjectByProperty('type', 'Bone')
    if (!rootBone) return
    const boneNames = [] as string[]
    rootBone.traverse((bone: Bone) => {
      boneNames.push(bone.name)
    })
    const file = new File([JSON.stringify(boneNames, null, 2)], fileNameWithoutExtension + '.json', {
      type: 'application/json'
    })
    const blobUrl = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileNameWithoutExtension + '.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          animations: assetObject.get(NO_PROXY)!.animations // this doesnt work for some reason
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
      console.log(asset)

      const rootBone = asset.scene.getObjectByProperty('type', 'Bone')
      if (!rootBone) return

      asset.scene.animations = asset.animations

      if (overrideNames.length > 0) {
        let i = 0
        rootBone.traverse((bone: Bone) => {
          bone.name = overrideNames[i++]
        })
      }

      const clone = rootBone.clone()
      Engine.instance.scene.add(clone)
      clone.updateMatrixWorld(true)

      const helper = new SkeletonHelper(clone)
      helper.updateMatrixWorld(true)
      Engine.instance.scene.add(helper)

      clone.traverse((bone: Bone) => {
        /** bones are oriented to the average position direction of their children from their position */
        const childAveragePosition = bone.children
          .reduce((acc, child) => {
            const childPosition = child.getWorldPosition(new Vector3())
            return acc.add(childPosition)
          }, new Vector3())
          .divideScalar(bone.children.length)

        const boneLength = bone.getWorldPosition(new Vector3()).distanceTo(childAveragePosition)

        const boneDirection = new Quaternion()
          .setFromUnitVectors(
            bone.getWorldPosition(new Vector3()).sub(childAveragePosition).normalize(),
            new Vector3(0, 1, 0)
          )
          .invert()

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
    const boneName = useHookstate(bone.name)

    const boneHelper = Engine.instance.scene.getObjectByName(boneName.value + '--helper') as Mesh<
      ConeGeometry,
      MeshBasicMaterial
    >
    const isBone = bone.type === 'Bone'

    const mouseOver = useHookstate(false)
    const boneState = useHookstate(getMutableState(BoneMatchedState))

    const nextUnmatchedBoneName = nextUnmatchedBone(boneName.value as BoneNames)

    const setBoneName = (name: string) => {
      if (!isBone) return
      bone.name = name
      boneHelper.name = name + '--helper'
      boneName.set(name)
    }

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
      console.log('bone match')
      getMutableState(BoneMatchedState)[nextUnmatchedBoneName].set(true)
      setBoneName(nextUnmatchedBoneName)
    }

    const clear = () => {
      if (!getState(BoneMatchedState)[bone.name]) return
      getMutableState(BoneMatchedState)[bone.name].set(none)
    }

    const changeBoneName = (ev) => {
      if (getState(BoneMatchedState)[ev.target.value]) return
      if (!bones.includes(boneName.value) && bones.includes(ev.target.value)) {
        getMutableState(BoneMatchedState)[ev.target.value].set(true)
      }
      if (bones.includes(boneName.value) && !bones.includes(ev.target.value)) {
        getMutableState(BoneMatchedState)[boneName.value].set(none)
      }
      setBoneName(ev.target.value)
    }

    return (
      <>
        <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          {bone.type} -{' '}
          <input
            className="outline outline-1"
            style={{
              color: bone.isBone ? (nextUnmatchedBoneName ? (mouseOver.value ? '#999900' : 'red') : 'green') : 'black'
            }}
            type="text"
            value={boneName.value}
            onChange={changeBoneName}
          />{' '}
          {mouseOver.value ? (
            nextUnmatchedBoneName ? (
              <button style={{ color: 'lightblue' }} onClick={boneMatch}>
                - Make {nextUnmatchedBoneName}
              </button>
            ) : (
              <button style={{ color: 'red' }} onClick={clear}>
                Clear
              </button>
            )
          ) : (
            <></>
          )}
        </div>
        <div key={bone.uuid} style={{ paddingLeft: '5px' }}>
          {bone.children.map((child: Bone) => (
            <BonesTree key={child.uuid} bone={child} />
          ))}
        </div>
      </>
    )
  }

  const onSkip = () => {
    if (!nextUnmatchedBoneName) return
    boneState[nextUnmatchedBoneName].set(true)
  }

  const nextUnmatchedBoneName = nextUnmatchedBone()

  const assetScene = assetObject.value?.scene as any as Bone

  return (
    <div style={{ fontSize: '16px' }}>
      {!assetScene && (
        <>
          <div>
            Asset
            <input type="file" name="avatarFile" accept={AVATAR_FILE_ALLOWED_EXTENSIONS} onChange={handleChangeFile} />
          </div>
          <div>
            JSON Name Map
            <input type="file" name="jsonFile" accept={'.json'} onChange={onLoadNameMap} />
          </div>
        </>
      )}
      {assetScene && (
        <>
          {nextUnmatchedBoneName && (
            <div>
              <button className="outline outline-1" onClick={onSkip}>
                Skip <span style={{ color: 'red' }}>{nextUnmatchedBoneName}</span>
              </button>
            </div>
          )}
          {
            <div>
              <button className="outline outline-1" onClick={onTryRigging}>
                {rigTestEntity.value ? 'Remove Rig' : 'Try Rig'}
              </button>
            </div>
          }
          {!nextUnmatchedBoneName && <div style={{ color: 'green' }}>Success!</div>}
          <div>
            <button className="outline outline-1" onClick={onSave}>
              Save Asset
            </button>
            <br />
            <button className="outline outline-1" onClick={onSaveNameMap}>
              Save Names as JSON
            </button>
          </div>
          <br />
          <div>-- Tree --</div>
          <BonesTree bone={assetScene} />
        </>
      )}
    </div>
  )
}

export default function Retargeting() {
  return (
    <div
      id="dnd-container"
      style={{ background: 'white', width: 'fit-content', pointerEvents: 'all', overflow: 'auto', height: '95%' }}
    >
      <DndWrapper id="dnd-container">
        <Template />
        <RetargetingDND />
      </DndWrapper>
    </div>
  )
}
