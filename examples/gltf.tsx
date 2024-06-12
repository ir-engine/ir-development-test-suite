import React, { useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { Vector3 } from 'three'

import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { useHookstate } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'

import { Entity } from '@etherealengine/ecs'

import { useRouteScene } from '../sceneRoute'
import { useExampleEntity } from './utils/common/entityUtils'

export const metadata = {
  title: 'GLTF',
  description: ''
}

const GLTF = (props: { sceneEntity: Entity }) => {
  const filenames = useHookstate<string[]>([])
  const entity = useExampleEntity(props.sceneEntity)

  useEffect(() => {
    setComponent(entity, TransformComponent, { position: new Vector3(0, 0, -2) })
    setComponent(entity, VisibleComponent)
    setComponent(entity, NameComponent, 'GLTF Viewer')
    setComponent(entity, ModelComponent)
  }, [])

  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    accept: [...SupportedFileTypes, '.glb'],
    async drop(item: any, monitor) {
      if (item.files) {
        const dndItem = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())
        try {
          const files = (await Promise.all(
            entries.map((entry) => new Promise((resolve, reject) => entry.file(resolve, reject)))
          )) as File[]
          filenames.set(files.map((file) => file.name))

          const gltfFile = files[0]
          setComponent(entity, ModelComponent, { src: URL.createObjectURL(gltfFile) })
          console.log(gltfFile)
        } catch (err) {
          console.error(err)
        }
      }
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isUploaded: !monitor.getItem()?.files
    })
  })

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: 'white',
        fontSize: '20px',
        position: 'relative',
        color: 'black'
      }}
      ref={onDropTarget}
    >
      Drag and drop GLTF files here!
      {filenames.value.map((filename, i) => (
        <div key={filename + i}> - {filename}</div>
      ))}
    </div>
  )
}

export default function GLTFViewer() {
  const sceneEntity = useRouteScene()

  return sceneEntity.value ? (
    <div
      id="dnd-container"
      style={{
        height: '25%',
        width: '25%',
        pointerEvents: 'all',
        position: 'absolute',
        zIndex: 1000,
        right: 0,
        top: 0
      }}
    >
      <DndWrapper id="dnd-container">
        <GLTF sceneEntity={sceneEntity.value} />
      </DndWrapper>
    </div>
  ) : null
}
