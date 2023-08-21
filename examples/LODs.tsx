import React from 'react'
import { useDrop } from 'react-dnd'
import { Vector3 } from 'three'

import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import { AdminAssetUploadArgumentsType } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import {
  getComponent,
  getMutableComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VariantComponent } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { useHookstate } from '@etherealengine/hyperflux'

import { Template } from './utils/template'
import { StaticResourceType } from '@etherealengine/engine/src/schemas/media/static-resource.schema'

const LODsDND = () => {
  const filenames = useHookstate<string[]>([])

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

          const uploadPromise = uploadToFeathersService('upload-asset', files, {
            type: 'admin-file-upload',
            args: {
              project: 'ee-development-test-suite'
            } as AdminAssetUploadArgumentsType,
            variants: true
          })

          const result = (await uploadPromise.promise) as StaticResourceType[]

          console.log(result)

          const entity = createEntity()
          setComponent(entity, TransformComponent, { position: new Vector3(0, 0, -2) })
          setComponent(entity, VisibleComponent)
          setComponent(entity, NameComponent, 'LOD Test')

          setComponent(entity, ModelComponent, {
            src: result[0].url
          })
          setComponent(entity, VariantComponent, {
            levels: result.map((variant, i) => ({
              distance: (i + 1) * 5,
              loaded: false,
              src: variant.url,
              model: null,
              metadata: variant.metadata ?? {
                minDistance: 0 + i * 5,
                maxDistance: 0 + (i + 1) * 5
              }
            })),
            heuristic: 'DISTANCE'
          })
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
    <div style={{ height: '100%', width: '100%', background: 'white', fontSize: '20px' }} ref={onDropTarget}>
      Drag and drop LOD files here!
      {filenames.value.map((filename, i) => (
        <div key={filename + i}> - {filename}</div>
      ))}
    </div>
  )
}

export default function LODs() {
  return (
    <div id="dnd-container" style={{ height: '25%', width: '25%', pointerEvents: 'all' }}>
      <DndWrapper id="dnd-container">
        <Template />
        <LODsDND />
      </DndWrapper>
    </div>
  )
}
