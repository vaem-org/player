import SvgIcon from '@jamescoyle/vue-icon';

export default {
  filters: {
    format(value) {
      return [
        Math.floor(value/60),
        Math.floor(value%60).toString().padStart(2, '0')
      ].join(':')
    }
  },
  components: {
    SvgIcon
  }
}
