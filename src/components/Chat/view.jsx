import React from 'react'
import { connect } from 'react-redux'

class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: props.user,
      channel: props.channels[0].name,
      message: ''
    }
  }
  sendMessage = (e) => {
    e.preventDefault()
    this.props.sendMessage(
      this.state.message,
      this.state.user,
      this.state.channel
    )
    this.setState({message:''})
  }
  render() {
    return (
      <div className="chat">
        <div className="channels">
          <ul className="channels__list">
            {this.props.channels.map((c,i) => (
              <li className={`channels__channel ${c.name === this.state.channel ? 'channels__channel--active' : ''}`} key={`channel-${i}`} onClick={() => {this.setState({channel:c.name})}}>#{c.name}</li>
            ))}
          </ul>
        </div>
        <div className="feed">
          <ul className="messages">
            {this.props.messages.filter(m => m.channel === this.state.channel).map((m,i) => (
              <li className="messages__message" key={`message-${i}`}><strong>{m.user}</strong> {m.message}</li>
            ))}
          </ul>
          <form className="chat__form" onSubmit={this.sendMessage}>
            <input type="text" value={this.state.message} onChange={(e) => {this.setState({message:e.target.value})}}/>
            <button type="submit">Send</button>
          </form>
        </div>
        <div className="users">
          <ul className="users__list">
            {this.props.users.filter(u => u.name !== 'root').map((u,i) => (
              <li className="users__user" key={`user-${i}`}>{u.name === this.state.user ? `Me (${u.name})` : u.name}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch, props) => ({
  deRegisterUser: () => {
    props.ws.close()
  },
  sendMessage: (message, user, channel) => {
    props.ws.send(JSON.stringify({
      type: 'message',
      message,
      user,
      channel
    }))
  }
})

const mapStateToProps = (state, props) => ({
  user: state.chat.user,
  messages: state.chat.messages,
  users: state.chat.users,
  channels: state.chat.channels
})

export default connect(mapStateToProps, mapDispatchToProps)(Chat)