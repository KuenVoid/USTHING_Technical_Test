import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

const colors = {
    ink: "#302d29",
    muted: "#746b62",
    line: "#e5d9cd",
    panel: "#f8eadb",
    accent: "#9b681c",
    paper: "#fff5e9",
};

export function SemesterSelector({
    semesters,
    selectedSemester,
    onSelect,
}: {
    semesters: string[];
    selectedSemester: string;
    onSelect: (semester: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <View style={styles.wrapper}>
            <Pressable
                onPress={() => setOpen((value) => !value)}
                style={styles.control}
                accessibilityLabel="Choose semester"
                accessibilityState={{ expanded: open }}
            >
                <ThemedText style={styles.selectedText}>{selectedSemester}</ThemedText>
                <View style={styles.arrowBox}>
                    <ThemedText style={styles.arrow}>{open ? "⌃" : "⌄"}</ThemedText>
                </View>
            </Pressable>
            {open && (
                <View style={styles.options}>
                    {semesters.map((semester) => (
                        <Pressable
                            key={semester}
                            onPress={() => {
                                onSelect(semester);
                                setOpen(false);
                            }}
                            style={[styles.option, semester === selectedSemester && styles.optionSelected]}
                        >
                            <ThemedText style={styles.optionText}>{semester}</ThemedText>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginHorizontal: 16, zIndex: 2 },
    control: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 8,
        backgroundColor: colors.panel,
        flexDirection: "row",
        alignItems: "center",
        overflow: "hidden",
    },
    selectedText: { color: colors.ink, fontSize: 14, flex: 1, paddingLeft: 12 },
    arrowBox: {
        width: 42,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderLeftWidth: 1,
        borderLeftColor: colors.line,
    },
    arrow: { color: colors.accent, fontSize: 20, lineHeight: 20 },
    options: {
        position: "absolute",
        top: 49,
        left: 0,
        right: 0,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 8,
        backgroundColor: colors.paper,
        overflow: "hidden",
    },
    option: { minHeight: 42, justifyContent: "center", paddingHorizontal: 12 },
    optionSelected: { backgroundColor: colors.panel },
    optionText: { color: colors.ink, fontSize: 14 },
});
