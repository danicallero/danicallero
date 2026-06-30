// ─── How to add images / videos to a project gallery ────────────────────────
//
// 1. Drop your files into /public/projects/<slug>/media/
//    e.g. /public/projects/fasttrack/media/queue-screen.png
//
// 2. Add a `gallery` array to the project object:
//
//    gallery: [
//      { type: 'image', src: '/projects/fasttrack/media/queue-screen.png', caption: 'Queue view' },
//      { type: 'image', src: '/projects/fasttrack/media/admin-dashboard.png' },
//      { type: 'video', src: '/projects/fasttrack/media/demo.mp4', caption: 'Demo clip' },
//    ],
//
// 3. For the demo video embed (YouTube / Loom), use `videoEmbedUrl` instead:
//    videoEmbedUrl: 'https://www.youtube.com/embed/VIDEO_ID',
//
// If neither field is set, those sections simply don't appear on the page.
// ─────────────────────────────────────────────────────────────────────────────

export interface GalleryItem {
  type: 'image' | 'video';
  src: string;
  caption?: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  highlights: string[];
  tags: string[];
  github?: string;
  url?: string;
  videoEmbedUrl?: string;
  gallery?: GalleryItem[];
  year: number;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: 'hackudc-2026',
    title: 'HackUDC 2026 website',
    description:
      'Contributed to the official site for HackUDC 2026, the open source hackathon organised by GPUL at the University of A Coruña. 450+ attendees.',
    longDescription:
      'The public site for HackUDC 2026, which brought together 450+ developers for a weekend at the University of A Coruña. Built by the GPUL team as an open source project, it covers the event schedule, registration info, sponsors and FAQ. I contributed alongside the rest of the team.',
    highlights: [
      '450+ attendees at the event it promoted',
      'Open source, built by GPUL contributors',
      'Live at hackudc.gpul.org',
    ],
    tags: ['Astro', 'Tailwind CSS', 'TypeScript'],
    github: 'https://github.com/gpul-org/hackudc-2026',
    url: 'https://hackudc.gpul.org',
    gallery: [
      { type: 'image', src: '/projects/hackudc-2026/media/landing.png', caption: 'Landing page' },
      { type: 'image', src: '/projects/hackudc-2026/media/gallery-component.png', caption: 'Gallery component' },
    ],
    year: 2026,
    featured: true,
  },
  {
    slug: 'fasttrack',
    title: 'FastTrack',
    description:
      'Queue management for hackathon judging. 120 projects, 12 rooms, 500 people. Built in three days, held up on the day.',
    longDescription:
      'Every hackathon has the same Sunday problem: a hundred teams all need to find their judges at the same time, nobody knows where to go, and the result is a mess. FastTrack works like a deli counter. Teams get a number, watch their position update live, and show up when called. Judges control the pace from their own view. Admins configure rooms, challenges and assignments beforehand. Built in three days for HackUDC 2026, during the event itself. It managed 120 projects across 12 rooms at once and held up under 500 concurrent users. By most architectural standards it is rough code. But it worked, which was the only thing that mattered.',
    highlights: [
      'Built in three days during the event prep',
      '120 projects judged across 12 rooms simultaneously',
      '500 concurrent users, no downtime',
      'Three roles: hackers join queues, judges call teams, admins configure everything',
      'Passwordless auth via email OTP — no accounts to manage on the day',
    ],
    tags: ['Next.js', 'Supabase', 'TypeScript', 'Tailwind CSS'],
    github: 'https://github.com/gpul-org/fasttrack',
    gallery: [
      { type: 'image', src: '/projects/fasttrack/media/position-view.png', caption: 'Queue position view for teams' },
      { type: 'image', src: '/projects/fasttrack/media/judge-view.jpeg', caption: 'Judge panel' },
      { type: 'image', src: '/projects/fasttrack/media/tv-view.jpeg', caption: 'TV display' },
    ],
    year: 2026,
    featured: true,
  },
  {
    slug: 'pkpassbuilder',
    title: 'pkpassBuilder',
    description:
      'Python script that generates signed Apple Wallet passes from a JSON list of attendees. Built for HackUDC 2026 accreditations.',
    longDescription:
      'Creating Apple Wallet passes for an event is more annoying than it should be. You need an Apple Developer account, two certificates, a specific signed file format, and a unique QR code per attendee. This script takes a JSON file with your attendee list and outputs ready-to-distribute .pkpass files, one per person, each with their own QR code and personalised fields. Customisable branding, colours and field layout through a config file. Built for HackUDC 2026 accreditations.',
    highlights: [
      'Reads a JSON attendee list and outputs signed .pkpass files',
      'Each pass gets a unique QR code generated from the attendee data',
      'Customisable fields, colours and event branding',
      'Also exports each QR code separately as a PNG',
      'One command, a folder of ready-to-send passes',
    ],
    tags: ['Python', 'PassKit'],
    github: 'https://github.com/danicallero/pkpassBuilder',
    gallery: [
      { type: 'image', src: '/projects/pkpassbuilder/media/apple-wallet-view.PNG', caption: 'Generated pass in Apple Wallet' },
    ],
    year: 2026,
    featured: true,
  },
  {
    slug: 'hackudc-app',
    title: 'HackUDC Management App',
    description:
      'React Native app for HackUDC staff. Check-ins, food passes and attendance tracking, all from a phone on the event floor.',
    longDescription:
      'Internal tool for the HackUDC 2026 organizer team. Staff needed something for the operational side of the event: checking people in at the door, managing meal passes, tracking attendance. This is a React Native/Expo app connected to the event backend. It ran on staff phones throughout the event.',
    highlights: [
      'Attendee check-in at the door',
      'Meal pass management during lunch and dinner',
      'Attendance tracking throughout the event',
      'Runs on iOS and Android',
      'Connected to the event backend (github.com/appuchias/hackackathon)',
      'Handled Apple provisioning profiles and App Store Connect setup for internal iOS distribution',
    ],
    tags: ['React Native', 'Expo', 'TypeScript'],
    github: 'https://github.com/danicallero/hackudc_front',
    gallery: [
      { type: 'image', src: '/projects/hackudc-app/media/statistics.jpeg', caption: 'Event statistics' },
      { type: 'video', src: '/projects/hackudc-app/media/temp-video-demo.mov' },
      { type: 'image', src: '/projects/hackudc-app/media/scanner.PNG', caption: 'QR scanner' },
      { type: 'image', src: '/projects/hackudc-app/media/people-list-view.PNG', caption: 'Participants list' },
      { type: 'image', src: '/projects/hackudc-app/media/person-detail-view.PNG', caption: 'Participant detail' },
      { type: 'image', src: '/projects/hackudc-app/media/presence-view.PNG', caption: 'Presence tracking' },
      { type: 'image', src: '/projects/hackudc-app/media/meal-pass-stats.PNG', caption: 'Meal pass stats' },
      { type: 'image', src: '/projects/hackudc-app/media/mealpass-repeated-redeem.PNG', caption: 'Repeated redeem prevention' },
    ],
    year: 2026,
    featured: true,
  },
];
