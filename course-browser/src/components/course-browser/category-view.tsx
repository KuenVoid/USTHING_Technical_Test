import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { SemesterSelector } from "@/components/course-browser/semester-selector";
import { ThemedText } from "@/components/themed-text";
import { type CourseData } from "@/data/course-data";

const colors = {
    ink: "#302d29",
    line: "#e5d9cd",
};

export function CategoryView({
    data,
    selectedSemester,
    onSemesterChange,
    onSelect,
}: {
    data: CourseData;
    selectedSemester: string;
    onSemesterChange: (semester: string) => void;
    onSelect: (prefix: string) => void;
}) {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedText style={styles.pageTitle}>All Courses</ThemedText>
            <SemesterSelector
                semesters={data.semesters}
                selectedSemester={selectedSemester}
                onSelect={onSemesterChange}
            />
            <View style={styles.divider} />
            <ThemedText style={styles.label}>Prefixes</ThemedText>
            {data.prefixes.map((value) => (
                <Pressable key={value} onPress={() => onSelect(value)} style={styles.row}>
                    <ThemedText style={styles.rowText}>{value}</ThemedText>
                </Pressable>
            ))}
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
        paddingVertical: 16,
    },
    label: {
        fontSize: 12,
        color: "#746b62",
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 8,
    },
    row: {
        minHeight: 41,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    rowText: { fontSize: 15, color: colors.ink },
    divider: { height: 1, backgroundColor: colors.line, marginTop: 8 },
});
