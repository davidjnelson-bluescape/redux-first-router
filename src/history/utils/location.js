import resolvePathname from 'resolve-pathname'
import { parsePath, createPath, stripBasename } from './index'

export const createLocation = (path, state, key, currentLocation, basename) => {
  let location

  if (typeof path === 'string') {
    location = parsePath(path)
    location.state = state
  }
  else {
    location = { ...path }
    const { pathname, search, hash } = location

    if (pathname === undefined) location.pathname = ''

    location.search = !search ? '' : search
    location.hash = !hash ? '' : hash
    location.state = { ...location.state, ...state }
  }

  try {
    location.pathname = decodeURI(location.pathname)
  }
  catch (e) {
    if (e instanceof URIError) {
      throw new URIError(`Pathname "${location.pathname}" could not be decoded.
        This is likely caused by an invalid percent-encoding.`)
    }
    else {
      throw e
    }
  }

  const { pathname } = location

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!pathname) {
      location.pathname = currentLocation.pathname
    }
    else if (pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(pathname, currentLocation.pathname)
    }
  }
  else if (!pathname) {
    // When there is no prior location and pathname is empty, set it to /
    location.pathname = '/'
  }

  location.key = location.key || key || createKey()
  location.url = createPath(location)
  location.basename = location.basename || basename || ''

  return location
}

export const getWindowLocation = (historyState, basenames = []) => {
  const { key, state } = historyState || {}
  const { pathname, search, hash } = window.location
  let path = pathname + search + hash

  const basename = basenames.find(bn => path.indexOf(bn) === 0)

  if (basename) path = stripBasename(path, basename)
  return createLocation(path, state, key, null, basename)
}

export const createKey = () =>
  Math.random().toString(36).substr(2, 6)