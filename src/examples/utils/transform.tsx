import { State } from '@ir-engine/hyperflux'
import EulerInput from '@ir-engine/ui/src/components/editor/input/Euler'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import Vector3Input from '@ir-engine/ui/src/components/editor/input/Vector3'
import PropertyGroup from '@ir-engine/ui/src/components/editor/properties/group'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Euler, Quaternion, Vector3 } from 'three'

export const Transform = (props: {
  title?: string
  transformState: State<{ position: Vector3; rotation: Quaternion; scale: Vector3 }>
}) => {
  const { transformState } = props
  const { t } = useTranslation()

  const { position, rotation, scale } = transformState.value

  const onChangePosition = (value: Vector3) => transformState.position.set(new Vector3().copy(value))
  const onChangeRotation = (value: Euler) => transformState.rotation.set(new Quaternion().setFromEuler(value))
  const onChangeScale = (value: Vector3) => transformState.scale.set(new Vector3().copy(value))

  return (
    <PropertyGroup
      minimizedDefault={false}
      name={props.title ?? t('editor:properties.transform.title')}
    >
      <InputGroup name="Position" label={t('editor:properties.transform.lbl-position')}>
        <Vector3Input smallStep={0.01} mediumStep={0.1} largeStep={1} value={position} onChange={onChangePosition} />
      </InputGroup>
      <InputGroup name="Rotation" label={t('editor:properties.transform.lbl-rotation')}>
        <EulerInput quaternion={rotation} onChange={onChangeRotation} unit="°" />
      </InputGroup>
      <InputGroup name="Scale" label={t('editor:properties.transform.lbl-scale')}>
        <Vector3Input
          uniformScaling
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={1}
          value={scale}
          onChange={onChangeScale}
        />
      </InputGroup>
    </PropertyGroup>
  )
}
