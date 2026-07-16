export interface AboutContent {
  msg: string;
}

export default class AboutInput {
  static aboutInput: AboutContent = {
    msg: `
      Welcome to the webpage for the x86 Soundscape internet radio livestream hub. Huge shoutout to the team over at the Webamp project and sakun for the system.css library. Webpage built with the TypeScript framework Angular.
    `,
  };
}
