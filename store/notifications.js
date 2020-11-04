export const state = () => ({
  notificationIdCounter: 0,
  notifications: [],
})

export const mutations = {
  add(state, { type, message }) {
    state.notifications.push({
      id: state.notificationIdCounter++,
      type,
      message,
    })
  },
  remove(state, id) {
    state.notifications = state.notifications.filter(
      (notification) => notification.id !== id
    )
  },
}
