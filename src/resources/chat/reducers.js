import * as types from './types'
import deepmerge from 'deepmerge'

const initialState = {
  users: [],
  channels: [],
  messages: []
}

const reducer = (state = initialState, { type, payload }) => {
  if (type === types.REGISTER) {
    return {
      ...state,
      user: payload
    }
  }

  if (type === types.DEREGISTER) {
    return initialState
  }

  if (type === types.PROCESS) {
    const data = JSON.parse(payload.data)
    switch (data.type) {
      case 'error':
        if (data.message === 'User already exists') {
          return {
            ...state,
            user: null,
            message: data.message
          }
        } else {
          return {
            ...state,
            message: data.message
          }
        }
      case 'initial': 
        return {
          users: data.users,
          channels: data.channels
        }
      case 'user':
        if (data.action === 'create') {
          return {
            ...state,
            users: data.users,
            channels: data.channels,
            message: null
          }
        } else if (data.action === 'destroy') {
          return {
            ...state,
            users: data.users,
            message: null
          }
        }
      case 'message':
        return {
          ...state,
          messages: [...state.messages, {
            message: data.message,
            user: data.user,
            channel: data.channel,
            time: data.time
          }]
        }
      case 'channel':
        if (data.action === 'create') {
          return {
            ...state,
            users: data.users,
            channels: data.channels,
            message: null
          }
        } else if (data.action === 'destroy') {
          return {
            ...state,
            channels: state.channels.filter(c => c.name !== data.name),
            message: null
          }
        }
      default:
        return state
    }
  }

  return state
}

export default reducer