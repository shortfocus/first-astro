import type { APIRoute } from "astro";
import { siteConfig } from "@/config/site.config";

export const prerender = false;

type ContactPayload = {
  visitPath: string;
  projectName: string;
  projectType: string;
  projectDetail: string;
  budget: string;
  dueDate: string;
  name: string;
  company?: string;
  phone: string;
  position?: string;
  email: string;
  privacyConsent: boolean;
};

function json(message: string, status = 200) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function required(v: string | undefined): boolean {
  return !!v && v.trim().length > 0;
}

export const POST: APIRoute = async ({ request, locals }) => {
  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return json("잘못된 요청 형식입니다.", 400);
  }

  const mustHave = [
    payload.visitPath,
    payload.projectName,
    payload.projectType,
    payload.projectDetail,
    payload.budget,
    payload.dueDate,
    payload.name,
    payload.phone,
    payload.email,
  ];
  if (!mustHave.every(required) || !payload.privacyConsent) {
    return json("필수 항목이 누락되었습니다.", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email)) {
    return json("이메일 형식을 확인해주세요.", 400);
  }

  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env ?? {};
  const resendApiKey = runtimeEnv.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
  const toEmail = runtimeEnv.CONTACT_TO_EMAIL || import.meta.env.CONTACT_TO_EMAIL || siteConfig.contact.email;
  const fromEmail = runtimeEnv.CONTACT_FROM_EMAIL || import.meta.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

  if (!resendApiKey) {
    return json("서버 메일 설정이 아직 완료되지 않았습니다. 관리자에게 문의해주세요.", 500);
  }

  const subject = `[${siteConfig.name}] 신규 문의 - ${payload.name}`;
  const html = `
    <h2>신규 문의가 접수되었습니다.</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;">
      <tr><th align="left">성명</th><td>${escapeHtml(payload.name)}</td></tr>
      <tr><th align="left">이메일</th><td>${escapeHtml(payload.email)}</td></tr>
      <tr><th align="left">연락처</th><td>${escapeHtml(payload.phone)}</td></tr>
      <tr><th align="left">회사명</th><td>${escapeHtml(payload.company || "-")}</td></tr>
      <tr><th align="left">직책</th><td>${escapeHtml(payload.position || "-")}</td></tr>
      <tr><th align="left">방문 경로</th><td>${escapeHtml(payload.visitPath)}</td></tr>
      <tr><th align="left">프로젝트 이름</th><td>${escapeHtml(payload.projectName)}</td></tr>
      <tr><th align="left">프로젝트 유형</th><td>${escapeHtml(payload.projectType)}</td></tr>
      <tr><th align="left">예산(만원)</th><td>${escapeHtml(payload.budget)}</td></tr>
      <tr><th align="left">마감일</th><td>${escapeHtml(payload.dueDate)}</td></tr>
      <tr><th align="left">상세 내용</th><td>${escapeHtml(payload.projectDetail).replace(/\n/g, "<br/>")}</td></tr>
    </table>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: payload.email,
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    console.error("Resend send failed:", errorText);
    return json("메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.", 502);
  }

  return json("문의가 정상 접수되었습니다.");
};
