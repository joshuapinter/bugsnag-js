const { describe, it, expect } = global

const Client = require('@bugsnag/core/client')
const schema = require('@bugsnag/core/config').schema
const VALID_NOTIFIER = { name: 't', version: '0', url: 'http://' }
const plugin = require('../')

describe('plugin: node unhandled rejection handler', () => {
  it('should listen to the process#unhandledRejection event', () => {
    const before = process.listeners('unhandledRejection').length
    const c = new Client(VALID_NOTIFIER)
    c.setOptions({ apiKey: 'api_key' })
    c.configure()
    c.use(plugin)
    const after = process.listeners('unhandledRejection').length
    expect(before < after).toBe(true)
    plugin.destroy()
  })

  it('does not add a process#unhandledRejection listener if autoNotify=false', () => {
    const before = process.listeners('unhandledRejection').length
    const c = new Client(VALID_NOTIFIER)
    c.setOptions({ apiKey: 'api_key', autoNotify: false })
    c.configure()
    c.use(plugin)
    const after = process.listeners('unhandledRejection').length
    expect(after).toBe(before)
  })

  it('should call the configured onUnhandledError callback', done => {
    const c = new Client(VALID_NOTIFIER)
    c.delivery({
      sendReport: (...args) => args[args.length - 1](),
      sendSession: (...args) => args[args.length - 1]()
    })
    c.setOptions({
      apiKey: 'api_key',
      onUnhandledError: (err, report) => {
        expect(err.message).toBe('never gonna catch me')
        expect(report.errorMessage).toBe('never gonna catch me')
        expect(report._handledState.unhandled).toBe(true)
        expect(report._handledState.severity).toBe('error')
        expect(report._handledState.severityReason).toEqual({ type: 'unhandledPromiseRejection' })
        plugin.destroy()
        done()
      }
    })
    c.configure({
      ...schema,
      onUnhandledError: {
        validate: val => typeof val === 'function',
        message: 'should be a function',
        defaultValue: () => {}
      }
    })
    c.use(plugin)
    process.listeners('unhandledRejection')[1](new Error('never gonna catch me'))
  })

  it('does not call config.onUnhandledError when terminateOnUnhandledRejection=false', done => {
    const c = new Client(VALID_NOTIFIER)
    c.delivery({
      sendReport: (...args) => {
        expect(args[2].events[0].errorMessage).toBe('floop')
        args[args.length - 1]()
        // allow a moment for the onUnhandledError callback to be called
        setTimeout(() => {
          plugin.destroy()
          done()
        }, 1)
      },
      sendSession: (...args) => args[args.length - 1]()
    })
    c.setOptions({
      apiKey: 'api_key',
      terminateOnUnhandledRejection: false,
      onUnhandledError: () => expect(true).toBe(false)
    })
    c.configure({
      ...schema,
      terminateOnUnhandledRejection: {
        defaultValue: () => true,
        message: 'should be true|false',
        validate: value => value === true || value === false
      },
      onUnhandledError: {
        validate: val => typeof val === 'function',
        message: 'should be a function',
        defaultValue: () => {}
      }
    })
    c.use(plugin)
    process.listeners('unhandledRejection')[1](new Error('floop'))
  })
})
