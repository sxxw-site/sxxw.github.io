export const HARBOR_BASE = '/apps/harbor/';
export const HARBOR_BETA = 'https://testflight.apple.com/join/pmT8CR8S';
export const HARBOR_CONTACT = 'neverfall@foxmail.com';
export const HARBOR_COMPANY = 'Shanghai Shuxia Xiaowu Network Technology Co., Ltd.';
export const HARBOR_DATE = '2026-11-15';
export const APPLE_TESTFLIGHT_TERMS = 'https://www.apple.com/legal/internet-services/itunes/testflight/sren/terms.html';
export type HarborSection = 'overview' | 'privacy' | 'terms' | 'support';
type Document = { intro: string; sections: Array<{ title: string; body: string[] }> };
type Copy = {
  lang: string; tabs: Record<HarborSection, string>; title: string; lead: string; beta: string; betaNote: string;
  directoryDescription: string; category: string; featuresTitle: string; features: string[];
  privacyTitle: string; privacyNote: string; readPrivacy: string; setupTitle: string; setup: Array<{ title: string; body: string }>;
  faqTitle: string; faq: Array<{ question: string; answer: string }>; contactTitle: string; contactNote: string;
  meta: Record<HarborSection, { title: string; description: string }>;
  privacy: Document; terms: Document; effective: string; appleTerms: string;
};

