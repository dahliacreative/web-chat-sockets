import React from 'react'
import { connect } from 'react-redux'
import { actions } from 'resources/chat'
import './styles/index.css'

import Chat from 'components/Chat/view'
import Avatar from 'react-avatar-edit'

let ws

class App extends React.Component {
  constructor(props) {
    super(props)
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      this.props.reRegisterUser(user.name, user.avatar)
    }
    this.state = {name: '', message: ''}
  }
  componentDidMount() {
    if (Notification.permission !== "granted") {
      Notification.requestPermission()
    }
    this.login.focus()
  }
  onClose = () => {
    this.setState({preview: null})
  }
  
  onCrop = (preview) => {
    this.setState({preview})
  }
  render() {
    return (
      <div className="page">
        {this.props.user && this.props.channels.length > 0 ? (
          <Chat ws={ws} />
        ):(
          <div className="modal">
            <div className="modal__inner">
              <h1 className="title">Welcome to SiChat</h1>
              <form className="form" onSubmit={this.props.registerUser(this.state.name, this.state.preview)}>
                <label className="label">Please choose a Nickname and connect.</label>
                <div><input type="text" value={this.state.name} onChange={(e) => {this.setState({name: e.target.value})}} ref={(n) => this.login = n}/></div>
                <label className="label">Please choose an avatar.</label>
                <div>
                  <Avatar
                    width={296}
                    height={200}
                    onCrop={this.onCrop}
                    onClose={this.onClose}
                    src={this.state.src}
                  />
                </div>
                <br/>
                <button className="button" type="submit">Connect to chat</button>
                {this.props.message &&
                  <p>{this.props.message}</p>
                }
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const socket = process.env.NODE_ENV === 'production' ? '178.62.21.20' : '192.168.0.21:8080'

const mapDispatchToProps = (dispatch, props) => ({
  registerUser: (name, avatar) => (e) => {
    e.preventDefault()
    if (name.length > 2) {
      ws = new WebSocket(`ws://${socket}`)
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'user',
          action: 'create',
          user: name,
          avatar: avatar
        }))
        dispatch(actions.registerUser(name, avatar))
      }
      ws.onclose = () => {
        dispatch(actions.deRegisterUser())
      }
      ws.onmessage = (message) => {
        dispatch(actions.processMessage(message))
      }
    }
  },
  reRegisterUser: (name, avatar) => {
    if (name.length > 2) {
      ws = new WebSocket(`ws://${socket}`)
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'user',
          action: 'create',
          user: name,
          avatar: avatar
        }))
        dispatch(actions.registerUser(name, avatar))
      }
      ws.onclose = () => {
        dispatch(actions.deRegisterUser())
      }
      ws.onmessage = (message) => {
        dispatch(actions.processMessage(message))
      }
    }
  }
})

const mapStateToProps = (state, props) => ({
  user: state.chat.user,
  message: state.chat.message,
  messages: state.chat.messages,
  users: state.chat.users,
  channels: state.chat.channels,
  channel: state.chat.activeChannel,
  activeuser: state.chat.activeUser
})

export default connect(mapStateToProps, mapDispatchToProps)(App)