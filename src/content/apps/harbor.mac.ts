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
    install: '打开 DMG，将 Harbor 拖入“应用程序”后启动。iPhone 与 iPad 请使用 TestFlight。',
    checksum: '查看 SHA-256 校验值',
    description: 'Harbor 是 WebDAV / HTTP 视频播放器，支持 NAS 浏览、待播、续播与批量离线下载。下载适用于 macOS 14 及以上 Apple 芯片或 Intel Mac 的 DMG，或加入 iPhone / iPad TestFlight 测试。',
    faqQuestion: 'Mac 版如何安装？与 TestFlight 有什么区别？',
    faqAnswer: 'Mac 版通过官网的 DMG 下载，支持 macOS 14 或更新版本的 Apple 芯片与 Intel Mac。打开安装包后，将 Harbor 拖入“应用程序”再启动。iPhone 与 iPad 继续通过 TestFlight 获取测试版；测试资格、到期时间和设备要求以 TestFlight 显示为准。',
  },
  en: {
    download: 'Download for Mac', requirements: 'macOS 14 or later · Apple silicon and Intel',
    install: 'Open the DMG and drag Harbor to Applications, then open it. Use TestFlight for iPhone and iPad.',
    checksum: 'View SHA-256 checksum',
    description: 'A WebDAV video player with queues and offline downloads. Get the Mac DMG for macOS 14+ on Apple silicon or Intel, or join the iPhone and iPad TestFlight beta.',
    faqQuestion: 'How do I install the Mac app? How does it differ from TestFlight?',
    faqAnswer: 'Download the Mac DMG from this website. It supports Apple silicon and Intel Macs running macOS 14 or later. Open the disk image, drag Harbor to Applications, then open it. iPhone and iPad beta builds remain available through TestFlight, where eligibility, expiry and device requirements are shown.',
  },
  ja: {
    download: 'Mac 版をダウンロード', requirements: 'macOS 14 以降 · Apple シリコン・Intel',
    install: 'DMG を開き、Harbor を「アプリケーション」にドラッグして起動します。iPhone・iPad は TestFlight をご利用ください。',
    checksum: 'SHA-256 チェックサムを表示',
    description: 'NAS の WebDAV 動画を再生し、キュー・続きからの再生・一括ダウンロードに対応。macOS 14 以降の Apple シリコン・Intel Mac 用 DMG と、iPhone・iPad 用 TestFlight ベータを提供します。',
    faqQuestion: 'Mac 版のインストール方法と TestFlight との違いは？',
    faqAnswer: 'このサイトから Mac 用 DMG をダウンロードできます。macOS 14 以降の Apple シリコン・Intel Mac に対応します。DMG を開き、Harbor を「アプリケーション」にドラッグして起動してください。iPhone・iPad のベータ版は引き続き TestFlight で提供します。参加条件、有効期限、対応端末は TestFlight をご確認ください。',
  },
  ko: {
    download: 'Mac용 다운로드', requirements: 'macOS 14 이상 · Apple Silicon 및 Intel',
    install: 'DMG를 열고 Harbor를 응용 프로그램으로 드래그한 뒤 실행하세요. iPhone과 iPad는 TestFlight를 이용하세요.',
    checksum: 'SHA-256 체크섬 보기',
    description: 'NAS의 WebDAV 동영상을 재생하고 대기열, 이어보기와 일괄 다운로드를 이용하세요. macOS 14 이상 Apple Silicon·Intel Mac용 DMG와 iPhone·iPad용 TestFlight 베타를 제공합니다.',
    faqQuestion: 'Mac 앱은 어떻게 설치하나요? TestFlight와 무엇이 다른가요?',
    faqAnswer: '이 웹사이트에서 Mac용 DMG를 다운로드할 수 있습니다. macOS 14 이상의 Apple Silicon 및 Intel Mac을 지원합니다. DMG를 열고 Harbor를 응용 프로그램으로 드래그한 뒤 실행하세요. iPhone과 iPad 베타는 계속 TestFlight에서 제공합니다. 참여 자격, 만료일과 기기 요구 사항은 TestFlight에서 확인하세요.',
  },
  fr: {
    download: 'Télécharger pour Mac', requirements: 'macOS 14 ou ultérieur · Apple silicon et Intel',
    install: 'Ouvrez le DMG, glissez Harbor dans Applications, puis lancez l’app. Pour iPhone et iPad, utilisez TestFlight.',
    checksum: 'Afficher la somme SHA-256',
    description: 'Lecteur vidéo WebDAV avec file, reprise et téléchargements. DMG pour Mac Apple silicon et Intel sous macOS 14+, bêta TestFlight pour iPhone et iPad.',
    faqQuestion: 'Comment installer la version Mac ? Quelle différence avec TestFlight ?',
    faqAnswer: 'Téléchargez le DMG Mac sur ce site. Il fonctionne sur les Mac Apple silicon et Intel sous macOS 14 ou ultérieur. Ouvrez le DMG, glissez Harbor dans Applications, puis lancez l’app. Les bêtas iPhone et iPad restent disponibles via TestFlight, qui précise les conditions d’accès, la date d’expiration et les appareils compatibles.',
  },
  ar: {
    download: 'تنزيل إصدار Mac', requirements: 'macOS 14 أو أحدث · شرائح Apple وIntel',
    install: 'افتح ملف DMG واسحب Harbor إلى «التطبيقات»، ثم شغّله. استخدم TestFlight على iPhone وiPad.',
    checksum: 'عرض قيمة التحقق SHA-256',
    description: 'مشغّل WebDAV بقائمة تشغيل وتنزيل دون اتصال. ملف DMG لأجهزة Mac بشرائح Apple وIntel بنظام macOS 14 أو أحدث، واختبار TestFlight لأجهزة iPhone وiPad.',
    faqQuestion: 'كيف أثبّت إصدار Mac؟ وما الفرق بينه وبين TestFlight؟',
    faqAnswer: 'نزّل ملف DMG الخاص بـ Mac من هذا الموقع. يدعم أجهزة Mac بشرائح Apple وIntel التي تعمل بنظام macOS 14 أو أحدث. افتح الملف واسحب Harbor إلى «التطبيقات»، ثم شغّله. تظل النسخ التجريبية لأجهزة iPhone وiPad متاحة عبر TestFlight، حيث تظهر شروط الأهلية وتاريخ الانتهاء ومتطلبات الأجهزة.',
  },
};

export function harborMacCopy(language: string): MacCopy {
  return copy[language] ?? copy.en;
}
