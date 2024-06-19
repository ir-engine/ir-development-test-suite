import { defineComponent, Entity, UndefinedEntity } from '@etherealengine/ecs'

export const EntityComponent = defineComponent({
  name: 'eepro.eetest.EntityComponent',
  onInit: (entity) => UndefinedEntity,

  onSet(entity, component, setEntity) {
    if (setEntity) component.set(setEntity as Entity)
  }
})
