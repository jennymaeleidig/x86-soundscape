export interface AnnoucementContent {
  title: string;
  msg: string;
  date: string;
}

export default class AnnoucementsInput {
  static accouncementsInput: AnnoucementContent[] = [
    {
      title: 'New Sights (⌐■_■)',
      msg: 'Enjoy some improved reliability and check out the new visualizer and added ambience. Stay chill. -- DJ x86',
      date: '07/10/25',
    },
    {
      title: '56 kbit/s',
      msg: 'Join me live on WRIR 97.3 FM, 2nd and 4th Thursdays, 11pm - 1am EST for a deep dive into the sounds of the Internet.   -- DJ x86',
      date: '04/10/25',
    },
    {
      title: 'Welcome',
      msg: 'Kick back and relax, draw some boxes mindlessly on the desktop, check out the visualizer, or just enjoy the tunes. Happy to have you.   -- DJ x86',
      date: '03/24/25',
    },
  ];
}
