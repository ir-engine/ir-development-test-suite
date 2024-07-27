import React, { useEffect } from 'react'
import { useDrop } from 'react-dnd'

import { getComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '@etherealengine/ecs'

import config from '@etherealengine/common/src/config'
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { GLTFAssetState } from '@etherealengine/engine/src/gltf/GLTFState'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'

export const metadata = {
  title: 'GLTF',
  description: ''
}

const defaultSource = config.client.fileServer + '/projects/ee-development-test-suite/assets/GLTF/Duck/Duck.gltf'

const GLTF = () => {
  const filenames = useHookstate<string[]>([])

  const source = useHookstate(defaultSource)

  useEffect(() => {
    return GLTFAssetState.loadScene(source.value, source.value)
  }, [source])

  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    // GLTF and GLB files seem to only come through as Native Files for this
    accept: [...SupportedFileTypes],
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
          source.set(URL.createObjectURL(gltfFile))

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
  useEffect(() => {
    const bgColor = document.body.style.backgroundColor
    document.body.style.backgroundColor = 'gray'
    getMutableState(RendererState).gridVisibility.set(true)
    getMutableState(RendererState).physicsDebug.set(true)
    const entity = Engine.instance.viewerEntity
    setComponent(entity, CameraOrbitComponent)
    setComponent(entity, InputComponent)
    getComponent(entity, CameraComponent).position.set(0, 3, 4)

    return () => {
      document.body.style.backgroundColor = bgColor
    }
  }, [])

  return (
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
        <GLTF />
      </DndWrapper>
    </div>
  )
}
