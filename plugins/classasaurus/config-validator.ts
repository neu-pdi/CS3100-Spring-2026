/**
 * Configuration validation utilities
 */

import type {
  CourseConfig,
  DateString,
  TimeString,
  LectureMapping,
  CourseSection,
  LabSection,
  Holiday,
  Lab,
} from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate a date string
 */
export function validateDate(date: DateString, fieldName: string): void {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ValidationError(
      `${fieldName} must be in YYYY-MM-DD format, got: ${date}`
    );
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError(`${fieldName} is not a valid date: ${date}`);
  }
}

/**
 * Validate a time string
 */
export function validateTime(time: TimeString, fieldName: string): void {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new ValidationError(
      `${fieldName} must be in HH:MM format (24-hour), got: ${time}`
    );
  }
}

/**
 * Validate that end date is after start date
 */
export function validateDateRange(
  startDate: DateString,
  endDate: DateString,
  context: string
): void {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end <= start) {
    throw new ValidationError(
      `${context}: end date (${endDate}) must be after start date (${startDate})`
    );
  }
}

/**
 * Validate that end time is after start time
 */
export function validateTimeRange(
  startTime: TimeString,
  endTime: TimeString,
  context: string
): void {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (endMinutes <= startMinutes) {
    throw new ValidationError(
      `${context}: end time (${endTime}) must be after start time (${startTime})`
    );
  }
}

/**
 * Validate a course section
 */
export function validateSection(section: CourseSection, courseStartDate: DateString, courseEndDate: DateString): void {
  if (!section.id || section.id.trim() === '') {
    throw new ValidationError('Section must have a non-empty id');
  }
  
  if (!section.name || section.name.trim() === '') {
    throw new ValidationError(`Section ${section.id} must have a non-empty name`);
  }
  
  if (!section.timeZone || section.timeZone.trim() === '') {
    throw new ValidationError(`Section ${section.id} must have a timeZone (e.g., "America/New_York")`);
  }
  
  if (!section.meetings || section.meetings.length === 0) {
    throw new ValidationError(`Section ${section.id} must have at least one meeting pattern`);
  }
  
  // Validate each meeting pattern
  section.meetings.forEach((meeting, idx) => {
    if (!meeting.days || meeting.days.length === 0) {
      throw new ValidationError(
        `Section ${section.id}, meeting ${idx}: must have at least one day`
      );
    }
    
    validateTime(meeting.startTime, `Section ${section.id}, meeting ${idx} start time`);
    validateTime(meeting.endTime, `Section ${section.id}, meeting ${idx} end time`);
    validateTimeRange(
      meeting.startTime,
      meeting.endTime,
      `Section ${section.id}, meeting ${idx}`
    );
  });
  
  // Validate section-specific dates if provided
  if (section.startDate) {
    validateDate(section.startDate, `Section ${section.id} start date`);
  }
  
  if (section.endDate) {
    validateDate(section.endDate, `Section ${section.id} end date`);
  }
  
  if (section.startDate && section.endDate) {
    validateDateRange(
      section.startDate,
      section.endDate,
      `Section ${section.id}`
    );
  }
}

/**
 * Validate a lab section (shares structure with CourseSection)
 */
export function validateLabSection(section: LabSection, courseStartDate: DateString, courseEndDate: DateString): void {
  validateSection(section as unknown as CourseSection, courseStartDate, courseEndDate);
}

/**
 * Validate holidays
 */
export function validateHoliday(holiday: Holiday): void {
  validateDate(holiday.date, 'Holiday date');
  
  if (holiday.endDate) {
    validateDate(holiday.endDate, 'Holiday end date');
    validateDateRange(holiday.date, holiday.endDate, `Holiday: ${holiday.name}`);
  }
  
  if (!holiday.name || holiday.name.trim() === '') {
    throw new ValidationError('Holiday must have a non-empty name');
  }
}

/**
 * Validate lecture mapping
 */
export function validateLecture(
  lecture: LectureMapping,
  knownSectionIds: Set<string>
): void {
  if (!lecture.lectureId || lecture.lectureId.trim() === '') {
    throw new ValidationError('Lecture must have a non-empty lectureId');
  }

  const hasGlobalDates = Array.isArray(lecture.dates) && lecture.dates.length > 0;
  const hasSectionDates =
    !!lecture.datesBySection &&
    Object.values(lecture.datesBySection).some(
      (dates) => Array.isArray(dates) && dates.length > 0
    );

  if (!hasGlobalDates && !hasSectionDates) {
    throw new ValidationError(
      `Lecture ${lecture.lectureId} must have at least one date source: dates or datesBySection`
    );
  }

  if (hasGlobalDates) {
    lecture.dates!.forEach((date, idx) => {
      validateDate(date, `Lecture ${lecture.lectureId}, date ${idx}`);
    });
  }

  if (lecture.datesBySection) {
    Object.entries(lecture.datesBySection).forEach(([sectionId, dates]) => {
      if (!knownSectionIds.has(sectionId)) {
        throw new ValidationError(
          `Lecture ${lecture.lectureId} references unknown section in datesBySection: ${sectionId}`
        );
      }
      if (!Array.isArray(dates) || dates.length === 0) {
        throw new ValidationError(
          `Lecture ${lecture.lectureId}, section ${sectionId} must have at least one date`
        );
      }
      dates.forEach((date, idx) => {
        validateDate(
          date,
          `Lecture ${lecture.lectureId}, section ${sectionId}, date ${idx}`
        );
      });
    });
  }
}

