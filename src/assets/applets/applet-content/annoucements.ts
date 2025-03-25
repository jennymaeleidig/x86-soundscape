export interface AnnoucementContent {
  title: string;
  msg: string;
  date: string;
}

export default class AnnoucementsInput {
  static accouncementsInput: AnnoucementContent[] = [
    {
      title: 'Welcome',
      msg: 'Hello',
      date: '03/24/25',
    },
  ];
}
