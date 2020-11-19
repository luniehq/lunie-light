import network from '~/common/network'

export default function ({ store, redirect }) {
  if (!network.localSigning) {
    return redirect('/welcome')
  }
}
