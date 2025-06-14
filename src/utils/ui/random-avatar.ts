import { h } from 'vue'

// 生成随机颜色
export const getRandomColor = () => {
  const colors = [
    '#40a9ff', // 亮蓝
    '#73d13d', // 亮绿
    '#ffc53d', // 亮黄
    '#ff7a45', // 亮橙
    '#9254de', // 亮紫
    '#36cfc9', // 亮青
    '#ff85c0', // 亮粉
    '#ffa940', // 亮橙黄
    '#69c0ff', // 天蓝
    '#95de64', // 薄荷绿
    '#ff9c6e', // 珊瑚色
    '#b37feb', // 紫罗兰
    '#5cdbd3', // 青绿
    '#ff7875', // 珊瑚红
    '#4dabf7', // 天蓝
    '#82c91e', // 薄荷
    '#ff6b6b', // 玫瑰红
    '#ffd43b', // 柠檬黄
    '#339af0', // 深天蓝
    '#51cf66'  // 深薄荷
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 生成头像
export const generateAvatar = (name: string) => {
  const lastTwoChars = name.slice(-2)
  const color = getRandomColor()
  return h(
    'div',
    {
      class: 'avatar-placeholder',
      style: {
        backgroundColor: color,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    lastTwoChars
  )
}
