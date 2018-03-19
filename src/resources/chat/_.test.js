import reducer from './reducers'
import * as actions from './actions'
import * as selectors from './selectors'

it('updates the store', () => {
  const example = actions.example('New State')
  const initialState = {
    example: 'Default State'
  }
  const result = reducer(initialState, example).example
  expect(result).toBe('New State')
})

it('returns an action', () => {
  const example = actions.example('New State')
  expect(example).toEqual({
    type: 'resources/chat/EXAMPLE',
    payload: 'New State'
  })
})

it('selects something', () => {
  const selection = selectors.getExample({
    home: {
      example: 'Default State'
    }
  })
  expect(selection).toBe('Default State')
})