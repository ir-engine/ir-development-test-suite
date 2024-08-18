import React, { useEffect } from 'react'

import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { LocationIcons } from '@ir-engine/client-core/src/components/LocationIcons'
import { useQuery } from '@ir-engine/ecs'
import { getComponent, updateComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { UUIDComponent } from '@ir-engine/ecs'
import { useSearchParams } from 'react-router-dom'
import { Template } from './utils/template'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import PostProcessingSettingsEditor from '@ir-engine/ui/src/components/editor/properties/postProcessing'

export default function PostProcessing() {
  const entity = useHookstate<Entity | null>(null)
  const [params] = useSearchParams()
  const sceneName = params.get('sceneName')!
  const projectName = params.get('projectName')!
  const postProEnt = useQuery([PostProcessingComponent])

  useEffect(() => {
    if (!postProEnt.length) return
    entity.set(postProEnt[0])
    EditorControlFunctions.modifyProperty = (entities, component, properties) => {
      updateComponent(entity.value!, PostProcessingComponent, properties)
    }
    getMutableState(SelectionState).selectedEntities.set([getComponent(entity.value!, UUIDComponent)])
  }, [postProEnt])

  return (
    <>
      <Template sceneName={sceneName} projectName={projectName} />
      <LocationIcons />
      <div
        style={{
          pointerEvents: 'all',
          position: 'absolute',
          top: '10%',
          left: '70%',
          background: 'white',
          overflowY: 'auto',
          height: '80%'
        }}
      >
        {entity.value && <PostProcessingSettingsEditor entity={entity.value} component={PostProcessingComponent} />}
      </div>
    </>
  )
}
