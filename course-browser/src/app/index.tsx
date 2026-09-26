import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CategoryView } from "@/components/course-browser/category-view";
import { CourseList } from "@/components/course-browser/course-list";
import { SearchResults } from "@/components/course-browser/search-results";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
    classesForCourse,
    formatSchedule,
    loadCourseData,
    prerequisiteGroups,
    type ClassRecord,
    type CourseData,
    type CourseRecord,
} from "@/data/course-data";

type BrowserView = "portal" | "categories" | "courses" | "course";
const colors = {
    ink: "#302d29",
    muted: "#746b62",
    line: "#e5d9cd",
    paper: "#fff5e9",
    panel: "#f8eadb",
    highlight: "#fbd9b1",
    accent: "#9b681c",
};

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const [view, setView] = useState<BrowserView>("portal");
    const [prefix, setPrefix] = useState<string>();
    const [course, setCourse] = useState<CourseRecord>();
    const [data, setData] = useState<CourseData>();
    const [error, setError] = useState<string>();
    const [searching, setSearching] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("");
    const pageTransition = useRef(new Animated.Value(0)).current;
    const searchTransition = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadCourseData()
            .then((loadedData) => {
                setData(loadedData);
                setSelectedSemester(loadedData.semesters[0] ?? "");
            })
            .catch((reason: Error) => setError(reason.message));
    }, []);
    useEffect(() => {
        pageTransition.setValue(0);
        Animated.timing(pageTransition, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
        }).start();
    }, [pageTransition, view]);
    useEffect(() => {
        Animated.timing(searchTransition, {
            toValue: searching ? 1 : 0,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [searchTransition, searching]);
    const openPrefix = (value: string) => {
        setPrefix(value);
        setView("courses");
    };
    const openCourse = (value: CourseRecord) => {
        setCourse(value);
        setView("course");
    };
    const openHome = () => {
        setSearching(false);
        setQuery("");
        setView("portal");
    };
    const openCourses = () => {
        setSearching(false);
        setQuery("");
        setView("categories");
    };
    const toggleSearch = () => {
        if (!searching) {
            setView("categories");
        }
        setSearching(!searching);
        setQuery("");
    };
    const handleSearchChange = (value: string) => {
        if (view !== "categories") {
            setView("categories");
        }
        setQuery(value);
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <NavItem
                        label="Home"
                        onPress={openHome}
                        active={view === "portal"}
                    />
                    <NavItem
                        label="Courses"
                        onPress={openCourses}
                        active={!searching && view !== "portal"}
                    />
                    <NavItem
                        label="Search"
                        onPress={toggleSearch}
                        active={searching}
                    />
                </View>
                {searching && (
                    <Animated.View
                        style={[
                            styles.searchBar,
                            {
                                opacity: searchTransition,
                                transform: [
                                    {
                                        translateY: searchTransition.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-8, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <TextInput
                            autoFocus
                            value={query}
                            onChangeText={handleSearchChange}
                            placeholder="Search courses"
                            placeholderTextColor={colors.muted}
                            style={styles.searchInput}
                        />
                        <Pressable onPress={toggleSearch} style={styles.cancelButton}>
                            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                        </Pressable>
                    </Animated.View>
                )}
                {!data && !error && (
                    <ThemedText style={styles.status}>Loading course data...</ThemedText>
                )}
                {error && (
                    <ThemedText style={styles.status}>
                        Could not load course data. Check your connection.
                    </ThemedText>
                )}
                <Animated.View
                    style={[
                        styles.pageContent,
                        {
                            opacity: pageTransition,
                            transform: [
                                {
                                    translateY: pageTransition.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [12, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {view === "portal" && (
                        <PortalView onBrowse={() => setView("categories")} />
                    )}
                    {data && view === "categories" && (
                        searching ? (
                            <SearchResults
                                courses={data.courses}
                                classes={data.classes}
                                query={query}
                                semesters={data.semesters}
                                selectedSemester={selectedSemester}
                                onSemesterChange={setSelectedSemester}
                                onCourseSelect={openCourse}
                            />
                        ) : (
                            <CategoryView
                                data={data}
                                selectedSemester={selectedSemester}
                                onSemesterChange={setSelectedSemester}
                                onSelect={openPrefix}
                            />
                        )
                    )}
                    {data && view === "courses" && prefix && (
                        <CourseList
                            data={data}
                            prefix={prefix}
                            selectedSemester={selectedSemester}
                            onSemesterChange={setSelectedSemester}
                            onSelect={openCourse}
                        />
                    )}
                    {data && view === "course" && course && (
                        <CourseDetail
                            course={course}
                            classes={classesForCourse(course, data.classes)}
                            courses={data.courses}
                            onCourseSelect={openCourse}
                        />
                    )}
                </Animated.View>
            </SafeAreaView>
        </ThemedView>
    );
}

function NavItem({
    label,
    onPress,
    active,
}: {
    label: string;
    onPress: () => void;
    active: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.navButton, active && styles.navButtonActive]}
        >
            <ThemedText style={[styles.navText, active && styles.navTextActive]}>
                {label}
            </ThemedText>
        </Pressable>
    );
}

function PortalView({ onBrowse }: { onBrowse: () => void }) {
    return (
        <View style={styles.portal}>
            <View style={styles.portalMark}>
                <ThemedText style={styles.portalMarkText}>U</ThemedText>
            </View>
            <ThemedText style={styles.portalTitle}>Welcome back</ThemedText>
            <ThemedText style={styles.portalSubtitle}>
                Find courses, compare sections, and plan your semester.
            </ThemedText>
            <Pressable
                onPress={onBrowse}
                style={({ pressed }) => [
                    styles.browseButton,
                    pressed && styles.pressed,
                ]}
            >
                <ThemedText style={styles.browseButtonText}>Browse courses</ThemedText>
                <ThemedText style={styles.browseArrow}>›</ThemedText>
            </Pressable>
        </View>
    );
}

function CourseDetail({
    course,
    classes,
    courses,
    onCourseSelect,
}: {
    course: CourseRecord;
    classes: ClassRecord[];
    courses: CourseRecord[];
    onCourseSelect: (course: CourseRecord) => void;
}) {
    return (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <ThemedText style={styles.detailCode}>
                {course.prefix} {course.number}
            </ThemedText>
            <ThemedText style={styles.detailTitle}>{course.title}</ThemedText>
            <ThemedText style={styles.detailSubtitle}>
                {course.term_name} · {course.credits} units
            </ThemedText>
            <View style={styles.prerequisiteBox}>
                <ThemedText style={styles.prerequisiteTitle}>Prerequisites</ThemedText>
                <PrerequisiteTree
                    course={course}
                    courses={courses}
                    onCourseSelect={onCourseSelect}
                />
            </View>
            {classes.map((item) => (
                <View key={`${item.section}-${item.number}`} style={styles.detailCard}>
                    <ThemedText style={styles.detailSection}>
                        {item.section ?? `Class ${item.number}`}
                    </ThemedText>
                    <ThemedText style={styles.detailTime}>
                        {item.schedules.map(formatSchedule).join(" · ")}
                    </ThemedText>
                    <View style={styles.infoBox}>
                        <ThemedText style={styles.infoText}>
                            ⌖ {item.schedules[0]?.venue_name ?? "Venue not provided"}
                        </ThemedText>
                        <ThemedText style={styles.infoText}>
                            ♙{" "}
                            {item.schedules[0]?.instructors.join(", ") ??
                                "Instructor not provided"}
                        </ThemedText>
                    </View>
                    <View style={styles.detailStats}>
                        <ThemedText style={styles.total}>Capacity</ThemedText>
                        <ThemedText style={styles.statLabel}>Enrol</ThemedText>
                        <ThemedText style={styles.statLabel}>Avail</ThemedText>
                        <ThemedText style={styles.statLabel}>Wait</ThemedText>
                    </View>
                    <View style={styles.detailStats}>
                        <ThemedText style={styles.total}>{item.capacity}</ThemedText>
                        <ThemedText style={styles.detailValue}>{item.enroll}</ThemedText>
                        <ThemedText style={styles.detailValue}>
                            {Math.max(item.capacity - item.enroll, 0)}
                        </ThemedText>
                        <ThemedText style={styles.detailValue}>{item.wait}</ThemedText>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

function PrerequisiteTree({
    course,
    courses,
    onCourseSelect,
    depth = 0,
    ancestors = new Set<string>(),
}: {
    course: CourseRecord;
    courses: CourseRecord[];
    onCourseSelect: (course: CourseRecord) => void;
    depth?: number;
    ancestors?: Set<string>;
}) {
    const courseCode = `${course.prefix} ${course.number}`;
    const prerequisiteGroupsForCourse = getPrerequisiteGroups(
        course,
        courses,
        ancestors,
    );
    const hasChoiceGroup = prerequisiteGroupsForCourse.some(
        (group) => group.length > 1,
    );

    if (!prerequisiteGroupsForCourse.length) {
        return depth === 0 ? (
            <ThemedText style={styles.prerequisiteEmpty}>
                No listed prerequisites
            </ThemedText>
        ) : null;
    }

    return (
        <View
            style={[
                depth > 0 && styles.prerequisiteChildren,
                hasChoiceGroup && styles.prerequisiteChildrenNoLine,
            ]}
        >
            {prerequisiteGroupsForCourse.map((group, index) => (
                <View
                    key={`${courseCode}-group-${index}`}
                    style={group.length > 1 && styles.prerequisiteGroup}
                >
                    {group.length > 1 && (
                        <ThemedText style={styles.prerequisiteGroupLabel}>
                            Choose one
                        </ThemedText>
                    )}
                    {group.map((item) => (
                        <PrerequisiteNode
                            key={`${item.prefix} ${item.number}`}
                            course={item}
                            courses={courses}
                            onCourseSelect={onCourseSelect}
                            depth={depth}
                            ancestors={new Set(ancestors).add(courseCode)}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
}

function PrerequisiteNode({
    course,
    courses,
    onCourseSelect,
    depth,
    ancestors,
}: {
    course: CourseRecord;
    courses: CourseRecord[];
    onCourseSelect: (course: CourseRecord) => void;
    depth: number;
    ancestors: Set<string>;
}) {
    const [expanded, setExpanded] = useState(false);
    const itemCode = `${course.prefix} ${course.number}`;
    const childPrerequisites = getPrerequisiteGroups(course, courses, ancestors);
    const hasChildren = childPrerequisites.length > 0;

    return (
        <View style={styles.prerequisiteNode}>
            <View style={styles.prerequisiteBranch}>
                {hasChildren ? (
                    <Pressable
                        onPress={() => setExpanded((value) => !value)}
                        style={styles.prerequisiteToggle}
                        accessibilityLabel={`${expanded ? "Collapse" : "Expand"} ${itemCode} prerequisites`}
                    >
                        <ThemedText style={styles.prerequisiteBranchText}>
                            {expanded ? "⌄" : "›"}
                        </ThemedText>
                    </Pressable>
                ) : (
                    <View style={styles.prerequisiteToggle} />
                )}
                <Pressable
                    onPress={() => onCourseSelect(course)}
                    style={styles.prerequisitePressable}
                >
                    <ThemedText style={styles.prerequisiteLink}>
                        {itemCode} · {course.title}
                    </ThemedText>
                </Pressable>
            </View>
            {expanded && hasChildren && (
                <PrerequisiteTree
                    course={course}
                    courses={courses}
                    onCourseSelect={onCourseSelect}
                    depth={depth + 1}
                    ancestors={ancestors}
                />
            )}
        </View>
    );
}

function getPrerequisiteGroups(
    course: CourseRecord,
    courses: CourseRecord[],
    ancestors: Set<string>,
) {
    const courseCode = `${course.prefix} ${course.number}`;
    const nextAncestors = new Set(ancestors).add(courseCode);
    return prerequisiteGroups(course.prerequisite)
        .map((group) =>
            group
                .map((label) =>
                    courses.find((item) => `${item.prefix} ${item.number}` === label),
                )
                .filter((item): item is CourseRecord => Boolean(item))
                .filter(
                    (item) => !nextAncestors.has(`${item.prefix} ${item.number}`),
                ),
        )
        .filter((group) => group.length > 0);
}

const styles = StyleSheet.create({
    navButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 44,
        paddingVertical: 10,
        borderRadius: 10,
    },
    navButtonActive: {
        backgroundColor: colors.highlight,
        shadowColor: colors.accent,
        shadowOpacity: 0.12,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    navText: { fontSize: 14, color: colors.muted, fontWeight: "700" },
    navTextActive: { color: colors.accent },
    pressed: { opacity: 0.7 },
    searchBar: {
        height: 72,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        height: 42,
        backgroundColor: colors.panel,
        borderRadius: 7,
        paddingHorizontal: 12,
        color: colors.ink,
        fontSize: 15,
    },
    cancelButton: { paddingHorizontal: 4, paddingVertical: 10 },
    cancelText: { color: colors.accent, fontSize: 13, fontWeight: "700" },
    prerequisiteBox: {
        backgroundColor: colors.panel,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 8,
        padding: 12,
    },
    prerequisiteChildren: {
        marginLeft: 18,
        borderLeftWidth: 1,
        borderLeftColor: colors.line,
        paddingLeft: 10,
    },
    prerequisiteChildrenNoLine: {
        borderLeftWidth: 0,
    },
    prerequisiteNode: { marginTop: 2 },
    prerequisiteBranch: {
        flexDirection: "row",
        alignItems: "center",
    },
    prerequisiteToggle: {
        width: 24,
        minHeight: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    prerequisiteGroup: {
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 6,
        marginTop: 6,
        padding: 6,
    },
    prerequisiteGroupLabel: {
        color: colors.muted,
        fontSize: 11,
        fontWeight: "700",
        marginBottom: 2,
        textTransform: "uppercase",
    },
    prerequisiteBranchText: {
        color: colors.muted,
        fontSize: 14,
        width: 22,
    },
    prerequisitePressable: { flex: 1 },
    prerequisiteTitle: {
        color: colors.ink,
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 6,
    },
    prerequisiteLink: { color: colors.accent, fontSize: 13, paddingVertical: 4 },
    prerequisiteEmpty: { color: colors.muted, fontSize: 13 },
    container: { flex: 1, backgroundColor: colors.paper },
    pageContent: { flex: 1 },
    safeArea: {
        flex: 1,
        width: "100%",
        maxWidth: 430,
        alignSelf: "center",
        backgroundColor: colors.paper,
    },
    header: {
        minHeight: 72,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    status: { color: colors.muted, textAlign: "center", padding: 32 },
    portal: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
        paddingBottom: 80,
    },
    portalMark: {
        width: 62,
        height: 62,
        borderRadius: 18,
        backgroundColor: colors.highlight,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 22,
    },
    portalMarkText: { color: colors.accent, fontSize: 34, fontWeight: "700" },
    portalTitle: { color: colors.ink, fontSize: 28, fontWeight: "600" },
    portalSubtitle: {
        color: colors.muted,
        fontSize: 14,
        lineHeight: 21,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 28,
    },
    browseButton: {
        width: "100%",
        maxWidth: 300,
        backgroundColor: colors.accent,
        borderRadius: 8,
        paddingHorizontal: 18,
        paddingVertical: 15,
        flexDirection: "row",
        alignItems: "center",
    },
    browseButtonText: {
        color: colors.paper,
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
    },
    browseArrow: { color: colors.paper, fontSize: 25, lineHeight: 22 },
    scrollContent: { paddingBottom: 110 },
    detailCode: {
        fontSize: 16,
        color: colors.muted,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    detailTitle: {
        fontSize: 25,
        fontWeight: "600",
        color: colors.ink,
        paddingHorizontal: 16,
        marginTop: 4,
    },
    detailSubtitle: {
        fontSize: 13,
        color: colors.muted,
        paddingHorizontal: 16,
        marginTop: 5,
        marginBottom: 10,
    },
    detailCard: {
        backgroundColor: colors.panel,
        borderRadius: 8,
        marginHorizontal: 12,
        marginTop: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.line,
    },
    detailSection: { fontSize: 19, color: colors.ink },
    detailTime: { fontSize: 12, color: colors.accent, marginTop: 5 },
    infoBox: {
        backgroundColor: "#f1e2d3",
        borderRadius: 7,
        padding: 9,
        marginTop: 10,
        gap: 4,
    },
    infoText: { fontSize: 11, color: colors.muted },
    detailStats: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        gap: 13,
    },
    statLabel: {
        fontSize: 12,
        color: colors.muted,
        minWidth: 29,
        textAlign: "center",
    },
    total: { flex: 1, fontSize: 12, color: colors.muted },
    detailValue: {
        fontSize: 23,
        color: colors.accent,
        minWidth: 29,
        textAlign: "center",
    },
});