/**
 * Validate lab
 */
export function validateLab(lab: Lab): void {
  if (!lab.id || lab.id.trim() === '') {
    throw new ValidationError('Lab must have a non-empty id');
  }
  
  if (!lab.title || lab.title.trim() === '') {
    throw new ValidationError(`Lab ${lab.id} must have a non-empty title`);
  }
  
  if (!lab.dates || lab.dates.length === 0) {
    throw new ValidationError(
      `Lab ${lab.id} must have at least one date`
    );
  }
  
  lab.dates.forEach((date: string, idx: number) => {
    validateDate(date, `Lab ${lab.id}, date ${idx}`);
  });
}

/**
 * Validate entire course configuration
 */
export function validateCourseConfig(config: CourseConfig): void {
  // Validate basic fields
  if (!config.courseCode || config.courseCode.trim() === '') {
    throw new ValidationError('Course must have a courseCode');
  }
  
  if (!config.courseTitle || config.courseTitle.trim() === '') {
    throw new ValidationError('Course must have a courseTitle');
  }
  
  if (!config.semester) {
    throw new ValidationError('Course must have a semester');
  }
  
  // Validate dates
  validateDate(config.startDate, 'Course start date');
  validateDate(config.endDate, 'Course end date');
  validateDateRange(config.startDate, config.endDate, 'Course');
  
  // Validate sections
  if (!config.sections || config.sections.length === 0) {
    throw new ValidationError('Course must have at least one section');
  }
  
  const sectionIds = new Set<string>();
  config.sections.forEach((section) => {
    if (sectionIds.has(section.id)) {
      throw new ValidationError(`Duplicate section id: ${section.id}`);
    }
    sectionIds.add(section.id);
    validateSection(section, config.startDate, config.endDate);
  });

  // Validate lab sections (if any) and collect ids
  const labSectionIds = new Set<string>();
  if (config.labSections) {
    config.labSections.forEach((labSection) => {
      if (labSectionIds.has(labSection.id)) {
        throw new ValidationError(`Duplicate lab section id: ${labSection.id}`);
      }
      labSectionIds.add(labSection.id);
      validateLabSection(labSection, config.startDate, config.endDate);
    });
  }
  
  // Validate holidays
  config.holidays.forEach((holiday) => {
    validateHoliday(holiday);
  });
  
  // Validate lectures
  const lectureIds = new Set<string>();
  config.lectures.forEach((lecture) => {
    if (lectureIds.has(lecture.lectureId)) {
      throw new ValidationError(`Duplicate lecture id: ${lecture.lectureId}`);
    }
    lectureIds.add(lecture.lectureId);
    //validating with section ids to ensure datesBySection references are valid
    validateLecture(lecture, sectionIds);
    
    // Validate section references
    if (lecture.sections) {
      lecture.sections.forEach((sectionId) => {
        if (!sectionIds.has(sectionId)) {
          throw new ValidationError(
            `Lecture ${lecture.lectureId} references unknown section: ${sectionId}`
          );
        }
      });
    }
  });
  
  // Validate labs if present
  if (config.labs) {
    const labIds = new Set<string>();
    config.labs.forEach((lab) => {
      if (labIds.has(lab.id)) {
        throw new ValidationError(`Duplicate lab id: ${lab.id}`);
      }
      labIds.add(lab.id);
      validateLab(lab);
      
      // Validate section references
      if (lab.sections) {
        lab.sections.forEach((sectionId) => {
          const known = sectionIds.has(sectionId) || labSectionIds.has(sectionId);
          if (!known) {
            throw new ValidationError(
              `Lab ${lab.id} references unknown section: ${sectionId}`
            );
          }
        });
      }
    });
  }
  
  // Validate Canvas config if present
  if (config.canvas) {
    if (!config.canvas.canvasUrl || !config.canvas.apiTokenEnvVar) {
      throw new ValidationError(
        'Canvas configuration must include canvasUrl and apiTokenEnvVar'
      );
    }
  }
  
  console.log('✓ Course configuration validated successfully');
}

