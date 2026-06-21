import React, { useEffect, useRef, ReactNode, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Reveal from 'reveal.js';
import RevealNotes from 'reveal.js/plugin/notes/notes.esm.js';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';
import 'reveal.js/dist/theme/black.css';
import 'reveal.js/dist/theme/league.css';
import 'reveal.js/dist/theme/beige.css';
import 'reveal.js/dist/theme/sky.css';
import 'reveal.js/dist/theme/night.css';
import 'reveal.js/dist/theme/serif.css';
import 'reveal.js/dist/theme/simple.css';
import 'reveal.js/dist/theme/solarized.css';
import 'reveal.js/dist/theme/blood.css';
import 'reveal.js/dist/theme/moon.css';
import { useColorMode } from '../ui/color-mode';
import styles from './styles.module.css';

/**
 * Helper to check if an error is the benign scrollWidth error from Reveal.js
 * This error occurs during hot reload when Reveal tries to access dimensions
 * of elements that are momentarily null during React reconciliation.
 */
const isScrollWidthError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('scrollWidth') && 
           (error.message.includes('null') || error.message.includes('undefined'));
  }
  return false;
};

/**
 * Safely call a Reveal.js API method, suppressing the transient scrollWidth error
 * that occurs during hot reload.
 */
const safeRevealCall = <T,>(fn: () => T, fallback?: T): T | undefined => {
  try {
    return fn();
  } catch (error) {
    if (isScrollWidthError(error)) {
      // Silently suppress - this is a known benign error during hot reload
      return fallback;
    }
    // Re-throw other errors
    throw error;
  }
};

// Detect if we're in PDF export mode via URL query parameter
const isPrintPDFMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.search.includes('print-pdf');
};

interface RevealJSProps {
  children?: ReactNode;
  htmlContent?: string;
  theme?: string;
  transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
  controls?: boolean;
  progress?: boolean;
  center?: boolean;
  touch?: boolean;
  loop?: boolean;
  keyboard?: boolean;
  overview?: boolean;
  hash?: boolean;
  autoSlides?: boolean; // Auto-split markdown into slides
  slideSeparator?: string; // Separator for slides (default: '---')
}

