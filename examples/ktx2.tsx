import React, { } from 'react'
import { useDrop } from 'react-dnd'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'

import { Template } from './template'
import { DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Texture, sRGBEncoding } from 'three'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

const mesh = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ side: DoubleSide }))
mesh.position.y += 1
mesh.updateMatrixWorld(true)
Engine.instance.scene.add(mesh)

const KTX2DND = () => {
  const [{ canDrop, isOver, isDragging, isUploaded }, onDropTarget] = useDrop({
    accept: [...SupportedFileTypes, '.ktx2'],
    async drop(item: any, monitor) {
      let file
      if (item.files) {
        const dndItem: any = monitor.getItem()
        const entries = Array.from(dndItem.items).map((item: any) => item.webkitGetAsEntry())
        try {
          file = await new Promise((resolve, reject) => entries[0].file(resolve, reject))
        } catch (err) {
          console.error(err)
        }
      }

      if (file.name.endsWith('.ktx2')) {
        const url = URL.createObjectURL(file)
        const ktxLoader = Engine.instance.gltfLoader.ktx2Loader
        if (!ktxLoader) throw new Error('KTX2Loader not yet initialized')
        ktxLoader.load(
          url,
          (texture) => {
            console.log('KTX2Loader loaded texture', texture)
            texture.encoding = sRGBEncoding
            texture.needsUpdate = true
            mesh.material.map = texture
            mesh.material.needsUpdate = true
          },
          () => { },
          () => { }
        )
        return
      }

      const reader = new FileReader();
      reader.addEventListener('load', function (event) {
        function imgCallback(event) {
          const texture = new Texture(event.target)
          texture.encoding = sRGBEncoding
          texture.needsUpdate = true
          mesh.material.map = texture
          mesh.material.needsUpdate = true
        }

        const img = new Image()
        img.onload = imgCallback
        img.src = event.target!.result! as string
      })

      reader.readAsDataURL(file)
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isUploaded: !monitor.getItem()?.files
    })
  })

  return <div style={{ height: '100%', width: '100%', background: 'white' }} ref={onDropTarget}>Drag and drop textures here!</div>
}

export default function KTX2() {

  return (
    <div id="dnd-container" style={{ height: '25%', width: '25%', pointerEvents: 'all' }}>
      <DndWrapper id="dnd-container">
        <Template />
        <KTX2DND />
      </DndWrapper>
    </div>
  )
}
