import home from 'resources/home'
import deepmerge from 'deepmerge'

const resources = (state = {}, { type, payload, meta }) => {
  const addToEntities = type.includes('FULFILLED') && meta && meta.addToEntities
  if (addToEntities) {
    return deepmerge(state, payload.data)
  }
  return state
}

export default {
  resources,
  home
}