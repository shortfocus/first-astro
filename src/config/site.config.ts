export const siteConfig = {
  name: "솔리드웹",
  description: "비즈니스에 집중하게 만드는 웹사이트",
  hero: {
    title: "고객을 부르는 웹사이트",
    subtitle: "빠르고, 단순하고, 성과 중심",
    ctaText: "문의하기",
  },
  features: [
    {
      title: "빠른 제작",
      description: "불필요한 기능 없이 바로 시작",
    },
    {
      title: "SEO 최적화",
      description: "검색에 잘 걸리는 구조",
    },
    {
      title: "유지비 없음",
      description: "서버 관리 필요 없음",
    },
  ],
  cta: {
    title: "지금 바로 시작하세요",
    buttonText: "상담 요청",
  },
  /**
   * 카카오톡 채널 1:1 채팅 URL
   * 형식: https://pf.kakao.com/_채널ID/chat (채널ID 앞에 _ 필수)
   * 정확한 주소: center-pf.kakao.com → 프로필 → 프로필 설정 → "채팅 링크" 복사
   */
  kakaoChatUrl: "http://pf.kakao.com/_xkxmzqX",
} as const;
