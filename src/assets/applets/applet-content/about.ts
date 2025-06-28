export interface AboutContent {
  msg: string;
}

export default class AboutInput {
  static aboutInput: AboutContent = {
    msg: `
      Welcome to the webpage for the x86 Soundscape internet radio livestream (streaming at a crisp 192kbps). Huge shoutout to the team over at the Webamp project and sakun for the system.css library. Webpage built with the TypeScript framework Angular. Radio hosted on an Unraid server running AzuraCast and streaming via Icecast2.
    `,
  };
}
