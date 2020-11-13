export default function ({ store, redirect }) {
  if (!store.state.session) {
    return redirect('/welcome')
  }
}
