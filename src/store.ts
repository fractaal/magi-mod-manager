import Magi from './magi';

export default {
  magi: new Magi(),
  search: {
    timer: null as unknown as any,
    isDoneTyping: true,
  }
}