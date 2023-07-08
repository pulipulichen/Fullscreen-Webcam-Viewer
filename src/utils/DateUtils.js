import dayjs from 'dayjs'

export default {
  format (date) {
    let dateString = dayjs(date).format('YYYY-MM/DD HH:mm')

    let now = new Date()
    
    if (dateString.startsWith(now.getFullYear() + '-')) {
      dateString = dateString.slice(5)
    }

    let nowMMDD = dayjs().format('MM/DD')
    if (dateString.startsWith(nowMMDD + ' ')) {
      dateString = dateString.slice(6)
    }

    return dateString
  }
}