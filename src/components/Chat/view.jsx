import React, {Fragment} from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import sanitizeHtml from 'sanitize-html'
import { actions } from 'resources/chat'
import './styles/index.css'
import emoji from 'node-emoji'
import linkifyStr from 'linkifyjs/string'
import GphApiClient from 'giphy-js-sdk-core'

const giphy = GphApiClient("nF7R4x2ub6T9ZEe0kHrEdd1Yn66nHdG8")

const giphyfy = async (chat) => {
  const stripped = chat.replace(/<span>/g, "").replace(/<\/span>/g, "")
  const isGiphy = /^\/giphy/g.test(stripped)
  if (isGiphy) {
    const term = stripped.split('/giphy ')[1]
    const rand = Math.floor(Math.random() * 24) + 0 
    return giphy.search('gifs', {q: term, sort: 'relevant'}).then(results => {
      return `${term}<br/><img src="${results.data[rand].images.fixed_width.gif_url}" alt="${results.data[rand].title}"/>`
    })
  } else {
    return chat
  }
}

const parseChat = (chat) => {
  const stripped = sanitizeHtml(chat, {allowedTags: [], allowedAttributes: []})
  const linked = linkifyStr(stripped)
  const format = linked
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\*([\S,\s]*)\*/g, '<b>$1</b>')
    .replace(/~([\S,\s]*)~/g, '<em>$1</em>')
    .replace(/_([\S,\s]*)_/g, '<u>$1</u>')
    .replace(/\-([\S,\s]*)-/g, '<s>$1</s>')
    .replace(/\```([\S,\s]*)```/g, '<div><code><pre>$1</pre></code></div>')
    .replace(/\`([\S,\s]*)`/g, '<code>$1</code>')
  const stripEmoji = `<span>${format}</span>`.replace(/<span>(:[\S,\s]*:)<\/span>/g, "$1")
  const emojid = emoji.emojify(stripEmoji, null, (code) => (`<i>${code}</i>`))
  return giphyfy(emojid)
}

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
  sendMessage = () => {
    if (!this.state.message) {
      return false
    }
    const message = emoji.unemojify(this.state.message)
    if (this.props.channel) {
      this.props.sendMessage(
        message,
        this.props.user,
        this.props.channel.name
      )
    } else if (this.props.activeuser) {
      this.props.sendDM(
        message,
        {
          them: this.props.activeuser,
          me: this.props.user.name
        },
        this.props.user
      )
    }
    this.setState({message:''})
    this.chat.style.cssText = `height:15px`
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
  checknewline = (e) => {
    if(!e.shiftKey && e.which === 13) {
      e.preventDefault()
      this.sendMessage()
    } else if(e.which === 13 || e.which === 8) {
      setTimeout(() => {
        this.chat.style.cssText = 'height:15px;padding:0'
        this.chat.style.cssText = `height:${this.chat.scrollHeight}px`
      }, 0)
    }
  }
  render() {
    let chanCount = 0
    this.props.channels.forEach(c => {
      if (c.notify) {
        chanCount = chanCount + c.notify
      }
    })
    let userCount = 0
    this.props.users.forEach(u => {
      if (u.notify) {
        userCount = userCount + u.notify
      }
    })
    return (
      <div className="chat">
        <div className="chat__side">
          <div className="chat__inner">
            <div className="tabs">
              <button className={`button ${this.state.tab === 'users' && 'button--ghost'}`} onClick={() => {this.setState({tab: 'channels'})}}> 
                {chanCount > 0 && this.state.tab === 'users' &&
                  <span className="count">{chanCount}</span>
                }
                Channels
              </button>
              <button className={`button ${this.state.tab === 'channels' && 'button--ghost'}`} onClick={() => {this.setState({tab: 'users'})}}>
                {userCount > 0 && this.state.tab === 'channels' &&
                  <span className="count">{userCount}</span>
                }
                Users
              </button>
            </div>
            {this.state.tab === 'channels' ? (
              <Fragment>
                <ul className="channels__list">
                  {this.props.channels.map((c,i) => {
                    return (
                      <li className={`channels__channel ${c.notify && 'channels__channel--notify'} ${this.props.channel && c.name === this.props.channel.name ? 'channels__channel--active' : ''}`} key={`channel-${i}`} onClick={() => {
                        if (this.props.channel) {
                          this.props.markRead(this.props.channel.name)
                        }
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
                <ul className="channels__list">
                  {this.props.users.map((u,i) => {
                    if (u.name === 'root') {
                      return null
                    }
                    return (
                      <li className={`channels__channel ${u.notify && 'channels__channel--notify'} ${u.name === this.props.activeuser ? 'channels__channel--active' : ''}`} key={`channel-${i}`} onClick={() => {
                        if (this.props.activeuser) {
                          this.props.markReadUser(this.props.activeuser)
                        }
                        this.props.setUser(u.name)
                        this.props.markReadUser(u.name)
                      }}>
                        {u.name} {u.name === this.props.user.name && '(Me)'} 
                        {u.notify > 0 &&
                          <span className="count">{u.notify}</span>
                        }
                      </li>
                    )
                  })}
                </ul>
                <button className="button" onClick={this.props.deRegisterUser}>Sign out</button>
              </Fragment>
            )}
          </div>
        </div>
        <div className="feed">
          <div className="feed__inner">
            <div className="messages">
              {this.props.channel &&
                <ul className="messages__list" ref={(node) => {this.messages = node}}>
                  <li className="messages__message messages__message--welcome">
                    Welcome to #{this.props.channel.name}
                    <small>Created by {this.props.channel.owner}</small>
                  </li>
                  <li className="messages__message">This is the beginning of the channel.</li>
                  {this.props.messages.filter(m => m.channel === this.props.channel.name).map((m,i) => (
                    <li className="messages__message" key={`message-${i}`}>
                      <div className="messages__avatar">
                        {m.user.avatar ? (
                          <img src={m.user.avatar} alt="" width="50" height="50"/>
                        ):(
                          <span className="messages__initials">{m.user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <strong className="messages__user">{m.user.name} <small className="messages__time">{m.time}</small></strong>
                        <div style={{whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{__html: m.message}}></div>
                      </div>
                    </li>
                  ))}
                </ul>
              }
              {this.props.activeuser &&
                <ul className="messages__list" ref={(node) => {this.messages = node}}>
                  <li className="messages__message messages__message--welcome">
                    Welcome to your chat with {this.props.activeuser}
                  </li>
                  <li className="messages__message">This is the beginning of your private chat.</li>
                  {this.props.dms.filter(m => ((m.dm.them === this.props.activeuser && m.dm.me === this.props.user.name) || (m.dm.me === this.props.activeuser && m.dm.them === this.props.user.name))).map((m,i) => (
                    <li className="messages__message" key={`message-${i}`}>
                      <div className="messages__avatar">
                        {m.user.avatar ? (
                          <img src={m.user.avatar} alt="" width="50" height="50"/>
                        ):(
                          <span className="messages__initials">{m.user.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <strong className="messages__user">{m.user.name} <small className="messages__time">{m.time}</small></strong>
                        <div style={{whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{__html: m.message}}></div>
                      </div>
                    </li>
                  ))}
                </ul>
              }
            </div>
            <form className="chat__form">
              <div className="chat__form-wrapper">
                <textarea value={this.state.message} onKeyDown={this.checknewline} onChange={(e) => {this.setState({message:emoji.emojify(e.target.value)})}} ref={(node) => {this.chat = node}}></textarea>
              </div>
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
  markReadUser: (user) => {
    dispatch(actions.markReadUser(user))
  },
  setChannel: (channel) => {
    dispatch(actions.setChannel(channel))
  },
  setUser: (user) => {
    dispatch(actions.setUser(user))
  },
  sendMessage: (message, user, channel) => {
    parseChat(message).then(m => {
      props.ws.send(JSON.stringify({
        type: 'message',
        message: m,
        user,
        channel
      }))
    })
  },
  sendDM: (message, dm, user) => {
    parseChat(message).then(m => {
      props.ws.send(JSON.stringify({
        type: 'dm',
        message: m,
        dm,
        user
      }))
    })
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
  dms: state.chat.dms,
  users: state.chat.users,
  channels: state.chat.channels,
  channel: state.chat.activeChannel,
  activeuser: state.chat.activeUser
})

export default connect(mapStateToProps, mapDispatchToProps)(Chat)