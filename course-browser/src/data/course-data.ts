import localData from "./local-data.json";

export type ScheduleRecord = {
    weekday: string;
    time_from: string;
    time_to: string;
    venue_name: string;
    instructors: string[];
};

export type CourseRecord = {
    term_num: number;
    term_code: string;
    term_name: string;
    id: string | null;
    prefix: string | null;
    number: string | null;
    career: string;
    title: string;
    credits: number;
    prerequisite: string | null;
    status: string;
};

export type ClassRecord = {
    term_num: number;
    term_code: string;
    term_name: string;
    course_id: string | null;
    prefix: string | null;
    course_number: string | null;
    course_code: string;
    section: string | null;
    number: number;
    capacity: number;
    enroll: number;
    wait: number;
    schedules: ScheduleRecord[];
    reservations: { name: string; quota: number; enroll: number }[];
    status: string;
};

export type CourseData = {
    courses: CourseRecord[];
    classes: ClassRecord[];
    semesters: string[];
    prefixes: string[];
};

export async function loadCourseData() {
    const activeCourses = (localData.courses as CourseRecord[]).filter(
        (course) => course.status === "ACTIVE" && course.prefix && course.number,
    );
    const activeClasses = (localData.classes as ClassRecord[]).filter(
        (courseClass) => courseClass.status === "ACTIVE",
    );
    const semesters = [
        ...new Set(activeCourses.map((course) => course.term_name)),
    ];
    const prefixes = [
        ...new Set(activeCourses.map((course) => course.prefix as string)),
    ].sort();

    return {
        courses: activeCourses,
        classes: activeClasses,
        semesters,
        prefixes,
    };
}

export function prerequisiteCodes(value: string | null | undefined) {
    return [...new Set(value?.match(/\b[A-Z]{2,5}\s?\d{4}[A-Z]?\b/g) ?? [])].map(
        (code) => code.replace(/\s+/, " "),
    );
}

export function prerequisiteGroups(value: string | null | undefined) {
    const expression = value?.replace(/\s+/g, " ").trim();
    if (!expression) return [];

    const parts: string[] = [];
    let depth = 0;
    let start = 0;
    for (let index = 0; index < expression.length; index += 1) {
        if (expression[index] === "(") depth += 1;
        if (expression[index] === ")") depth -= 1;
        if (
            depth === 0 &&
            expression.slice(index, index + 3).toUpperCase() === "AND" &&
            /\s/.test(expression[index - 1] ?? "") &&
            /\s/.test(expression[index + 3] ?? "")
        ) {
            parts.push(expression.slice(start, index).trim());
            start = index + 3;
            index += 2;
        }
    }
    parts.push(expression.slice(start).trim());

    return parts
        .flatMap((part) => {
            const codes = prerequisiteCodes(part);
            return /\bOR\b/i.test(part) ? [codes] : codes.map((code) => [code]);
        })
        .filter((group) => group.length > 0);
}

export function classesForCourse(course: CourseRecord, classes: ClassRecord[]) {
    return classes.filter(
        (courseClass) =>
            courseClass.term_num === course.term_num &&
            courseClass.course_id === course.id,
    );
}

export function formatSchedule(schedule: ScheduleRecord) {
    return `${schedule.weekday} ${schedule.time_from.slice(0, 5)} - ${schedule.time_to.slice(0, 5)}`;
}
