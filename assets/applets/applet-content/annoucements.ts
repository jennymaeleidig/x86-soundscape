export interface AnnoucementContent {
  title: string;
  msg: string;
  date: string;
}

export default class AnnoucementsInput {
  static accouncementsInput: AnnoucementContent[] = [
    {
      title: 'New Music and the Weather',
      msg: "I've added some new stations to the mix. I've aslo added a the WeatherStar 4000+ widget by Matt. Some stations are currently unavailable, but I'm working on increasing their uptime! Love y'all. -- DJ x86",
      date: '05/27/26',
    },
    {
      title: '56 kbit/s - Hiatus',
      msg: '56 kbit/s is on pause for a while, thank you for the support ♥. Stay tuned for future updates and new music!? Some minor tweaks in here for ya as well. -- DJ x86',
      date: '1/11/26',
    },
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
