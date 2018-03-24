import React, {Fragment} from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import sanitizeHtml from 'sanitize-html'
import { actions } from 'resources/chat'
import './styles/index.css'
import emoji from 'node-emoji'

class NewChannel extends React.Component {
  state = {name:''}
  componentDidMount() {
    this.input.focus()
  }
  submit = (e) => {
    e.preventDefault()
    this.props.create(this.state.name)
  }
  render() {
    return (
      <div className="modal">
        <div className="modal__inner">
          <button className="close" onClick={this.props.close}>x</button>
          <h1 className="title">Create a channel</h1>
          <form onSubmit={this.submit} className="form">
            <label className="label">Name</label>
            <div><input type="text" value={this.state.name} onChange={(e) => {this.setState({name: e.target.value})}} ref={(node) => {this.input = node}}/></div>
            <button type="submit" className="button">Create Channel</button>
          </form>
        </div>
      </div>
    )
  }
}

class Chat extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: '',
      tab: 'channels'
    }
  }
  sendMessage = (e) => {
    e.preventDefault()
    if (!this.state.message) {
      return false
    }
    const string = emoji.unemojify(this.state.message)
    const message = emoji.emojify(string, null, (code) => (`<i>${code}</i>`))
    this.props.sendMessage(
      message,
      this.props.user,
      this.props.channel.name
    )
    this.setState({message:''})
  }
  componentDidMount() {
    this.chat.focus()
  }
  componentDidUpdate() {
    this.messages.scrollTop = 99999
    if (!this.state.createModal) {
      this.chat.focus()
    }
  }
  render() {
    const chanCount = this.props.channels.reduce((a,c) => {
      if (c.notify) {
        return a + c.notify
      } else {
        if (typeof a === 'number') {
          return a
        } else {
          return 0
        }
      }
    })
    return (
      <div className="chat">
        <div className="chat__side">
          <div className="chat__inner">
            <div className="tabs">
              <button className={`button ${this.state.tab === 'users' && 'button--ghost'}`} onClick={() => {this.setState({tab: 'channels'})}}> 
                {chanCount > 0 &&
                  <span className="count">{chanCount}</span>
                }
                Channels
              </button>
              <button className={`button ${this.state.tab === 'channels' && 'button--ghost'}`} onClick={() => {this.setState({tab: 'users'})}}>Users</button>
            </div>
            {this.state.tab === 'channels' ? (
              <Fragment>
                <ul className="channels__list">
                  {this.props.channels.map((c,i) => {
                    return (
                      <li className={`channels__channel ${c.notify && 'channels__channel--notify'} ${c.name === this.props.channel.name ? 'channels__channel--active' : ''}`} key={`channel-${i}`} onClick={() => {
                        this.props.markRead(this.props.channel.name)
                        this.props.setChannel({ name:c.name, owner:c.owner})
                        this.props.markRead(c.name)
                      }}>
                        #{c.name} 
                        {c.owner === this.props.user.name &&
                          <button className="close close--inline" onClick={() => {this.props.destroyChannel(c.name, this.props.user.name)}}>x</button>
                        }
                        {c.notify > 0 &&
                          <span className="count">{c.notify}</span>
                        }
                      </li>
                    )
                  })}
                </ul>
                <button className="button" onClick={() => {this.setState({createModal: true})}}>Create Channel</button>
              </Fragment>
            ):(
              <Fragment>
                <ul className="users__list">
                  {this.props.users.filter(u => u.name !== 'root').map((u,i) => (
                    <li className="users__user" key={`user-${i}`}>{u.name === this.props.user.name ? `Me (${u.name})` : u.name}</li>
                  ))}
                </ul>
                <button className="button" onClick={this.props.deRegisterUser}>Sign out</button>
              </Fragment>
            )}
          </div>
        </div>
        <div className="feed">
          <div className="feed__inner">
            <div className="messages">
              <ul className="messages__list" ref={(node) => {this.messages = node}}>
                <li className="messages__message messages__message--welcome">
                  Welcome to #{this.props.channel.name}
                  <small>Created by {this.props.channel.owner}</small>
                </li>
                <li className="messages__message">This is the beginning of the channel.</li>
                {this.props.messages.filter(m => m.channel === this.props.channel.name).map((m,i) => (
                  <li className="messages__message" key={`message-${i}`}>
                    <img src={m.user.avatar} alt="" width="50" height="50"/>
                    <div>
                      <strong className="messages__user">{m.user.name} <small className="messages__time">{m.time}</small></strong>
                      <span dangerouslySetInnerHTML={{__html: m.message}}></span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <form className="chat__form" onSubmit={this.sendMessage}>
              <input type="text" value={this.state.message} onChange={(e) => {this.setState({message:emoji.emojify(e.target.value)})}} ref={(node) => {this.chat = node}}/>
              <button className="button button--send" type="submit">Send</button>
            </form>
          </div>
        </div>
        {this.state.createModal &&
          <NewChannel close={() => {this.setState({createModal: false})}} create={(name) => {
            this.props.createChannel(name, this.props.user.name)
            this.setState({createModal: false})
          }} />
        }
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch, props) => ({
  deRegisterUser: () => {
    props.ws.close()
  },
  markRead: (channel) => {
    dispatch(actions.markRead(channel))
  },
  setChannel: (channel) => {
    dispatch(actions.setChannel(channel))
  },
  sendMessage: (message, user, channel) => {
    props.ws.send(JSON.stringify({
      type: 'message',
      message: sanitizeHtml(message),
      user,
      channel,
      time: moment().format('h:mm A')
    }))
  },
  createChannel: (name, owner) => {
    props.ws.send(JSON.stringify({
      type: 'channel',
      action: 'create',
      name,
      owner
    }))
  },
  destroyChannel: (name, owner) => {
    props.ws.send(JSON.stringify({
      type: 'channel',
      action: 'destroy',
      name,
      owner
    }))
  }
})

const mapStateToProps = (state, props) => ({
  user: state.chat.user,
  messages: state.chat.messages,
  users: state.chat.users,
  channels: state.chat.channels,
  channel: state.chat.activeChannel
})

export default connect(mapStateToProps, mapDispatchToProps)(Chat)