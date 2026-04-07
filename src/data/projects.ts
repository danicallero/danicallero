export interface Project {
  title: string;
  description: string;
  tags: string[];
  github?: string;
  url?: string;
  year: number;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: 'HackUDC 2026 website',
    description:
      'Collaborated on the official website for an open-source hackathon organised by GPUL at the University of A Coruña.',
    tags: ['Astro', 'Tailwind CSS', 'TypeScript'],
    github: 'https://github.com/gpul-org/hackudc-2026',
    year: 2026,
    featured: true,
  },
  {
    title: 'FastTrack',
    description:
      'Shipped in just 48 hours a digital queue management system for hackathon judging. Teams get queue numbers and real-time position updates, eliminating the crowd chaos of traditional judging rounds. Altough it is arguably rough around the edges based on the time constraints, it survived over 400 concurrent users.',
    tags: ['Hackathon', 'Next.js', 'Supabase', 'TypeScript', 'Tailwind CSS'],
    github: 'https://github.com/gpul-org/fasttrack',
    year: 2026,
    featured: true,
  },
  {
    title: 'pkpassBuilder',
    description:
      'Automates creation of Apple Wallet passes for events — generates personalised QR codes and cryptographically signed .pkpass files from JSON data.',
    tags: ['Python', 'PassKit'],
    github: 'https://github.com/danicallero/pkpassBuilder',
    year: 2026,
    featured: true,
  },
  {
    title: 'HackUDC Management App',
    description:
      'React Native app for HackUDC´s event operations.',
    tags: ['React Native', 'TypeScript'],
    year: 2026,
    featured: true,
  }
];
