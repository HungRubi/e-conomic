'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { Ad } from '@/lib/ads';

interface AdBannerProps {
  ad: Ad;
  index?: number;
}

export default function AdBanner({ ad, index = 0 }: AdBannerProps) {
  const isExternal = ad.link.startsWith('http');

  const content = (
    <>
      <Image
        src={ad.image}
        alt={ad.alt}
        fill
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      <div className="absolute inset-0 flex items-center p-6 md:p-10">
        <div className="max-w-lg">
          <h3 className="text-lg md:text-2xl font-bold text-white drop-shadow-sm">
            {ad.alt}
          </h3>
          <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white transition-colors">
            Khám phá ngay <ExternalLink className="h-4 w-4" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl bg-bg"
      style={{
        height: ad.type === 'compact' ? 'clamp(140px, 18vh, 180px)' : 'clamp(120px, 16vh, 160px)',
      }}
    >
      {isExternal ? (
        <a
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full w-full"
        >
          {content}
        </a>
      ) : (
        <Link href={ad.link} className="block h-full w-full">
          {content}
        </Link>
      )}
    </motion.section>
  );
}
