const apiKey = 'a738ed9e-4760-4e77-b471-3e6ec2cea252'

let currentPeer = null
let currentRoom = null

export function getPeerId() {
  return currentPeer?.id
}

export async function joinRoom(peerId, stream) {
  const peer = new Peer(peerId, {
    key: apiKey,
    debug: 3,
  })

  await new Promise((resolve, reject) => {
    const resolveRelease = () => {
      resolve()
      peer.off('error', rejectRelease)
    }

    const rejectRelease = (err) => {
      reject(err)
      peer.off('open', resolveRelease)
    }

    peer.once('open', resolveRelease)
    peer.once('error', rejectRelease)
  })

  const room = peer.joinRoom('default', {
    mode: 'sfu',
    stream,
  })

  await new Promise((resolve, reject) => {
    const resolveRelease = () => {
      resolve()
      peer.off('error', rejectRelease)
    }

    const rejectRelease = (err) => {
      reject(err)
      room.off('open', resolveRelease)
      peer.destroy()
    }

    room.once('open', resolveRelease)
    peer.once('error', rejectRelease)
  })

  peer.on('error', (err) => alert(err))

  currentPeer = peer
  currentRoom = room
}

export function leaveRoom() {
  currentRoom.close()
  currentPeer.destroy()
  currentPeer = null
  currentRoom = null
}

export function onRoom(type, cb) {
  currentRoom?.on(type, cb)
}

export function sendRoom(type, data) {
  currentRoom?.send({ type, data })
}