export default function RevealJS({ 
  children,
  htmlContent,
  theme: themeProp,
  transition = 'slide',
  controls = true,
  progress = true,
  center = true,
  touch = true,
  loop = false,
  keyboard = true,
  overview = true,
  hash = true,
  autoSlides = false,
  slideSeparator = '---',
}: RevealJSProps) {
  const { colorMode } = useColorMode();
  
  // Sync RevealJS theme with Docusaurus color mode
  // Dark mode -> "black" theme, Light mode -> "white" theme
  // Allow theme prop to override if explicitly provided
  // Default to 'white' if colorMode is not yet available (during SSR/hydration)
  const theme = useMemo(() => {
    if (themeProp) return themeProp;
    if (!colorMode) return 'white'; // Default during SSR/hydration
    return colorMode === 'dark' ? 'black' : 'white';
  }, [themeProp, colorMode]);
  
  const revealRef = useRef<HTMLDivElement>(null);
  const fullscreenRevealRef = useRef<HTMLDivElement>(null);
  const printRevealRef = useRef<HTMLDivElement>(null);
  const revealInstanceRef = useRef<Reveal.Api | null>(null);
  const fullscreenRevealInstanceRef = useRef<Reveal.Api | null>(null);
  const printRevealInstanceRef = useRef<Reveal.Api | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [printPortalContainer, setPrintPortalContainer] = useState<HTMLDivElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFullscreenInitialized, setIsFullscreenInitialized] = useState(false);

  // Detect print-pdf mode on mount
  useEffect(() => {
    if (isPrintPDFMode()) {
      setIsPrintMode(true);
    }
  }, []);

  // Create portal container for fullscreen mode
  useEffect(() => {
    if (isFullscreen && typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.id = 'reveal-fullscreen-portal';
      document.body.appendChild(container);
      setPortalContainer(container);

      return () => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        setPortalContainer(null);
      };
    }
  }, [isFullscreen]);

  // Create portal container for print mode
  useEffect(() => {
    if (isPrintMode && typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.id = 'reveal-print-portal';
      document.body.appendChild(container);
      setPrintPortalContainer(container);

      // Add print mode class to document for CSS targeting
      document.documentElement.classList.add('reveal-print-mode');
      document.body.classList.add('reveal-print-mode');

      return () => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        setPrintPortalContainer(null);
        document.documentElement.classList.remove('reveal-print-mode');
        document.body.classList.remove('reveal-print-mode');
      };
    }
  }, [isPrintMode]);

  // Handle fullscreen mode - hide Docusaurus UI
  useEffect(() => {
    const rootElement = document.documentElement;
    const bodyElement = document.body;
    
    if (isFullscreen) {
      rootElement.classList.add('reveal-fullscreen');
      bodyElement.classList.add('reveal-fullscreen');
    } else {
      rootElement.classList.remove('reveal-fullscreen');
      bodyElement.classList.remove('reveal-fullscreen');
    }

    return () => {
      rootElement.classList.remove('reveal-fullscreen');
      bodyElement.classList.remove('reveal-fullscreen');
    };
  }, [isFullscreen]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Preprocess Mermaid code to fix curly braces in node labels
  const preprocessMermaidCode = (code: string): string => {
    // Fix curly braces inside node labels by wrapping them in quotes
    // Pattern: matches node labels like E[Memory: {5}] and wraps them in quotes
    // This handles cases where curly braces inside square brackets cause parsing errors
    return code.replace(/(\w+)\[([^\]]*\{[^\}]*\}[^\]]*)\]/g, (match, nodeId, label) => {
      // If label already has quotes, don't modify
      if ((label.startsWith('"') && label.endsWith('"')) || 
          (label.startsWith("'") && label.endsWith("'"))) {
        return match;
      }
      // Wrap label in double quotes to escape curly braces
      return `${nodeId}["${label}"]`;
    });
  };

  // Initialize Mermaid diagrams with theme support
  const initializeMermaid = (container: HTMLDivElement | null, forceReinit = false, revealInstance: Reveal.Api | null = null) => {
    if (!container || typeof window === 'undefined') return;
    
    // Determine Mermaid theme based on RevealJS theme
    const mermaidTheme = theme === 'black' ? 'dark' : 'default';
    
    // Try to use Docusaurus Mermaid initialization if available
    if ((window as any).mermaid) {
      const mermaid = (window as any).mermaid;
      
      // Set global theme if mermaid.initialize is available
      if (mermaid.initialize) {
        try {
          mermaid.initialize({ 
            theme: mermaidTheme,
            themeVariables: mermaidTheme === 'dark' ? {
              primaryColor: '#4a5568',
              primaryTextColor: '#e2e8f0',
              primaryBorderColor: '#718096',
              lineColor: '#cbd5e0',
              secondaryColor: '#2d3748',
              tertiaryColor: '#1a202c',
            } : {
              primaryColor: '#e8e8ff',
              primaryTextColor: '#1a1a1a',
              primaryBorderColor: '#9370DB',
              lineColor: '#333',
              secondaryColor: '#f0f0f0',
              tertiaryColor: '#ffffff',
            }
          });
        } catch (e) {
          console.warn('Mermaid theme initialization error:', e);
        }
      }
      
      const mermaidElements = container.querySelectorAll('.mermaid');
      let hasUninitialized = false;
      
      mermaidElements.forEach((element) => {
        // Preprocess Mermaid code to fix curly braces in node labels
        const originalText = element.textContent || '';
        if (originalText && originalText.includes('{') && originalText.includes('[')) {
          const processedText = preprocessMermaidCode(originalText);
          if (processedText !== originalText) {
            element.textContent = processedText;
          }
        }
        
        // If forcing reinit, remove data-processed attribute and clear content
        if (forceReinit && element.hasAttribute('data-processed')) {
          element.removeAttribute('data-processed');
          // Clear the SVG content to force re-render
          const svg = element.querySelector('svg');
          if (svg) {
            svg.remove();
          }
        }
        
        // Check if already initialized
        if (!element.hasAttribute('data-processed')) {
          hasUninitialized = true;
          try {
            mermaid.init(undefined, element);
          } catch (e) {
            console.warn('Mermaid initialization error:', e);
          }
        }
      });
      
      // If we initialized any diagrams, wait for them to render and then recalculate layout
      if (hasUninitialized && revealInstance) {
        // Wait for Mermaid to render (it's async)
        setTimeout(() => {
          if (revealInstance && typeof revealInstance.layout === 'function') {
            safeRevealCall(() => revealInstance.layout());
          }
        }, 200);
      }
    } else {
      // Fallback: trigger Docusaurus Mermaid initialization
      // Docusaurus theme-mermaid listens for DOMContentLoaded and processes .mermaid elements
      // We can trigger a custom event or manually process
      const mermaidElements = container.querySelectorAll('.mermaid');
      if (mermaidElements.length > 0) {
        // Dispatch a custom event that might trigger Mermaid processing
        const event = new Event('mermaid-init', { bubbles: true });
        container.dispatchEvent(event);
        
        // Also recalculate layout after a delay
        if (revealInstance) {
          setTimeout(() => {
            if (revealInstance && typeof revealInstance.layout === 'function') {
              safeRevealCall(() => revealInstance.layout());
            }
          }, 300);
        }
      }
    }
  };

  // Scale overflowing slide content to fit within slide bounds
  const scaleOverflowingContent = (revealInstance: Reveal.Api) => {
    const config = safeRevealCall(() => revealInstance.getConfig());
    if (!config) return; // Suppress if Reveal is in a bad state during hot reload
    const configuredHeight = (config as any).height || 700;
    const configuredWidth = (config as any).width || 960;
    
    // Get all sections and check for overflow (use instance DOM for fullscreen support)
    const slidesElement = safeRevealCall(() => revealInstance.getSlidesElement());
    const sections = slidesElement?.querySelectorAll(':scope > section');
    sections?.forEach((section) => {
      const sectionEl = section as HTMLElement;
      // Reset any previous scaling
      sectionEl.style.removeProperty('--slide-content-scale');
      sectionEl.style.fontSize = '';
      sectionEl.style.transform = '';
      sectionEl.style.transformOrigin = '';
      
      // Measure content
      const scrollHeight = sectionEl.scrollHeight;
      const scrollWidth = sectionEl.scrollWidth;
      
      // Calculate scale needed to fit content (uniform scale preserves aspect ratio)
      const scaleY = scrollHeight > configuredHeight ? configuredHeight / scrollHeight : 1;
      const scaleX = scrollWidth > configuredWidth ? configuredWidth / scrollWidth : 1;
      const contentScale = Math.min(scaleX, scaleY);
      
      // Apply flow-based scale if content overflows (reflows to full width)
      if (contentScale < 1) {
        sectionEl.style.setProperty('--slide-content-scale', String(contentScale));
        sectionEl.style.fontSize = `${contentScale * 100}%`;
      }
    });
  };

  // Sync RevealJS slide changes with Docusaurus TOC
  const syncTOCWithSlide = (revealInstance: Reveal.Api) => {
    const currentSlide = safeRevealCall(() => revealInstance.getCurrentSlide());
    if (!currentSlide) return;

    // Find the heading in the current slide (prefer h2, then h1, then others)
    const heading = currentSlide.querySelector('h2') || 
                    currentSlide.querySelector('h1') || 
                    currentSlide.querySelector('h3, h4, h5, h6');
    if (!heading) return;

    const headingText = heading.textContent?.trim();
    if (!headingText) return;

    // Try multiple TOC selectors (Docusaurus may use different class names)
    const tocSelectors = [
      '.table-of-contents a',
      '.theme-doc-toc-desktop a',
      '.toc a',
      '[class*="toc"] a'
    ];

    let tocLinks: NodeListOf<Element> | null = null;
    for (const selector of tocSelectors) {
      tocLinks = document.querySelectorAll(selector);
      if (tocLinks.length > 0) break;
    }

    if (!tocLinks || tocLinks.length === 0) return;

    // Remove active class from all TOC items
    tocLinks.forEach(link => {
      link.classList.remove('table-of-contents__link--active');
      // Also try other possible active class names
      link.classList.remove('active');
      link.setAttribute('aria-current', 'false');
    });

    // Find and highlight the matching TOC item
    tocLinks.forEach(link => {
      const linkText = link.textContent?.trim();
      // Match by exact text or by checking if the link text contains the heading
      if (linkText === headingText || linkText.includes(headingText) || headingText.includes(linkText)) {
        link.classList.add('table-of-contents__link--active');
        link.setAttribute('aria-current', 'page');
        // Scroll TOC item into view if needed
        link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  };

  // Initialize Reveal.js for normal mode
  useEffect(() => {
    if (!revealRef.current || isFullscreen) return;

    // Reset initialized state when re-initializing
    setIsInitialized(false);

    // Destroy fullscreen instance if it exists
    if (fullscreenRevealInstanceRef.current) {
      safeRevealCall(() => fullscreenRevealInstanceRef.current?.destroy());
      fullscreenRevealInstanceRef.current = null;
    }

    // Wait for slides to be rendered
    const timer = setTimeout(() => {
      if (!revealRef.current || isFullscreen) return;

      // Get container dimensions for dynamic sizing
      const containerWidth = revealRef.current.clientWidth || 960;
      const containerHeight = revealRef.current.clientHeight || 700;
      
      // Use 16:9 aspect ratio with dimensions that fit the container
      // Scale the native dimensions to maximize space usage
      const aspectRatio = 16 / 9;
      let slideWidth = 960;
      let slideHeight = Math.round(slideWidth / aspectRatio);  // ~540 for 16:9
      
      // If container is taller than 16:9, use a taller aspect ratio
      const containerAspectRatio = containerWidth / containerHeight;
      if (containerAspectRatio < aspectRatio) {
        // Container is taller, so use container aspect ratio
        slideHeight = Math.round(slideWidth / containerAspectRatio);
      }
      
      const reveal = new Reveal(revealRef.current, {
        hash,
        controls,
        progress,
        center,
        touch,
        loop,
        keyboard,
        overview,
        transition: transition as any,
        theme: theme as any,
        embedded: true,  // Important: tells Reveal it's embedded in another page
        width: slideWidth,
        height: slideHeight,
        minScale: 0.2,
        maxScale: 2.0,
        margin: 0.04,  // Margin around slides
        slideNumber: 'c/t',
        plugins: [],
      } as any);

      reveal.initialize().then(() => {
        revealInstanceRef.current = reveal;
        setIsInitialized(true);
        
        // Ensure viewport gets correct background based on theme
        // Reveal.js creates .reveal-viewport as a sibling/ancestor, find it via document
        const viewport = document.querySelector('.reveal-viewport') as HTMLElement;
        if (viewport) {
          if (theme === 'white') {
            viewport.style.backgroundColor = '#fff';
            viewport.classList.add('has-white');
            viewport.classList.remove('has-black');
          } else if (theme === 'black') {
            viewport.style.backgroundColor = '#191919';
            viewport.classList.add('has-black');
            viewport.classList.remove('has-white');
          }
        }
        
        // Ensure notes elements have the correct class attribute (not just className)
        // The notes plugin looks for elements with class="notes" in the DOM
        setTimeout(() => {
          if (revealRef.current) {
            const notesElements = revealRef.current.querySelectorAll('aside.notes');
            notesElements.forEach((el) => {
              if (!el.getAttribute('class')) {
                el.setAttribute('class', 'notes');
              }
            });
          }
        }, 100);
        
        // Initialize Mermaid diagrams after RevealJS is ready
        initializeMermaid(revealRef.current, false, reveal);
        
        // Sync TOC on initial load
        syncTOCWithSlide(reveal);
        
        // Scale overflowing content on initial load
        scaleOverflowingContent(reveal);
        
        // Sync TOC when slide changes
        reveal.on('slidechanged', () => {
          syncTOCWithSlide(reveal);
          // Re-initialize Mermaid when slide changes (in case new diagrams appear)
          initializeMermaid(revealRef.current, false, reveal);
        });
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (revealInstanceRef.current && !isFullscreen) {
        safeRevealCall(() => revealInstanceRef.current?.destroy());
        revealInstanceRef.current = null;
      }
    };
  }, [theme, transition, controls, progress, center, touch, loop, keyboard, overview, hash, htmlContent, isFullscreen]);

  // Fixed slide dimensions with 20:13 aspect ratio for fullscreen mode
  // Using large base dimensions that will scale down nicely
  const FULLSCREEN_SLIDE_WIDTH = 1400;  // 20 units
  const FULLSCREEN_SLIDE_HEIGHT = 910;  // 13 units (1400 / 20 * 13 = 910)

  // Handle container resize - use ResizeObserver for reliable detection
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    const handleResize = () => {
      // Just call layout() - Reveal will scale fixed native dimensions to fit container
      if (revealInstanceRef.current && !isFullscreen) {
        safeRevealCall(() => revealInstanceRef.current!.layout());
      }
      if (fullscreenRevealInstanceRef.current && isFullscreen) {
        // For fullscreen mode, just call layout() - Reveal will scale the fixed 20:13 dimensions
        // to fit the viewport while maintaining aspect ratio and centering
        safeRevealCall(() => fullscreenRevealInstanceRef.current!.layout());
        scaleOverflowingContent(fullscreenRevealInstanceRef.current);
      }
    };

    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 50);
    };

    // Use ResizeObserver for reliable container size change detection
    let resizeObserver: ResizeObserver | null = null;
    
    if (!isFullscreen && revealRef.current?.parentElement) {
      resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(revealRef.current.parentElement);
    }
    
    // Also listen to window resize for fullscreen mode
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      resizeObserver?.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [isFullscreen]);

  // Update viewport background when theme changes (for immediate visual feedback)
  useEffect(() => {
    const viewport = document.querySelector('.reveal-viewport') as HTMLElement;
    if (viewport) {
      if (theme === 'white') {
        viewport.style.backgroundColor = '#fff';
        viewport.classList.add('has-white');
        viewport.classList.remove('has-black');
      } else if (theme === 'black') {
        viewport.style.backgroundColor = '#191919';
        viewport.classList.add('has-black');
        viewport.classList.remove('has-white');
      }
    }
  }, [theme]);

  // Re-initialize Mermaid diagrams when theme changes
  useEffect(() => {
    // Wait a bit for theme to be applied
    const timer = setTimeout(() => {
      if (revealRef.current && !isFullscreen && revealInstanceRef.current) {
        initializeMermaid(revealRef.current, true, revealInstanceRef.current);
      }
      if (fullscreenRevealRef.current && isFullscreen && fullscreenRevealInstanceRef.current) {
        initializeMermaid(fullscreenRevealRef.current, true, fullscreenRevealInstanceRef.current);
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, isFullscreen]);

  // Initialize Reveal.js for fullscreen mode
  useEffect(() => {
    if (!fullscreenRevealRef.current || !isFullscreen || !portalContainer) return;

    // Reset fullscreen initialized state when re-initializing
    setIsFullscreenInitialized(false);

    // Destroy normal instance if it exists
    if (revealInstanceRef.current) {
      safeRevealCall(() => revealInstanceRef.current?.destroy());
      revealInstanceRef.current = null;
    }

    // Wait for slides to be rendered
    const timer = setTimeout(() => {
      if (!fullscreenRevealRef.current || !isFullscreen) return;

      // Use fixed 20:13 aspect ratio for fullscreen presentations
      // Reveal.js will scale these dimensions to fit the viewport while maintaining aspect ratio
      const reveal = new Reveal(fullscreenRevealRef.current, {
        hash,
        controls,
        progress,
        center: true,  // Center slides within the viewport
        touch,
        loop,
        keyboard,
        overview,
        transition: transition as any,
        theme: theme as any,
        embedded: false,  // Fullscreen uses normal mode
        width: FULLSCREEN_SLIDE_WIDTH,
        height: FULLSCREEN_SLIDE_HEIGHT,
        minScale: 0.1,
        maxScale: 1.5,
        margin: 0.04,  // Margin around slides for dead space
        slideNumber: 'c/t',
        plugins: [RevealNotes], // Notes only when fullscreen
      } as any);

      reveal.initialize().then(() => {
        fullscreenRevealInstanceRef.current = reveal;
        setIsFullscreenInitialized(true);
        
        // Scale overflowing content after layout (allow time for async content like code blocks)
        setTimeout(() => scaleOverflowingContent(reveal), 50);
        
        // Ensure viewport gets correct background based on theme
        // Reveal.js creates .reveal-viewport as a sibling/ancestor, find it via document
        const viewport = document.querySelector('.reveal-viewport') as HTMLElement;
        if (viewport) {
          if (theme === 'white') {
            viewport.style.backgroundColor = '#fff';
            viewport.classList.add('has-white');
            viewport.classList.remove('has-black');
          } else if (theme === 'black') {
            viewport.style.backgroundColor = '#191919';
            viewport.classList.add('has-black');
            viewport.classList.remove('has-white');
          }
        }
        
        // Ensure notes elements have the correct class attribute (not just className)
        // The notes plugin looks for elements with class="notes" in the DOM
        setTimeout(() => {
          if (fullscreenRevealRef.current) {
            const notesElements = fullscreenRevealRef.current.querySelectorAll('aside.notes');
            notesElements.forEach((el) => {
              if (!el.getAttribute('class')) {
                el.setAttribute('class', 'notes');
              }
            });
          }
        }, 100);
        
        // Initialize Mermaid diagrams after RevealJS is ready
        initializeMermaid(fullscreenRevealRef.current, false, reveal);
        
        // Sync TOC on initial load (if TOC is still accessible)
        syncTOCWithSlide(reveal);
        
        // Sync TOC when slide changes
        reveal.on('slidechanged', () => {
          syncTOCWithSlide(reveal);
          scaleOverflowingContent(reveal);
          // Re-initialize Mermaid when slide changes
          initializeMermaid(fullscreenRevealRef.current, false, reveal);
        });
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (fullscreenRevealInstanceRef.current && isFullscreen) {
        safeRevealCall(() => fullscreenRevealInstanceRef.current?.destroy());
        fullscreenRevealInstanceRef.current = null;
      }
    };
  }, [theme, transition, controls, progress, center, touch, loop, keyboard, overview, hash, htmlContent, isFullscreen, portalContainer]);

  // Fixed slide dimensions for print mode (optimized for PDF output)
  const PRINT_SLIDE_WIDTH = 960;
  const PRINT_SLIDE_HEIGHT = 700;

  // Initialize Reveal.js for print mode
  useEffect(() => {
    if (!printRevealRef.current || !isPrintMode || !printPortalContainer) return;

    // Destroy other instances
    if (revealInstanceRef.current) {
      safeRevealCall(() => revealInstanceRef.current?.destroy());
      revealInstanceRef.current = null;
    }
    if (fullscreenRevealInstanceRef.current) {
      safeRevealCall(() => fullscreenRevealInstanceRef.current?.destroy());
      fullscreenRevealInstanceRef.current = null;
    }

    // Wait for slides to be rendered
    const timer = setTimeout(async () => {
      if (!printRevealRef.current || !isPrintMode) return;

      // Configure Reveal.js for PDF export
      // Important: embedded must be false for print mode to work
      const reveal = new Reveal(printRevealRef.current, {
        hash: false,
        controls: false,
        progress: false,
        center: true,
        touch: false,
        loop: false,
        keyboard: false,
        overview: false,
        transition: 'none' as any,
        theme: theme as any,
        embedded: false,  // Must be false for print mode
        width: PRINT_SLIDE_WIDTH,
        height: PRINT_SLIDE_HEIGHT,
        minScale: 0.2,
        maxScale: 2.0,
        margin: 0.04,
        // PDF-specific options
        pdfSeparateFragments: false,  // Don't create separate pages for fragments
        pdfMaxPagesPerSlide: 1,       // Limit to 1 page per slide
        // Show slide numbers in PDF
        slideNumber: true,
        showSlideNumber: 'print',
        plugins: [RevealNotes],
      } as any);

      await reveal.initialize();
      printRevealInstanceRef.current = reveal;
      
      // Initialize Mermaid diagrams
      initializeMermaid(printRevealRef.current, false, reveal);
      
      // Reveal.js should auto-detect print-pdf in URL and activate print view
      // If it didn't, we need to manually trigger it
      // Check if print view is active by looking for the class
      if (!document.documentElement.classList.contains('reveal-print')) {
        // Manually activate print view by calling the internal method
        // This happens when Reveal.js doesn't detect the query param properly
        const revealElement = printRevealRef.current;
        if (revealElement && (reveal as any).getPlugin) {
          // Try to get print plugin and activate it
          try {
            // Force print mode by adding the required classes
            document.documentElement.classList.add('reveal-print', 'print-pdf');
            document.body.style.overflow = 'visible';
            
            // Reveal.js print mode lays out all slides vertically
            // We need to manually trigger this layout
            const slidesContainer = revealElement.querySelector('.slides');
            if (slidesContainer) {
              const slides = slidesContainer.querySelectorAll(':scope > section');
              slides.forEach((slide, index) => {
                const slideEl = slide as HTMLElement;
                slideEl.style.display = 'block';
                slideEl.style.position = 'relative';
                slideEl.style.visibility = 'visible';
                slideEl.style.opacity = '1';
                slideEl.style.transform = 'none';
                slideEl.style.pageBreakAfter = 'always';
                slideEl.style.height = `${PRINT_SLIDE_HEIGHT}px`;
                slideEl.style.width = `${PRINT_SLIDE_WIDTH}px`;
                slideEl.style.margin = '0 auto 20px auto';
                slideEl.style.boxSizing = 'border-box';
                slideEl.style.overflow = 'hidden';
                slideEl.style.backgroundColor = theme === 'black' ? '#191919' : '#fff';
                slideEl.style.color = theme === 'black' ? '#fff' : '#222';
              });
              
              // Style the slides container for print
              (slidesContainer as HTMLElement).style.position = 'relative';
              (slidesContainer as HTMLElement).style.width = `${PRINT_SLIDE_WIDTH}px`;
              (slidesContainer as HTMLElement).style.margin = '0 auto';
              (slidesContainer as HTMLElement).style.transform = 'none';
              (slidesContainer as HTMLElement).style.left = 'auto';
              (slidesContainer as HTMLElement).style.top = 'auto';
            }
          } catch (e) {
            console.warn('Could not activate print mode:', e);
          }
        }
      }
      
      // Force layout recalculation for print
      safeRevealCall(() => reveal.layout());
    }, 100);

    return () => {
      clearTimeout(timer);
      if (printRevealInstanceRef.current) {
        safeRevealCall(() => printRevealInstanceRef.current?.destroy());
        printRevealInstanceRef.current = null;
      }
      // Clean up print classes
      document.documentElement.classList.remove('reveal-print', 'print-pdf');
    };
  }, [theme, isPrintMode, printPortalContainer, htmlContent]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle PDF export - opens print dialog
  const handleExportPDF = useCallback(() => {
    // Get current URL and add print-pdf parameter
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('print-pdf', '');
    
    // Open in new tab - the new tab will detect print-pdf and initialize in print mode
    const printWindow = window.open(currentUrl.toString(), '_blank');
    
    // Try to trigger print dialog after a delay to let RevealJS initialize
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        // Wait for Reveal.js to fully initialize and layout
        setTimeout(() => {
          printWindow.print();
        }, 1500);
      });
    }
  }, []);

  // Check if children already contain Slide components
  const hasSlideComponents = useMemo(() => {
    if (!children || typeof children !== 'object') return false;
    
    const checkForSlides = (node: ReactNode): boolean => {
      if (!node) return false;
      if (typeof node === 'string' || typeof node === 'number') return false;
      if (Array.isArray(node)) {
        return node.some(checkForSlides);
      }
        if (React.isValidElement(node)) {
          // Check if it's a Slide component (check displayName or type)
          const componentName = (node.type as any)?.displayName || (node.type as any)?.name || '';
          if (componentName === 'Slide' || componentName === 'VerticalSlide') {
            return true;
          }
          // Check children recursively
          const props = node.props as { children?: ReactNode };
          if (props?.children) {
            return checkForSlides(props.children);
          }
        }
      return false;
    };
    
    return checkForSlides(children);
  }, [children]);

  // Auto-split markdown content into slides
  const processedChildren = useMemo(() => {
    // If autoSlides is false, return as-is
    if (!autoSlides || !children) {
      return children;
    }

    // Process React children and split by horizontal rules (<hr>) or h1/h2 headings
    // Handle mixed content: some slides may use <Slide> components, others use --- separators
    const splitIntoSlides = (nodes: ReactNode): { slides: ReactNode[], hasSplits: boolean } => {
      if (!nodes) return { slides: [], hasSplits: false };
      
      const slides: ReactNode[] = [];
      let currentSlide: ReactNode[] = [];
      let foundSplitter = false;
      
      const processNode = (node: ReactNode): void => {
        if (!node) return;
        
        if (Array.isArray(node)) {
          node.forEach(processNode);
          return;
        }
        
        if (React.isValidElement(node)) {
          // Check if it's a Slide component - treat it as a complete slide
          const componentName = (node.type as any)?.displayName || (node.type as any)?.name || '';
          if (componentName === 'Slide' || componentName === 'VerticalSlide') {
            foundSplitter = true;
            // Save current slide if it has content
            if (currentSlide.length > 0) {
              slides.push(React.createElement(Slide, { key: slides.length, children: currentSlide }));
              currentSlide = [];
            }
            // Add the Slide component as-is, ensuring it has a key
            const slideKey = node.key || slides.length;
            slides.push(React.cloneElement(node, { key: slideKey }));
            return;
          }
          
          // Check if it's an <hr> element (horizontal rule)
          if (node.type === 'hr' || (typeof node.type === 'string' && node.type.toLowerCase() === 'hr')) {
            foundSplitter = true;
            // Save current slide and start a new one
            if (currentSlide.length > 0) {
              slides.push(React.createElement(Slide, { key: slides.length, children: currentSlide }));
              currentSlide = [];
            }
            return;
          }
          
          // Check if it's an h1 or h2 heading - start new slide
          const tagName = typeof node.type === 'string' ? node.type.toLowerCase() : '';
          if (tagName === 'h1' || tagName === 'h2') {
            foundSplitter = true;
            // Save current slide if it has content
            if (currentSlide.length > 0) {
              slides.push(React.createElement(Slide, { key: slides.length, children: currentSlide }));
              currentSlide = [];
            }
            currentSlide.push(node);
            return;
          }
          
          // For other elements (like divs, p, etc.), preserve them as-is
          // Don't recursively process - just add them to current slide
          // This ensures HTML elements render correctly
          currentSlide.push(node);
          return;
        }
        
        // Regular content - add to current slide
        currentSlide.push(node);
      };
      
      // Process all nodes
      if (Array.isArray(nodes)) {
        nodes.forEach(processNode);
      } else {
        processNode(nodes);
      }
      
      // Add the last slide if it has content
      if (currentSlide.length > 0) {
        slides.push(React.createElement(Slide, { key: slides.length, children: currentSlide }));
      }
      
      return { 
        slides: foundSplitter && slides.length > 0 ? slides : [], 
        hasSplits: foundSplitter 
      };
    };
    
    const result = splitIntoSlides(children);
    return result.slides.length > 0 ? result.slides : children;
  }, [children, autoSlides]);

  const slidesContent = htmlContent ? (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  ) : (
    processedChildren
  );

  const revealContent = (
    <>
      <div className={styles.toolbarButtons}>
        {/* PDF Export Button */}
        <button
          className={styles.toolbarButton}
          onClick={handleExportPDF}
          aria-label="Export to PDF"
          title="Export to PDF"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="12" y2="18"/>
            <line x1="15" y1="15" x2="12" y2="18"/>
          </svg>
        </button>
        {/* Fullscreen Button */}
        <button
          className={`${styles.toolbarButton} ${isFullscreen ? styles.toolbarButtonActive : ''}`}
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3v5m0 0H3m5 0v5M16 3v5m0 0h5m-5 0v5M8 21v-5m0 0H3m5 0v-5M16 21v-5m0 0h5m-5 0v-5"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          )}
        </button>
      </div>
      <div className="slides">
        {slidesContent}
      </div>
    </>
  );

  // Render print mode via portal (for PDF export)
  if (isPrintMode && printPortalContainer) {
    return createPortal(
      <div className={`${styles.revealWrapper} ${styles.printMode}`}>
        <div className={`reveal ${styles.revealContainer}`} ref={printRevealRef} data-theme={theme}>
          <div className="slides">
            {slidesContent}
          </div>
        </div>
      </div>,
      printPortalContainer
    );
  }

  // Render fullscreen via portal
  if (isFullscreen && portalContainer) {
    return (
      <>
        {/* Keep the original element in place but hidden */}
        <div className={styles.revealWrapper} style={{ display: 'none' }}>
          <div className={`reveal ${styles.revealContainer}`} ref={revealRef} data-theme={theme}>
            <div className="slides">
              {slidesContent}
            </div>
          </div>
        </div>
        {/* Render fullscreen version via portal */}
        {createPortal(
          <div className={`${styles.revealWrapper} ${styles.fullscreen} ${!isFullscreenInitialized ? styles.initializing : ''}`}>
            <div className={`reveal ${styles.revealContainer}`} ref={fullscreenRevealRef} data-theme={theme}>
              {revealContent}
            </div>
          </div>,
          portalContainer
        )}
      </>
    );
  }

  // Normal mode
  return (
    <div className={`${styles.revealWrapper} ${!isInitialized ? styles.initializing : ''}`}>
      <div className={`reveal ${styles.revealContainer}`} ref={revealRef} data-theme={theme}>
        {revealContent}
      </div>
    </div>
  );
}

// Component for individual slides with full Reveal.js support
export interface SlideProps {
  children: ReactNode;
  className?: string;
  // Reveal.js data attributes for slide formatting
  'data-background-color'?: string;
  'data-background-image'?: string;
  'data-background-size'?: string;
  'data-background-position'?: string;
  'data-background-repeat'?: string;
  'data-background-opacity'?: string;
  'data-background-video'?: string;
  'data-background-video-loop'?: boolean | string;
  'data-background-video-muted'?: boolean | string;
  'data-background-iframe'?: string;
  'data-background-interactive'?: boolean | string;
  'data-transition'?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
  'data-transition-speed'?: 'default' | 'fast' | 'slow';
  'data-auto-animate'?: boolean | string;
  'data-auto-animate-id'?: string;
  'data-auto-animate-easing'?: string;
  'data-auto-animate-duration'?: string;
  'data-auto-animate-unmatched'?: boolean | string;
  'data-state'?: string;
  'data-visibility'?: string;
  // Allow any other data-* attributes
  [key: `data-${string}`]: string | boolean | undefined;
}

export function Slide({ 
  children, 
  className = '',
  ...dataProps 
}: SlideProps) {
  // Extract all data-* props
  const dataAttributes: Record<string, string> = {};
  Object.keys(dataProps).forEach(key => {
    if (key.startsWith('data-')) {
      const value = dataProps[key as keyof typeof dataProps];
      // Convert boolean to string for HTML attributes
      if (typeof value === 'boolean') {
        dataAttributes[key] = value ? 'true' : 'false';
      } else if (value !== undefined && value !== null) {
        dataAttributes[key] = String(value);
      }
    }
  });

  return (
    <section className={className} {...dataAttributes}>
      {children}
    </section>
  );
}

// Component for nested slides (vertical slides)
export interface VerticalSlideProps extends SlideProps {}

export function VerticalSlide({ 
  children, 
  className = '',
  ...dataProps 
}: VerticalSlideProps) {
  // Extract all data-* props
  const dataAttributes: Record<string, string> = {};
  Object.keys(dataProps).forEach(key => {
    if (key.startsWith('data-')) {
      const value = dataProps[key as keyof typeof dataProps];
      if (typeof value === 'boolean') {
        dataAttributes[key] = value ? 'true' : 'false';
      } else if (value !== undefined && value !== null) {
        dataAttributes[key] = String(value);
      }
    }
  });

  return (
    <section className={className} {...dataAttributes}>
      {children}
    </section>
  );
}

