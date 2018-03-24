import * as types from './types'
import deepmerge from 'deepmerge'

const ping = new Audio()
ping.src = require('assets/knock_brush.mp3')

const initialState = {
  users: [],
  channels: [],
  messages: []
}

const reducer = (state = initialState, { type, payload }) => {
  if (type === types.REGISTER) {
    localStorage.setItem('user', JSON.stringify(payload))
    return {
      ...state,
      user: payload
    }
  }

  if (type === types.DEREGISTER) {
    localStorage.removeItem('user')
    return initialState
  }

  if (type === types.MARK_READ) {
    return {
      ...state,
      channels: state.channels.map(c => {
        if (c.name === payload) {
          return {
            ...c,
            notify: 0
          }
        } else {
          return c
        }
      })
    }
  }

  if (type === types.SET_CHANNEL) {
    return {
      ...state,
      activeChannel: payload
    }
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
          channels: data.channels,
          activeChannel: {
            name: data.channels[0].name,
            owner: data.channels[0].owner
          }
        }
      case 'user':
        if (data.action === 'create') {
          if (!state.activeChannel) {
            return {
              ...state,
              users: data.users,
              channels: data.channels,
              message: null,
              activeChannel: {
                name: data.channels[0].name,
                owner: data.channels[0].owner
              }
            }
          }
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
          }],
          channels: state.channels.map(c => {
            if (!window.focused || (c.name === data.channel && c.name !== state.activeChannel.name)) {
              new Notification('New Message', {
                body: `New message in ${c.name} by ${data.user.name}`,
              })
            }
            if (c.name === data.channel && c.name !== state.activeChannel.name) {
              ping.play()
              return {
                ...c,
                notify: c.notify ? c.notify + 1 : 1
              }
            } else {
              return c
            }
          })
        }
      case 'channel':
        if (data.action === 'create') {
          if (data.owner === state.user) {
            return {
              ...state,
              users: data.users,
              channels: data.channels,
              message: null,
              activeChannel: {
              name: data.name,
              owner: data.owner
            }
            }
          }
          return {
            ...state,
            users: data.users,
            channels: data.channels,
            message: null
          }
        } else if (data.action === 'destroy') {
          return {
            ...state,
            channels: data.channels,
            message: null,
            activeChannel: {
              name: data.channels[0].name,
              owner: data.channels[0].owner
            }
          }
        }
      default:
        return state
    }
  }

  return state
}

export default reducer