import type { Language } from "./locale";

export const dashboardMessages = {
  en: {
    overview: "Overview", tasks: "Tasks", auditTrail: "Audit trail", settings: "Settings", menu: "Open navigation", closeMenu: "Close navigation",
    title: "Operations overview", intro: "Follow each recorded task from request to verified result.", allRecorded: "All recorded tasks", checkedAt: "Checked", refresh: "Refresh", signOut: "Sign out",
    totalTasks: "Total tasks", awaiting: "Awaiting approval", inProgress: "In progress", completed: "Completed", other: "Other", taskStatus: "Task status",
    distribution: "Task status distribution", distributionUnavailable: "Distribution unavailable while counts are incomplete or changing.", noDistribution: "No recorded tasks yet.",
    partialCounts: "Some status counts are unavailable. Available values are shown; no missing value is treated as zero.", snapshotNote: "Counts are separate reads and may reflect different moments.",
    recentTasks: "Recent tasks", pageScope: "Newest by creation · up to 5", purpose: "Purpose", state: "State", updated: "Updated", viewTask: "View task", selectedTask: "Selected task",
    selectTask: "Select a task to inspect its evidence.", noTasks: "No tasks are recorded.", tasksUnavailable: "The recent task page is unavailable.",
    evidence: "Evidence and status", request: "Request", policy: "Policy", approval: "Approval", payment: "Payment", fulfillment: "Fulfillment",
    recorded: "Recorded", blocked: "Denied", missing: "No evidence", unknown: "Unknown", loading: "Loading records…", unavailable: "Unavailable", notRecorded: "Not recorded",
    policyChecks: "Policy outcomes · selected task", noAttempts: "No policy attempts recorded for this task.", attempt: "Attempt", merchant: "Merchant", amount: "Amount", baseUnits: "base units", tokenUnits: "token units", exactAmount: "Exact amount", accountAmount: "Task account amount", attemptAmount: "Selected attempt amount",
    activity: "Selected task activity", firstEvents: "First 5 events from the first page", noEvents: "No events recorded on this page.", eventsUnavailable: "Events are unavailable.", accountUnavailable: "Account evidence is unavailable.",
    detailUnavailable: "Selected task detail is unavailable.", actor: "Actor", event: "Event", reason: "Reason", viewAll: "Open full audit record", taskId: "Task ID", ownerId: "User ID", accountState: "Account state",
    signInAgain: "Admin session is required. Sign in again.", forbidden: "This account cannot access Admin audit records.", overviewUnavailable: "The overview is unavailable. Try refreshing.",
    settingsTitle: "Language settings", settingsIntro: "Choose the language for this browser. Record values stay unchanged.", close: "Close", policyUnknown: "Policy decision unavailable",
  },
  ko: {
    overview: "개요", tasks: "작업", auditTrail: "감사 기록", settings: "설정", menu: "메뉴 열기", closeMenu: "메뉴 닫기",
    title: "운영 개요", intro: "기록된 작업의 요청부터 검증된 결과까지 확인합니다.", allRecorded: "기록된 전체 작업", checkedAt: "확인 시각", refresh: "새로고침", signOut: "로그아웃",
    totalTasks: "전체 작업", awaiting: "승인 대기", inProgress: "진행 중", completed: "완료", other: "기타", taskStatus: "작업 상태",
    distribution: "작업 상태 분포", distributionUnavailable: "일부 수를 확인할 수 없거나 조회 중 데이터가 변해 분포를 표시할 수 없습니다.", noDistribution: "기록된 작업이 없습니다.",
    partialCounts: "일부 상태 수를 확인할 수 없습니다. 확인된 값만 표시하며, 누락된 값을 0으로 취급하지 않습니다.", snapshotNote: "각 수치는 별도 조회 결과로 확인 시점이 다를 수 있습니다.",
    recentTasks: "최근 작업", pageScope: "생성 시각 최신순 · 최대 5개", purpose: "목적", state: "상태", updated: "수정 시각", viewTask: "작업 보기", selectedTask: "선택한 작업",
    selectTask: "작업을 선택해 증거를 확인하세요.", noTasks: "기록된 작업이 없습니다.", tasksUnavailable: "작업 목록을 불러올 수 없습니다.",
    evidence: "증거와 상태", request: "요청", policy: "정책", approval: "승인", payment: "결제", fulfillment: "이행",
    recorded: "기록됨", blocked: "거부", missing: "증거 없음", unknown: "미확인", loading: "기록을 불러오는 중…", unavailable: "확인 불가", notRecorded: "기록 없음",
    policyChecks: "정책 판정 · 선택한 작업", noAttempts: "이 작업의 정책 시도 기록이 없습니다.", attempt: "시도", merchant: "판매자", amount: "금액", baseUnits: "기본 단위", tokenUnits: "토큰 단위", exactAmount: "정확한 금액", accountAmount: "작업 계정 금액", attemptAmount: "선택한 시도 금액",
    activity: "선택한 작업의 활동", firstEvents: "첫 페이지의 처음 5개 이벤트", noEvents: "이 페이지에 기록된 이벤트가 없습니다.", eventsUnavailable: "이벤트를 불러올 수 없습니다.", accountUnavailable: "계정 증거를 불러올 수 없습니다.",
    detailUnavailable: "선택한 작업의 상세 기록을 불러올 수 없습니다.", actor: "행위자", event: "이벤트", reason: "사유", viewAll: "전체 감사 기록 열기", taskId: "작업 ID", ownerId: "사용자 ID", accountState: "계정 상태",
    signInAgain: "관리자 세션이 필요합니다. 다시 로그인하세요.", forbidden: "이 계정은 관리자 감사 기록에 접근할 수 없습니다.", overviewUnavailable: "운영 개요를 불러올 수 없습니다. 새로고침해 주세요.",
    settingsTitle: "언어 설정", settingsIntro: "이 브라우저에서 사용할 언어를 고르세요. 기록 값은 변경되지 않습니다.", close: "닫기", policyUnknown: "정책 판정 미확인",
  },
} as const;

export type DashboardKey = keyof typeof dashboardMessages.en;
export function dashboardText(language: Language, key: DashboardKey): string { return dashboardMessages[language][key]; }
