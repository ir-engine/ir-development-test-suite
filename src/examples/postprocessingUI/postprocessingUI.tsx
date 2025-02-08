// @ts-ignore
import styles from './postprocessingUI.css?inline'

import { Entity, EntityTreeComponent, getAllComponents, getOptionalComponent, getOptionalMutableComponent } from '@ir-engine/ecs'
import { useXRUIState } from '@ir-engine/engine/src/xrui/useXRUIState'
import { useHookstate } from '@ir-engine/hyperflux'
import { PostProcessingComponent } from '@ir-engine/spatial/src/renderer/components/PostProcessingComponent'
import { Effect } from 'postprocessing'

import React, { useEffect } from 'react'


const PostprocessingUI: React.FC = () => {
  const xruiState = useXRUIState<{ settingsEntity: Entity }>()
  const settingsEntity = xruiState.settingsEntity.value
  const postProcessingComponent = getOptionalMutableComponent(settingsEntity, PostProcessingComponent)


  return (
    <>
      <style type="text/css">{styles.toString()}</style>
      <div className="PostProcessingsContainer">
        <div className="PostProcessingsHeaderContainer">
          <h1 className="PostProcessingsHeader">Effects</h1>
        </div>
        <div className="PostProcessingNamesContainer">
          {Object.entries(postProcessingComponent?.effects.value as Record<string, Effect & {isActive: boolean}>).map(([name, effectData]) => {
            return (
              <div onClick={() => postProcessingComponent?.effects[name].isActive.set(!effectData.isActive)} className="PostProcessingNameContainer" key={name}>
                <p className="PostProcessingName">{name}</p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
export default PostprocessingUI
