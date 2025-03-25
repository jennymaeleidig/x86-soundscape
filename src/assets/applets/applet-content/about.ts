export interface AboutContent {
  msg: string;
}

export default class AboutInput {
  static aboutInput: AboutContent = {
    msg: 'blurb bout the site',
  };
}
