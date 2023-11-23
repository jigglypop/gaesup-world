const column = 'column';
const row = 'row';
const center = 'center';
const left = 'left';
const right = 'right';

export const aligns = {
  justify: {
    center: {
      justifyContent: 'center'
    },
    between: {
      justifyContent: 'space-between'
    },
    around: {
      justifyContent: 'space-around'
    },
    evenly: {
      justifyContent: 'space-evenly'
    },
    start: {
      justifyContent: 'flex-start'
    },
    end: {
      justifyContent: 'flex-end'
    }
  },
  align: {
    center: {
      alignItems: 'center'
    },
    between: {
      alignItems: 'space-between'
    },
    around: {
      alignItems: 'space-around'
    },
    evenly: {
      alignItems: 'space-evenly'
    },
    start: {
      alignItems: 'flex-start'
    },
    end: {
      alignItems: 'flex-end'
    }
  },

  text: {
    center: {
      textAlign: center as 'center'
    },
    left: {
      textAlign: left as 'left'
    },
    right: {
      textAlign: right as 'right'
    }
  },
  direction: {
    row: {
      flexDirection: row as 'row'
    },
    column: {
      flexDirection: column as 'column'
    }
  }
};
