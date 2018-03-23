import React from 'react'
import { connect } from 'react-redux'
import { actions } from 'resources/chat'
import './styles/index.css'

import Chat from 'components/Chat/view'

let ws

class App extends React.Component {
  state = {name: '',message:''}
  submitChat = (e) => {
    e.preventDefault()
    this.props.sendMessage(this.state.message, this.props.user, this.props.channel)
    this.setState({
      message: ''
    })
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
              <form className="form" onSubmit={this.props.registerUser(this.state.name)}>
                <label className="label">Please choose a Nickname and connect.</label>
                <div><input type="text" value={this.state.name} onChange={(e) => {this.setState({name: e.target.value})}}/></div>
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
  registerUser: (name) => (e) => {
    e.preventDefault()
    if (name.length > 2) {
      ws = new WebSocket(`ws://${socket}`)
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'user',
          action: 'create',
          user: name
        }))
        dispatch(actions.registerUser(name))
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
  channels: state.chat.channels
})

export default connect(mapStateToProps, mapDispatchToProps)(App)