# Code Citations

## License: unknown
https://github.com/theCosmicGame/mdb-test/blob/e3dc188f7affebe2075f28fbefb26e1bbc91fee8/packages/mdb/app/src/pro/core/forms/Datepicker/utils/hooks/useDatepickerBodyScroll.ts

```
Found the issue! **The problem is in your `section-container` class.** When the Header loads, it likely has a different width calculation, causing horizontal overflow. Here's the fix:

## Main Issues:

1. **`section-container` might not have `width: 100%`** - causing it to overflow beyond viewport
2. **Mobile menu `absolute` positioning** - can cause overflow if `section-container` isn't constrained
3. **Missing `box-sizing` on the header wrapper**

## Fix for Header.jsx:

````jsx
// filepath: c:\Users\HP\Music\Spherekings-Marketplace-and-Afiliates\FRONTEND_AUTH_IMPLEMENTATION\src\sections\Header.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Menu, X, Crown } from 'lucide-react';

const HeaderContent = () => {
  const [isScrolled, setIsScrolled] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const registerHref = ref ? `/register?ref=${ref}` : '/register';

  useEffect(() => {
    setIsMounted(true);
    setIsScrolled(window.scrollY > 50);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Products', href: '#products' },
    { label: 'Influencers', href: '#influencers' },
    { label: 'Sponsorships', href: '#sponsorships' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 will-change-transform ${
        isMounted ? (isScrolled ? 'bg-white/95
```


## License: unknown
https://github.com/theCosmicGame/mdb-test/blob/e3dc188f7affebe2075f28fbefb26e1bbc91fee8/packages/mdb/app/src/pro/core/forms/Datepicker/utils/hooks/useDatepickerBodyScroll.ts

```
Found the issue! **The problem is in your `section-container` class.** When the Header loads, it likely has a different width calculation, causing horizontal overflow. Here's the fix:

## Main Issues:

1. **`section-container` might not have `width: 100%`** - causing it to overflow beyond viewport
2. **Mobile menu `absolute` positioning** - can cause overflow if `section-container` isn't constrained
3. **Missing `box-sizing` on the header wrapper**

## Fix for Header.jsx:

````jsx
// filepath: c:\Users\HP\Music\Spherekings-Marketplace-and-Afiliates\FRONTEND_AUTH_IMPLEMENTATION\src\sections\Header.jsx
"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Menu, X, Crown } from 'lucide-react';

const HeaderContent = () => {
  const [isScrolled, setIsScrolled] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const registerHref = ref ? `/register?ref=${ref}` : '/register';

  useEffect(() => {
    setIsMounted(true);
    setIsScrolled(window.scrollY > 50);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Products', href: '#products' },
    { label: 'Influencers', href: '#influencers' },
    { label: 'Sponsorships', href: '#sponsorships' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 will-change-transform ${
        isMounted ? (isScrolled ? 'bg-white/95
```

