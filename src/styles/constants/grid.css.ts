import { repeat } from './constant.css';

export const gridTemplateRows = {
  ...repeat,
  writeA: '30rem 50rem 40rem 80rem',
  writeB: '30rem 50rem 80rem 80rem',
  '1,2': '1fr 2fr',
  '1,3': '1fr 3fr',
  '1,4': '1fr 4fr',
  '2,1': '2fr 1fr',
  '2,3': '2fr 3fr',
  '2,4': '2fr 4fr'
};

export const gridTemplateColumns = {
  ...repeat,
  sideBar: '3rem 1fr',
  postA: '2fr 5fr 2fr',
  postB: '1fr',
  '1,2': '1fr 2fr',
  '1,3': '1fr 3fr',
  '1,4': '1fr 4fr',
  '2,1': '2fr 1fr',
  '2,3': '2fr 3fr',
  '2,4': '2fr 4fr'
};

export const gridTemplate = {
  '15rem': '15rem 1fr 1fr',
  '10rem': '10rem 1fr 1fr'
};

export const gridTemplateAll = {
  ...gridTemplate,
  ...gridTemplateRows,
  ...gridTemplateColumns
};
