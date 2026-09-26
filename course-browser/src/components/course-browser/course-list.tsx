import { ScrollView, StyleSheet, View } from "react-native";

import { CourseCard } from "@/components/course-browser/course-card";
import { SemesterSelector } from "@/components/course-browser/semester-selector";
import { ThemedText } from "@/components/themed-text";
import { classesForCourse, type CourseData, type CourseRecord } from "@/data/course-data";

const colors = {
    ink: "#302d29",
    muted: "#746b62",
    line: "#e5d9cd",
};

export function CourseList({
    data,
    prefix,
    selectedSemester,
    onSemesterChange,
    onSelect,
}: {
    data: CourseData;
    prefix: string;
    selectedSemester: string;
    onSemesterChange: (semester: string) => void;
    onSelect: (course: CourseRecord) => void;
}) {
    const courses = data.courses.filter(
        (course) =>
            course.prefix === prefix && course.term_name === selectedSemester,
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.listHeading}>
                <ThemedText style={styles.pageTitle}>{prefix}</ThemedText>
                <ThemedText style={styles.subtitle}>{courses.length} courses</ThemedText>
            </View>
            <SemesterSelector
                semesters={data.semesters}
                selectedSemester={selectedSemester}
                onSelect={onSemesterChange}
            />
            {courses.map((course) => (
                <CourseCard
                    key={`${course.term_num}-${course.id}`}
                    course={course}
                    classes={classesForCourse(course, data.classes)}
                    onPress={() => onSelect(course)}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContent: { paddingBottom: 110 },
    listHeading: {
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        paddingBottom: 12,
    },
    pageTitle: {
        fontSize: 21,
        fontWeight: "600",
        color: colors.ink,
        paddingHorizontal: 16,
        paddingTop: 18,
    },
    subtitle: {
        color: colors.muted,
        fontSize: 12,
        marginLeft: 16,
        marginTop: 4,
    },
});
