"use client";

import Layout from '@theme/Layout';
import {
  Box,
  Button,
  Container,
  Heading,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type { CourseConfig } from '../../plugins/classasaurus/types';
import { useCourseConfig } from '../hooks/useCourseConfig';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

type Group = {
  id: string;
  label: string;
};

/** Used when `course.config.json` has no `showcaseGroups` or config failed to load. */
const FALLBACK_SHOWCASE_GROUPS: Group[] = [
  { id: '302', label: 'Group 302' },
  { id: '309', label: 'Group 309' },
  { id: '310', label: 'Group 310' },
  { id: '326', label: 'Group 326' },
  { id: '328', label: 'Group 328' },
  { id: '502', label: 'Group 502' },
  { id: '503', label: 'Group 503' },
  { id: '513', label: 'Group 513' },
  { id: '4601', label: 'Group 4601' },
  { id: '4621', label: 'Group 4621' },
  { id: '4630', label: 'Group 4630' },
];

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableInContainer(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  });
}

function showcaseGroupsFromConfig(config: CourseConfig | null): Group[] {
  const raw = config?.showcaseGroups;
  if (!raw?.length) return FALLBACK_SHOWCASE_GROUPS;
  const mapped = raw
    .filter((g) => typeof g.id === 'string' && g.id.trim() !== '')
    .map((g) => {
      const id = g.id.trim();
      return {
        id,
        label: typeof g.label === 'string' && g.label.trim() !== '' ? g.label.trim() : `Group ${id}`,
      };
    });
  return mapped.length > 0 ? mapped : FALLBACK_SHOWCASE_GROUPS;
}

type LightboxProps = { src: string; label: string; onClose: () => void };

/** Full-screen preview with dialog semantics, focus trap, Escape, and scroll lock. */
function Lightbox({ src, label, onClose }: LightboxProps) {
  const hintId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [imageBroken, setImageBroken] = useState(false);

  onCloseRef.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const prevActive = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(id);
      prevActive?.focus?.();
    };
  }, []);

  const handleContainerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !containerRef.current) return;
    const focusables = getFocusableInContainer(containerRef.current);
    if (focusables.length === 0) return;
    if (focusables.length === 1) {
      e.preventDefault();
      focusables[0].focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const dialogLabel = `${label} full-size infographic preview`;

  return (
    <Box
      ref={containerRef}
      position="fixed"
      inset={0}
      zIndex={1000}
      bg="blackAlpha.900"
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
      onKeyDown={handleContainerKeyDown}
      cursor="zoom-out"
      p={4}
      role="dialog"
      aria-modal="true"
      aria-label={dialogLabel}
      aria-describedby={hintId}
    >
      <Box position="relative" onClick={e => e.stopPropagation()} maxW="95vw" maxH="92vh">
        <Button
          ref={closeRef}
          position="absolute"
          top={2}
          right={2}
          zIndex={2}
          size="sm"
          colorPalette="gray"
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close preview"
        >
          Close
        </Button>
        {imageBroken ? (
          <Box
            maxW="95vw"
            maxH="88vh"
            minH="40vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="bg.muted"
            borderRadius="md"
            px={6}
          >
            <Text color="fg.muted" textAlign="center">
              Image could not be loaded.
            </Text>
          </Box>
        ) : (
          <Image
            src={src}
            alt={`${label} infographic poster, full size`}
            maxW="95vw"
            maxH="88vh"
            objectFit="contain"
            borderRadius="md"
            boxShadow="2xl"
            onError={() => setImageBroken(true)}
          />
        )}
        <Text
          position="absolute"
          bottom={2}
          left={0}
          right={0}
          textAlign="center"
          color="white"
          fontSize="sm"
          fontWeight="medium"
          textShadow="0 1px 3px rgba(0,0,0,0.8)"
          id={hintId}
        >
          {label} — press Escape, use Close, or click outside to dismiss
        </Text>
      </Box>
    </Box>
  );
}

type InfographicCardProps = { group: Group };

function InfographicCard({ group }: InfographicCardProps) {
  const [open, setOpen] = useState(false);
  const [thumbBroken, setThumbBroken] = useState(false);
  const src = useBaseUrl(`/img/showcase/group-${group.id}.png`);

  const openLightbox = useCallback(() => setOpen(true), []);

  const onKeyDownCard = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox();
    }
  };

  return (
    <>
      <Box
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.emphasized"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="sm"
        _hover={{ boxShadow: 'lg', transform: 'translateY(-3px)' }}
        transition="all 0.2s"
        cursor="zoom-in"
        onClick={openLightbox}
        role="button"
        tabIndex={0}
        aria-label={`Open ${group.label} infographic in full size`}
        onKeyDown={onKeyDownCard}
      >
        {thumbBroken ? (
          <Box
            w="100%"
            aspectRatio="16/9"
            bg="bg.muted"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={4}
          >
            <Text fontSize="sm" color="fg.muted" textAlign="center">
              Preview unavailable for {group.label}
            </Text>
          </Box>
        ) : (
          <Image
            src={src}
            alt={`${group.label} infographic poster`}
            w="100%"
            objectFit="contain"
            aspectRatio="16/9"
            display="block"
            bg="bg.muted"
            onError={() => setThumbBroken(true)}
          />
        )}
        <Box px={3} py={2}>
          <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
            {group.label}
          </Text>
        </Box>
      </Box>

      {open && <Lightbox src={src} label={group.label} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Public gallery of final-project infographic posters (groups from `showcaseGroups` in course config). */
export default function ShowcasePage() {
  const courseConfig = useCourseConfig();
  const groups = useMemo(() => showcaseGroupsFromConfig(courseConfig), [courseConfig]);

  return (
    <Layout
      title="Project Gallery"
      description="Spring 2026 final project infographic posters from CS 3100 student teams"
    >
      <Container maxW="container.xl" py={8}>
        <VStack gap={6} align="stretch">
          <VStack gap={2} align="stretch">
            <Heading size="xl">Spring 2026 Project Gallery</Heading>
            <Text fontSize="md" color="fg.muted">
              Infographic posters from CS 3100 final project teams who opted in to public display.
              Each poster summarizes a team's{' '}
              <Link to="https://www.cookyourbooks.app/">CookYourBooks</Link>
              {' '}
              application — its architecture, features, and team contributions. The work shown here
              follows the semester-long project described in the{' '}
              <Link to="/assignments">assignments overview</Link>
              . Click any poster or focus a card and press Enter or Space to view it full size.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
            {groups.map(group => (
              <InfographicCard key={group.id} group={group} />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Layout>
  );
}
