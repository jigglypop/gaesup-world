export const direction = {
  north: {
    true: {
      top: '0'
    }
  },
  east: {
    true: {
      right: '0'
    }
  },
  south: {
    true: {
      bottom: '0'
    }
  },
  west: {
    true: {
      left: '0'
    }
  },
  // 방향으로 표시 (동서남북)
  north_east: {
    true: {
      top: '0',
      right: '0'
    }
  },
  south_east: {
    true: {
      bottom: '0',
      right: '0'
    }
  },
  south_west: {
    true: {
      bottom: '0',
      left: '0'
    }
  },
  north_west: {
    true: {
      top: '0',
      left: '0'
    }
  }
};

const column = 'column';
// 시계방향으로 표시
export const clock = {
  row: {
    // 센터
    center: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    '12': {
      alignItems: 'flex-start',
      justifyContent: 'center'
    },
    '10': {
      alignItems: 'flex-start',
      justifyContent: 'flex-start'
    },
    '2': {
      alignItems: 'flex-start',
      justifyContent: 'flex-end'
    },
    '2_10': {
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    },
    '9': {
      alignItems: 'center',
      justifyContent: 'flex-start'
    },
    '3': {
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    '3_9': {
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    '7': {
      alignItems: 'flex-end',
      justifyContent: 'flex-start'
    },
    '6': {
      alignItems: 'flex-end',
      justifyContent: 'center'
    },
    '5': {
      alignItems: 'flex-end',
      justifyContent: 'flex-end'
    },
    '5_7': {
      alignItems: 'flex-end',
      justifyContent: 'space-between'
    }
  },

  // column 방향
  column: {
    // 센터
    center: {
      flexDirection: column as 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    '7': {
      flexDirection: column as 'column',
      justifyContent: 'flex-end',
      alignItems: 'flex-start'
    },
    '12': {
      flexDirection: column as 'column',
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    '2': {
      flexDirection: column as 'column',
      justifyContent: 'flex-end',
      alignItems: 'flex-end'
    },
    '7_10': {
      flexDirection: column as 'column',
      justifyContent: 'flex-end',
      alignItems: 'space-between'
    },
    '9': {
      flexDirection: column as 'column',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    '3': {
      flexDirection: column as 'column',
      justifyContent: 'center',
      alignItems: 'flex-end'
    },
    '6_12': {
      flexDirection: column as 'column',
      justifyContent: 'center',
      alignItems: 'space-between'
    },
    '10': {
      flexDirection: column as 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    },
    '6': {
      flexDirection: column as 'column',
      justifyContent: 'flex-start',
      alignItems: 'center'
    },
    '5': {
      flexDirection: column as 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-end'
    },
    '1_5': {
      flexDirection: column as 'column',
      justifyContent: 'flex-start',
      alignItems: 'space-between'
    }
  }
};
