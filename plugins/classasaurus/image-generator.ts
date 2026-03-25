/**
 * Image Generator for MDX Lecture Slides
 * 
 * Parses MDX files for images, generates missing ones via Google Gemini API,
 * and optimizes them for web use.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import sharp from 'sharp';
import type {
    ExtractedImage,
    CacheManifest,
    CacheEntry,
    ImageGeneratorConfig,
    GenerationResult,
    ProcessingResult,
} from './image-generator-types';
import * as dotenv from 'dotenv';
dotenv.config();

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SYSTEM_PROMPT = `Generate a professional graphic for a lecture slide. Do not add any additional copyright or course name information, other than what is requested below:`;

const CACHE_VERSION = 1;
const MAX_WIDTH = 1920; // Max width for web-optimized versions
const WEBP_QUALITY = 85;
const PNG_COMPRESSION = 9; // Max compression (0-9)

// ============================================================================
// MDX Parser
// ============================================================================

/**
 * Extract an attribute value from an HTML tag string
 * Handles both single and double quoted values, including multiline content
 */
function extractAttribute(tagContent: string, attrName: string): string | null {
  // Require attribute-name boundary so e.g. "src" does not match inside "data-src".
  const attrPrefix = '(?:^|\\s)';
  // Match attr="value" or attr='value' - the value can contain the OTHER quote type
  // First try double quotes
  const doubleQuotePattern = new RegExp(
    `${attrPrefix}${attrName}\\s*=\\s*"([^"]*)"`,
    's'
  );
  const doubleMatch = tagContent.match(doubleQuotePattern);
  if (doubleMatch) {
    return doubleMatch[1];
  }

  // Then try single quotes
  const singleQuotePattern = new RegExp(
    `${attrPrefix}${attrName}\\s*=\\s*'([^']*)'`,
    's'
  );
  const singleMatch = tagContent.match(singleQuotePattern);
  if (singleMatch) {
    return singleMatch[1];
  }

  // Try JSX expression syntax: attr={"value"} or attr={'value'}
  // This handles cases where the string contains quotes that would break
  // standard HTML attribute syntax (e.g., FXML code with escaped quotes)
  // We match attr={ then find the closing "} or '} accounting for escaped quotes
  const jsxExprPattern = new RegExp(
    `${attrPrefix}${attrName}\\s*=\\s*\\{`,
    's'
  );
  const jsxExprMatch = jsxExprPattern.exec(tagContent);
  if (jsxExprMatch) {
    const afterBrace = tagContent.substring(jsxExprMatch.index + jsxExprMatch[0].length);
    const quoteChar = afterBrace.trimStart().charAt(0);
    if (quoteChar === '"' || quoteChar === "'") {
      const contentStart = afterBrace.indexOf(quoteChar) + 1;
      const content = afterBrace.substring(contentStart);
      // Walk through finding the unescaped closing quote
      let i = 0;
      while (i < content.length) {
        if (content[i] === '\\' && i + 1 < content.length) {
          i += 2; // skip escaped character
        } else if (content[i] === quoteChar) {
          // Found the closing quote — extract and unescape
          const extracted = content.substring(0, i);
          return extracted.replace(/\\\\/g, '\\').replace(/\\"/g, '"').replace(/\\'/g, "'");
        } else {
          i++;
        }
      }
    }
  }

  return null;
}

/**
 * Extract all image references from an MDX file
 */
