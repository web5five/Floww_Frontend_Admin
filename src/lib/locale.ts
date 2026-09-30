export const messages = {
  en: {
    language: "Language", korean: "Korean", english: "English", settings: "Language settings", admin: "ADMIN", navigation: "Admin navigation", pageTitle: "Floww | Admin audit", pageDescription: "Authorized task and account audit records",
    operationsAudit: "OPERATIONS / AUDIT", operationsRecords: "OPERATIONS / RECORDS", taskRecord: "TASK RECORD",
    tagline: "See every decision in the flow.", signInTitle: "Admin sign in", restricted: "Access is limited to authorized operators.",
    email: "Email", password: "Password", signingIn: "Signing in…", signIn: "Sign in",
    invalidCredentials: "Invalid admin credentials.", accountUnavailable: "Admin access is unavailable for this account.", signInUnavailable: "Sign-in is unavailable. Try again.",
    taskAudit: "Task audit", signOut: "Sign out", auditIntro: "Read the persisted task, decision, and account trail.", refresh: "Refresh",
    status: "Status", allStatuses: "All statuses", userId: "User ID", filterUser: "Filter by user ID", apply: "Apply", invalidUserId: "Enter a valid user ID.",
    loadingTasks: "Loading task records…", tasksFound: "tasks found", noTasks: "No task records match these filters.", task: "Task", purpose: "Purpose",
    userWallet: "User / wallet", cap: "Cap · base units", updated: "Updated", previous: "Previous", next: "Next", page: "Page", scrollTable: "Scroll sideways to see all columns.",
    allTasks: "All tasks", auditDetail: "Audit detail", loadingRecord: "Loading audit record…", invalidTaskId: "Invalid task ID.",
    reason: "Reason", item: "Item", mandate: "Mandate", mandateVersionState: "Mandate version / state", mandateExpires: "Mandate expires",
    maximum: "Maximum · base units", token: "Token", wallet: "Wallet", created: "Created", completed: "Completed", decimals: "decimals",
    attempts: "Attempts", noAttempts: "No attempts recorded.", attemptId: "Attempt ID", merchantQuote: "Merchant / quote", policy: "Policy",
    amount: "Amount · base units", recipient: "Recipient", taskAccount: "Task account", noAccountShort: "No account", noAccount: "No task account recorded for this task.",
    account: "Account", ownerAddress: "Owner address", deploymentTx: "Deployment transaction", approvalTx: "Approval transaction",
    approvalOperation: "Approval operation", paymentId: "Payment ID", paymentOperation: "Payment operation", paymentTx: "Payment transaction",
    paymentVerified: "Payment verified", fulfillmentId: "Fulfillment ID", fulfillmentHash: "Fulfillment evidence hash",
    fulfillmentTx: "Fulfillment transaction", fulfillmentVerified: "Fulfillment verified", events: "Events", noEvents: "No events recorded.",
    loading: "Loading…", loadMore: "Load more events", sessionExpired: "Your admin session has expired. Sign in again.",
    accessDenied: "This account does not have admin audit access.", taskNotFound: "This task was not found.",
    recordsUnavailable: "Audit records are unavailable right now. Try again.",
  },
  ko: {
    language: "언어", korean: "한국어", english: "영어", settings: "언어 설정", admin: "관리자", navigation: "관리자 메뉴", pageTitle: "Floww | 관리자 감사", pageDescription: "승인된 운영자를 위한 작업 및 계정 감사 기록",
    operationsAudit: "운영 / 감사", operationsRecords: "운영 / 기록", taskRecord: "작업 기록",
    tagline: "흐름 속 모든 결정을 확인하세요.", signInTitle: "관리자 로그인", restricted: "승인된 운영자만 접근할 수 있습니다.",
    email: "이메일", password: "비밀번호", signingIn: "로그인 중…", signIn: "로그인",
    invalidCredentials: "관리자 인증 정보가 올바르지 않습니다.", accountUnavailable: "이 계정은 관리자 권한이 없습니다.", signInUnavailable: "로그인할 수 없습니다. 다시 시도해 주세요.",
    taskAudit: "작업 감사", signOut: "로그아웃", auditIntro: "저장된 작업, 결정 및 계정 이력을 확인합니다.", refresh: "새로고침",
    status: "상태", allStatuses: "전체 상태", userId: "사용자 ID", filterUser: "사용자 ID로 필터", apply: "적용", invalidUserId: "올바른 사용자 ID를 입력하세요.",
    loadingTasks: "작업 기록을 불러오는 중…", tasksFound: "개 작업", noTasks: "필터와 일치하는 작업 기록이 없습니다.", task: "작업", purpose: "목적",
    userWallet: "사용자 / 지갑", cap: "한도 · 기본 단위", updated: "수정 시각", previous: "이전", next: "다음", page: "페이지", scrollTable: "옆으로 스크롤하면 나머지 열을 볼 수 있습니다.",
    allTasks: "전체 작업", auditDetail: "감사 상세", loadingRecord: "감사 기록을 불러오는 중…", invalidTaskId: "올바르지 않은 작업 ID입니다.",
    reason: "사유", item: "항목", mandate: "위임", mandateVersionState: "위임 버전 / 상태", mandateExpires: "위임 만료",
    maximum: "최대 금액 · 기본 단위", token: "토큰", wallet: "지갑", created: "생성 시각", completed: "완료 시각", decimals: "소수 자릿수",
    attempts: "시도", noAttempts: "기록된 시도가 없습니다.", attemptId: "시도 ID", merchantQuote: "판매자 / 견적", policy: "정책",
    amount: "금액 · 기본 단위", recipient: "수신자", taskAccount: "작업 계정", noAccountShort: "계정 없음", noAccount: "이 작업에 기록된 계정이 없습니다.",
    account: "계정", ownerAddress: "소유자 주소", deploymentTx: "배포 트랜잭션", approvalTx: "승인 트랜잭션",
    approvalOperation: "승인 작업", paymentId: "결제 ID", paymentOperation: "결제 작업", paymentTx: "결제 트랜잭션",
    paymentVerified: "결제 검증 시각", fulfillmentId: "이행 ID", fulfillmentHash: "이행 증거 해시",
    fulfillmentTx: "이행 트랜잭션", fulfillmentVerified: "이행 검증 시각", events: "이벤트", noEvents: "기록된 이벤트가 없습니다.",
    loading: "불러오는 중…", loadMore: "이벤트 더 보기", sessionExpired: "관리자 세션이 만료되었습니다. 다시 로그인하세요.",
    accessDenied: "이 계정은 관리자 감사 기록에 접근할 수 없습니다.", taskNotFound: "작업을 찾을 수 없습니다.",
    recordsUnavailable: "감사 기록을 불러올 수 없습니다. 다시 시도해 주세요.",
  },
} as const;

export type Language = keyof typeof messages;
export type MessageKey = keyof typeof messages.en;
export const languageStorageKey = "floww_admin_language";

export const statusLabels: Record<Language, Record<string, string>> = {
  en: {},
  ko: { DRAFT: "초안", AWAITING_APPROVAL: "승인 대기", ACTIVE: "활성", EXECUTING: "실행 중", COMPLETED: "완료", DECLINED: "거절", FAILED: "실패", EXPIRED: "만료", CANCELLED: "취소", PENDING: "대기", APPROVED: "승인", REJECTED: "거절", REVIEWED: "검토 완료", UNKNOWN: "미확인" },
};

export function statusLabel(value: string | null | undefined, language: Language): string {
  if (!value) return "—";
  return statusLabels[language][value] ?? value;
}

export function formatDate(value: string | null | undefined, language: Language): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", { timeZone: "Asia/Seoul", dateStyle: "medium", timeStyle: "short" }).format(parsed)} KST`;
}

export function errorText(status: number, language: Language): string {
  const key = status === 401 ? "sessionExpired" : status === 403 ? "accessDenied" : status === 404 ? "taskNotFound" : "recordsUnavailable";
  return messages[language][key];
}
