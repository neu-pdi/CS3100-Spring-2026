/**
 * Classasaurus Plugin Types
 * 
 * Type definitions for course configuration and scheduling
 */

/**
 * Day of the week for class meetings
 */
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

/**
 * Time in 24-hour format (HH:MM)
 */
export type TimeString = string; // Format: "HH:MM" (e.g., "09:50", "15:30")

/**
 * Date in ISO format (YYYY-MM-DD)
 */
export type DateString = string; // Format: "YYYY-MM-DD" (e.g., "2026-01-12")

/**
 * Semester identifier
 */
export type Semester = `${'Spring' | 'Summer' | 'Fall'} ${number}`; // e.g., "Spring 2026"

/**
 * Meeting pattern for a class section
 */
export interface MeetingPattern {
  /** Type of meeting: lecture, lab, recitation, etc. */
  type?: 'lecture' | 'lab' | 'recitation' | 'studio' | 'other';
  
  /** Days of the week when class meets */
  days: DayOfWeek[];
  
  /** Start time of the class */
  startTime: TimeString;
  
  /** End time of the class */
  endTime: TimeString;
  
  /** Optional location/room */
  location?: string;
  
  /** Optional notes about the meeting (e.g., "Lab section") */
  notes?: string;
}

/**
 * A course section with its own schedule
 */
export interface CourseSection {
  /** Unique identifier for the section (e.g., "01", "02", "honors") */
  id: string;
  
  /** Human-readable section name */
  name: string;
  
  /** CRN or other registration identifier */
  crn?: string;
  
  /** Meeting pattern(s) for this section */
  meetings: MeetingPattern[];

  /** Timezone for the section, all times for lectures are in this timezone */
  timeZone: string;
  
  /** Instructor(s) for this section */
  instructors?: string[];
  
  /** Override dates for this specific section if different from course defaults */
  startDate?: DateString;
  endDate?: DateString;
  
  /** Section-specific holidays/cancellations (in addition to course-wide ones) */
  additionalHolidays?: Holiday[];
  
  /** Canvas course ID for this section (for Canvas sync) */
  canvasCourseId?: string;
}

/**
 * A lab section with its own schedule (distinct from lecture sections)
 */
export interface LabSection {
  /** Unique identifier for the lab section (e.g., "L01") */
  id: string;

  /** Human-readable lab section name */
  name: string;

  /** CRN or other registration identifier */
  crn?: string;

  /** Meeting pattern(s) for this lab section */
  meetings: MeetingPattern[];

  /** Timezone for this lab section */
  timeZone: string;

  /** Instructor(s) for this lab section */
  instructors?: string[];

  /** Override dates for this specific section if different from course defaults */
  startDate?: DateString;
  endDate?: DateString;

  /** Section-specific holidays/cancellations (in addition to course-wide ones) */
  additionalHolidays?: Holiday[];
  
  /** Canvas course ID for this lab section (for Canvas sync) */
  canvasCourseId?: string;
}

/**
 * Type of special date/holiday
 */
export type HolidayType = 
  | 'holiday'           // University holiday (no class)
  | 'break'             // Multi-day break
  | 'reading-day'       // Reading day
  | 'exam-period'       // Exam period
  | 'no-class'          // Instructor cancellation
  | 'special-event'     // Special event/guest lecture
  | 'deadline';         // Important deadline

/**
 * Holiday or special date
 */
export interface Holiday {
  /** Date or start date of the holiday */
  date: DateString;
  
  /** End date for multi-day holidays/breaks */
  endDate?: DateString;
  
  /** Name/description of the holiday */
  name: string;
  
  /** Type of holiday */
  type: HolidayType;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Mapping between a lecture note file and class meeting(s)
 */
export interface LectureMapping {
  /** Lecture identifier (should match filename, e.g., "l1-intro" for l1-intro.md) */
  lectureId: string;
  
  /** Optional custom title (defaults to title from markdown file) */
  title?: string;
  
