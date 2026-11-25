import manifest from './harbor.mac.json';

type MacManifest = {
  status: string; version: string; build: string | null; minimumSystemVersion: string;
  architectures: string[]; filename: string; href: string; bytes: number | null; sha256: string | null;
};
type MacRelease = Omit<MacManifest, 'build' | 'bytes' | 'sha256'> & {
  build: string; bytes: number; sha256: string;
};

// A draft has no public download or schema entry. Fill these values from the
// verified, uploaded DMG before changing its publication status.
function publishedRelease(candidate: MacManifest): MacRelease | null {
  const { build, bytes, sha256 } = candidate;
  return candidate.status === 'published' && typeof build === 'string' && build.length > 0
    && typeof bytes === 'number' && bytes > 0 && typeof sha256 === 'string' && /^[a-f0-9]{64}$/.test(sha256)
    ? { ...candidate, build, bytes, sha256 } : null;
}
export const harborMacRelease = publishedRelease(manifest);

type MacCopy = {
  download: string; requirements: string; install: string; checksum: string;
  faqQuestion: string; faqAnswer: string; description: string;
};

const copy: Record<string, MacCopy> = {
  'zh-Hans': {
    download: '下载 Mac 版', requirements: 'macOS 14 或更新版本 · Apple 芯片与 Intel',
    install: '打开 DMG，将 Harbor 拖入“应用程序”后启动。iPhone 与 iPad 正式版可从 App Store 下载，地区可用性以商店显示为准。',
    checksum: '查看 SHA-256 校验值',
    description: 'Harbor 是 WebDAV / HTTP 视频播放器，支持 NAS 浏览、待播、续播与批量离线下载。iPhone / iPad 正式版通过 App Store 提供，地区可用性以商店为准；官网提供 macOS 14 及以上 Apple 芯片或 Intel Mac 的 DMG 和 TestFlight 入口。',
    faqQuestion: 'Mac 版如何安装？iPhone / iPad 正式版与测试版在哪里获取？',
    faqAnswer: 'Mac 原生版通过官网 DMG 下载，支持 macOS 14 或更新版本的 Apple 芯片与 Intel Mac。打开安装包后，将 Harbor 拖入“应用程序”再启动。iPhone / iPad 正式版可从 App Store 下载，地区、价格与设备要求以商店为准；TestFlight 提供独立测试渠道，可用构建、资格和有效期以实际显示为准。',
  },
  en: {
    download: 'Download for Mac', requirements: 'macOS 14 or later · Apple silicon and Intel',
    install: 'Open the DMG and drag Harbor to Applications, then open it. Get the iPhone and iPad release on the App Store; regional availability is shown there.',
    checksum: 'View SHA-256 checksum',
    description: 'Play WebDAV video with queues and offline downloads. Get the iPhone/iPad App Store app where available, or the macOS 14+ DMG for Apple silicon and Intel Macs.',
    faqQuestion: 'How do I install the Mac app and get the iPhone / iPad release or beta?',
    faqAnswer: 'Download the native Mac DMG from this website for Apple silicon and Intel Macs running macOS 14 or later. Open it, drag Harbor to Applications, then open the app. Get the iPhone / iPad release on the App Store, where regional availability, pricing and device requirements are shown. TestFlight is a separate testing channel; available builds, eligibility and expiry are shown there.',
  },
  ja: {
    download: 'Mac 版をダウンロード', requirements: 'macOS 14 以降 · Apple シリコン・Intel',
    install: 'DMG を開き、Harbor を「アプリケーション」にドラッグして起動します。iPhone・iPad 正式版は App Store から入手でき、提供地域はストアで確認できます。',
    checksum: 'SHA-256 チェックサムを表示',
    description: 'NAS の WebDAV 動画を再生し、キュー・続きからの再生・一括ダウンロードに対応。iPhone・iPad 正式版は App Store、macOS 14 以降の Apple シリコン・Intel Mac 版は DMG で提供します。提供地域はストアをご確認ください。TestFlight は別のテスト用入口です。',
    faqQuestion: 'Mac 版のインストール方法と iPhone・iPad 版の入手方法は？',
    faqAnswer: 'このサイトの Mac 用 DMG は macOS 14 以降の Apple シリコン・Intel Mac に対応します。DMG を開き、Harbor を「アプリケーション」にドラッグして起動してください。iPhone・iPad 正式版は App Store から入手でき、提供地域、価格、対応端末はストアをご確認ください。TestFlight は別のテスト用入口で、利用可能なビルド、参加条件、有効期限はその表示をご確認ください。',
  },
  ko: {
    download: 'Mac용 다운로드', requirements: 'macOS 14 이상 · Apple Silicon 및 Intel',
    install: 'DMG를 열고 Harbor를 응용 프로그램으로 드래그한 뒤 실행하세요. iPhone 및 iPad 정식 버전은 App Store에서 받을 수 있으며 제공 지역은 스토어를 확인하세요.',
    checksum: 'SHA-256 체크섬 보기',
    description: 'WebDAV 동영상, 대기열, 이어보기와 오프라인 다운로드. iPhone/iPad는 App Store에서, Mac은 macOS 14 이상 Apple Silicon·Intel용 DMG로 제공합니다. 제공 지역은 스토어를 확인하세요.',
    faqQuestion: 'Mac 앱은 어떻게 설치하고 iPhone 및 iPad 정식 버전이나 베타는 어디서 받나요?',
    faqAnswer: '이 사이트의 Mac용 DMG는 macOS 14 이상의 Apple Silicon 및 Intel Mac을 지원합니다. DMG를 열고 Harbor를 응용 프로그램으로 드래그한 뒤 실행하세요. iPhone 및 iPad 정식 버전은 App Store에서 받을 수 있으며 제공 지역, 가격과 기기 요구 사항은 스토어를 확인하세요. TestFlight는 별도 테스트 채널이며 이용 가능한 빌드, 참여 자격과 만료일은 해당 화면을 확인하세요.',
  },
  fr: {
    download: 'Télécharger pour Mac', requirements: 'macOS 14 ou ultérieur · Apple silicon et Intel',
    install: 'Ouvrez le DMG, glissez Harbor dans Applications, puis lancez l’app. La version iPhone et iPad est sur l’App Store, selon la disponibilité indiquée pour votre région.',
    checksum: 'Afficher la somme SHA-256',
    description: 'Lecteur WebDAV avec file et téléchargements. App Store pour iPhone/iPad selon la région ; DMG Mac Apple silicon et Intel sous macOS 14+.',
    faqQuestion: 'Comment installer Harbor sur Mac ou obtenir la version iPhone et iPad ?',
    faqAnswer: 'Le DMG Mac de ce site fonctionne sur les Mac Apple silicon et Intel sous macOS 14 ou ultérieur. Ouvrez-le, glissez Harbor dans Applications, puis lancez l’app. La version iPhone et iPad est publiée sur l’App Store, qui précise la disponibilité régionale, le prix et les appareils compatibles. TestFlight est un canal de test distinct ; les versions disponibles, les conditions d’accès et l’expiration y sont indiquées.',
  },
  ar: {
    download: 'تنزيل إصدار Mac', requirements: 'macOS 14 أو أحدث · شرائح Apple وIntel',
    install: 'افتح ملف DMG واسحب Harbor إلى «التطبيقات»، ثم شغّله. احصل على إصدار iPhone وiPad الرسمي من App Store، وراجع المتجر لمعرفة التوفر في منطقتك.',
    checksum: 'عرض قيمة التحقق SHA-256',
    description: 'مشغّل WebDAV مع قائمة وتنزيل دون اتصال. تطبيق iPhone وiPad على App Store حسب المنطقة، وDMG لأجهزة Mac بشرائح Apple وIntel بنظام macOS 14 أو أحدث.',
    faqQuestion: 'كيف أثبّت إصدار Mac وأحصل على إصدار iPhone وiPad الرسمي أو التجريبي؟',
    faqAnswer: 'يدعم ملف DMG على هذا الموقع أجهزة Mac بشرائح Apple وIntel التي تعمل بنظام macOS 14 أو أحدث. افتحه واسحب Harbor إلى «التطبيقات»، ثم شغّل التطبيق. يتوفر الإصدار الرسمي لأجهزة iPhone وiPad على App Store، حيث يظهر التوفر حسب المنطقة والسعر ومتطلبات الأجهزة. TestFlight قناة اختبار منفصلة؛ راجعها لمعرفة النسخ المتاحة والأهلية ومدة الصلاحية.',
  },
};

export function harborMacCopy(language: string): MacCopy {
  return copy[language] ?? copy.en;
}