const zh: Copy = {
  lang: 'zh-Hans', tabs: { overview: '产品介绍', privacy: '隐私政策', terms: '使用条款', support: '使用帮助' },
  title: '家中 NAS 的视频播放器',
  lead: '在 iPhone、iPad 和 Mac 上连接 WebDAV，浏览视频、整理待播列表，或下载到本机离线观看。',
  beta: '加入 TestFlight 测试',
  betaNote: '当前为 0.0.1 测试版，支持单视频下载；多选与文件夹下载将在后续测试版开放。公开测试提供 iPhone / iPad 包，也可在兼容的 Apple 芯片 Mac 上运行。',
  directoryDescription: '连接家中 WebDAV 服务器，浏览文件夹、整理待播列表，下载视频到本机离线观看。当前提供 TestFlight 测试。',
  category: 'NAS 视频播放器', featuresTitle: '从文件夹到离线观看',
  features: [
    '浏览 WebDAV 文件夹，搜索当前目录，查看视频格式与文件大小。',
    '将视频或包含子文件夹的目录加入待播，调整顺序并连续播放。',
    '使用原生播放控件、全屏上一项与下一项，以及本机观看记录和续播。',
    '从 NAS 视频、网络直链或播放器下载单个视频，自动跳过已有任务。',
    '查看下载进度、取消与重试；已完成的视频可在重启后离线播放。',
  ],
  privacyTitle: '连接和观看记录留在本机',
  privacyNote: 'Harbor 不设开发者账号，不含广告或分析 SDK。服务器密码保存在系统钥匙串。播放和下载直接连接你配置的服务器；TestFlight 的测试数据处理另有说明。',
  readPrivacy: '阅读隐私政策', setupTitle: '连接家中的 WebDAV',
  setup: [
    { title: '开启 NAS 的 WebDAV 服务', body: '让设备与 NAS 连接同一可互通的家庭网络。群晖可在套件中心启用 WebDAV Server，并给使用的账号视频文件夹读取权限。' },
    { title: '添加服务器并测试连接', body: '在 Harbor 中添加服务器，可先查找局域网 NAS，也可手动输入 WebDAV 地址。填写服务端口、共享文件夹和账号，测试成功后保存。DSM 管理后台地址不能代替 WebDAV 地址。' },
    { title: '播放或下载自己的视频', body: '打开文件夹选择视频，或从菜单加入待播。视频菜单和播放器提供“下载到本地”，完成后可在“本地视频”离线观看。没有 NAS 时，可先打开演示资料库体验原创无声视频。' },
  ],
  faqTitle: '连接、播放与下载问题',
  faq: [
    { question: '为什么自动发现没有找到 NAS？', answer: '确认 Harbor 有本地网络权限，设备与 NAS 处于可互通的网络，NAS 支持并开启 Bonjour 服务广播。访客 Wi-Fi 或 AP 隔离可能阻止连接。自动发现失败时仍可手动输入地址；发现设备不代表已登录。' },
    { question: 'WebDAV 地址该怎么填？', answer: '填写 NAS 的 WebDAV 服务地址、端口和共享文件夹。群晖默认 HTTP 端口为 5005、HTTPS 为 5006，以 NAS 实际设置为准。HTTP 会明文传输，只适合可信家庭网络；HTTPS 使用系统证书验证，不支持绕过无效证书。' },
    { question: '为什么某个视频无法播放？', answer: '容器格式不等于编码支持。MP4、MOV、M4V 与 HLS 的实际播放能力取决于系统、设备、视频编码、内嵌字幕和音轨。当前不包含扩展 MKV 解码、SMB 接入或 NAS 转码。可以先用内置演示视频检查播放器。' },
    { question: '下载后在哪里看？下载会在后台继续吗？', answer: '打开“本地视频”可查看进度、存储空间并播放已完成下载。下载时请保持应用打开；当前不保证系统挂起或退出后继续下载，重开后可重试未完成任务。离线下载支持 MP4、MOV、M4V 独立文件，暂不支持 HLS / DASH。' },
    { question: '已有下载为什么只提示跳过？', answer: '同一来源的已有任务会跳过，包括已完成、排队、下载中、失败和取消的任务。需要重新传输失败或取消的任务时，请进入“本地视频”选择重试。' },
    { question: '可以多选视频或下载整个文件夹吗？', answer: '多选与文件夹下载已在开发版完成，将在后续 TestFlight 测试版开放。当前公开测试包支持单视频下载，实际可用功能请以安装的版本为准。' },
    { question: '删除下载和移除服务器有什么区别？', answer: '删除下载会移除本机副本、该下载记录以及对应的本地待播和观看记录，不影响 NAS 原文件。移除服务器会移除保存的连接、密码及关联在线待播和观看记录，并取消未完成下载；已完成视频和下载来源记录仍保留，需要在“本地视频”单独删除。' },
    { question: 'TestFlight 和 Mac 版本的状态是什么？', answer: 'Harbor 当前提供 0.0.1 测试版，尚未作为正式 App Store 版本发布。公开链接提供 iPhone / iPad 测试包，兼容的 Apple 芯片 Mac 也可运行该包；原生 Mac 版暂未提供公开安装入口。测试资格、到期时间和设备要求以 TestFlight 显示为准。' },
  ],
  contactTitle: '联系 Harbor 支持',
  contactNote: '反馈时请附应用版本、设备与系统版本、复现步骤，以及已遮盖敏感信息的截图。请勿发送 NAS 密码、完整带令牌链接或私人视频。邮件由你主动发送。',
  effective: '生效日期', appleTerms: '查看 Apple TestFlight 条款',
  meta: {
    overview: { title: 'Harbor 官网｜NAS 视频播放、待播与离线下载', description: 'Harbor 是 iPhone、iPad 和兼容 Apple 芯片 Mac 上的 WebDAV / HTTP 视频播放器，支持文件夹浏览、待播、续播与单视频离线下载。查看 TestFlight 测试、使用帮助与隐私说明。' },
    privacy: { title: 'Harbor 隐私政策｜本机数据、NAS 连接与下载', description: '了解 Harbor 如何在本机保存连接、钥匙串密码、观看记录和下载，以及 NAS 网络请求、删除操作与 TestFlight 测试数据。' },
    terms: { title: 'Harbor 使用条款｜应用与测试版使用说明', description: 'Harbor 的使用范围、用户媒体与服务器责任、测试版说明、功能限制及官方联系渠道。' },
    support: { title: 'Harbor 使用帮助｜连接 NAS、播放与离线下载', description: '设置 WebDAV 连接，排查局域网发现与播放问题，了解视频下载、重复提示、离线播放、本地删除及后续功能。' },
  },
  privacy: {
    intro: `本政策适用于 Harbor 应用，由 ${HARBOR_COMPANY} 提供。Harbor 是用户自行配置视频服务的播放器，当前版本不设置开发者账号，不展示广告，也不集成分析 SDK 或开发者自建遥测服务。`,
    sections: [
      { title: '本机保存的资料', body: ['服务器地址、显示名称、用户名、待播列表、连续播放设置和观看记录保存在设备的应用数据目录；服务器密码保存在系统钥匙串。当前版本不提供跨设备云同步。', '带临时令牌的视频链接可能作为待播、观看记录或下载记录的一部分保存在本机。Harbor 本身没有将资料库或私人视频上传给开发者的功能。设备系统的备份、诊断与恢复按系统设置处理。'] },
      { title: '局域网发现和服务器连接', body: ['经系统允许后，局域网发现使用 Bonjour 服务信息查找兼容设备，读取其名称、地址和服务端口，并检查 WebDAV 服务。发现阶段不使用保存的密码，不会替你登录 NAS。', '浏览、播放或下载时，Harbor 会直接请求你指定的服务器；启用认证时，会向该服务器提供所需登录信息。HTTP 不加密传输，适用于可信网络；HTTPS 使用系统证书验证，不提供无效证书绕过。', '服务器运营者可能记录 IP 地址、请求时间和访问文件等信息，其处理方式取决于该服务器。请仅配置你信任并有权访问的服务。'] },
      { title: '下载和存储', body: ['主动下载的视频保存在本设备应用数据目录。下载记录包含来源地址、标题、服务器标识、状态、进度与文件大小，来源链接可能包含临时令牌。下载目录标记为不参与云备份。', '完成的下载可离线播放。当前版本不提供后台下载、HLS / DASH 离线下载或设备间下载同步。'] },
      { title: '查看和删除数据', body: ['你可在应用中编辑或移除服务器、管理待播和清空观看记录。移除服务器会移除保存的连接和密码、关联的在线待播及观看记录，并取消相关未完成下载。', '已完成视频及下载来源记录不会随服务器移除而删除，需要在“本地视频”中单独删除。删除本地下载会移除副本、该下载记录及对应本地待播和观看记录，不会删除 NAS 原文件；已有在线记录需另行管理。', '不同列表可能各自保存同一带令牌链接。若希望完整移除，请分别检查待播、观看记录与下载。系统钥匙串可能按系统规则保留项目；建议在卸载应用前先移除保存的服务器连接。'] },
      { title: 'TestFlight 测试和主动反馈', body: ['通过 TestFlight 使用测试版时，Apple 根据其 TestFlight 条款处理测试数据，包括自动向 Apple 和应用提供者提供崩溃日志与测试使用数据。这一平台行为不同于 Harbor 集成分析 SDK。', '你在 TestFlight 提交的文字、截图等反馈可能由 Apple 和开发者接收。你主动发送支持邮件时，我们会接收该邮件及附件，并将其用于处理反馈。请勿在反馈中包含服务器密码、完整带令牌链接或私人视频。'] },
      { title: '政策更新与联系', body: [`本政策随当前功能提供，更新时会调整本页日期。有关隐私、设备数据管理或反馈的疑问，可联系 ${HARBOR_CONTACT}。`] },
    ],
  },
  terms: {
    intro: `Harbor 由 ${HARBOR_COMPANY} 提供。本页说明当前播放器及测试版的使用范围，并与适用的 Apple 分发、TestFlight 条款一并适用。`,
    sections: [
      { title: '应用与媒体', body: ['Harbor 用于连接你自行配置的 WebDAV 或 HTTP / HTTPS 视频服务、播放和管理本地副本。除明确标注的原创演示视频外，Harbor 不提供影视目录、内容订阅或第三方视频授权。', '请仅访问、播放、下载你拥有或获得授权的文件，并遵守服务器的使用规则和适用法律。媒体内容的权利归其各自权利人所有。'] },
      { title: '设备、连接与账号', body: ['你负责配置可访问的服务器、维护访问权限，并妥善保管设备和服务器凭据。请使用可信网络；HTTP 不加密传输。Harbor 无法控制服务器运营者、家庭网络或系统权限设置。', '本机待播、观看记录和下载由你管理。删除本地副本不删除服务器文件，移除服务器也不会自动删除完成的下载。重要文件请在原服务器或其他适当位置保留备份。'] },
      { title: '测试版与功能范围', body: ['Harbor 当前处于 TestFlight 测试阶段。测试资格、可用设备、构建有效期及测试数据处理以 Apple TestFlight 显示和条款为准；测试版可能中断、变更或出现错误。', '播放能力取决于系统、设备、编码和文件。当前不包含 SMB 接入、扩展 MKV 解码、NAS 转码或跨设备进度同步。下载需保持应用打开，不支持 HLS / DASH 离线保存。应用不保证所有 NAS、媒体文件或网络环境均兼容。'] },
      { title: '应用使用和权利', body: ['请按适用的 Apple 条款，在你拥有或控制的兼容设备上使用 Harbor。除适用法律、相关开源许可或授权另有允许外，不得擅自分发应用、冒用开发者身份或利用应用侵犯他人的权利。', 'Harbor 的应用软件、品牌及原创演示内容的相关权利由其权利人保留。本条款不限制法律规定不能排除的消费者权利。'] },
      { title: '反馈、更新与联系', body: [`你可以停止使用应用或退出测试。功能、政策或条款更新会在相应页面说明。有关使用、版权或支持问题，请联系 ${HARBOR_CONTACT}；请勿发送不必要的私人媒体或登录凭据。`] },
    ],
  },
};

