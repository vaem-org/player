import SvgIcon from '@jamescoyle/vue-icon';

export default {
  filters: {
    format(value) {
      return [
        ...value>=3600  ? [Math.floor(value/3600)] : [],
        Math.floor(value/60) % 60,
        Math.floor(value%60)
      ]
      .map((v, i) => i===0 ? v : v.toString().padStart(2, '0'))
      .join(':')
    }
  },
  components: {
    SvgIcon
  }
}
