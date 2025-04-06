'use client';

import { Github, Twitter, Linkedin, Globe, ExternalLink } from 'lucide-react';

interface SocialLink {
  title: string;
  url: string;
}

interface SocialLinksProps {
  links: SocialLink[];
}

export default function SocialLinks({ links }: SocialLinksProps) {
  function getSocialIcon(url: string) {
    const domain = new URL(url).hostname.toLowerCase();
    
    if (domain.includes('github')) return <Github className="h-5 w-5" />;
    if (domain.includes('twitter') || domain.includes('x.com')) return <Twitter className="h-5 w-5" />;
    if (domain.includes('linkedin')) return <Linkedin className="h-5 w-5" />;
    if (domain.includes('portfolio') || domain.includes('website')) return <Globe className="h-5 w-5" />;
    return <ExternalLink className="h-5 w-5" />;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
          title={link.title}
        >
          {getSocialIcon(link.url)}
          <span>{link.title}</span>
        </a>
      ))}
    </div>
  );
} 