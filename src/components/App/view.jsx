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
          <form className="login" onSubmit={this.props.registerUser(this.state.name)}>
            <h1>Welcome to Rawchat</h1>
            <p>Please choose a Nickname and connect.</p>
            <input type="text" value={this.state.name} onChange={(e) => {this.setState({name: e.target.value})}}/>
            <button type="submit">Connect to chat</button>
            {this.props.message &&
              <p>{this.props.message}</p>
            }
          </form>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch, props) => ({
  registerUser: (name) => (e) => {
    e.preventDefault()
    if (name.length > 2) {
      ws = new WebSocket('ws://192.168.0.21:8080')
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