  /** Date(s) when this lecture is covered */
  dates: DateString[]; //optional if using datesBySection

  /** Section-specific dates (preferred over `dates` when section id matches) */
  datesBySection?: Record<string, DateString[]>; //optional mapping of section ID to dates for that section 
  
  /** Optional section IDs if this lecture is only for specific sections */
  sections?: string[];
  
  /** Optional topics/tags for this lecture */
  topics?: string[];
  
  /** Optional notes or additional context */
  notes?: string;
  
  /** Optional materials/resources for this lecture */
  materials?: {
    slides?: string;
    recording?: string;
    additionalReading?: string[];
    code?: string[];
  };
}

/**
 * Assignment configuration
 */
export interface Assignment {
  /** Unique identifier for the assignment */
  id: string;
  
  /** Assignment title */
  title: string;
  
  /** Assignment type */
  type: 'homework' | 'project' | 'lab' | 'quiz' | 'exam' | 'reading';
  
  /** Release/assigned date */
  assignedDate: DateString;
  
  /** Due date */
  dueDate: DateString;

  /** Optional time zone override, otherwise uses the section's time zone */
  timeZone?: string;

  /** Optional time for due date (defaults to 23:59) */
  dueTime?: TimeString;
  
  /** Points/weight */
  points?: number;
  
  /** Link to assignment document */
  url?: string;
  
  /** Canvas assignment ID (for syncing) */
  canvasId?: string;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Lab definition
 */
export interface Lab {
  /** Unique ID for the lab */
  id: string;
  
  /** Lab title */
  title: string;
  
  /** Dates this lab is scheduled (one per section typically) */
  dates: DateString[];
  
  /** Section-specific dates if different */
  sections?: string[];
  
  /** Link to lab document */
  url?: string;
  
  /** Lab description/topics */
  description?: string;
  
  /** Points if graded */
  points?: number;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Schedule note for displaying announcements/banners on the schedule
 */
export interface ScheduleNote {
  /** Note text/content */
  message: string;
  
  /** Week number(s) when this note should appear (1-indexed) */
  weeks: number[];
  
  /** Section IDs this note applies to (empty array means all sections) */
  sections?: string[];
  
  /** Lab section IDs this note applies to (empty array means all lab sections) */
  labSections?: string[];
  
  /** Alert status/type (defaults to 'info') */
  status?: 'info' | 'warning' | 'error' | 'success';
  
  /** Optional date to align the speech bubble triangle with (YYYY-MM-DD format) */
  date?: DateString;
}

/**
 * Calendar type for events
 */
export type CalendarType = 'office_hours' | 'events';

/**
 * ICS calendar configuration
 */
export interface ICSCalendarConfig {
  /** URL to the ICS calendar file */
  url: string;
  
  /** Display name for this calendar */
  name: string;
  
  /** Type of calendar events */
  type: CalendarType;
  
  /** Optional queue name for office hours calendars */
  queueName?: string;
}

/**
 * Calendar configuration
 */
export interface CalendarConfig {
  /** ICS calendar sources */
  ics?: ICSCalendarConfig[];
}

/**
 * Canvas integration configuration
 */
export interface CanvasConfig {
  /** Canvas instance URL (e.g., "https://canvas.northeastern.edu") */
  canvasUrl: string;
  
  /** Environment variable name for API token (default: CANVAS_API_TOKEN) */
  apiTokenEnvVar?: string;
  
  /** Whether to sync assignments (default: true) */
  syncAssignments?: boolean;
  
  /** Whether to sync modules/lectures/labs (default: true) */
  syncModules?: boolean;
  
  /** Whether to sync homepage to Canvas course front page (default: true) */
  syncHomepage?: boolean;
}

/**
 * Course configuration
 */
export interface CourseConfig {
  /** Course code (e.g., "CS 3100") */
  courseCode: string;
  
  /** Course title */
  courseTitle: string;
  