export function extractImagesFromMdx(
  content: string,
  filePath: string
): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const lines = content.split('\n');

  // Track which images we've found to avoid duplicates
  const foundSrcs = new Set<string>();

  // Find line numbers for images by searching line by line
  const findLineNumber = (searchStr: string): number => {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchStr)) {
        return i + 1;
      }
    }
    return 0;
  };

  // Helper function to process a tag and extract image if valid
  const processImageTag = (tagContent: string): void => {
    // Extract src, alt, and prompt attributes
    const src = extractAttribute(tagContent, 'src');
    const alt = extractAttribute(tagContent, 'alt');
    const prompt = extractAttribute(tagContent, 'prompt');
    
    // Use prompt attribute if available, otherwise fall back to alt
    const generationPrompt = prompt || alt;
    
    if (src && generationPrompt && !foundSrcs.has(src) && generationPrompt.length > 50) {
      foundSrcs.add(src);
      const extracted = parseImageSrc(src, generationPrompt, 'html', findLineNumber(src));
      if (extracted) {
        images.push(extracted);
      }
    }
  };

  // Pattern to find complete <img ... /> or <Img ... /> tags (handles multiline)
  // Must match to actual /> not just > which might appear in alt text (like -> in lambda syntax)
  // Use greedy match up to /> which is the actual tag terminator for self-closing tags
  // Case-insensitive to match both <img> and <Img> (custom component)
  // This handles both standard HTML <img> tags and custom React <Img> components
  const imgTagPattern = /<img\s+[\s\S]*?\/>/gi;
  
  let match: RegExpExecArray | null;
  while ((match = imgTagPattern.exec(content)) !== null) {
    processImageTag(match[0]);
  }

  // Pattern for Markdown images: ![alt](src) or ![alt](src "title")
  // The title (in quotes) is used as the generation prompt when present
  // Format: ![alt text](path/to/image.png "optional prompt in title")
  const mdImgPattern = /!\[([\s\S]*?)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g;
  
  while ((match = mdImgPattern.exec(content)) !== null) {
    const alt = match[1];
    const src = match[2];
    const title = match[3]; // Optional title attribute (used as prompt)
    
    // Use title (prompt) if available, otherwise fall back to alt
    const generationPrompt = title || alt;
    
    if (!foundSrcs.has(src) && generationPrompt.length > 50) {
      foundSrcs.add(src);
      const extracted = parseImageSrc(src, generationPrompt, 'markdown', findLineNumber(src));
      if (extracted) {
        images.push(extracted);
      }
    }
  }

  return images;
}

/**
 * Parse an image src path into structured data
 * @param src - The image source path
 * @param prompt - The generation prompt (from prompt attr, alt text, or markdown title)
 * @param sourceFormat - Whether from HTML/JSX tag or markdown syntax
 * @param lineNumber - Line number in source file
 */
function parseImageSrc(
    src: string,
    prompt: string,
    sourceFormat: 'html' | 'markdown',
    lineNumber: number
): ExtractedImage | null {
    // Handle paths like /img/lectures/web/l4-millers-law.png
    // Convert to filesystem path: static/img/lectures/web/l4-millers-law.png

    let targetDir: string;
    let baseName: string;

    if (src.startsWith('/')) {
        // Absolute path from web root
        const withoutLeadingSlash = src.substring(1);
        const ext = path.extname(withoutLeadingSlash);
        baseName = path.basename(withoutLeadingSlash, ext);
        const dirPart = path.dirname(withoutLeadingSlash);
        targetDir = `static/${dirPart}`;
    } else {
        // Relative path
        const ext = path.extname(src);
        baseName = path.basename(src, ext);
        targetDir = `static/img/lectures/web`; // Default location
    }

    return {
        src,
        alt: prompt, // Note: 'alt' field stores the generation prompt
        baseName,
        targetDir,
        sourceFormat,
        lineNumber,
    };
}

// ============================================================================
// Prompt Cache
// ============================================================================

/**
 * Load the cache manifest from disk
 */
export function loadCacheManifest(manifestPath: string): CacheManifest {
    if (fs.existsSync(manifestPath)) {
        try {
            const content = fs.readFileSync(manifestPath, 'utf-8');
            const manifest = JSON.parse(content) as CacheManifest;
            if (manifest.version === CACHE_VERSION) {
                return manifest;
            }
        } catch (e) {
            console.warn(`⚠️  Could not parse cache manifest, starting fresh`);
        }
    }

    return {
        version: CACHE_VERSION,
        lastUpdated: new Date().toISOString(),
        entries: {},
    };
}

/**
 * Save the cache manifest to disk
 */
