import { combineReducers } from 'redux'
import * as types from './types'

const initialState = 'Default State'

const example = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.EXAMPLE:
      return payload
    default:
      return state
  }
}

const another = (state = false, { type, payload }) => {
  switch (type) {
    default:
      return state
  }
}

const reducer = combineReducers({
    example,
    another
})

export default reducer