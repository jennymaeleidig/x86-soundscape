/**
 * One recording in Ambience's library: an asset path and the name shown to the
 * listener.
 */
export interface Sound {
  path: string;
  name: string;
}

/**
 * The library Ambience draws from, declared beside the module that plays it.
 * Names are written by hand, one per recording: no tag in these files carries
 * anything human, and a rule that reads a name back out of a filename is the
 * guess that produced the mangled path this replaced.
 */
export const ambienceSounds: Sound[] = [
  // ARNO
  {
    path: 'assets/audio/sounds/ARNO/Vintage_Macintosh_computer_sounds-ASMR-002_Macintosh_Classic_II-OFVoTfrChYE.mp3',
    name: 'Macintosh Classic II — startup chime and floppy drive',
  },
  {
    path: 'assets/audio/sounds/ARNO/Vintage_Macintosh_computer_sounds-ASMR-003_Macintosh_SE-OFVoTfrChYE.mp3',
    name: 'Macintosh SE — startup chime and floppy drive',
  },
  // Brandon_Michael
  {
    path: 'assets/audio/sounds/Brandon_Michael/ASMR_Keyboard_Typing_on_a_Macintosh_Plus-2decylpvXZg.mp3',
    name: 'Macintosh Plus — keyboard typing',
  },
  {
    path: 'assets/audio/sounds/Brandon_Michael/ASMR_Typing_on_a_Macintosh_Classic_with_Apple_Keyboard-M0116.0WLnN3zkGVQ.mp3',
    name: 'Macintosh Classic with M0116 keyboard — typing',
  },
  // MajorMason
  {
    path: 'assets/audio/sounds/MajorMason/ASMR_90s_Computer_Noises-White_Noise-u-GYOjhI9q0.mp3',
    name: '1990s PC — fan and drive white noise',
  },
  // RetroSpector78
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-005_Intel_386_sx_40MHz_with_Seagate_IDE_drive-tt3kYcHbbLg.mp3',
    name: 'Intel 386SX/40 with Seagate IDE drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-006_Olivetti_M300-02_with_Conner_IDE_hard_drive-tt3kYcHbbLg.mp3',
    name: 'Olivetti M300-02 with Conner IDE drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-008_AMD_K5-PR150MHz_with_dual_Seagate_IDE_drives-tt3kYcHbbLg.mp3',
    name: 'AMD K5 PR150 with dual Seagate IDE drives — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-009_AMD_DX4_100MHz_with_Conner_IDE_drive-tt3kYcHbbLg.mp3',
    name: 'AMD DX4-100 with Conner IDE drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-010_Toshiba_310CT_laptop_with_Toshiba_drive-tt3kYcHbbLg.mp3',
    name: 'Toshiba 310CT laptop with Toshiba drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-011_Altima_Two_laptop_with_Conner_hard_drive-tt3kYcHbbLg.mp3',
    name: 'Altima Two laptop with Conner hard drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-013_IBM_5151_Portable_with_Seagate_MFM_hard_drive-tt3kYcHbbLg.mp3',
    name: 'IBM 5151 Portable with Seagate MFM drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-014_AMD_DX4_100MHz_with_Seagate_IDE_hard_drive-tt3kYcHbbLg.mp3',
    name: 'AMD DX4-100 with Seagate IDE drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-017_DTK_8088_XT_system_with_Seagate_MFM_hard_drive-tt3kYcHbbLg.mp3',
    name: 'DTK 8088 XT with Seagate MFM drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-018_Grape_XT_system_with_Seagate_MFM_hard_drive-tt3kYcHbbLg.mp3',
    name: 'Grape XT with Seagate MFM drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-019_IBM_PC_XT_5160_with_Seagate_MFM_hard_drive-tt3kYcHbbLg.mp3',
    name: 'IBM PC XT 5160 with Seagate MFM drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-020_Another_IBM_PC_XT_5160_with_Seagate_MFM_hard_drive-tt3kYcHbbLg.mp3',
    name: 'A second IBM PC XT 5160 with Seagate MFM drive — boot and drive access',
  },
  {
    path: 'assets/audio/sounds/RetroSpector78/ASMR-Enjoy_the_sweet_sounds_of_old_PCs-021_IBM_PC_286_XT_5162_with_MFM_hard_drive-tt3kYcHbbLg.mp3',
    name: 'IBM PC 5162 (286 XT) with MFM drive — boot and drive access',
  },
  // The 022 Turbo XT recording was removed from the folder in 6f87d72; its
  // entry left here behind would have played nothing.
  // SoundLonely
  {
    path: 'assets/audio/sounds/SoundLonely/University_Computer_Lab_Ambience-pNHMmu400M.mp3',
    name: 'University computer lab — room ambience',
  },
  // Tech_Barn
  {
    path: 'assets/audio/sounds/Tech_Barn/Old_Apple_Keyboard_M0110A-ASMR-No-talking,_typing,_tapping,_educational-007_Typing-z_3G-UbJQc.mp3',
    name: 'Apple M0110A keyboard — typing and tapping',
  },
  // coneypylon
  {
    path: 'assets/audio/sounds/coneypylon/Macintosh_SE_Short_Typing_ASMR-0Oobl4xf13w.mp3',
    name: 'Macintosh SE — a short burst of typing',
  },
  // The_Stanley_Parable
  {
    path: 'assets/audio/sounds/The_Stanley_Parable/Amb_Loop_MonitorRoom_Off.wav',
    name: 'Monitor Room — ambient loop',
  },
  {
    path: 'assets/audio/sounds/The_Stanley_Parable/Amb_Loop_MonitorRoom_Off_01.wav',
    name: 'Monitor Room, alternate take — ambient loop',
  },
  {
    path: 'assets/audio/sounds/The_Stanley_Parable/Amb_Loop_Office_General_02.wav',
    name: 'Office, general 02 — ambient loop',
  },
  {
    path: 'assets/audio/sounds/The_Stanley_Parable/Amb_Loop_Office_General_05.wav',
    name: 'Office, general 05 — ambient loop',
  },
  {
    path: 'assets/audio/sounds/The_Stanley_Parable/Ambient_OfficeAlive.wav',
    name: 'Office, alive — ambient loop',
  },
  {
    path: 'assets/audio/sounds/The_Stanley_Parable/amb_loop_office_general_01.wav',
    name: 'Office, general 01 — ambient loop',
  },
  {
    path: 'assets/audio/sounds/The_Stanley_Parable/amb_loop_office_general_03.wav',
    name: 'Office, general 03 — ambient loop',
  },
  {
    path: 'assets/audio/sounds/The_Stanley_Parable/amb_loop_office_general_04.wav',
    name: 'Office, general 04 — ambient loop',
  },
  // vcamnowaa
  {
    path: 'assets/audio/sounds/vcamnowaa/ASMR_Old_Computer_Sounds-KUVILrVnM_Y.mp3',
    name: 'Old PC — fan, drive and keyboard sounds',
  },
];