export function saveCacheManifest(
    manifestPath: string,
    manifest: CacheManifest
): void {
    const dir = path.dirname(manifestPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    manifest.lastUpdated = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Compute a hash of a prompt for change detection
 */
export function hashPrompt(prompt: string): string {
    return crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
}

/**
 * Check if an image needs to be regenerated based on cache
 */
export function needsRegeneration(
    manifest: CacheManifest,
    baseName: string,
    prompt: string,
    force: boolean
): boolean {
    if (force) {
        return true;
    }

    const entry = manifest.entries[baseName];
    if (!entry) {
        return true;
    }

    const currentHash = hashPrompt(prompt);
    if (entry.promptHash !== currentHash) {
        return true;
    }

    // Check if original files still exist
    for (const origPath of entry.originalPaths) {
        if (!fs.existsSync(origPath)) {
            return true;
        }
    }

    return false;
}

// ============================================================================
// Gemini API Client
// ============================================================================

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract base64 image data from various API response message formats
 */
function extractImageFromMessage(message: Record<string, unknown>): string | undefined {
  // Strategy 1: Gemini images array (for compatibility with OpenAI-style responses)
  // Format varies: 
  //   { images: [{ b64_json: "..." }] }
  //   { images: [{ image_url: "data:image/png;base64,..." }] }
  //   { images: [{ url: "data:image/png;base64,..." }] }
  if (Array.isArray(message.images) && message.images.length > 0) {
    const img = message.images[0];
    // b64_json format (OpenAI style)
    if (img.b64_json) {
      return img.b64_json;
    }
    // Direct base64 string
    if (typeof img === 'string') {
      const match = img.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (match) return match[1];
      // Check if it's already pure base64
      if (img.length > 1000 && img.match(/^[A-Za-z0-9+/=]+$/)) {
        return img;
      }
    }
    // image_url field (alternative Gemini format)
    if (img.image_url) {
      const url = typeof img.image_url === 'string' ? img.image_url : img.image_url.url;
      if (url) {
        const match = url.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
        if (match) return match[1];
        // Maybe it's already pure base64
        if (url.length > 1000 && url.match(/^[A-Za-z0-9+/=]+$/)) {
          return url;
        }
      }
    }
    // data field
    if (img.data) {
      return img.data;
    }
    // URL field with base64 embedded
    if (img.url) {
      const match = img.url.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (match) return match[1];
    }
  }

  // Strategy 2: Direct content string (might contain base64 or data URL)
  if (typeof message.content === 'string') {
    const content = message.content;
    // Check for data URL format
    const dataUrlMatch = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (dataUrlMatch) {
      return dataUrlMatch[1];
    }
    // Check for pure base64 (long string of valid base64 chars)
    if (content.length > 1000 && content.match(/^[A-Za-z0-9+/=\s]+$/)) {
      return content.replace(/\s/g, '');
    }
  }

  // Strategy 3: Content array with parts (OpenAI/Gemini multimodal format)
  if (Array.isArray(message.content)) {
    for (const part of message.content) {
      // OpenAI format: { type: 'image_url', image_url: { url: 'data:...' } }
      if (part.type === 'image_url' && part.image_url?.url) {
        const urlMatch = part.image_url.url.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
        if (urlMatch) return urlMatch[1];
      }
      // Gemini format: { type: 'image', image: 'base64...' }
      if (part.type === 'image' && part.image) {
        return part.image;
      }
      // Alternative: { inlineData: { data: 'base64...', mimeType: 'image/png' } }
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
      // Text part with embedded base64
      if (part.type === 'text' && typeof part.text === 'string') {
        const match = part.text.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
        if (match) return match[1];
      }
    }
  }

  // Strategy 4: Gemini native format with parts array directly on message
  if (Array.isArray(message.parts)) {
    for (const part of message.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
      if (part.image) {
        return part.image;
      }
    }
  }

  // Strategy 5: Direct image field on message
  if (typeof message.image === 'string') {
    return message.image;
  }

  // Strategy 6: Check for inline_data at message level
  if ((message as { inline_data?: { data?: string } }).inline_data?.data) {
    return (message as { inline_data: { data: string } }).inline_data.data;
  }

  return undefined;
}

/**
 * Generate an image using Google Gemini API directly
 */
export async function generateImage(
    config: ImageGeneratorConfig,
    prompt: string,
    baseName: string,
    variationIndex: number,
    retryCount = 0
): Promise<GenerationResult> {
    const maxRetries = 5;
    const baseDelay = 2000;

    try {
        const fullPrompt = `${config.systemPrompt}\n\n---\n\nImage Description:\n${prompt}`;

        // Use Gemini API directly
        const modelId = config.model.replace('google/', ''); // Strip google/ prefix if present
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${config.apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: fullPrompt }
                        ]
                    }
                ],
                generationConfig: {
                    responseModalities: ['TEXT', 'IMAGE'],
                    // Image generation config - uppercase K required!
                    imageConfig: {
                        imageSize: "4K",
                        aspectRatio: "16:9",
                    },
                },
            }),
        });

        if (response.status === 429 || response.status === 503) {
            // Rate limited or overloaded (common with 4K generation)
            if (retryCount < maxRetries) {
                const delay = baseDelay * Math.pow(2, retryCount);
                console.log(`   ⏳ ${response.status === 429 ? 'Rate limited' : 'Model overloaded'}, waiting ${delay}ms before retry ${retryCount + 1}/${maxRetries}...`);
                await sleep(delay);
                return generateImage(config, prompt, baseName, variationIndex, retryCount + 1);
            }
            return {
                success: false,
                baseName,
                variationIndex,
                error: `${response.status === 429 ? 'Rate limited' : 'Model overloaded'} after max retries`,
                rateLimited: true,
            };
        }

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                baseName,
                variationIndex,
                error: `API error ${response.status}: ${errorText}`,
            };
        }

        const data = await response.json();

        // Extract image data from Gemini response format
        // Response format: { candidates: [{ content: { parts: [{ text: "..." }, { inlineData: { mimeType: "...", data: "base64..." } }] } }] }
        const parts = data.candidates?.[0]?.content?.parts;
        let imageData: string | undefined;

        if (!parts || !Array.isArray(parts)) {
            return {
                success: false,
                baseName,
                variationIndex,
                error: 'No parts in Gemini API response',
            };
        }

        // Find the image part
        for (const part of parts) {
            if (part.inlineData?.data) {
                imageData = part.inlineData.data;
                break;
            }
        }

        if (!imageData) {
            return {
                success: false,
                baseName,
                variationIndex,
                error: `No image data in response. Parts: ${parts.map((p: Record<string, unknown>) => Object.keys(p).join(',')).join('; ')}`,
            };
        }

        return {
            success: true,
            baseName,
            variationIndex,
            imageData,
        };

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // Retry on network errors
        if (retryCount < maxRetries && (message.includes('ECONNRESET') || message.includes('network'))) {
            const delay = baseDelay * Math.pow(2, retryCount);
            console.log(`   ⏳ Network error, waiting ${delay}ms before retry ${retryCount + 1}/${maxRetries}...`);
            await sleep(delay);
            return generateImage(config, prompt, baseName, variationIndex, retryCount + 1);
        }

        return {
            success: false,
            baseName,
            variationIndex,
            error: message,
        };
    }
}

