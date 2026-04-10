import { LoadContext, Plugin } from "@docusaurus/types";
import path from 'path';
import fs from 'fs';
import type { ClassasaurusPluginOptions, CourseConfig, CourseSchedule, CalendarEvent, CalendarType } from './types';
import { validateCourseConfig } from './config-validator';
import { generateSchedule } from './schedule-generator';
import { extractHeadings, formatDateDisplay } from './utils';
import { syncToCanvas } from './canvas-sync';
import ICAL from 'ical.js';

export default async function pluginClassasaurus(
    context: LoadContext,
    options: ClassasaurusPluginOptions
): Promise<Plugin<CourseSchedule | null>> {
    console.log("🦕 Classasaurus plugin loaded");
    
    // Helper function to load config
    function loadConfig(): CourseConfig | null {
        let courseConfig: CourseConfig | null = null;
        
        try {
            if (options.config) {
                // Configuration provided directly
                courseConfig = options.config;
            } else if (options.configPath) {
                // Load from file
                const configPath = path.isAbsolute(options.configPath)
                    ? options.configPath
                    : path.join(context.siteDir, options.configPath);
                
                if (fs.existsSync(configPath)) {
                    const configContent = fs.readFileSync(configPath, 'utf-8');
                    
                    // Support both .json and .ts files
                    if (configPath.endsWith('.ts') || configPath.endsWith('.js')) {
                        // For TypeScript/JavaScript configs, clear require cache to get fresh version
                        delete require.cache[require.resolve(configPath)];
                        const configModule = require(configPath);
                        courseConfig = configModule.default || configModule;
                    } else {
                        // For JSON configs
                        courseConfig = JSON.parse(configContent) as CourseConfig;
                    }
                    
                    console.log(`📚 Loaded course configuration from ${configPath}`);
                } else {
                    console.warn(`⚠️  Configuration file not found: ${configPath}`);
                }
            }
        } catch (error) {
            console.error('❌ Error loading course configuration:', error);
            throw error;
        }
        
        return courseConfig;
    }
    
    /**
     * Generate COURSE.md content with course summary, lecture TOC, labs, lecture slides, and assignments
     * Returns the markdown string
     */
    async function generateCourseMarkdownContent(
        schedule: CourseSchedule,
        siteDir: string,
        baseUrl: string
    ): Promise<string> {
        const config = schedule.config;
        const baseUrlNormalized = baseUrl.replace(/\/$/, '');
        const lectureNotesDir = path.join(siteDir, 'lecture-notes');
        const labsDir = path.join(siteDir, 'labs');
        const lectureSlidesDir = path.join(siteDir, 'lecture-slides');
        const overviewPath = path.join(siteDir, 'assignments', 'cyb-overview.md');
        
        // Add frontmatter to disable sidebar
        let courseMarkdown = `---
title: Course Overview
description: Complete course overview with lectures and assignments
hide_table_of_contents: true
sidebar: false
---

# ${config.courseCode}: ${config.courseTitle}\n\n`;
        
        // Add course description
        if (config.metadata?.description) {
            courseMarkdown += `${config.metadata.description}\n\n`;
        }
        
        // Add mechanical description if present
        if (config.metadata?.mechanicalDescription) {
            courseMarkdown += `${config.metadata.mechanicalDescription}\n\n`;
        }
        
        // Generate lecture table of contents
        courseMarkdown += `# Lectures and associated learning objectives\n\n`;
        
        // Only include lecture files that are explicitly listed in the course config.
        const lectureFiles: Array<{ id: string; content: string }> = [];

        if (fs.existsSync(lectureNotesDir)) {
            for (const lecture of config.lectures) {
                const lectureId = lecture.lectureId;
                const mdPath = path.join(lectureNotesDir, `${lectureId}.md`);
                const mdxPath = path.join(lectureNotesDir, `${lectureId}.mdx`);

                let filePath: string | null = null;
                if (fs.existsSync(mdPath)) {
                    filePath = mdPath;
                } else if (fs.existsSync(mdxPath)) {
                    filePath = mdxPath;
                }

                if (!filePath) {
                    console.warn(`⚠️ Lecture file not found for configured lectureId: ${lectureId}`);
                    continue;
                }

                const content = fs.readFileSync(filePath, 'utf-8');
                lectureFiles.push({ id: lectureId, content });
            }
        }
        
        // Create a map of lecture IDs to dates
        const lectureDateMap = new Map<string, string[]>();
        for (const lecture of config.lectures) {
            lectureDateMap.set(lecture.lectureId, lecture.dates);
        }
        
        // Generate TOC for each lecture
        for (const lectureFile of lectureFiles) {
            const lectureId = lectureFile.id;
            const dates = lectureDateMap.get(lectureId) || [];
            const dateStr = dates.length > 0 
                ? dates.map(d => formatDateDisplay(d)).join(', ')
                : '';
            
            // Extract title
            let title = lectureId;
            const frontmatterMatch = lectureFile.content.match(/^---\n([\s\S]*?)\n---/);
            if (frontmatterMatch) {
                const frontmatter = frontmatterMatch[1];
                const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
                if (titleMatch) {
                    title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
                }
            } else {
                const headingMatch = lectureFile.content.match(/^#\s+(.+)$/m);
                if (headingMatch) {
                    title = headingMatch[1].trim();
                }
            }
            
            // Generate lecture URL (Docusaurus route) with baseUrl
            const lectureUrl = `${baseUrlNormalized}/lecture-notes/${lectureId}`;
            
            // Format lecture header with date
            if (dateStr) {
                courseMarkdown += `## [${title}](${lectureUrl}) - ${dateStr}\n\n`;
            } else {
                courseMarkdown += `## [${title}](${lectureUrl})\n\n`;
            }
            
            // Extract level 2 headings (as plain text, not links)
            const headings = extractHeadings(lectureFile.content);
            if (headings.length > 0) {
                for (const heading of headings) {
                    courseMarkdown += `- ${heading.text}\n`;
                }
                courseMarkdown += '\n';
            }
        }

        // Generate labs table of contents
        if (fs.existsSync(labsDir)) {
            const labFiles: Array<{ id: string; title: string }> = [];
            const files = fs.readdirSync(labsDir);

            for (const file of files) {
                if (file.endsWith('.md') || file.endsWith('.mdx')) {
                    const labId = file.replace(/\.(md|mdx)$/, '');
                    // Skip index, changelog, and other non-lab files
                    if (labId === 'index' || labId.startsWith('CHANGELOG') || !labId.startsWith('lab')) continue;

                    const filePath = path.join(labsDir, file);
                    const content = fs.readFileSync(filePath, 'utf-8');

                    // Extract title from frontmatter or first heading
                    let title = labId;
                    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                    if (frontmatterMatch) {
                        const frontmatter = frontmatterMatch[1];
                        const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
                        if (titleMatch) {
                            title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
                        }
                    }
                    if (title === labId) {
                        // Try to get from first heading
                        const headingMatch = content.match(/^#\s+(.+)$/m);
                        if (headingMatch) {
                            title = headingMatch[1].trim();
                        }
                    }

                    labFiles.push({ id: labId, title });
                }
            }

            // Sort labs by ID (handling numeric sorting)
            labFiles.sort((a, b) => {
                return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
            });

            if (labFiles.length > 0) {
                courseMarkdown += `# Labs\n\n`;
                for (const lab of labFiles) {
                    const labUrl = `${baseUrlNormalized}/labs/${lab.id}`;
                    courseMarkdown += `- [${lab.title}](${labUrl})\n`;
                }
                courseMarkdown += '\n';
            }
        }

        // Generate lecture slides table of contents
        if (fs.existsSync(lectureSlidesDir)) {
            const slideFiles: Array<{ id: string; title: string }> = [];
            const files = fs.readdirSync(lectureSlidesDir);

            for (const file of files) {
                if (file.endsWith('.md') || file.endsWith('.mdx')) {
                    const slideId = file.replace(/\.(md|mdx)$/, '');
                    // Skip index files
                    if (slideId === 'index') continue;
                    // Skip non-lecture files (only include files starting with 'l' followed by a number)
                    if (!/^l\d/.test(slideId)) continue;

                    const filePath = path.join(lectureSlidesDir, file);
                    const content = fs.readFileSync(filePath, 'utf-8');

                    // Extract title from frontmatter or first heading
                    let title = slideId;
                    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                    if (frontmatterMatch) {
                        const frontmatter = frontmatterMatch[1];
                        const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
                        if (titleMatch) {
                            title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
                        }
                    }
                    if (title === slideId) {
                        // Try to get from first heading
                        const headingMatch = content.match(/^#\s+(.+)$/m);
                        if (headingMatch) {
                            title = headingMatch[1].trim();
                        }
                    }

                    slideFiles.push({ id: slideId, title });
                }
            }

            // Sort slides by ID (handling numeric sorting)
            slideFiles.sort((a, b) => {
                return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
            });

            if (slideFiles.length > 0) {
                courseMarkdown += `# Lecture Slides\n\n`;
                for (const slide of slideFiles) {
                    const slideUrl = `${baseUrlNormalized}/lecture-slides/${slide.id}`;
                    courseMarkdown += `- [${slide.title}](${slideUrl})\n`;
                }
                courseMarkdown += '\n';
            }
        }

        // Include cyb-overview.md content
        if (fs.existsSync(overviewPath)) {
            const overviewContent = fs.readFileSync(overviewPath, 'utf-8');
            // Remove frontmatter if present
            const overviewWithoutFrontmatter = overviewContent.replace(/^---\n[\s\S]*?---\n/, '');
            courseMarkdown += `---\n\n${overviewWithoutFrontmatter}\n\n---\n\n`;
        }
        
        // Generate assignments section
        if (config.assignments && config.assignments.length > 0) {
            courseMarkdown += `# Schedule of assignments \n\n`;
            
            // Sort assignments by due date
            const sortedAssignments = [...config.assignments].sort((a, b) => 
                a.dueDate.localeCompare(b.dueDate)
            );
            
            for (const assignment of sortedAssignments) {
                const assignedDateStr = formatDateDisplay(assignment.assignedDate);
                const dueDateStr = formatDateDisplay(assignment.dueDate);
                const dueTime = assignment.dueTime || '23:59';
                
                // Make the title a link if URL exists, otherwise just plain text
                let titleMarkdown = `### ${assignment.title}\n\n`;
                if (assignment.url) {
                    // Ensure assignment URL includes baseUrl if it's a relative path
                    const assignmentUrl = assignment.url.startsWith('/') 
                        ? `${baseUrlNormalized}${assignment.url}`
                        : assignment.url;
                    titleMarkdown = `### [${assignment.title}](${assignmentUrl})\n\n`;
                }
                courseMarkdown += titleMarkdown;
                
                courseMarkdown += `- **Assigned:** ${assignedDateStr}\n`;
                courseMarkdown += `- **Due:** ${dueDateStr} at ${dueTime}\n`;
                if (assignment.points) {
                    courseMarkdown += `- **Points:** ${assignment.points}\n`;
                }
                courseMarkdown += '\n';
            }
        }
        
        return courseMarkdown;
    }
    
    /**
     * Fetch ICS calendar from URL (at build time)
     */
    async function fetchICSCalendar(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch ICS calendar: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Error fetching ICS calendar from ${url}:`, error);
            throw error;
        }
    }

    /**
     * Parse ICS calendar data and convert to CalendarEvent[]
     */
    function parseICS(icsData: string, calendarType: CalendarType, queueName?: string): CalendarEvent[] {
        const events: CalendarEvent[] = [];
        let eventIdCounter = 1;
        
        try {
            const jcalData = ICAL.parse(icsData);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');
            
            for (const vevent of vevents) {
                const event = new ICAL.Event(vevent);
                
                // Skip if event doesn't have start/end times
                if (!event.startDate || !event.endDate) {
                    continue;
                }
                
                const startDate = event.startDate.toJSDate();
                const endDate = event.endDate.toJSDate();
                
                // Extract organizer name from ICAL event
                let organizerName: string | undefined;
                try {
                    const organizerProp = vevent.getFirstProperty('organizer');
                    if (organizerProp) {
                        const organizerValue = organizerProp.getFirstValue();
                        if (typeof organizerValue === 'string') {
                            // Extract CN from format like "CN=Name:mailto:email" or just "mailto:email"
                            const cnMatch = organizerValue.match(/CN=([^:]+)/);
                            organizerName = cnMatch ? cnMatch[1] : undefined;
                        } else if (organizerValue && typeof organizerValue === 'object') {
                            // Try to get CN property
                            const cn = (organizerValue as any).cn;
                            if (typeof cn === 'string') {
                                organizerName = cn;
                            }
                        }
                    }
                } catch (err) {
                    // Ignore errors extracting organizer
                }
                
                events.push({
                    id: eventIdCounter++,
                    uid: event.uid || `ics-${eventIdCounter}`,
                    title: event.summary || 'Untitled Event',
                    start_time: startDate.toISOString(),
                    end_time: endDate.toISOString(),
                    location: event.location || undefined,
                    organizer_name: organizerName,
                    queue_name: queueName,
                    calendar_type: calendarType,
                });
            }
        } catch (error) {
            console.error('Error parsing ICS data:', error);
        }
        
        return events;
    }

    /**
     * Fetch and parse all ICS calendars configured in the course config
     */
    async function fetchCalendarEvents(config: CourseConfig): Promise<CalendarEvent[]> {
        if (!config.calendars?.ics || config.calendars.ics.length === 0) {
            return [];
        }
        
        const allEvents: CalendarEvent[] = [];
        
        for (const icsConfig of config.calendars.ics) {
            try {
                console.log(`📅 Fetching ICS calendar: ${icsConfig.name} from ${icsConfig.url}`);
                const icsData = await fetchICSCalendar(icsConfig.url);
                const events = parseICS(icsData, icsConfig.type, icsConfig.queueName);
                allEvents.push(...events);
                console.log(`   ✓ Loaded ${events.length} events from ${icsConfig.name}`);
            } catch (err) {
                console.error(`   ✗ Failed to fetch calendar ${icsConfig.name}:`, err);
                // Continue with other calendars even if one fails
            }
        }
        
        return allEvents;
    }

    /**
     * Generate COURSE.md file with course summary, lecture TOC, and assignments
     * Writes the file to the specified output directory
     */
    async function generateCourseMarkdown(
        schedule: CourseSchedule,
        siteDir: string,
        outDir: string,
        baseUrl: string
    ): Promise<void> {
        const courseMarkdown = await generateCourseMarkdownContent(schedule, siteDir, baseUrl);
        const courseMdPath = path.join(outDir, 'COURSE.md');
        fs.writeFileSync(courseMdPath, courseMarkdown, 'utf-8');
        console.log(`📚 Generated COURSE.md at ${courseMdPath}`);
    }
    
    return {
        name: 'docusaurus-plugin-classasaurus',
        
        async loadContent() {
            console.log('🔄 loadContent() called - reloading course configuration...');
            
            // Load config on each content load (happens when watched files change)
            const courseConfig = loadConfig();
            
            if (!courseConfig) {
                return null;
            }
            
            try {
                // Validate configuration
                validateCourseConfig(courseConfig);
                
                // Generate schedule
                const courseSchedule = generateSchedule(courseConfig);
                console.log(`📅 Generated schedule with ${courseSchedule.allEntries.length} total class meetings`);
                
                // Log section info
                for (const section of courseConfig.sections) {
                    const sectionEntries = courseSchedule.scheduleBySection[section.id];
                    console.log(`   Section ${section.id} (${section.name}): ${sectionEntries.length} meetings`);
                }
                
                // Fetch ICS calendars at build time
                const calendarEvents = await fetchCalendarEvents(courseConfig);
                if (calendarEvents.length > 0) {
                    console.log(`📅 Fetched ${calendarEvents.length} calendar events from ICS files`);
                    courseSchedule.calendarEvents = calendarEvents;
                }
                
                return courseSchedule;
            } catch (error) {
                console.error('❌ Error validating or generating schedule:', error);
                throw error;
            }
        },
        
        async contentLoaded({ content, actions }) {
            if (!content) {
                return;
            }
            
            const { createData, addRoute, setGlobalData } = actions;
            
            // Expose content as global data so usePluginData can access it
            setGlobalData(content);
            
            // Make schedule data available globally for routes that need it
            const scheduleDataPath = await createData(
                'schedule.json',
                JSON.stringify(content, null, 2)
            );
            
            // Generate overview.md content and write to src/pages
            // Docusaurus automatically creates routes for files in src/pages
            const courseMarkdown = await generateCourseMarkdownContent(content, context.siteDir, context.baseUrl);
            
            // Write overview.md to src/pages directory (Docusaurus will automatically create a route)
            const pagesDir = path.join(context.siteDir, 'src', 'pages');
            if (!fs.existsSync(pagesDir)) {
                fs.mkdirSync(pagesDir, { recursive: true });
            }
            const overviewMdPath = path.join(pagesDir, 'overview.md');
            fs.writeFileSync(overviewMdPath, courseMarkdown, 'utf-8');
            
            // Verify file was written
            if (fs.existsSync(overviewMdPath)) {
                const stats = fs.statSync(overviewMdPath);
                console.log(`✅ Generated overview.md at ${overviewMdPath} (${stats.size} bytes)`);
            } else {
                console.error(`❌ Failed to generate overview.md at ${overviewMdPath}`);
            }
            
            // Also write to root for reference
            const rootOverviewMdPath = path.join(context.siteDir, 'overview.md');
            fs.writeFileSync(rootOverviewMdPath, courseMarkdown, 'utf-8');
            
            console.log(`📚 Overview page will be available at /overview`);
            
            // Optionally generate a schedule page
            if (options.generateSchedule !== false) {
                const scheduleRoute = options.scheduleRoute || '/schedule';
                
                // Resolve component path
                const componentPath = path.resolve(
                    context.siteDir,
                    'src/components/SchedulePage/index.tsx'
                );
                
                // Normalize the route path with baseUrl
                const normalizedPath = `${context.baseUrl.replace(/\/$/, '')}${scheduleRoute}`;
                
                addRoute({
                    path: normalizedPath,
                    component: componentPath,
                    exact: true,
                    modules: {
                        scheduleData: scheduleDataPath,
                    },
                });
                
                console.log(`📄 Schedule page will be available at ${normalizedPath}`);
            }
        },
        
        getPathsToWatch() {
            const pathsToWatch: string[] = [];
            
            // Watch the configuration file for changes
            if (options.configPath) {
                const configPath = path.isAbsolute(options.configPath)
                    ? options.configPath
                    : path.join(context.siteDir, options.configPath);
                pathsToWatch.push(configPath);
                console.log(`👀 Watching for changes: ${configPath}`);
            }
            
            // Watch lecture-notes, assignments, labs, and lecture-slides directories for overview.md regeneration
            const lectureNotesDir = path.join(context.siteDir, 'lecture-notes');
            const assignmentsDir = path.join(context.siteDir, 'assignments');
            const labsDir = path.join(context.siteDir, 'labs');
            const lectureSlidesDir = path.join(context.siteDir, 'lecture-slides');
            if (fs.existsSync(lectureNotesDir)) {
                pathsToWatch.push(lectureNotesDir);
            }
            if (fs.existsSync(assignmentsDir)) {
                pathsToWatch.push(assignmentsDir);
            }
            if (fs.existsSync(labsDir)) {
                pathsToWatch.push(labsDir);
            }
            if (fs.existsSync(lectureSlidesDir)) {
                pathsToWatch.push(lectureSlidesDir);
            }

            return pathsToWatch;
        },
        
        async postBuild({ outDir, content }) {
            if (content) {
                // Export schedule as JSON for external tools
                const scheduleJsonPath = path.join(outDir, 'schedule.json');
                fs.writeFileSync(
                    scheduleJsonPath,
                    JSON.stringify(content, null, 2)
                );
                console.log(`📦 Exported schedule to ${scheduleJsonPath}`);
                
                // Verify that Docusaurus rendered the overview page
                // Docusaurus automatically renders src/pages/overview.md to overview/index.html
                // Try multiple possible paths
                const possiblePaths = [
                    path.join(outDir, 'overview', 'index.html'), // Standard path
                    path.join(outDir, 'cs3100-public-resources', 'overview', 'index.html'), // With baseUrl
                    path.join(outDir, 'overview.html'), // Alternative format
                ];
                
                let foundPath: string | null = null;
                for (const htmlPath of possiblePaths) {
                    if (fs.existsSync(htmlPath)) {
                        foundPath = htmlPath;
                        const stats = fs.statSync(htmlPath);
                        console.log(`✅ Overview page rendered at ${htmlPath} (${stats.size} bytes)`);
                        break;
                    }
                }
                
                if (!foundPath) {
                    console.warn(`⚠️  Overview page not found. Checked paths: ${possiblePaths.join(', ')}`);
                }
                
                // Canvas sync (if configured and token present)
                // Do this in postBuild so we have access to built HTML files
                const canvasConfig = content.config.canvas;
                if (canvasConfig?.canvasUrl) {
                    const tokenEnvVar = canvasConfig.apiTokenEnvVar || 'CANVAS_API_TOKEN';
                    const apiToken = process.env[tokenEnvVar];
                    
                    if (apiToken) {
                        // Build public site URL from Docusaurus config
                        const siteUrl = context.siteConfig.url + context.siteConfig.baseUrl.replace(/\/$/, '');
                        
                    try {
                        await syncToCanvas(
                            content.config,
                            content,
                            siteUrl,
                            canvasConfig.canvasUrl,
                            apiToken
                        );
                    } catch (error) {
                        console.error('❌ Canvas sync failed:', error);
                        // Don't throw - allow build to continue even if Canvas sync fails
                    }
                    } else {
                        console.log(`ℹ️  Canvas sync configured but ${tokenEnvVar} not set. Skipping sync.`);
                    }
                }
            }
        },
    };
}

// Export types for use in other files
export type { ClassasaurusPluginOptions, CourseConfig, CourseSchedule } from './types';
// Export utilities
export * from './utils';
