import * as types from './types'
import deepmerge from 'deepmerge'

const ping = new Audio()
ping.src = require('assets/definite.mp3')

const initialState = {
  users: [],
  channels: [],
  messages: [],
  dms: []
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

  if (type === types.MARK_READ_USER) {
    return {
      ...state,
      users: state.users.map(u => {
        if (u.name === payload) {
          return {
            ...u,
            notify: 0
          }
        } else {
          return u
        }
      })
    }
  }

  if (type === types.SET_CHANNEL) {
    return {
      ...state,
      activeChannel: payload,
      activeUser: null
    }
  }

  if (type === types.SET_USER) {
    return {
      ...state,
      activeChannel: null,
      activeUser: payload
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
      case 'user':
        if (data.action === 'create') {
          if (!state.activeChannel && !state.activeUser) {
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
            if (!window.focused || !state.activeChannel && c.name === data.channel || (c.name === data.channel && c.name !== state.activeChannel.name)) {
              new Notification('New Message', {
                body: `New message in ${c.name} by ${data.user.name}`,
              })
            }
            if (!state.activeChannel && c.name === data.channel || c.name === data.channel && c.name !== state.activeChannel.name) {
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
      case 'dm':
        return {
          ...state,
          dms: [...state.dms, {
            ...data
          }],
          users: state.users.map(u => {
            if (!window.focused || ((u.name === data.dm.them || u.name === data.dm.me) && u.name !== state.user.name && u.name !== state.activeUser)) {
              new Notification('New Message', {
                body: `New message from ${u.name}`,
              })
            }
            if ((u.name === data.dm.them || u.name === data.dm.me) && u.name !== state.user.name && u.name !== state.activeUser) {
              ping.play()
              return {
                ...u,
                notify: u.notify ? u.notify + 1 : 1
              }
            } else {
              return u
            }
          })
        }
      case 'channel':
        if (data.action === 'create') {
          if (data.owner === state.user.name) {
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
          if (state.activeChannel && state.activeChannel.name === data.name) {
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
          return {
            ...state,
            channels: data.channels,
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