/**
 * Debug cache file path
 */
function getDebugCachePath(config: ImageGeneratorConfig, baseName: string): string {
  const cacheDir = path.join(config.cacheDir, 'debug');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return path.join(cacheDir, `${baseName}-debug.json`);
}

/**
 * Debug function: Make a single API request and print full request/response
 * Caches request/response to disk for cheaper debugging
 */
export async function debugGenerateImage(
  config: ImageGeneratorConfig,
  prompt: string,
  baseName: string
): Promise<void> {
  const fullPrompt = `${config.systemPrompt}\n\n---\n\nImage Description:\n${prompt}`;
  
  const requestBody = {
    contents: [
      {
        parts: [
          { text: fullPrompt }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        imageSize: "4K",
        aspectRatio: "16:9",
      },
    },
  };

  const cachePath = getDebugCachePath(config, baseName);
  
  // Check for cached response
  if (fs.existsSync(cachePath)) {
    console.log('\n' + '='.repeat(80));
    console.log('💾 DEBUG: Using cached response from ' + cachePath);
    console.log('   (Delete this file to make a fresh API call)');
    console.log('='.repeat(80));
    
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    analyzeGeminiDebugResponse(cached.requestBody, cached.responseText, cached.status);
    return;
  }

  // No cached response - need API key
  if (!config.apiKey) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ DEBUG: No cached response and no API key');
    console.log('='.repeat(80));
    console.log('Set GEMINI_API_KEY to make an API call');
    return;
  }

  const modelId = config.model.replace('google/', '');
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${config.apiKey}`;

  console.log('\n' + '='.repeat(80));
  console.log('🔍 DEBUG: Gemini API Request');
  console.log('='.repeat(80));
  console.log(`URL: https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`);
  console.log('Method: POST');
  console.log('Headers:');
  console.log('  Content-Type: application/json');
  console.log('\nRequest Body:');
  console.log(JSON.stringify(requestBody, null, 2));
  console.log('\n' + '-'.repeat(80));
  console.log('Sending request...\n');

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    
    // Cache the response
    const cacheData = {
      timestamp: new Date().toISOString(),
      requestBody,
      status: response.status,
      statusText: response.statusText,
      responseText,
    };
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), 'utf-8');
    console.log(`💾 Cached response to: ${cachePath}`);

    analyzeGeminiDebugResponse(requestBody, responseText, response.status);

  } catch (error) {
    console.log('='.repeat(80));
    console.log('❌ DEBUG: Request Failed');
    console.log('='.repeat(80));
    console.log('Error:', error);
  }
}

/**
 * Analyze and print debug information about an API response
 */
function analyzeDebugResponse(
  requestBody: Record<string, unknown>,
  responseText: string,
  status: number
): void {
  console.log('='.repeat(80));
  console.log('🔍 DEBUG: API Response');
  console.log('='.repeat(80));
  console.log(`Status: ${status}`);
  
  console.log('\nResponse Body (raw, first 2000 chars):');
  console.log(responseText.substring(0, 2000) + (responseText.length > 2000 ? '...' : ''));

  // Try to parse as JSON for analysis
  try {
    const responseJson = JSON.parse(responseText);
    
    // Analyze the response structure
    console.log('\n' + '-'.repeat(80));
    console.log('🔍 DEBUG: Response Analysis');
    console.log('-'.repeat(80));
    console.log('Top-level keys:', Object.keys(responseJson));
    
    if (responseJson.choices?.[0]) {
      const choice = responseJson.choices[0];
      console.log('choices[0] keys:', Object.keys(choice));
      
      if (choice.message) {
        const msg = choice.message;
        console.log('choices[0].message keys:', Object.keys(msg));
        console.log('choices[0].message (full):');
        console.log(JSON.stringify(msg, null, 2));
        
            // Check for images array specifically
            if (Array.isArray(msg.images)) {
              console.log(`\n📸 Found images array with ${msg.images.length} item(s)`);
              for (let i = 0; i < msg.images.length; i++) {
                const img = msg.images[i];
                console.log(`   Image ${i}: keys = ${Object.keys(img).join(', ')}`);
                if (img.b64_json) {
                  console.log(`   - b64_json: ${img.b64_json.length} chars`);
                }
                if (img.url) {
                  console.log(`   - url: ${img.url.substring(0, 100)}...`);
                }
                if (img.image_url) {
                  const urlVal = typeof img.image_url === 'string' ? img.image_url : JSON.stringify(img.image_url);
                  console.log(`   - image_url type: ${typeof img.image_url}`);
                  console.log(`   - image_url preview: ${urlVal.substring(0, 200)}...`);
                  console.log(`   - image_url length: ${urlVal.length} chars`);
                }
              }
            }

            // Try our extraction function
            const extracted = extractImageFromMessage(msg as Record<string, unknown>);
            if (extracted) {
              console.log(`\n✅ extractImageFromMessage succeeded!`);
              console.log(`   Extracted ${extracted.length} chars of base64 data`);
              console.log(`   First 100 chars: ${extracted.substring(0, 100)}...`);
              
              // Actually save the image to verify the full pipeline
              console.log('\n💾 Saving test image to verify pipeline...');
              try {
                const testBuffer = Buffer.from(extracted, 'base64');
                const testPath = path.join(path.dirname(getDebugCachePath({ cacheDir: '.image-cache' } as ImageGeneratorConfig, 'test')), 'debug-test-image.png');
                fs.writeFileSync(testPath, testBuffer);
                console.log(`   ✅ Saved test image to: ${testPath}`);
                console.log(`   Image size: ${(testBuffer.length / 1024).toFixed(1)} KB`);
              } catch (saveError) {
                console.log(`   ❌ Failed to save test image: ${saveError}`);
              }
            } else {
              console.log('\n❌ extractImageFromMessage returned undefined');
              console.log('\nTrying to find image data manually...');
          
          // Deep search for any base64-looking strings
          const jsonStr = JSON.stringify(msg);
          const base64Match = jsonStr.match(/[A-Za-z0-9+/=]{1000,}/);
          if (base64Match) {
            console.log(`✅ Found long base64-like string (${base64Match[0].length} chars)`);
            console.log(`   First 100 chars: ${base64Match[0].substring(0, 100)}...`);
          }
          
          // Look for URLs
          const urlMatch = jsonStr.match(/https?:\/\/[^\s"]+/g);
          if (urlMatch) {
            console.log(`✅ Found URLs in response:`);
            urlMatch.forEach(url => console.log(`   ${url}`));
          }
        }
      }
    }
    
    // Show usage info if present
    if (responseJson.usage) {
      console.log('\n📊 Usage:');
      console.log(JSON.stringify(responseJson.usage, null, 2));
    }
    
  } catch (parseError) {
    console.log('Could not parse response as JSON');
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * Analyze and print debug information about a Gemini API response
 */
function analyzeGeminiDebugResponse(
  requestBody: Record<string, unknown>,
  responseText: string,
  status: number
): void {
  console.log('='.repeat(80));
  console.log('🔍 DEBUG: Gemini API Response');
  console.log('='.repeat(80));
  console.log(`Status: ${status}`);
  
  console.log('\nResponse Body (raw, first 2000 chars):');
  console.log(responseText.substring(0, 2000) + (responseText.length > 2000 ? '...' : ''));

  // Try to parse as JSON for analysis
  try {
    const responseJson = JSON.parse(responseText);
    
    // Analyze the response structure
    console.log('\n' + '-'.repeat(80));
    console.log('🔍 DEBUG: Response Analysis');
    console.log('-'.repeat(80));
    console.log('Top-level keys:', Object.keys(responseJson));
    
    // Gemini format: { candidates: [{ content: { parts: [...] } }] }
    if (responseJson.candidates?.[0]) {
      const candidate = responseJson.candidates[0];
      console.log('candidates[0] keys:', Object.keys(candidate));
      
      if (candidate.content?.parts) {
        const parts = candidate.content.parts;
        console.log(`Found ${parts.length} part(s) in response`);
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          console.log(`\nPart ${i}: keys = ${Object.keys(part).join(', ')}`);
          
          if (part.text) {
            console.log(`   - text: ${part.text.substring(0, 200)}${part.text.length > 200 ? '...' : ''}`);
          }
          
          if (part.inlineData) {
            console.log(`   - inlineData.mimeType: ${part.inlineData.mimeType}`);
            console.log(`   - inlineData.data: ${part.inlineData.data?.length || 0} chars of base64`);
            
            if (part.inlineData.data) {
              // Save the image
              console.log('\n💾 Saving test image to verify pipeline...');
              try {
                const testBuffer = Buffer.from(part.inlineData.data, 'base64');
                const testPath = path.join(path.dirname(getDebugCachePath({ cacheDir: '.image-cache' } as ImageGeneratorConfig, 'test')), 'debug-test-image.png');
                fs.writeFileSync(testPath, testBuffer);
                
                // Get image dimensions
                const sharp = require('sharp');
                sharp(testBuffer).metadata().then((metadata: { width?: number; height?: number }) => {
                  console.log(`   ✅ Saved test image to: ${testPath}`);
                  console.log(`   Image size: ${(testBuffer.length / 1024).toFixed(1)} KB`);
                  console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);
                }).catch(() => {
                  console.log(`   ✅ Saved test image to: ${testPath}`);
                  console.log(`   Image size: ${(testBuffer.length / 1024).toFixed(1)} KB`);
                });
              } catch (saveError) {
                console.log(`   ❌ Failed to save test image: ${saveError}`);
              }
            }
          }
        }
      }
    }
    
    // Show error if present
    if (responseJson.error) {
      console.log('\n❌ Error in response:');
      console.log(JSON.stringify(responseJson.error, null, 2));
    }
    
    // Show usage info if present
    if (responseJson.usageMetadata) {
      console.log('\n📊 Usage:');
      console.log(JSON.stringify(responseJson.usageMetadata, null, 2));
    }
    
  } catch (parseError) {
    console.log('Could not parse response as JSON');
  }

  console.log('\n' + '='.repeat(80));
}

// ============================================================================
// Image Processor
// ============================================================================

/**
 * Save generated image to disk and create optimized versions
 */
export async function saveAndOptimizeImage(
    imageData: string,
    baseName: string,
    variationIndex: number,
    config: ImageGeneratorConfig,
    targetDir: string
): Promise<{ originalPath: string; webPaths: string[] }> {
    // Decode base64 image
    const buffer = Buffer.from(imageData, 'base64');

    // Ensure directories exist
    const originalsDir = path.join(config.cacheDir, 'originals');
    if (!fs.existsSync(originalsDir)) {
        fs.mkdirSync(originalsDir, { recursive: true });
    }

    const fullTargetDir = path.join(config.projectRoot, targetDir);
    if (!fs.existsSync(fullTargetDir)) {
        fs.mkdirSync(fullTargetDir, { recursive: true });
    }

    // Save original full-size image
    const originalFilename = `${baseName}-v${variationIndex + 1}.png`;
    const originalPath = path.join(originalsDir, originalFilename);
    fs.writeFileSync(originalPath, buffer);

    // Get image metadata for web optimization
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width && metadata.width > MAX_WIDTH ? MAX_WIDTH : metadata.width;

    // Create web-optimized versions
    const webPaths: string[] = [];

    // Optimized PNG
    const pngPath = path.join(fullTargetDir, `${baseName}-v${variationIndex + 1}.png`);
    await sharp(buffer)
        .resize(width, undefined, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: PNG_COMPRESSION })
        .toFile(pngPath);
    webPaths.push(pngPath);

    // WebP version
    const webpPath = path.join(fullTargetDir, `${baseName}-v${variationIndex + 1}.webp`);
    await sharp(buffer)
        .resize(width, undefined, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(webpPath);
    webPaths.push(webpPath);

    return { originalPath, webPaths };
}

// ============================================================================
// Main Processing Functions
// ============================================================================

/**
 * Process a single image - generate variations and save
 */
export async function processImage(
    image: ExtractedImage,
    config: ImageGeneratorConfig,
    manifest: CacheManifest
): Promise<{
    status: 'exists' | 'generated' | 'failed' | 'skipped' | 'cached';
    message?: string;
    entry?: CacheEntry;
}> {
    // Check if image already exists at target path
    const targetPath = path.join(config.projectRoot, image.targetDir, `${image.baseName}.png`);
    if (fs.existsSync(targetPath) && !config.force) {
        return { status: 'exists', message: 'Image already exists' };
    }

    // Build full prompt
    const fullPrompt = `${config.systemPrompt}\n\n---\n\nImage Description:\n${image.alt}`;

    // Check cache
    if (!needsRegeneration(manifest, image.baseName, fullPrompt, config.force)) {
        return { status: 'cached', message: 'Using cached version (prompt unchanged)' };
    }

    if (config.dryRun) {
        return {
            status: 'skipped',
            message: `Would generate ${config.variationCount} variations`
        };
    }

    // Check if API key is available before attempting generation
    if (!config.apiKey) {
        return {
            status: 'failed',
            message: 'Generation needed but GEMINI_API_KEY not set'
        };
    }

    // Generate variations in parallel
    const generationPromises: Promise<GenerationResult>[] = [];
    for (let i = 0; i < config.variationCount; i++) {
        generationPromises.push(
            generateImage(config, image.alt, image.baseName, i)
        );
    }

    const results = await Promise.all(generationPromises);

    // Process successful generations
    const successfulResults = results.filter(r => r.success && r.imageData);
    if (successfulResults.length === 0) {
        const errors = results.map(r => r.error).filter(Boolean).join('; ');
        return { status: 'failed', message: errors };
    }

    // Save and optimize images
    const originalPaths: string[] = [];
    const webPaths: string[] = [];
    const variations: string[] = [];

    for (const result of successfulResults) {
        if (!result.imageData) continue;

        const saved = await saveAndOptimizeImage(
            result.imageData,
            image.baseName,
            result.variationIndex,
            config,
            image.targetDir
        );

        originalPaths.push(saved.originalPath);
        webPaths.push(...saved.webPaths);
        variations.push(`${image.baseName}-v${result.variationIndex + 1}.png`);
    }

    // Create cache entry
    const entry: CacheEntry = {
        prompt: fullPrompt,
        promptHash: hashPrompt(fullPrompt),
        generatedAt: new Date().toISOString(),
        variations,
        originalPaths,
        webPaths,
    };

    return {
        status: 'generated',
        message: `Generated ${successfulResults.length}/${config.variationCount} variations`,
        entry,
    };
}

/**
 * Process an entire MDX file
 */
export async function processMdxFile(
    filePath: string,
    config: ImageGeneratorConfig
): Promise<ProcessingResult> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const images = extractImagesFromMdx(content, filePath);

    const result: ProcessingResult = {
        filePath,
        totalImages: images.length,
        existingImages: 0,
        generatedImages: 0,
        failedImages: 0,
        skippedImages: 0,
        imageResults: [],
    };

    if (images.length === 0) {
        console.log(`   No images with substantial alt text found`);
        return result;
    }

    // Load cache manifest
    const manifest = loadCacheManifest(config.manifestPath);

    // Process images with concurrency limit
    const semaphore = new Semaphore(config.concurrency);

    const processWithLimit = async (image: ExtractedImage) => {
        await semaphore.acquire();
        try {
            console.log(`   Processing: ${image.baseName} (line ${image.lineNumber})`);
            const imageResult = await processImage(image, config, manifest);

            // Update manifest if we generated new images
            if (imageResult.entry) {
                manifest.entries[image.baseName] = imageResult.entry;
            }

            return { baseName: image.baseName, ...imageResult };
        } finally {
            semaphore.release();
        }
    };

    const imageResults = await Promise.all(images.map(processWithLimit));

    // Tally results
    for (const ir of imageResults) {
        result.imageResults.push({
            baseName: ir.baseName,
            status: ir.status,
            message: ir.message,
        });

        switch (ir.status) {
            case 'exists':
                result.existingImages++;
                break;
            case 'generated':
                result.generatedImages++;
                break;
            case 'failed':
                result.failedImages++;
                break;
            case 'skipped':
            case 'cached':
                result.skippedImages++;
                break;
        }
    }

    // Save updated manifest
    if (!config.dryRun) {
        saveCacheManifest(config.manifestPath, manifest);
    }

    return result;
}

/**
 * Get default configuration
 */
export function getDefaultConfig(projectRoot: string): Partial<ImageGeneratorConfig> {
    return {
        // Gemini model for image generation (don't include google/ prefix)
        model: process.env.GEMINI_MODEL || 'gemini-3-pro-image-preview',
        projectRoot,
        cacheDir: path.join(projectRoot, '.image-cache'),
        manifestPath: path.join(projectRoot, '.image-cache/manifest.json'),
        concurrency: 2, // Lower concurrency for 4K generation to avoid 503s
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
        variationCount: 2,
        force: false,
        dryRun: false,
    };
}

// ============================================================================
// Utility: Simple Semaphore for concurrency control
// ============================================================================

class Semaphore {
    private permits: number;
    private queue: (() => void)[] = [];

    constructor(permits: number) {
        this.permits = permits;
    }

    async acquire(): Promise<void> {
        if (this.permits > 0) {
            this.permits--;
            return;
        }

        return new Promise<void>(resolve => {
            this.queue.push(resolve);
        });
    }

    release(): void {
        const next = this.queue.shift();
        if (next) {
            next();
        } else {
            this.permits++;
        }
    }
}

