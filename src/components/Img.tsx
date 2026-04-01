import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  /** The LLM prompt used to generate this image (stored as data-prompt) */
  prompt?: string;
}

/**
 * Image component that automatically handles baseUrl for Docusaurus.
 * Use this instead of <img> tags in MDX files to ensure images work
 * correctly with arbitrary baseUrl configurations.
 * 
 * Accepts an optional `prompt` attribute for AI-generated images,
 * which stores the generation prompt as a data attribute.
 */
export default function Img({ src, prompt, style, ...props }: ImgProps) {
  // If src starts with /, it's an absolute path from static folder
  // useBaseUrl will prepend the baseUrl automatically
  const imageSrc = src.startsWith('/') ? useBaseUrl(src) : src;

  return (
    <img
      src={imageSrc}
      data-prompt={prompt}
      style={{
        objectFit: 'contain',
        display: 'block',
        margin: '0 auto',
        ...style,
      }}
      {...props}
    />
  );
}


