/**
 * Schedule generation utilities
 */

import { parseISO, format as formatDateFns, addDays, isWithinInterval, getDay } from 'date-fns';
import type {
  CourseConfig,
  CourseSchedule,
  CourseSection,
  LabSection,
  DateString,
  DayOfWeek,
  Holiday,
  Lab,
  LectureMapping,
  MeetingPattern,
  ScheduleEntry,
} from './types';

/**
 * Get day of week from date
 */
function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[getDay(date)];
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): DateString {
  return formatDateFns(date, 'yyyy-MM-dd');
}

/**
 * Check if a date is a holiday
 */
function isHoliday(date: DateString, holidays: Holiday[]): Holiday | undefined {
  const checkDate = parseISO(date);
  return holidays.find((holiday) => {
    if (holiday.endDate) {
      return isWithinInterval(checkDate, {
        start: parseISO(holiday.date),
        end: parseISO(holiday.endDate)
      });
    }
    return date === holiday.date;
  });
}

/**
 * Generate all class meeting dates for a section (including holidays)
 */
function generateMeetingDates(
  section: CourseSection | LabSection,
  courseStartDate: DateString,
  courseEndDate: DateString,
  holidays: Holiday[]
): Map<DateString, MeetingPattern[]> {
  const startDate = parseISO(section.startDate || courseStartDate);
  const endDate = parseISO(section.endDate || courseEndDate);
  const meetingDates = new Map<DateString, MeetingPattern[]>();
  
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    const dayOfWeek = getDayOfWeek(currentDate);
    
    for (const meeting of section.meetings) {
      if (meeting.days.includes(dayOfWeek)) {
        const existing = meetingDates.get(dateStr) || [];
        meetingDates.set(dateStr, [...existing, meeting]);
      }
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return meetingDates;
}

/**
 * Get dates for a lecture mapping for a specific section.
 * Prefers datesBySection over dates when a section-specific entry exists.
 */
function getLectureDatesForSection(
  lecture: LectureMapping,
  sectionId: string
): DateString[] {
  const sectionDates = lecture.datesBySection?.[sectionId];
  if (Array.isArray(sectionDates) && sectionDates.length > 0) {
    return sectionDates; //preferred if section-specific dates are provided and non-empty
  }
  return lecture.dates ?? [];
}


/**
 * Validate lecture mappings and warn if any have no dates configured.
 */
function validateLectureMappings(lectures: LectureMapping[]): void {
  for (const lecture of lectures) {
    
    const hasGlobalDates = Array.isArray(lecture.dates) && lecture.dates.length > 0;
    const hasSectionDates =
      !!lecture.datesBySection &&
      Object.values(lecture.datesBySection).some(
        (dates) => Array.isArray(dates) && dates.length > 0
      );

    if (!hasGlobalDates && !hasSectionDates) {
      console.warn(
        `[schedule-generator] Lecture "${lecture.lectureId}" has no dates. Provide "dates" or "datesBySection".`
      );
    }

    if (lecture.datesBySection && !hasSectionDates) {
      console.warn(
        `[schedule-generator] Lecture "${lecture.lectureId}" has "datesBySection" but no non-empty section date arrays.`
      );
    }
  }
}

/**
 * Find lecture for a given date and section.
 * Uses section-specific dates (datesBySection) if available, falls back to global dates.
 */
function findLectureForDate(
  date: DateString,
  sectionId: string,
  lectures: LectureMapping[]
): LectureMapping | undefined {
  return lectures.find((lecture) => {
    const lectureDates = getLectureDatesForSection(lecture, sectionId);

    if (!lectureDates.includes(date)) {
      return false;
    }
    
    // Check if lecture is restricted to specific sections
    if (lecture.sections && lecture.sections.length > 0) {
      return lecture.sections.includes(sectionId);
    }
    
    return true;
  });
}

/**
 * Find lab for a given date
 */
function findLabForDate(
  date: DateString,
  sectionId: string,
  labs: Lab[]
): Lab | undefined {
  if (!labs || labs.length === 0) return undefined;
  
  return labs.find((lab) => {
    if (!lab.dates.includes(date)) {
      return false;
    }
    
    if (lab.sections && lab.sections.length > 0) {
      return lab.sections.includes(sectionId);
    }
    
    return true;
  });
}

/**
 * Generate schedule for a single section
 */
function generateSectionSchedule(
  section: CourseSection,
  config: CourseConfig
): ScheduleEntry[] {
  const allHolidays = [
    ...config.holidays,
    ...(section.additionalHolidays || []),
  ];
  
  const meetingDates = generateMeetingDates(
    section,
    config.startDate,
    config.endDate,
    allHolidays
  );

  // Find all lectures scheduled for this section that might not match normal meeting pattern
  const scheduledLectureDates = new Set<DateString>();
  if (config.lectures && config.lectures.length > 0) {
    for (const lecture of config.lectures) {
      const appliesToSection = !lecture.sections || lecture.sections.length === 0 || lecture.sections.includes(section.id);
      if (appliesToSection) {
        // Use section-specific dates if available, else global dates
        const lectureDates = getLectureDatesForSection(lecture, section.id);
        for (const lectureDate of lectureDates) {
          const dateObj = parseISO(lectureDate);
          const startDate = parseISO(section.startDate || config.startDate);
          const endDate = parseISO(section.endDate || config.endDate);
          if (dateObj >= startDate && dateObj <= endDate) {
            scheduledLectureDates.add(lectureDate);
          }
        }
      }
    }
  }

  // Find all labs scheduled for this section that might not match normal meeting pattern
  const scheduledLabDates = new Set<DateString>();
  if (config.labs && config.labs.length > 0) {
    for (const lab of config.labs) {
      const appliesToSection = !lab.sections || lab.sections.length === 0;
      if (appliesToSection) {
        for (const labDate of lab.dates) {
          const dateObj = parseISO(labDate);
          const startDate = parseISO(section.startDate || config.startDate);
          const endDate = parseISO(section.endDate || config.endDate);
          if (dateObj >= startDate && dateObj <= endDate) {
            scheduledLabDates.add(labDate);
          }
        }
      }
    }
  }

  const allScheduledDates = new Set([...scheduledLectureDates, ...scheduledLabDates]);
  for (const scheduledDate of allScheduledDates) {
    if (!meetingDates.has(scheduledDate)) {
      const defaultMeeting: MeetingPattern = section.meetings.length > 0
        ? section.meetings[0]
        : {
            type: 'lecture',
            days: [getDayOfWeek(parseISO(scheduledDate))],
            startTime: '00:00',
            endTime: '00:00',
            location: section.meetings[0]?.location,
          };
      const existing = meetingDates.get(scheduledDate) || [];
      meetingDates.set(scheduledDate, [...existing, defaultMeeting]);
    }
  }
  
  const schedule: ScheduleEntry[] = [];
  let meetingNumber = 1;
  
  const sortedDates = Array.from(meetingDates.keys()).sort();
  
  for (const date of sortedDates) {
    const meetings = meetingDates.get(date)!;
    const dateObj = parseISO(date);
    const holiday = isHoliday(date, allHolidays);
    const lecture = findLectureForDate(date, section.id, config.lectures);
    const lab = findLabForDate(date, section.id, config.labs || []);
    
    for (const meeting of meetings) {
      const entry: ScheduleEntry = {
        date,
        dayOfWeek: getDayOfWeek(dateObj),
        meetingNumber: meetingNumber++,
        sectionId: section.id,
        sectionName: section.name,
        meeting,
        lecture,
        lab,
        holiday,
        isCancelled: !!holiday,
      };
      
      schedule.push(entry);
    }
  }
  
  return schedule;
}

/**
 * Generate schedule for a single lab section
 */
function generateLabSectionSchedule(
  labSection: LabSection,
  config: CourseConfig
): ScheduleEntry[] {
  const allHolidays = [
    ...config.holidays,
    ...(labSection.additionalHolidays || []),
  ];

  const meetingDates = generateMeetingDates(
    {
      ...labSection,
      meetings: labSection.meetings,
    },
    config.startDate,
    config.endDate,
    allHolidays
  );

  const scheduledLabDates = new Set<DateString>();
  if (config.labs && config.labs.length > 0) {
    for (const lab of config.labs) {
      const appliesToSection = !lab.sections || lab.sections.length === 0 || lab.sections.includes(labSection.id);
      if (appliesToSection) {
        for (const labDate of lab.dates) {
          const dateObj = parseISO(labDate);
          const startDate = parseISO(labSection.startDate || config.startDate);
          const endDate = parseISO(labSection.endDate || config.endDate);
          if (dateObj >= startDate && dateObj <= endDate) {
            scheduledLabDates.add(labDate);
          }
        }
      }
    }
  }

  for (const labDate of scheduledLabDates) {
    if (!meetingDates.has(labDate)) {
      const defaultMeeting: MeetingPattern = labSection.meetings.length > 0
        ? labSection.meetings[0]
        : {
            type: 'lab',
            days: [getDayOfWeek(parseISO(labDate))],
            startTime: '00:00',
            endTime: '00:00',
            location: labSection.meetings[0]?.location,
          };
      const existing = meetingDates.get(labDate) || [];
      meetingDates.set(labDate, [...existing, defaultMeeting]);
    }
  }

  const schedule: ScheduleEntry[] = [];
  let meetingNumber = 1;

  const sortedDates = Array.from(meetingDates.keys()).sort();

  for (const date of sortedDates) {
    const meetings = meetingDates.get(date)!;
    const dateObj = parseISO(date);
    const holiday = isHoliday(date, allHolidays);
    const lab = findLabForDate(date, labSection.id, config.labs || []);
    
    for (const meeting of meetings) {
      const entry: ScheduleEntry = {
        date,
        dayOfWeek: getDayOfWeek(dateObj),
        meetingNumber: meetingNumber++,
        sectionId: labSection.id,
        sectionName: labSection.name,
        meeting,
        lecture: undefined,
        lab,
        holiday,
        isCancelled: !!holiday,
      };
      
      schedule.push(entry);
    }
  }

  return schedule;
}

/**
 * Generate complete course schedule
 */
export function generateSchedule(config: CourseConfig): CourseSchedule {
  validateLectureMappings(config.lectures || []);

  const scheduleBySection: { [sectionId: string]: ScheduleEntry[] } = {};
  const allEntries: ScheduleEntry[] = [];
  const labScheduleBySection: { [labSectionId: string]: ScheduleEntry[] } = {};
  
  for (const section of config.sections) {
    const sectionSchedule = generateSectionSchedule(section, config);
    scheduleBySection[section.id] = sectionSchedule;
    allEntries.push(...sectionSchedule);
  }

  if (config.labSections && config.labSections.length > 0) {
    for (const labSection of config.labSections) {
      const labSectionSchedule = generateLabSectionSchedule(labSection, config);
      labScheduleBySection[labSection.id] = labSectionSchedule;
      allEntries.push(...labSectionSchedule);
      if (labSectionSchedule.length === 0) {
        console.warn(`[schedule-generator] Lab section ${labSection.id} produced 0 meetings`);
      }
    }
  } else {
    if (!config.labSections) {
      console.warn('[schedule-generator] No labSections configured');
    } else if (config.labSections.length === 0) {
      console.warn('[schedule-generator] labSections is empty');
    }
  }
  
  allEntries.sort((a, b) => a.date.localeCompare(b.date));
  
  const examDates = config.holidays
    .filter((h) => h.type === 'exam-period')
    .map((h) => h.date);
  
  const assignmentDueDates = (config.assignments || []).map((a) => a.dueDate);
  
  return {
    config,
    scheduleBySection,
    labScheduleBySection: Object.keys(labScheduleBySection).length > 0 ? labScheduleBySection : undefined,
    allEntries,
    importantDates: {
      startDate: config.startDate,
      endDate: config.endDate,
      holidays: config.holidays,
      examDates,
      assignmentDueDates,
    },
  };
}

/**
 * Export schedule to various formats
 */
export function exportScheduleToJSON(schedule: CourseSchedule): string {
  return JSON.stringify(schedule, null, 2);
}

/**
 * Generate a markdown table for the schedule
 */
export function exportScheduleToMarkdown(
  schedule: CourseSchedule,
  sectionId?: string
): string {
  const entries = sectionId
    ? schedule.scheduleBySection[sectionId]
    : schedule.allEntries;
  
  let markdown = '# Course Schedule\n\n';
  markdown += `**Course:** ${schedule.config.courseCode} - ${schedule.config.courseTitle}\n\n`;
  markdown += `**Semester:** ${schedule.config.semester}\n\n`;
  
  markdown += '| # | Date | Day | Topic | Notes |\n';
  markdown += '|---|------|-----|-------|-------|\n';
  
  for (const entry of entries) {
    const date = new Date(entry.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    
    let topic = entry.lecture?.title || entry.lecture?.lectureId || '';
    let notes = entry.holiday?.name || entry.notes || '';
    
    if (entry.isCancelled) {
      topic = '~~' + (topic || 'Class') + '~~';
      notes = entry.holiday?.name || 'No class';
    }
    
    markdown += `| ${entry.meetingNumber} | ${date} | ${entry.dayOfWeek.slice(0, 3)} | ${topic} | ${notes} |\n`;
  }
  
  return markdown;
}