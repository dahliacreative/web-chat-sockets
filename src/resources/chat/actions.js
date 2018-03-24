import * as types from './types'

const registerUser = (name, avatar) => ({
  type: types.REGISTER,
  payload: {
    name,
    avatar
  }
})

const deRegisterUser = () => ({
  type: types.DEREGISTER
})

const processMessage = (message) => ({
  type: types.PROCESS,
  payload: message
})

const markRead = (channel) => ({
  type: types.MARK_READ,
  payload: channel
})

const setChannel = (channel) => ({
  type: types.SET_CHANNEL,
  payload: channel
})

export {
  processMessage,
  registerUser,
  deRegisterUser,
  markRead,
  setChannel
}