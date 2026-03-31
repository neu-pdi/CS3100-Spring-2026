import { usePluginData } from '@docusaurus/useGlobalData';
import { GlobalDoc, GlobalPluginData } from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import Markdown from 'react-markdown';
import { Box, Card, HStack, List, Text, Heading, Alert } from '@chakra-ui/react';
import { decode } from 'html-entities';

export default function LectureSummary({ version }: { version: string }) {
  const pluginData = usePluginData('docusaurus-plugin-content-docs') as GlobalPluginData;
  const sidebar = pluginData.versions[0]
  const docs = sidebar.docs.filter(doc => !doc.id.startsWith('l0')).map(doc => {
    const docContent = require(`@site/lecture-notes/${doc.id}.md`);
    return {
      doc,
      docContent
    }
  });
  docs.sort((a, b) => a.doc.id.localeCompare(b.doc.id, undefined, { numeric: true, sensitivity: 'accent' }))
  return (
    <Box>
      {docs.map(({ doc, docContent }) => {
        const { required_preparation, optional_preparation } = docContent.frontMatter
        const headings = docContent.toc || [];
        const headngMinutes = headings.map(heading => {
          const regeex = /\(([0-9]+) minutes\)/
          const match = heading.value.match(regeex)
          return match ? parseInt(match[1]) : 0
        })
        const totalMinutes = headngMinutes.reduce((acc, curr) => acc + curr, 0)
        return (
          <Card.Root key={doc.id} m={4} size='sm'>
            <Card.Header>
              <HStack justifyContent='space-between'>
                <Link to={doc.path}><Heading as="h3" m={0}>{docContent.metadata?.title}</Heading></Link>
                <Text fontSize='sm' color='text.muted'>Est {totalMinutes} minutes</Text>
              </HStack>
            </Card.Header>
            <Card.Body spaceY={0}>
              <HStack alignItems="flex-start">
                {required_preparation && <Box>
                  <Text fontWeight='bold' p={0} m={0}>Required preparation</Text>
                  <List.Root m={0}>
                    {required_preparation.map((prep, idx) => <List.Item key={idx}><a href={prep}>{prep}</a></List.Item>)}
                  </List.Root>
                </Box>}
                {optional_preparation && <Box>
                  <Text fontWeight='bold' p={0} m={0}>Optional preparation</Text>
                  <List.Root m={0}>
                    {optional_preparation.map((prep, idx) => <List.Item key={idx}><Markdown>{prep}</Markdown></List.Item>)}
                  </List.Root>
                </Box>}
              </HStack>
              <b>Topics</b>
              <List.Root>
                {headings.filter(heading => heading.level === 2).map((heading, idx) => (
                  <List.Item key={idx} style={{ marginLeft: `${heading.level * 12}px` }}>
                    <Link to={`${doc.path}#${heading.id}`}>{decode(heading.value)}</Link>
                  </List.Item>
                ))}
              </List.Root>
            </Card.Body>
          </Card.Root>
        );
      })}
    </Box>
  )
}
