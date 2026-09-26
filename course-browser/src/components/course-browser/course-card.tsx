import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { type ClassRecord, type CourseRecord } from "@/data/course-data";

const colors = {
    ink: "#302d29",
    muted: "#746b62",
    line: "#e5d9cd",
    panel: "#f8eadb",
    accent: "#9b681c",
};

export function CourseCard({
    course,
    classes,
    onPress,
}: {
    course: CourseRecord;
    classes: ClassRecord[];
    onPress: () => void;
}) {
    const section = classes[0];
    const capacity = section?.capacity ?? 0;
    const enrolled = section?.enroll ?? 0;
    const wait = section?.wait ?? 0;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.courseCard, pressed && styles.pressed]}
        >
            <ThemedText style={styles.courseCode}>
                {course.prefix} {course.number}
            </ThemedText>
            <ThemedText style={styles.courseTitle}>{course.title}</ThemedText>
            <View style={styles.statsRow}>
                <ThemedText style={styles.section}>{classes.length} sections</ThemedText>
                {statLabels.map((label) => (
                    <ThemedText key={label} style={styles.statLabel}>
                        {label}
                    </ThemedText>
                ))}
            </View>
            <View style={styles.statsRow}>
                <ThemedText style={styles.metaPill}>{course.credits} units</ThemedText>
                {[capacity, enrolled, Math.max(capacity - enrolled, 0), wait].map(
                    (value, index) => (
                        <ThemedText key={`${statLabels[index]}-${value}`} style={styles.statValue}>
                            {value}
                        </ThemedText>
                    ),
                )}
            </View>
        </Pressable>
    );
}

const statLabels = ["Quota", "Enrol", "Avail", "Wait"];

const styles = StyleSheet.create({
    courseCard: {
        backgroundColor: colors.panel,
        borderRadius: 8,
        marginHorizontal: 12,
        marginTop: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.line,
    },
    pressed: { opacity: 0.7 },
    courseCode: { fontSize: 18, color: colors.ink, marginBottom: 2 },
    courseTitle: { fontSize: 12, color: colors.ink, marginBottom: 12 },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 0,
        marginTop: 2,
    },
    section: { color: colors.accent, fontSize: 13, flex: 1 },
    statLabel: {
        width: 48,
        fontSize: 12,
        color: colors.muted,
        textAlign: "center",
    },
    statValue: {
        width: 48,
        fontSize: 21,
        color: colors.accent,
        textAlign: "center",
    },
    metaPill: {
        width: 48,
        color: colors.accent,
        fontSize: 12,
        fontWeight: "700",
        textAlign: "left",
    },
});
