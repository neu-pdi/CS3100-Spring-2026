import Layout from '@theme/Layout';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Image,
} from '@chakra-ui/react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useState } from 'react';

type Group = {
  id: string;
  label: string;
};

const GROUPS: Group[] = [
  { id: '302',  label: 'Group 302'  },
  { id: '309',  label: 'Group 309'  },
  { id: '310',  label: 'Group 310'  },
  { id: '326',  label: 'Group 326'  },
  { id: '328',  label: 'Group 328'  },
  { id: '502',  label: 'Group 502'  },
  { id: '503',  label: 'Group 503'  },
  { id: '513',  label: 'Group 513'  },
  { id: '4601', label: 'Group 4601' },
  { id: '4621', label: 'Group 4621' },
  { id: '4630', label: 'Group 4630' },
];

function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1000}
      bg="blackAlpha.900"
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
      cursor="zoom-out"
      p={4}
    >
      <Box position="relative" onClick={e => e.stopPropagation()} maxW="95vw" maxH="92vh">
        <Image
          src={src}
          alt={label}
          maxW="95vw"
          maxH="88vh"
          objectFit="contain"
          borderRadius="md"
          boxShadow="2xl"
        />
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
        >
          {label} — click outside to close
        </Text>
      </Box>
    </Box>
  );
}

function InfographicCard({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const src = useBaseUrl(`/img/showcase/group-${group.id}.png`);

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
        onClick={() => setOpen(true)}
      >
        <Image
          src={src}
          alt={`${group.label} infographic poster`}
          w="100%"
          objectFit="cover"
          aspectRatio="16/9"
          display="block"
        />
        <Box px={3} py={2}>
          <Text fontSize="sm" fontWeight="semibold" color="fg.muted">
            {group.label}
          </Text>
        </Box>
      </Box>

      {open && (
        <Lightbox src={src} label={group.label} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

export default function ShowcasePage() {
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
              . Click any poster to view it full size.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
            {GROUPS.map(group => (
              <InfographicCard key={group.id} group={group} />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Layout>
  );
}
