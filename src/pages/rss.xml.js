import rss from "@astrojs/rss";
import { siteConfig } from "@/config/site.config";

/** @param {import('astro').APIContext} context */
export function GET(context) {
  const site = context.site ?? new URL("https://solidweb.kr");
  const baseUrl = typeof site === "string" ? site : site.href;

  return rss({
    title: siteConfig.name,
    description: siteConfig.description,
    site: baseUrl,
    items: [
      {
        title: siteConfig.name,
        description: siteConfig.description,
        link: "/",
        pubDate: new Date(),
      },
      {
        title: "포트폴리오",
        description: siteConfig.portfolioPage?.description ?? "솔리드웹 프로젝트 포트폴리오",
        link: "/portfolio/",
        pubDate: new Date(),
      },
      {
        title: "문의하기",
        description: siteConfig.nav?.consult ?? "상담 신청",
        link: "/contact/",
        pubDate: new Date(),
      },
      {
        title: "개인정보처리방침",
        description: "개인정보처리방침",
        link: "/privacy/",
        pubDate: new Date(),
      },
    ],
    customData: "<language>ko-kr</language>",
  });
}
