// const pify = require('pify')
const path = require('path')
const datenc = require('dat-encoding')
const crypto = require('hypercore-crypto')
const thunky = require('thunky')
// const hexTo32 = require('hex-to-32')

module.exports = {
  promise,
  hex,
  chainStorage,
  inParent,
  omit,
  discoveryKey,
  pifi,
  keyToFolder,
  asyncThunk,
  asyncThunky,
  pifyObj
}

function asyncThunk (fn) {
  let result
  let run = false
  return function (cb) {
    if (!run) {
      run = true
      result = fn()
    }
    if (cb) result.then(res => cb(null, res)).catch(e => cb(e, null))
    else return result
  }
}

function asyncThunky (fn) {
  let thunk = thunky(fn)
  return function (cb) {
    if (cb) return thunk(cb)
    if (!cb) {
      return new Promise((resolve, reject) => {
        thunk(err => {
          if (err) reject(err)
          else resolve()
        })
      })
    }
  }
}


function pifyObj (obj, opts) {
  opts = opts || {}
 const ret = {}
  for (key in obj) {
    if (opts.include && opts.include.indexOf(key) === -1) continue
    if (typeof obj[key] === 'function') {
      ret[key] = function () {
        const args = Array.from(arguments)
        return new Promise((resolve, reject) => {
          const cb = (err, res) => {
            console.log('res', key, err, res)
            if (err) reject(err)
            else resolve(res)
          }
          args.push(cb)
          obj[key].apply(obj[key], args)
        })
      }
    }
  }
  return ret
}

function promise (fn) {
  return new Promise(fn)
}

function keyToFolder (key) {
  const str = discoveryKey(key)
  return str
  // return str.substr(0, 40)
}

function pifi (fn, noError) {
  return new Promise((resolve, reject) => {
    fn.call(this, (err, result) => {
      if (noError) resolve(err, result)
      else err ? reject(err) : resolve(result)
    })
  })
}

function hex (buf) {
  if (!Buffer.isBuffer(buf)) return buf
  return buf.toString('hex')
}

function chainStorage (parent) {
  return function (prefix) {
    if (typeof parent === 'function' || typeof parent === 'object') {
      return function (name) {
        return parent(path.join(prefix, name))
      }
    } else {
      return path.join(parent, prefix)
    }
  }
}

function inParent (parent, dir) {
  const relative = path.relative(parent, dir)
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function omit (obj, keys) {
  Object.keys(obj)
    .filter(key => keys.indexOf(key) < 0)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
}

function discoveryKey (publicKey) {
  return crypto.discoveryKey(datenc.toBuf(publicKey)).toString('hex')
}
