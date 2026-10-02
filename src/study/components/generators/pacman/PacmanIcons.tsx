import React from 'react';
import { CollectibleItem } from './pacmanData';

interface CollectibleVisualProps {
  item: CollectibleItem;
  size?: number;
  className?: string;
  glow?: boolean;
}

// Generates raw SVG inner elements for an item
export const getItemSvgInner = (item: CollectibleItem): string => {
  const { id, color, accentColor } = item;

  // 1. BIOLOGY
  if (id === 'bio-baobab') {
    return `
      <g>
        <path d="M 10 23 L 11 15 C 10 13 8 13 8 11 C 8 10 10 9 12 11 L 13 11 C 13 8 14 6 14 5 C 14 6 15 8 15 11 L 16 11 C 18 9 20 10 20 11 C 20 13 18 13 17 15 L 18 23 Z" fill="#92400E" stroke="#B45309" stroke-width="0.8" />
        <ellipse cx="14" cy="7" rx="10" ry="4" fill="${color}" opacity="0.9" />
        <ellipse cx="14" cy="6" rx="7" ry="3" fill="${accentColor}" opacity="0.6" />
        <path d="M 11 17 Q 14 16 17 17" stroke="#78350F" stroke-width="1" fill="none" />
      </g>
    `;
  }
  if (id === 'bio-oak') {
    return `
      <g>
        <rect x="12" y="17" width="4" height="7" rx="1" fill="#78350F" />
        <circle cx="14" cy="11" r="8" fill="${color}" />
        <circle cx="9" cy="12" r="5.5" fill="${color}" />
        <circle cx="19" cy="12" r="5.5" fill="${color}" />
        <circle cx="14" cy="8" r="5" fill="${accentColor}" opacity="0.85" />
      </g>
    `;
  }
  if (id === 'bio-pine') {
    return `
      <g stroke="#14532D" stroke-width="0.8" stroke-linejoin="round">
        <rect x="12.5" y="19" width="3" height="5" fill="#78350F" stroke="none" />
        <polygon points="14,3 19,9 9,9" fill="${accentColor}" />
        <polygon points="14,7 21,14 7,14" fill="${color}" />
        <polygon points="14,12 23,20 5,20" fill="#15803D" />
      </g>
    `;
  }
  if (id === 'bio-palm') {
    return `
      <g>
        <path d="M 14 24 Q 13 17 14 11" stroke="#92400E" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M 14 11 Q 8 6 4 10" stroke="${color}" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <path d="M 14 11 Q 20 6 24 10" stroke="${color}" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <path d="M 14 11 Q 14 4 11 3" stroke="${accentColor}" stroke-width="2.2" stroke-linecap="round" fill="none" />
        <path d="M 14 11 Q 14 4 17 3" stroke="${accentColor}" stroke-width="2.2" stroke-linecap="round" fill="none" />
        <circle cx="14" cy="12" r="1.5" fill="#78350F" />
      </g>
    `;
  }
  if (id === 'bio-maple') {
    return `
      <g>
        <line x1="14" y1="18" x2="14" y2="24" stroke="#78350F" stroke-width="2" stroke-linecap="round" />
        <path d="M 14 4 L 16 10 L 22 8 L 19 13 L 23 16 L 16 17 L 14 21 L 12 17 L 5 16 L 9 13 L 6 8 L 12 10 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="1" stroke-linejoin="round" />
        <path d="M 14 8 L 14 17 M 14 13 L 18 10 M 14 13 L 10 10" stroke="#FEE2E2" stroke-width="0.8" opacity="0.8" fill="none" />
      </g>
    `;
  }
  if (id === 'bio-acacia') {
    return `
      <g>
        <path d="M 14 24 L 14 16 L 8 10 M 14 16 L 20 10 M 14 16 L 14 9" stroke="#78350F" stroke-width="2.2" stroke-linecap="round" fill="none" />
        <ellipse cx="14" cy="8" rx="11" ry="3.5" fill="${color}" />
        <ellipse cx="14" cy="7" rx="8" ry="2.2" fill="${accentColor}" opacity="0.9" />
      </g>
    `;
  }
  if (id === 'bio-fern') {
    return `
      <g stroke="${color}" stroke-width="1.8" stroke-linecap="round" fill="none">
        <path d="M 6 24 Q 13 18 20 4" stroke-width="2.2" />
        <line x1="10" y1="20" x2="7" y2="17" />
        <line x1="10" y1="20" x2="14" y2="19" />
        <line x1="13" y1="16" x2="9" y2="12" />
        <line x1="13" y1="16" x2="17" y2="15" />
        <line x1="16" y1="11" x2="12" y2="8" />
        <line x1="16" y1="11" x2="19" y2="10" />
      </g>
    `;
  }
  if (id === 'bio-moss') {
    return `
      <g>
        <ellipse cx="14" cy="18" rx="10" ry="5" fill="#15803D" />
        <circle cx="9" cy="15" r="4.5" fill="${color}" />
        <circle cx="15" cy="14" r="5" fill="${accentColor}" />
        <circle cx="19" cy="16" r="4" fill="${color}" />
        <circle cx="13" cy="11" r="1.5" fill="#FEF08A" />
        <line x1="13" y1="11" x2="13" y2="14" stroke="#65A30D" stroke-width="1" />
      </g>
    `;
  }
  if (id === 'bio-sunflower') {
    return `
      <g>
        <circle cx="14" cy="14" r="5" fill="#78350F" />
        <circle cx="14" cy="14" r="3.2" fill="#451A03" />
        <path d="M 14 3 L 15.5 8 L 14 9 L 12.5 8 Z" fill="#FBBF24" />
        <path d="M 14 25 L 15.5 20 L 14 19 L 12.5 20 Z" fill="#FBBF24" />
        <path d="M 3 14 L 8 15.5 L 9 14 L 8 12.5 Z" fill="#FBBF24" />
        <path d="M 25 14 L 20 15.5 L 19 14 L 20 12.5 Z" fill="#FBBF24" />
        <path d="M 6 6 L 10 9 L 10 11 L 8 10 Z" fill="#F59E0B" />
        <path d="M 22 22 L 18 19 L 18 17 L 20 18 Z" fill="#F59E0B" />
        <path d="M 22 6 L 18 9 L 18 11 L 20 10 Z" fill="#F59E0B" />
        <path d="M 6 22 L 10 19 L 10 17 L 8 18 Z" fill="#F59E0B" />
      </g>
    `;
  }
  if (id === 'bio-aloe') {
    return `
      <g stroke="#0F766E" stroke-width="0.8" stroke-linejoin="round">
        <path d="M 14 24 L 14 4 L 15 24 Z" fill="${accentColor}" />
        <path d="M 14 24 Q 9 14 4 10 Q 11 16 14 24 Z" fill="${color}" />
        <path d="M 14 24 Q 19 14 24 10 Q 17 16 14 24 Z" fill="${color}" />
        <path d="M 14 24 Q 10 18 7 17 Q 12 20 14 24 Z" fill="#14B8A6" />
        <path d="M 14 24 Q 18 18 21 17 Q 16 20 14 24 Z" fill="#14B8A6" />
      </g>
    `;
  }
  if (id === 'bio-lion') {
    return `
      <g>
        <circle cx="14" cy="14" r="9" fill="#B45309" />
        <circle cx="14" cy="14.5" r="5.5" fill="#FBBF24" />
        <circle cx="10" cy="8" r="2.5" fill="#B45309" />
        <circle cx="18" cy="8" r="2.5" fill="#B45309" />
        <circle cx="12" cy="13.5" r="1.2" fill="#1E293B" />
        <circle cx="16" cy="13.5" r="1.2" fill="#1E293B" />
        <polygon points="14,16 12.5,14.5 15.5,14.5" fill="#78350F" />
        <line x1="14" y1="16" x2="14" y2="18" stroke="#78350F" stroke-width="1" />
      </g>
    `;
  }
  if (id === 'bio-elephant') {
    return `
      <g>
        <ellipse cx="14" cy="13" rx="7.5" ry="6.5" fill="#94A3B8" />
        <ellipse cx="7" cy="11" rx="4.5" ry="5.5" fill="#64748B" />
        <ellipse cx="21" cy="11" rx="4.5" ry="5.5" fill="#64748B" />
        <path d="M 12.5 15 C 12.5 19 14 22 17 22 Q 18 20 15 19" stroke="#64748B" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M 11 16 Q 9 20 10 21" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" />
        <path d="M 16 16 Q 18 20 17 21" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" fill="none" />
        <circle cx="11.5" cy="11" r="1" fill="#0F172A" />
        <circle cx="16.5" cy="11" r="1" fill="#0F172A" />
      </g>
    `;
  }
  if (id === 'bio-giraffe') {
    return `
      <g>
        <path d="M 12 24 L 13 8 L 17 8 L 18 24 Z" fill="#FBBF24" />
        <ellipse cx="15" cy="7" rx="3.5" ry="2.8" fill="#FBBF24" />
        <line x1="13.5" y1="5" x2="13.5" y2="3.5" stroke="#78350F" stroke-width="1.2" stroke-linecap="round" />
        <line x1="16.5" y1="5" x2="16.5" y2="3.5" stroke="#78350F" stroke-width="1.2" stroke-linecap="round" />
        <rect x="13.5" y="11" width="2.5" height="3" rx="1" fill="#B45309" />
        <rect x="14" y="16" width="3" height="3" rx="1" fill="#B45309" />
        <rect x="13" y="20" width="3.5" height="2.5" rx="1" fill="#B45309" />
        <circle cx="16.5" cy="7" r="0.9" fill="#0F172A" />
      </g>
    `;
  }
  if (id === 'bio-zebra') {
    return `
      <g>
        <path d="M 8 22 Q 10 14 13 8 L 19 8 Q 20 14 20 22 Z" fill="#F8FAFC" stroke="#0F172A" stroke-width="0.8" />
        <line x1="10" y1="18" x2="18" y2="18" stroke="#0F172A" stroke-width="1.8" />
        <line x1="11" y1="14" x2="19" y2="14" stroke="#0F172A" stroke-width="1.8" />
        <line x1="12" y1="10" x2="18" y2="10" stroke="#0F172A" stroke-width="1.8" />
        <circle cx="17" cy="8.5" r="1.1" fill="#0F172A" />
        <polygon points="12,5 14,8 11,8" fill="#0F172A" />
      </g>
    `;
  }
  if (id === 'bio-penguin') {
    return `
      <g>
        <ellipse cx="14" cy="14" rx="7" ry="9" fill="#0F172A" />
        <ellipse cx="14" cy="15" rx="4.5" ry="7" fill="#FFFFFF" />
        <ellipse cx="7" cy="14" rx="1.5" ry="5" fill="#0F172A" transform="rotate(15 7 14)" />
        <ellipse cx="21" cy="14" rx="1.5" ry="5" fill="#0F172A" transform="rotate(-15 21 14)" />
        <polygon points="14,11 12,13 16,13" fill="#F97316" />
        <ellipse cx="11.5" cy="23" rx="2" ry="1" fill="#F97316" />
        <ellipse cx="16.5" cy="23" rx="2" ry="1" fill="#F97316" />
        <circle cx="12" cy="9.5" r="0.8" fill="#0F172A" />
        <circle cx="16" cy="9.5" r="0.8" fill="#0F172A" />
      </g>
    `;
  }
  if (id === 'bio-eagle') {
    return `
      <g>
        <path d="M 8 22 C 8 16 11 12 14 8 C 17 12 20 16 20 22 Z" fill="#78350F" />
        <ellipse cx="14" cy="10" rx="4.5" ry="4" fill="#FFFFFF" />
        <path d="M 14 10 Q 18 10 19 13 Q 16 13 14 12" fill="#FBBF24" />
        <circle cx="13" cy="9.5" r="1" fill="#0F172A" />
      </g>
    `;
  }
  if (id === 'bio-frog') {
    return `
      <g>
        <ellipse cx="14" cy="15" rx="8" ry="6.5" fill="${color}" />
        <circle cx="9" cy="9" r="3.2" fill="${color}" />
        <circle cx="19" cy="9" r="3.2" fill="${color}" />
        <circle cx="9" cy="9" r="2" fill="#F97316" />
        <circle cx="19" cy="9" r="2" fill="#F97316" />
        <circle cx="9" cy="9" r="1" fill="#0F172A" />
        <circle cx="19" cy="9" r="1" fill="#0F172A" />
        <path d="M 10 16 Q 14 19 18 16" stroke="#065F46" stroke-width="1.4" fill="none" />
        <circle cx="14" cy="14" r="1" fill="${accentColor}" />
      </g>
    `;
  }
  if (id === 'bio-butterfly') {
    return `
      <g stroke="#831843" stroke-width="0.8">
        <ellipse cx="14" cy="14" rx="1.5" ry="6" fill="#0F172A" stroke="none" />
        <path d="M 14 11 C 11 4 4 6 5 12 C 6 15 13 14 14 14 Z" fill="${color}" />
        <path d="M 14 11 C 17 4 24 6 23 12 C 22 15 15 14 14 14 Z" fill="${color}" />
        <path d="M 14 14 C 11 15 7 18 8 22 C 10 24 13 19 14 16 Z" fill="${accentColor}" />
        <path d="M 14 14 C 17 15 21 18 20 22 C 18 24 15 19 14 16 Z" fill="${accentColor}" />
        <path d="M 13.5 8 Q 11 4 9 4 M 14.5 8 Q 17 4 19 4" stroke="#0F172A" stroke-width="1" fill="none" />
      </g>
    `;
  }
  if (id === 'bio-octopus') {
    return `
      <g>
        <ellipse cx="14" cy="11" rx="6.5" ry="7" fill="${color}" />
        <circle cx="11.5" cy="11" r="1.5" fill="#FFFFFF" />
        <circle cx="16.5" cy="11" r="1.5" fill="#FFFFFF" />
        <circle cx="11.5" cy="11" r="0.9" fill="#0F172A" />
        <circle cx="16.5" cy="11" r="0.9" fill="#0F172A" />
        <path d="M 9 17 Q 6 22 8 24 M 11 17 Q 10 23 12 24 M 17 17 Q 18 23 16 24 M 19 17 Q 22 22 20 24" stroke="${color}" stroke-width="2.2" stroke-linecap="round" fill="none" />
      </g>
    `;
  }
  if (id === 'bio-dolphin') {
    return `
      <g>
        <path d="M 4 18 C 9 10 18 8 23 12 C 21 15 16 17 12 18 C 8 19 5 21 4 18 Z" fill="${color}" />
        <polygon points="14,10 17,6 18,10" fill="${color}" />
        <polygon points="4,18 2,15 3,21" fill="${accentColor}" />
        <circle cx="19" cy="12" r="1" fill="#FFFFFF" />
        <circle cx="19.2" cy="12" r="0.6" fill="#0F172A" />
      </g>
    `;
  }
  if (id === 'bio-animal-cell') {
    return `
      <g>
        <circle cx="14" cy="14" r="9.5" fill="${color}33" stroke="${color}" stroke-width="2" />
        <circle cx="14" cy="14" r="4" fill="${accentColor}" opacity="0.9" />
        <circle cx="14" cy="14" r="1.8" fill="#4C1D95" />
        <ellipse cx="8.5" cy="11" rx="1.8" ry="1" fill="#F43F5E" transform="rotate(30 8.5 11)" />
        <ellipse cx="18" cy="17" rx="1.8" ry="1" fill="#F43F5E" transform="rotate(-20 18 17)" />
        <circle cx="17.5" cy="9.5" r="1" fill="#10B981" />
      </g>
    `;
  }
  if (id === 'bio-plant-cell') {
    return `
      <g>
        <rect x="5" y="5" width="18" height="18" rx="4" fill="${color}33" stroke="${color}" stroke-width="2.5" />
        <rect x="7" y="7" width="14" height="14" rx="2.5" fill="none" stroke="${accentColor}" stroke-width="1.2" />
        <ellipse cx="14" cy="14" rx="5" ry="4" fill="#38BDF8" opacity="0.6" />
        <circle cx="9.5" cy="10" r="2" fill="#A855F7" />
        <circle cx="18" cy="10" r="1.3" fill="#15803D" />
        <circle cx="17.5" cy="17.5" r="1.3" fill="#15803D" />
      </g>
    `;
  }
  if (id === 'bio-nucleus') {
    return `
      <g>
        <circle cx="14" cy="14" r="9" fill="${color}44" stroke="${color}" stroke-width="2" stroke-dasharray="3,1.5" />
        <circle cx="14" cy="14" r="4.5" fill="${accentColor}" />
        <circle cx="14" cy="14" r="2.2" fill="#581C87" />
        <circle cx="9" cy="14" r="1" fill="${color}" />
        <circle cx="19" cy="14" r="1" fill="${color}" />
        <circle cx="14" cy="9" r="1" fill="${color}" />
        <circle cx="14" cy="19" r="1" fill="${color}" />
      </g>
    `;
  }
  if (id === 'bio-mitochondria') {
    return `
      <g stroke="${color}" stroke-width="1.6" fill="none">
        <ellipse cx="14" cy="14" rx="9" ry="5.5" transform="rotate(-30 14 14)" fill="${color}44" />
        <path d="M 8 16 Q 13 12 13 15 Q 16 11 19 13" stroke="${accentColor}" stroke-width="1.8" stroke-linecap="round" />
      </g>
    `;
  }
  if (id === 'bio-rbc' || id === 'med-rbc') {
    return `
      <g>
        <ellipse cx="14" cy="14" rx="9" ry="7" fill="#E11D48" />
        <ellipse cx="14" cy="14" rx="5" ry="3.2" fill="#9F1239" />
        <ellipse cx="14" cy="14" rx="2.5" ry="1.5" fill="#BE123C" />
      </g>
    `;
  }
  if (id === 'bio-neuron' || id === 'med-neuron') {
    return `
      <g stroke="${color}" stroke-width="1.8" stroke-linecap="round" fill="none">
        <circle cx="9" cy="9" r="3" fill="${color}" stroke="none" />
        <line x1="9" y1="9" x2="20" y2="20" stroke="${accentColor}" stroke-width="2.4" />
        <line x1="9" y1="9" x2="5" y2="6" />
        <line x1="9" y1="9" x2="5" y2="13" />
        <line x1="9" y1="9" x2="12" y2="4" />
        <line x1="20" y1="20" x2="23" y2="18" />
        <line x1="20" y1="20" x2="21" y2="24" />
      </g>
    `;
  }
  if (id === 'bio-chromosome') {
    return `
      <g stroke="${color}" stroke-width="3" stroke-linecap="round" fill="none">
        <line x1="8" y1="6" x2="20" y2="22" stroke="${accentColor}" />
        <line x1="20" y1="6" x2="8" y2="22" />
        <circle cx="14" cy="14" r="2.2" fill="#6B21A8" stroke="none" />
      </g>
    `;
  }
  if (id === 'bio-bacterium') {
    return `
      <g>
        <rect x="7" y="10" width="14" height="8" rx="4" fill="${color}" stroke="#065F46" stroke-width="1.2" />
        <path d="M 7 14 C 4 12 4 16 1 14" stroke="${accentColor}" stroke-width="1.5" stroke-linecap="round" fill="none" />
        <circle cx="11" cy="14" r="1" fill="#FFFFFF" />
        <circle cx="15" cy="14" r="1" fill="#FFFFFF" />
      </g>
    `;
  }
  if (id === 'bio-virus') {
    return `
      <g stroke="${color}" stroke-width="1.5" stroke-linecap="round">
        <polygon points="14,5 19,9 19,15 14,19 9,15 9,9" fill="${color}55" />
        <circle cx="14" cy="12" r="2.5" fill="${accentColor}" stroke="none" />
        <line x1="9" y1="9" x2="5" y2="6" />
        <line x1="19" y1="9" x2="23" y2="6" />
        <line x1="19" y1="15" x2="23" y2="18" />
        <line x1="9" y1="15" x2="5" y2="18" />
        <line x1="14" y1="19" x2="14" y2="24" />
      </g>
    `;
  }
  if (id === 'bio-dna-helix' || id === 'sci-dna') {
    return `
      <g stroke="${color}" stroke-width="2" stroke-linecap="round">
        <path d="M 6 5 Q 14 14 22 5" fill="none" />
        <path d="M 6 23 Q 14 14 22 23" fill="none" />
        <line x1="9" y1="8" x2="9" y2="20" stroke="#EF4444" stroke-width="1.6" />
        <line x1="14" y1="13" x2="14" y2="15" stroke="#FBBF24" stroke-width="1.6" />
        <line x1="19" y1="8" x2="19" y2="20" stroke="#3B82F6" stroke-width="1.6" />
      </g>
    `;
  }

  // 2. MATHEMATICS
  if (id === 'math-pi') {
    return `
      <g>
        <path d="M 5 9 Q 14 7 23 7" stroke="${color}" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M 10 9 C 9.5 15 9.5 19 8 23" stroke="${accentColor}" stroke-width="2.8" stroke-linecap="round" fill="none" />
        <path d="M 17 8 C 17.5 14 17.5 19 18.5 21 Q 19 23 22 23" stroke="${color}" stroke-width="2.8" stroke-linecap="round" fill="none" />
      </g>
    `;
  }
  if (id === 'math-sqrt') {
    return `
      <path d="M 4 16 L 8 16 L 11 23 L 15 5 L 24 5" stroke="${color}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    `;
  }
  if (id === 'math-infinity') {
    return `
      <path d="M 14 14 C 18 9 24 9 24 14 C 24 19 18 19 14 14 C 10 9 4 9 4 14 C 4 19 10 19 14 14 Z" stroke="${color}" stroke-width="2.8" stroke-linecap="round" fill="none" />
    `;
  }
  if (id === 'math-integral') {
    return `
      <path d="M 20 6 C 15 6 14 9 14 14 C 14 19 13 22 8 22" stroke="${color}" stroke-width="2.8" stroke-linecap="round" fill="none" />
    `;
  }
  if (id === 'math-summation') {
    return `
      <path d="M 22 7 L 7 7 L 14 14 L 7 21 L 22 21" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    `;
  }
  if (id === 'math-cube') {
    return `
      <g stroke="${color}" stroke-width="1.8" stroke-linejoin="round" fill="${color}33">
        <polygon points="14,4 23,9 14,14 5,9" />
        <polygon points="5,9 14,14 14,24 5,19" fill="${color}55" />
        <polygon points="14,14 23,9 23,19 14,24" fill="${color}77" />
      </g>
    `;
  }

  // 3. SCIENCE
  if (id === 'sci-atom') {
    return `
      <g stroke="${color}" stroke-width="1.6" fill="none">
        <ellipse cx="14" cy="14" rx="9" ry="3.5" transform="rotate(0 14 14)" />
        <ellipse cx="14" cy="14" rx="9" ry="3.5" transform="rotate(60 14 14)" />
        <ellipse cx="14" cy="14" rx="9" ry="3.5" transform="rotate(120 14 14)" />
        <circle cx="14" cy="14" r="3" fill="${accentColor}" stroke="none" />
      </g>
    `;
  }
  if (id === 'sci-microscope' || id === 'med-microscope') {
    return `
      <g stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <line x1="6" y1="23" x2="22" y2="23" stroke-width="2.5" />
        <path d="M 14 23 L 14 17" />
        <path d="M 11 17 L 17 17" />
        <path d="M 14 14 C 9 14 9 8 13 6 L 16 11 Z" fill="${color}44" />
      </g>
    `;
  }
  if (id === 'sci-magnet') {
    return `
      <g stroke-linecap="round">
        <path d="M 8 6 L 8 15 A 6 6 0 0 0 20 15 L 20 6" stroke="${color}" stroke-width="3" fill="none" />
        <line x1="8" y1="6" x2="8" y2="10" stroke="#EF4444" stroke-width="3.5" />
        <line x1="20" y1="6" x2="20" y2="10" stroke="#3B82F6" stroke-width="3.5" />
      </g>
    `;
  }
  if (id === 'sci-telescope') {
    return `
      <g stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <line x1="6" y1="20" x2="19" y2="7" stroke-width="3" stroke="${accentColor}" />
        <rect x="16" y="5" width="6" height="4" rx="1" fill="${color}" stroke="none" />
        <line x1="10" y1="16" x2="7" y2="24" />
        <line x1="12" y1="14" x2="15" y2="24" />
      </g>
    `;
  }

  // 4. MEDICINE
  if (id === 'med-heart') {
    return `
      <path d="M 14 22 C 7 17 4 12 4 8 A 5 5 0 0 1 14 6 A 5 5 0 0 1 24 8 C 24 12 21 17 14 22 Z" fill="#E11D48" stroke="#FDA4AF" stroke-width="1.8" />
    `;
  }
  if (id === 'med-brain') {
    return `
      <g stroke="${color}" stroke-width="1.8" fill="${color}44" stroke-linecap="round">
        <path d="M 14 6 C 9 6 6 9 6 14 C 6 19 9 22 14 22 C 19 22 22 19 22 14 C 22 9 19 6 14 6 Z" />
        <path d="M 10 10 Q 14 14 10 18 M 18 10 Q 14 14 18 18 M 14 6 L 14 22" stroke="${accentColor}" stroke-width="1.4" fill="none" />
      </g>
    `;
  }
  if (id === 'med-stethoscope') {
    return `
      <g stroke="${color}" stroke-width="2" stroke-linecap="round" fill="none">
        <path d="M 8 5 L 8 12 C 8 16 20 16 20 12 L 20 5" />
        <path d="M 14 16 L 14 20" />
        <circle cx="14" cy="22" r="2.8" fill="${accentColor}" stroke="${color}" stroke-width="1.6" />
      </g>
    `;
  }

  // 5. FINANCE
  if (id === 'fin-coin') {
    return `
      <g>
        <circle cx="14" cy="14" r="9.5" fill="#F59E0B" stroke="#FDE68A" stroke-width="1.5" />
        <circle cx="14" cy="14" r="7" fill="#D97706" />
        <text x="14" y="18" fill="#FEF08A" font-size="11" font-weight="900" font-family="monospace" text-anchor="middle">$</text>
      </g>
    `;
  }
  if (id === 'fin-banknote') {
    return `
      <g stroke="#10B981" stroke-width="1.5" fill="#065F46">
        <rect x="4" y="8" width="20" height="12" rx="2" />
        <circle cx="14" cy="14" r="3" fill="#34D399" />
      </g>
    `;
  }
  if (id === 'fin-stockchart') {
    return `
      <g stroke-linecap="round" stroke-linejoin="round" fill="none">
        <line x1="4" y1="22" x2="24" y2="22" stroke="#64748B" stroke-width="1.5" />
        <path d="M 5 19 L 10 13 L 15 16 L 23 6" stroke="#10B981" stroke-width="2.5" />
        <circle cx="23" cy="6" r="2" fill="#34D399" />
      </g>
    `;
  }

  // 6. TECHNOLOGY
  if (id === 'tech-microchip') {
    return `
      <g stroke="${color}" stroke-width="1.5" fill="${color}44">
        <rect x="7" y="7" width="14" height="14" rx="2.5" />
        <line x1="9" y1="4" x2="9" y2="7" stroke-width="1.8" />
        <line x1="14" y1="4" x2="14" y2="7" stroke-width="1.8" />
        <line x1="19" y1="4" x2="19" y2="7" stroke-width="1.8" />
        <line x1="9" y1="21" x2="9" y2="24" stroke-width="1.8" />
        <line x1="14" y1="21" x2="14" y2="24" stroke-width="1.8" />
        <line x1="19" y1="21" x2="19" y2="24" stroke-width="1.8" />
        <circle cx="14" cy="14" r="3" fill="${accentColor}" />
      </g>
    `;
  }
  if (id === 'tech-robot' || id === 'tech-ai') {
    return `
      <g stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="${color}44">
        <line x1="14" y1="4" x2="14" y2="7" />
        <circle cx="14" cy="4" r="1.5" fill="${accentColor}" />
        <rect x="6" y="7" width="16" height="13" rx="3" />
        <circle cx="10" cy="12" r="2" fill="${accentColor}" />
        <circle cx="18" cy="12" r="2" fill="${accentColor}" />
        <line x1="10" y1="16" x2="18" y2="16" stroke="${accentColor}" stroke-width="1.5" />
      </g>
    `;
  }
  if (id === 'tech-code') {
    return `
      <g stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <polyline points="9,9 5,14 9,19" />
        <polyline points="19,9 23,14 19,19" />
        <line x1="15" y1="7" x2="13" y2="21" stroke="${accentColor}" stroke-width="2" />
      </g>
    `;
  }

  // 7. POLITICS
  if (id === 'pol-parliament' || id === 'pol-court' || id === 'fin-bank') {
    return `
      <g stroke="${color}" stroke-width="1.5" stroke-linejoin="round" fill="${color}33">
        <polygon points="14,4 24,10 4,10" fill="${color}" />
        <rect x="6" y="10" width="2" height="9" fill="${accentColor}" />
        <rect x="11" y="10" width="2" height="9" fill="${accentColor}" />
        <rect x="15" y="10" width="2" height="9" fill="${accentColor}" />
        <rect x="20" y="10" width="2" height="9" fill="${accentColor}" />
        <rect x="4" y="19" width="20" height="4" fill="${color}" />
      </g>
    `;
  }
  if (id === 'pol-gavel') {
    return `
      <g stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <line x1="8" y1="20" x2="17" y2="11" stroke-width="2.5" />
        <rect x="14" y="6" width="6" height="10" rx="1.5" transform="rotate(45 17 11)" fill="${color}" />
        <line x1="5" y1="23" x2="13" y2="23" stroke-width="3" stroke="${accentColor}" />
      </g>
    `;
  }
  if (id === 'pol-ballotbox') {
    return `
      <g stroke="${color}" stroke-width="1.8" stroke-linejoin="round" fill="${color}44">
        <rect x="6" y="10" width="16" height="13" rx="2" />
        <line x1="10" y1="10" x2="18" y2="10" stroke-width="2.8" />
        <polygon points="12,5 16,5 15,11 13,11" fill="${accentColor}" />
      </g>
    `;
  }

  // 8. GEOGRAPHY
  if (id === 'geo-mountain') {
    return `
      <g stroke="${color}" stroke-width="1.8" stroke-linejoin="round" fill="${color}44">
        <polygon points="14,5 24,23 4,23" />
        <polygon points="14,5 17,11 13,10 10,12" fill="${accentColor}" stroke="none" />
      </g>
    `;
  }
  if (id === 'geo-volcano') {
    return `
      <g stroke="${color}" stroke-width="1.8" stroke-linejoin="round" fill="${color}44">
        <polygon points="10,10 18,10 24,23 4,23" />
        <path d="M 12 10 Q 11 5 8 4 M 16 10 Q 17 5 20 4 M 14 10 L 14 3" stroke="#EF4444" stroke-width="2.2" stroke-linecap="round" />
      </g>
    `;
  }
  if (id === 'geo-compass') {
    return `
      <g>
        <circle cx="14" cy="14" r="9" stroke="${color}" stroke-width="2" fill="${color}22" />
        <polygon points="14,7 16.5,14 14,12 11.5,14" fill="#EF4444" />
        <polygon points="14,21 16.5,14 14,16 11.5,14" fill="#94A3B8" />
        <circle cx="14" cy="14" r="1.5" fill="#FFFFFF" />
      </g>
    `;
  }
  if (id === 'geo-globe' || id === 'sci-earth') {
    return `
      <g>
        <circle cx="14" cy="14" r="8.5" fill="#0284C7" stroke="${color}" stroke-width="2" />
        <path d="M 8 12 Q 13 8 18 13 Q 15 19 8 12 Z" fill="#22C55E" />
        <path d="M 12 7 Q 15 5 17 7 Q 16 9 12 7 Z" fill="#22C55E" />
      </g>
    `;
  }

  // DEFAULT STYLIZED BADGE
  return `
    <g>
      <circle cx="14" cy="14" r="8.5" fill="${color}33" stroke="${color}" stroke-width="2" />
      <circle cx="14" cy="14" r="4" fill="${accentColor}" />
      <text x="14" y="17" fill="#FFFFFF" font-size="8" font-weight="900" font-family="sans-serif" text-anchor="middle">
        ${item.name.slice(0, 1).toUpperCase()}
      </text>
    </g>
  `;
};

// Returns complete SVG data URL ready for HTMLImageElement / canvas drawImage
export const getItemSvgDataUrl = (item: CollectibleItem, size: number = 48): string => {
  const inner = getItemSvgInner(item);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">${inner}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const CollectibleVisual: React.FC<CollectibleVisualProps> = ({
  item,
  size = 28,
  className = '',
  glow = false,
}) => {
  const { id, color, accentColor } = item;
  const innerHtml = getItemSvgInner(item);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className={`inline-block select-none overflow-visible ${className}`}
      style={{
        filter: glow ? `drop-shadow(0 0 8px ${color})` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
      }}
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    />
  );
};
