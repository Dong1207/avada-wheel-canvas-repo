import React from 'react'
import { LuckyGrid as Grid } from '@lib/avada-wheel-canvas/index.esm.js'
import { name, version } from '../../package.json'

export default class LuckyGrid extends React.Component {
  constructor (props) {
    super(props)
    this.myLucky = React.createRef()
    this.lucky = undefined
  }
  componentDidMount () {
    // Skip if instance already exists, fix issue where componentDidMount is triggered twice in `react18 + strictMode`
    if (this.lucky) {
      return
    }
    this.myLucky.current.setAttribute('package', `${name}@${version}`)
    try {
      this.initLucky()
      this.props.onSuccess && this.props.onSuccess()
    } catch (err) {
      this.props.onError && this.props.onError(err)
    } finally {
      this.props.onFinally && this.props.onFinally(err)
    }
  }
  componentDidUpdate (prevProps) {
    if (!this.lucky) return
    if (this.props.width !== prevProps.width) {
      this.lucky.width = this.props.width
    }
    if (this.props.height !== prevProps.height) {
      this.lucky.height = this.props.height
    }
    if (this.props.cols !== prevProps.cols) {
      this.lucky.cols = this.props.cols
    }
    if (this.props.rows !== prevProps.rows) {
      this.lucky.rows = this.props.rows
    }
    if (this.props.blocks !== prevProps.blocks) {
      this.lucky.blocks = this.props.blocks
    }
    if (this.props.prizes !== prevProps.prizes) {
      this.lucky.prizes = this.props.prizes
    }
    if (this.props.buttons !== prevProps.buttons) {
      this.lucky.buttons = this.props.buttons
    }
  }
  initLucky () {
    this.lucky = new Grid({
      flag: 'WEB',
      divElement: this.myLucky.current
    }, {
      ...this.props,
      start: (...rest) => {
        this.props.onStart && this.props.onStart(...rest)
      },
      end: (...rest) => {
        this.props.onEnd && this.props.onEnd(...rest)
      }
    })
  }
  init (...rest) {
    this.lucky.init(...rest)
  }
  play (...rest) {
    this.lucky.play(...rest)
  }
  stop (...rest) {
    this.lucky.stop(...rest)
  }
  render () {
    return <div ref={this.myLucky}></div>
  }
}

LuckyGrid.defaultProps = {
  width: '',
  height: '',
  cols: 3,
  rows: 3,
  blocks: [],
  prizes: [],
  buttons: [],
  defaultStyle: {},
  activeStyle: {},
  defaultConfig: {},
}
