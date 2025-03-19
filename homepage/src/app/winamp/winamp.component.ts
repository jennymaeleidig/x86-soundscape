import { Component, ElementRef, ViewChild } from '@angular/core';
import Webamp from 'webamp';

@Component({
    selector: 'winamp',
    standalone: true,
    templateUrl: './winamp.component.html',
    styleUrl: './winamp.component.css'
})

export class WinampComponent {
    @ViewChild('winamp') winamp!: ElementRef<HTMLElement>
    title = 'component';

    ngAfterViewInit() {
        let webamp: Webamp = new Webamp({
            initialTracks: [
                {
                    metaData: {
                        artist: "soma fm",
                        title: "Groove Salad Classic",
                    },
                    url: "https://ice4.somafm.com/gsclassic-128-mp3"
                },
                {
                    metaData: {
                        artist: "soma fm",
                        title: "Groove Salad",
                    },
                    url: "https://ice2.somafm.com/groovesalad-128-mp3"
                },
                {
                    metaData: {
                        artist: "WRIR",
                        title: "Richmond, VA Community Radio",
                    },
                    url: "https://live.wrir.org"
                },
                {
                    metaData: {
                        artist: "KGNU",
                        title: "Boulder, CO Community Radio",
                    },
                    url: "https://kgnu.streamguys1.com/kgnu"
                },
                {
                    metaData: {
                        artist: "soma fm",
                        title: "Vaporwaves",
                    },
                    url: "https://ice2.somafm.com/vaporwaves-128-mp3"
                },
                {
                    metaData: {
                        artist: "Nightwave Plaza",
                        title: "Online Vaporwave Radio",
                    },
                    url: "https://radio.plaza.one/mp3_low"
                },
                {
                    metaData: {
                        artist: "Radio Paradise",
                        title: "Mellow Mix",
                    },
                    url: "http://stream.radioparadise.com/mellow-192"
                },
                {
                    metaData: {
                        artist: "Echoes of Bluemars",
                        title: "Bluemars (rcast)",
                    },
                    url: "https://free.rcast.net/214026"
                },
                {
                    metaData: {
                        artist: "NTS Mixtapes",
                        title: "Labrynth",
                    },
                    url: "https://stream-mixtape-geo.ntslive.net/mixtape31"
                },
                {
                    metaData: {
                        artist: "NTS Mixtapes",
                        title: "Field Recordings",
                    },
                    url: "https://stream-mixtape-geo.ntslive.net/mixtape23"
                },
                {
                    metaData: {
                        artist: "9128",
                        title: "live",
                    },
                    url: "https://streams.radio.co/s0aa1e6f4a/listen"
                },
                {
                    metaData: {
                        artist: "dinamo.fm",
                        title: "live",
                    },
                    url: "https://channels.dinamo.fm/legacy-mp3"
                },
                {
                    metaData: {
                        artist: "LOCAFM",
                        title: "Chill Out",
                    },
                    url: "https://s2.we4stream.com/listen/loca_chill_out/live"
                },
                {
                    metaData: {
                        artist: "Underground Kollektiv",
                        title: "live",
                    },
                    url: "https://s2.radio.co/s12ef3f65a/listen"
                },
                {
                    metaData: {
                        artist: "Isekoi Radio",
                        title: "live",
                    },
                    url: "https://public.isekoi-radio.com/listen/isekoi/radio.mp3"
                },
                {
                    metaData: {
                        artist: "Isekoi Radio",
                        title: "Chill Zone",
                    },
                    url: "https://public.isekoi-radio.com/listen/chill/radio.mp3"
                },
                {
                    metaData: {
                        artist: "rateau",
                        title: "live",
                    },
                    url: "https://ad.rateau.live:8000/radio.mp3"
                },
                {
                    metaData: {
                        artist: "KEXP",
                        title: "Seattle, WA Community Radio",
                    },
                    url: "https://live-aacplus-64.streamguys1.com/kexp64.aac"
                },
                {
                    metaData: {
                        artist: "WORT",
                        title: "Madison, WI Community Radio",
                    },
                    url: "https://wortcast01.wortfm.org:8443/high.mp3"
                },
                {
                    metaData: {
                        artist: "KOOP",
                        title: "Austin, TX Community Radio",
                    },
                    url: "https://streaming.koop.org/stream.mp3"
                }                         
            ],
            initialSkin: {
                // NOTE: Your skin file must be served from the same domain as your HTML
                // file, or served with permissive CORS HTTP headers:
                // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
                // Can be downloaded from https://github.com/captbaritone/webamp/raw/master/skins/TopazAmp1-2.wsz
                url: "assets/skins/Old_Mac-OS.wsz"
            },
            availableSkins: [
                { url: "assets/skins/Old_Mac-OS.wsz", name: "MacOS" }
            ]
        });

        // // An example of handling the close button and giving a way to reopen WEebamp
        // webamp.onClose(() => {
        //     const open = document.createElement("button");
        //     open.innerText = "Reopen";
        //     document.getElementById("controls").appendChild(open);
        //     function handleClick() { 
        //     webamp.reopen();
        //     open.remove();
        //     open.removeEventListener("click", handleClick);
        //     }
        //     open.addEventListener("click", handleClick);
        // });

        // Example of adding a confirmation button before Webamp can be closed.
        webamp.onWillClose((cancel) => {
            if (!window.confirm("Are you sure you want to close Webamp?")) {
                cancel();
            }
        });
        // Here we go! Let's show Webamp.
        webamp.renderWhenReady(this.winamp.nativeElement)
    }

    ngOnInit() {
        if (!Webamp.browserIsSupported()) {
            alert("Oh no! Webamp does not work in this browser!");
            throw new Error("What's the point of anything?");
        }
    }
}