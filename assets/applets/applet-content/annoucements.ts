export interface AnnoucementContent {
  title: string;
  msg: string;
  date: string;
}

export default class AnnoucementsInput {
  static accouncementsInput: AnnoucementContent[] = [
    {
      title: 'Welcome',
      msg: 'Kick back and relax, draw some boxes mindlessly on the desktop, check out the visualizer, or just enjoy the tunes. Happy to have you.   -- DJ x86',
      date: '03/24/25',
    },
  ];
}