const en: Copy = {
  lang: 'en', tabs: { overview: 'Overview', privacy: 'Privacy', terms: 'Terms', support: 'Support' },
  title: 'A video player for your home NAS',
  lead: 'Connect to WebDAV on iPhone, iPad and Mac. Browse your videos, build a playback queue, or download them for offline viewing.',
  beta: 'Join the TestFlight beta',
  betaNote: 'Beta version 0.0.1 supports individual video downloads; batch and folder downloads are planned for a later beta. The public test provides an iPhone / iPad build that also runs on compatible Apple silicon Macs.',
  directoryDescription: 'Browse your home WebDAV server, queue your videos, and download them for offline viewing. Currently available through TestFlight.',
  category: 'NAS video player', featuresTitle: 'From folders to offline playback',
  features: [
    'Browse WebDAV folders, search the current directory, and check file types and sizes.',
    'Add videos or folders with subfolders to your queue, reorder them, and play continuously.',
    'Use native playback controls, full-screen previous and next, local history and resume.',
    'Download individual videos from your NAS, a direct link or the player; existing tasks are skipped.',
    'Track downloads, cancel or retry. Play completed files offline after restarting Harbor.',
  ],
  privacyTitle: 'Connections and history stay on your device',
  privacyNote: 'Harbor has no developer account, ads or analytics SDK. Server passwords use the system Keychain. Playback and downloads connect directly to your server; TestFlight testing data is covered separately.',
  readPrivacy: 'Read the privacy policy', setupTitle: 'Connect your home WebDAV server',
  setup: [
    { title: 'Enable WebDAV on your NAS', body: 'Connect your device and NAS to the same reachable home network. On Synology, enable WebDAV Server in Package Center and give your account read access to the video folder.' },
    { title: 'Add and test the connection', body: 'Add a server in Harbor. Discover a local NAS or enter its WebDAV address manually, including the service port and shared folder. Enter your credentials, test and save. A DSM administration address is not a WebDAV address.' },
    { title: 'Play or download your videos', body: 'Open a video or add it to the queue from its menu. Choose Download to device from the video menu or player, then watch completed downloads in Local Videos. The Demo Library lets you try original silent clips before connecting a NAS.' },
  ],
  faqTitle: 'Connections, playback and downloads',
  faq: [
    { question: 'Why does discovery not find my NAS?', answer: 'Allow local network access for Harbor. Check that both devices are on a reachable network and your NAS advertises compatible services with Bonjour. Guest Wi-Fi or access-point isolation may prevent connections. You can always enter an address manually. Finding a device does not sign you in.' },
    { question: 'Which WebDAV address should I enter?', answer: 'Use the NAS WebDAV service address, port and shared folder. Synology defaults are port 5005 for HTTP and 5006 for HTTPS; use your actual server settings. HTTP is unencrypted and intended for trusted networks. HTTPS uses system certificate validation; invalid certificates cannot be bypassed.' },
    { question: 'Why will a particular video not play?', answer: 'A container extension does not guarantee codec support. MP4, MOV, M4V and HLS playback depends on the system, device, encoding, embedded subtitles and audio tracks. This version has no extended MKV decoder, SMB access or NAS transcoding. Try the bundled demo to check the player.' },
    { question: 'Where are downloads? Do they run in the background?', answer: 'Open Local Videos to see progress, storage use and completed files. Keep Harbor open during transfers. Downloads are not guaranteed to continue when suspended or closed; unfinished tasks can be retried after reopening. Offline downloads support standalone MP4, MOV and M4V files, not HLS / DASH.' },
    { question: 'Why are existing downloads skipped?', answer: 'Harbor skips an existing task for the same source, including completed, queued, active, failed or cancelled tasks. To transfer a failed or cancelled task again, choose Retry in Local Videos.' },
    { question: 'Can I download multiple videos or a whole folder?', answer: 'Batch and folder downloads are implemented in the development version and planned for a later TestFlight beta. The current public build supports individual video downloads. Available features depend on the version you have installed.' },
    { question: 'How does deleting a download differ from removing a server?', answer: 'Deleting a download removes its local copy, download record, and matching local queue and history entries. It leaves the NAS original untouched. Removing a server clears the connection, password, related online queue and history, and cancels unfinished transfers. Completed videos and download-source records remain until separately deleted in Local Videos.' },
    { question: 'What is the status of TestFlight and the Mac version?', answer: 'Harbor is currently in beta at version 0.0.1 and has not been released as a production App Store app. The public link provides an iPhone / iPad build that can also run on compatible Apple silicon Macs. A native Mac installer is not yet publicly available. Test availability, expiry and device requirements are shown in TestFlight.' },
  ],
  contactTitle: 'Contact Harbor support',
  contactNote: 'Include your app version, device, system version, steps to reproduce, and a redacted screenshot. Do not send NAS passwords, full token-bearing links or private videos. Email is sent only when you choose to send it.',
  effective: 'Effective date', appleTerms: 'Read Apple’s TestFlight terms',
  meta: {
    overview: { title: 'Harbor | NAS video playback, queues and offline downloads', description: 'Harbor is a WebDAV and HTTP video player for iPhone, iPad and compatible Apple silicon Macs, with folder browsing, queues, resume and individual video downloads. Join TestFlight and read support and privacy information.' },
    privacy: { title: 'Harbor privacy policy | Device data, servers and downloads', description: 'How Harbor stores connections, Keychain passwords, history and downloads on your device, makes server requests, handles deletion, and works with TestFlight testing data.' },
    terms: { title: 'Harbor terms | App use and beta information', description: 'Harbor’s purpose, your media and server responsibilities, beta availability, feature limits and official contact information.' },
    support: { title: 'Harbor support | WebDAV, playback and offline downloads', description: 'Set up your NAS connection and troubleshoot discovery, playback, downloads, duplicate notices, offline viewing and local deletion. Check upcoming features.' },
  },
  privacy: {
    intro: `This policy applies to Harbor, provided by ${HARBOR_COMPANY}. Harbor plays video from services you configure. The current app has no developer account, advertising, analytics SDK or developer-operated telemetry service.`,
    sections: [
      { title: 'Data stored on your device', body: ['Server addresses, display names, usernames, queues, continuous-playback preferences and watch history are stored in the app’s data directory. Server passwords are stored in the system Keychain. Harbor currently provides no cloud sync between devices.', 'Links containing temporary tokens may be saved in queue, history or download records. Harbor itself has no feature that uploads your library or private videos to the developer. System backups, diagnostics and restoration are governed by your device settings.'] },
      { title: 'Local discovery and server requests', body: ['With system permission, discovery uses Bonjour service information to find compatible devices, read names, addresses and ports, and check WebDAV availability. Discovery does not use saved passwords or sign in to your NAS.', 'Browsing, playing and downloading send requests directly to the server you choose. Authentication provides the login information that server requires. HTTP traffic is unencrypted and intended for trusted networks. HTTPS uses system certificate validation; Harbor does not bypass invalid certificates.', 'Your server operator may log IP addresses, request times and accessed files. That operator controls its own data practices. Configure only services you trust and are authorised to access.'] },
      { title: 'Downloads and storage', body: ['Videos you download are stored in the app’s data directory on this device. Download records include the source address, title, server identifier, state, progress and file size. Source addresses may contain temporary tokens. The downloads directory is marked as excluded from cloud backup.', 'Completed downloads can play offline. Harbor currently does not provide background downloads, HLS / DASH offline storage, or download sync between devices.'] },
      { title: 'Viewing and deleting data', body: ['You can edit or remove servers, manage the queue and clear watch history. Removing a server removes its saved connection, password, related online queue and history entries, and cancels its unfinished downloads.', 'Completed videos and their download-source records remain after a server is removed. Delete them separately in Local Videos. Deleting a download removes its local copy, download record and matching local queue and history entries; it does not delete the NAS original. Existing online history is managed separately.', 'The same token-bearing link may be stored in several lists. To remove it fully, check the queue, history and downloads. Keychain items may persist according to system rules; remove saved server connections before uninstalling if you want those passwords cleared.'] },
      { title: 'TestFlight and feedback you send', body: ['When you use a beta through TestFlight, Apple handles testing data under its TestFlight terms, including automatically providing crash logs and beta usage data to Apple and the application provider. This platform behaviour is separate from Harbor integrating an analytics SDK.', 'Feedback you submit in TestFlight, including text or screenshots, may reach Apple and the developer. If you email support, we receive your message and attachments and use them to handle your request. Please omit server passwords, complete token-bearing links and private videos.'] },
      { title: 'Updates and contact', body: [`This policy describes the current app. The date on this page is updated when the policy changes. For privacy, device-data management or feedback enquiries, contact ${HARBOR_CONTACT}.`] },
    ],
  },
  terms: {
    intro: `Harbor is provided by ${HARBOR_COMPANY}. These terms describe the current player and beta and apply alongside the Apple distribution and TestFlight terms applicable to your use.`,
    sections: [
      { title: 'The app and your media', body: ['Harbor connects to WebDAV or HTTP / HTTPS video services you configure and plays or manages local copies. Apart from its clearly labelled original demo clips, Harbor does not supply a film catalogue, content subscription or rights to third-party videos.', 'Access, play and download only files you own or are authorised to use. Follow your server’s rules and applicable law. Rights to media remain with their respective owners.'] },
      { title: 'Devices, connections and credentials', body: ['You are responsible for configuring a reachable server, maintaining your permissions, and securing your device and server credentials. Use trusted networks; HTTP is unencrypted. Harbor does not control server operators, home networks or system permissions.', 'You manage local queues, history and downloads. Deleting a local copy does not delete a server file; removing a server does not delete completed downloads. Keep important files backed up on the original server or another suitable location.'] },
      { title: 'Beta status and feature limits', body: ['Harbor is currently in TestFlight testing. Eligibility, compatible devices, build expiry and testing-data processing are governed by TestFlight’s displayed information and Apple’s terms. Beta software can change, stop working or contain errors.', 'Playback depends on the system, device, codecs and files. This version has no SMB access, extended MKV decoder, NAS transcoding or cross-device progress sync. Keep the app open for downloads; HLS / DASH offline downloads are unsupported. Compatibility with every NAS, file or network is not guaranteed.'] },
      { title: 'App use and rights', body: ['Use Harbor on compatible devices you own or control, in accordance with applicable Apple terms. Unless permitted by applicable law, relevant open-source licences or authorisation, do not redistribute the app, impersonate its developer or use it to infringe others’ rights.', 'Rights in Harbor’s software, brand and original demo content are reserved by their respective owners. These terms do not limit consumer rights that applicable law does not allow to be excluded.'] },
      { title: 'Feedback, updates and contact', body: [`You may stop using Harbor or leave the beta. Updates to features, policies or terms will be described on the relevant pages. For use, copyright or support questions, contact ${HARBOR_CONTACT}. Do not send unnecessary private media or login credentials.`] },
    ],
  },
};

// Product documentation is maintained in Chinese and English. Other site languages
// use the English document with an explicit content language rather than a false translation.
export function harborCopy(language: string): Copy {
  return language.startsWith('zh') || language === 'yue' ? zh : en;
}
export function harborSection(path: string): HarborSection {
  return path.includes('/privacy/') ? 'privacy' : path.includes('/terms/') ? 'terms' : path.includes('/support/') ? 'support' : 'overview';
}
