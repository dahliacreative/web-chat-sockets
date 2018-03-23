import * as types from './types'

const registerUser = (name) => ({
  type: types.REGISTER,
  payload: name
})

const deRegisterUser = () => ({
  type: types.DEREGISTER
})

const processMessage = (message) => ({
  type: types.PROCESS,
  payload: message
})

export {
  processMessage,
  registerUser
}