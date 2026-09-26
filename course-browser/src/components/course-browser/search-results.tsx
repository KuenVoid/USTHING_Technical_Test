import { ScrollView, StyleSheet } from "react-native";

import { CourseCard } from "@/components/course-browser/course-card";
import { SemesterSelector } from "@/components/course-browser/semester-selector";
import { ThemedText } from "@/components/themed-text";
import { classesForCourse, type ClassRecord, type CourseRecord } from "@/data/course-data";

const colors = {
    ink: "#302d29",
    muted: "#746b62",
    line: "#e5d9cd",
    panel: "#f8eadb",
    accent: "#9b681c",
};

export function SearchResults({
    courses,
    classes,
    query,
    semesters,
    selectedSemester,
    onSemesterChange,
    onCourseSelect,
}: {
    courses: CourseRecord[];
    classes: ClassRecord[];
    query: string;
    semesters: string[];
    selectedSemester: string;
    onSemesterChange: (semester: string) => void;
    onCourseSelect: (course: CourseRecord) => void;
}) {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = normalizedQuery
        ? courses.filter(
            (course) =>
                course.term_name === selectedSemester &&
                `${course.prefix} ${course.number} ${course.title}`
                    .toLowerCase()
                    .includes(normalizedQuery),
        )
        : [];

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedText style={styles.pageTitle}>
                Searched Courses ({selectedSemester}):
            </ThemedText>
            <SemesterSelector
                semesters={semesters}
                selectedSemester={selectedSemester}
                onSelect={onSemesterChange}
            />
            {!normalizedQuery ? (
                <ThemedText style={styles.emptyResults}>Please input search</ThemedText>
            ) : (
                matches.map((course) => (
                    <CourseCard
                        key={`${course.term_num}-${course.id}`}
                        course={course}
                        classes={classesForCourse(course, classes)}
                        onPress={() => onCourseSelect(course)}
                    />
                ))
            )}
            {normalizedQuery && matches.length === 0 && (
                <ThemedText style={styles.emptyResults}>No courses found</ThemedText>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: { paddingBottom: 110 },
    pageTitle: {
        fontSize: 21,
        fontWeight: "600",
        color: colors.ink,
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 10,
    },
    emptyResults: {
        color: colors.muted,
        fontSize: 14,
        paddingHorizontal: 16,
        paddingVertical: 24,
    },
});