  /** Semester */
  semester: Semester;
  
  /** Academic year */
  academicYear: string; // e.g., "2025-2026"
  
  /** Overall course start date */
  startDate: DateString;
  
  /** Overall course end date */
  endDate: DateString;
  
  /** Course sections */
  sections: CourseSection[];

  /** Lab sections */
  labSections?: LabSection[];
  
  /** Holidays and special dates */
  holidays: Holiday[];
  
  /** Lecture mappings */
  lectures: LectureMapping[];
  
  /** Lab mappings */
  labs?: Lab[];
  
  /** Assignments */
  assignments?: Assignment[];
  
  /** Schedule notes for displaying banners/announcements */
  scheduleNotes?: ScheduleNote[];
  
  /** Calendar configuration (ICS sources) */
  calendars?: CalendarConfig;
  
  /** Canvas integration (optional) */
  canvas?: CanvasConfig;
  
  /** Timezone for the course (e.g., "America/New_York") */
  timezone?: string;
  
  /** Optional course metadata */
  metadata?: {
    department?: string;
    credits?: number;
    prerequisites?: string[];
    description?: string;
    mechanicalDescription?: string; // Mechanical/logistical description (e.g., course structure, policies)
    syllabus?: string; // URL to syllabus
    officeHours?: {
      instructor: string;
      schedule: string;
      location: string;
      bookingUrl?: string;
    }[];
  };
}

/**
 * Plugin options for Classasaurus
 */
export interface ClassasaurusPluginOptions {
  /** Path to course configuration file */
  configPath?: string;
  
  /** Or provide configuration directly */
  config?: CourseConfig;
  
  /** Whether to generate schedule page */
  generateSchedule?: boolean;
  
  /** Custom schedule page route */
  scheduleRoute?: string;
  
  /** Whether to add lecture metadata to markdown files */
  enhanceLectures?: boolean;
  
  /** Whether to validate lecture IDs against actual files */
  validateLectureFiles?: boolean;
}

/**
 * Generated schedule entry
 */
export interface ScheduleEntry {
  /** Date of the meeting */
  date: DateString;
  
  /** Day of week */
  dayOfWeek: DayOfWeek;
  
  /** Class meeting number (e.g., 1, 2, 3...) */
  meetingNumber: number;
  
  /** Section ID */
  sectionId: string;
  
  /** Section name */
  sectionName: string;
  
  /** Meeting pattern */
  meeting: MeetingPattern;
  
  /** Lecture mapped to this date (if any) */
  lecture?: LectureMapping;
  
  /** Lab mapped to this date (if any) */
  lab?: Lab;
  
  /** Holiday information (if this date is a holiday) */
  holiday?: Holiday;
  
  /** Whether class meets on this date */
  isCancelled: boolean;
  
  /** Optional notes */
  notes?: string;
}

/**
 * Calendar event from ICS files
 */
export interface CalendarEvent {
  id: number;
  uid: string;
  title: string;
  start_time: string; // ISO format
  end_time: string;   // ISO format
  location?: string;
  organizer_name?: string;
  queue_name?: string;
  calendar_type: CalendarType;
}

/**
 * Complete schedule for a course
 */
export interface CourseSchedule {
  /** Course configuration */
  config: CourseConfig;
  
  /** Generated schedule entries, organized by section */
  scheduleBySection: {
    [sectionId: string]: ScheduleEntry[];
  };

  /** Generated schedule entries for lab sections (if provided) */
  labScheduleBySection?: {
    [labSectionId: string]: ScheduleEntry[];
  };
  
  /** All schedule entries in chronological order */
  allEntries: ScheduleEntry[];
  
  /** Important dates */
  importantDates: {
    startDate: DateString;
    endDate: DateString;
    holidays: Holiday[];
    examDates: DateString[];
    assignmentDueDates: DateString[];
  };
  
  /** Calendar events fetched from ICS files at build time */
  calendarEvents?: CalendarEvent[];
}

