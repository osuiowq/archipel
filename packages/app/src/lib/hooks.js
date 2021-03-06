import React, { useState, useEffect } from 'react'
import { Input } from '@archipel/ui'

const defaultState = { data: undefined, pending: false, error: false, started: false }

export function useAsyncState () {
  const [state, setState] = useState(defaultState)
  return {
    state,
    setError: error => { setState(state => ({ ...defaultState, pending: false, started: true, error })) },
    setStarted: started => { setState(state => ({ ...defaultState, pending: true, started })) },
    setPending: () => { setState(state => ({ ...state, pending: true })) },
    setSuccess: data => { setState(state => ({ ...defaultState, pending: false, started: true, data })) }
  }
}

export function useAsync (defaultValue) {
  const { state, setError, setPending, setSuccess, setStarted } = useAsyncState()
  return [state, setPromise]

  function setPromise (asyncFn) {
    let abort = false
    if (!state.started) setStarted(true)
    else setPending()

    const maybeAbort = fn => (...args) => {
      if (!abort) fn(...args)
    }

    // asyncFn({ setError, setPending, setSuccess })
    asyncFn()
      .then(maybeAbort(setSuccess))
      .catch(maybeAbort(setError))

    return () => { abort = true }
  }
}

export function useAsyncEffect (asyncFn, inputs) {
  const [state, setPromise] = useAsync()
  useEffect(() => {
    let abort = setPromise(asyncFn)
    return abort
  }, inputs)
  return state
}

export function useCounter () {
  const [state, setState] = useState(1)
  return [
    state,
    () => setState(state + 1)
  ]
}

export function useForm (defaultValue) {
  defaultValue = defaultValue || {}
  const [state, setState] = useState(defaultValue)
  const [didChange, setDidChange] = useState(false)
  return {
    state,
    itemProps,
    checkboxItemProps,
    makeField,
    setState,
    didChange
  }

  function itemProps (name, defaultValue) {
    let value = state[name] === undefined ? defaultValue : state[name]
    function onChange (e) {
      setDidChange(true)
      setState({ ...state, [name]: e.target.value })
    }
    return { name, value, onChange }
  }

  function checkboxItemProps (name, defaultValue) {
    let checked = state[name] === undefined ? defaultValue : state[name]
    function onChange (e) {
      setDidChange(true)
      setState({ ...state, [name]: e.target.checked })
    }
    return { name, checked, onChange }
  }

  function makeField ({ title, name, defaultValue, type }) {
    defaultValue = defaultValue || ''
    type = type || 'input'
    let props
    if (type === 'input') props = itemProps(name, defaultValue)
    else if (type === 'checkbox') props = checkboxItemProps(name, defaultValue)
    return (
      <>
        {title && <label htmlFor={name}>{title}</label> }
        <Input type={type} {...props} />
      </>
    )
  }
}

export function useToggle (init) {
  const [state, setState] = useState(!!init ? true : false)
  return [state, (val) => setState(state => val === undefined ? !state : !!val)]
}

export function useRerender () {
  const [_, setState] = useState(true)
  const rerender = () => setState(state => !state)
  return rerender
}

export function useKey (key, cb, opts) {
  opts = opts || {}
  useEffect(() => {
    function onKeydown (e) {
      if (!opts.allTargets && e.target !== document.body) return
      if (e.key === key) cb(e)
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [key])
}

export function useStack () {
  const [state, setState] = useState([])
  return [
    state,
    val => setState(state => [...state, val]),
    () => setState([])
  ]
}

export function useHover () {
  const [hovered, set] = useState(false)
  return {
    hovered,
    bind: {
      onMouseEnter: () => set(true),
      onMouseLeave: () => set(false),
    },
  }
}


export function copyToClipboard (str) {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

