import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export const fromNow = (date) => dayjs(date).fromNow()

export const date = (date) => dayjs(date).format('MMMM Do YYYY, HH:mm')
