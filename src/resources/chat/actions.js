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

const markReadUser = (user) => ({
  type: types.MARK_READ_USER,
  payload: user
})

const setChannel = (channel) => ({
  type: types.SET_CHANNEL,
  payload: channel
})

const setUser = (user) => ({
  type: types.SET_USER,
  payload: user
})

export {
  processMessage,
  registerUser,
  deRegisterUser,
  markRead,
  markReadUser,
  setChannel,
  setUser
}