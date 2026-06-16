export const APP_CASES = [
  {
    id: "delivery",
    name: "배달 앱",
    shortName: "배달",
    signal: "주문 확인",
  },
  {
    id: "maps",
    name: "지도 앱",
    shortName: "지도",
    signal: "경로 안내",
  },
  {
    id: "banking",
    name: "송금 앱",
    shortName: "송금",
    signal: "받는 사람 확인",
  },
  {
    id: "music",
    name: "음악 앱",
    shortName: "음악",
    signal: "재생목록 정리",
  },
  {
    id: "chat",
    name: "메신저 앱",
    shortName: "채팅",
    signal: "알림 전달",
  },
];

export const LESSONS = [
  {
    id: "rename",
    type: "rename",
    title: "이름표 바꾸기",
    shortTitle: "이름",
    caseId: "delivery",
    badge: "의도가 먼저 보인다",
    summary:
      "같은 일을 하더라도 이름표가 흐리면 요청하는 사람이 망설인다. 더 정확한 이름은 연결된 모든 지점의 기대를 같은 방향으로 맞춘다.",
    beforeLabel: "빠른 주문",
    afterLabel: "안전 결제",
    concept: "이름 변경",
    controls: {
      before: "익숙하지만 흐린 이름",
      after: "낯설지만 정확한 이름",
    },
    resultText: {
      before: "요청은 도착하지만 의도가 흐려 확인 질문이 늘어난다.",
      after: "요청 지점과 처리 지점이 같은 뜻을 바라본다.",
    },
  },
  {
    id: "add-info",
    type: "cards",
    title: "필요한 정보 더하기",
    shortTitle: "추가",
    caseId: "maps",
    badge: "부족한 카드를 채운다",
    summary:
      "새로운 상황을 제대로 처리하려면 약속표에 필요한 정보 카드가 들어와야 한다. 부족한 카드는 경로를 흔들리게 한다.",
    concept: "정보 추가",
    requiredCards: ["출발지", "도착지", "이동 수단"],
    optionalCards: ["날씨", "혼잡도"],
    obsoleteCards: [],
    initialCards: ["출발지", "도착지"],
    resultText: {
      incomplete: "핵심 카드가 부족해 안내선이 중간에서 멈춘다.",
      complete: "핵심 카드가 모여 안정적인 안내선이 열린다.",
    },
  },
  {
    id: "remove-info",
    type: "cards",
    title: "낡은 정보 덜어내기",
    shortTitle: "삭제",
    caseId: "music",
    badge: "불필요한 카드는 접는다",
    summary:
      "더 이상 쓰지 않는 정보가 약속표에 남아 있으면 요청하는 사람도, 처리하는 쪽도 헷갈린다. 필요한 카드만 남긴다.",
    concept: "정보 삭제",
    requiredCards: ["곡", "재생목록"],
    optionalCards: ["분위기"],
    obsoleteCards: ["옛 보관함"],
    initialCards: ["곡", "재생목록", "옛 보관함"],
    resultText: {
      incomplete: "낡은 카드가 남아 있어 길이 두 갈래로 흔들린다.",
      complete: "필요한 카드만 남아 흐름이 가벼워진다.",
    },
  },
  {
    id: "reorder",
    type: "order",
    title: "정보 순서 맞추기",
    shortTitle: "순서",
    caseId: "banking",
    badge: "앞뒤가 뜻을 만든다",
    summary:
      "같은 정보라도 순서가 바뀌면 다른 뜻으로 읽힐 수 있다. 약속표의 순서를 바꾸면 연결된 요청 지점도 함께 맞춰야 한다.",
    concept: "순서 변경",
    targetOrder: ["받는 사람", "금액", "메모"],
    initialOrder: ["금액", "받는 사람", "메모"],
    resultText: {
      incomplete: "첫 칸이 어긋나 확인 단계가 길어진다.",
      complete: "요청 지점과 처리 지점의 읽는 순서가 맞아진다.",
    },
  },
  {
    id: "migrate",
    type: "migrate",
    title: "모두 함께 건너가기",
    shortTitle: "전환",
    caseId: "chat",
    badge: "옛 문과 새 문을 잠시 같이 둔다",
    summary:
      "새 약속표로 바꿀 때는 연결된 지점들이 한 번에 모두 움직이지 않을 수 있다. 잠시 두 길을 열어 두고, 확인이 끝나면 옛길을 닫는다.",
    concept: "호출 지점 전환",
    bridgeLabels: ["기존 알림", "상황별 알림"],
    resultText: {
      incomplete: "일부 지점이 아직 옛 문에 남아 있어 전환 위험이 있다.",
      complete: "모든 요청 지점이 새 문으로 모여 옛 문을 닫을 수 있다.",
    },
  },
];

export const PRINCIPLES = [
  "겉모습을 바꾸더라도 사용자가 보던 결과는 유지한다.",
  "이름, 정보 카드, 순서, 연결 지점을 함께 살핀다.",
  "작게 바꾸고 바로 확인하면 초보자도 길을 잃지 않는다.",
];

export const DEFAULT_ACTIVITY_STATE = {
  renameChoice: "before",
  selectedCards: {},
  cardOrder: {},
  migrationProgress: 35,
};
