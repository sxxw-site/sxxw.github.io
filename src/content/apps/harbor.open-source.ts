import deliveryData from './harbor.delivery.json';

export type DeliveryArtifact = {
  filename: string;
  bytes: number;
  sha256: string;
  href: string | null;
};

export type RelinkArtifact = DeliveryArtifact & {
  platform: 'macos' | 'ios';
  version: string;
  build: string;
};

type Delivery = {
  libraryVariant: string;
  vlckitVersion: string;
  libvlcVersion: string;
  vlckitCommit: string;
  libvlcCommit: string;
  applicationBuilds: Array<{ version: string; build: string; offerIncluded: boolean }>;
  source: DeliveryArtifact;
  notices: DeliveryArtifact;
  offer: DeliveryArtifact;
  objectLicense: DeliveryArtifact;
  retention: { minimumYears: number; contactEmail: string };
  checksums: { filename: string; href: string | null };
  relink: {
    route: string;
    verified: boolean;
    verifiedBuilds: string[];
    artifacts: RelinkArtifact[];
    macosRuntimeArchitectures: string[];
    iosDeviceRuntimeVerified: boolean;
    iosRuntimeLimitation: string | null;
  };
};

export const harborDelivery = deliveryData as Delivery;

const zh = {
  downloads: '版本对应的下载',
  variant: '播放库构建',
  application: '对应 Harbor 版本',
  source: '下载 VLC 对应源码',
  sourceDetail: '含实际使用的库源码、Harbor 对库的补丁、构建脚本、版本清单与组件许可。',
  notices: '下载完整组件告知',
  noticesDetail: '所选播放构建的版权、许可证及第三方声明，与 App 内的组件告知一致。',
  relink: '应用重链接材料',
  relinkMac: '下载 macOS 重链接材料',
  relinkIOS: '下载 iOS 重链接材料',
  relinkDetail: '含对应发行版的 Harbor 编译目标文件、资源及链接工具。应用目标文件保留独立许可，不包含 Harbor 业务源代码。',
  offer: '下载 LGPL 书面提供承诺',
  offerDetail: '适用于随包附有该承诺的 Harbor 构建；免费提供匹配的源码与应用对象材料，并约定保留期限。',
  objectLicense: '下载应用目标文件授权',
  objectLicenseDetail: 'Harbor 编译对象与资源保持专有许可；保留接收者自用修改、重链接及为调试这些修改而逆向工程的权利。',
  offerIncluded: '随包附有书面提供承诺',
  historicalBuild: '历史构建，原包未附该书面承诺',
  noPublishedRelink: '此构建的重链接文件尚未公开，暂不提供下载。',
  verifiedScope: '实际验证范围',
  verifiedBuilds: '下列独立重链接验证记录适用于构建',
  macosScope: 'macOS：已使用接口兼容的修改版库重链接并实际运行；验证架构',
  iosScope: 'iOS arm64：已验证目标文件、重链接及开发签名；尚未完成实体设备上的修改库运行验证。',
  iosRuntimeDone: 'iOS arm64：已完成修改版库的重链接、签名及设备实际运行验证，具体测试范围见材料内的 README。',
  scopeNote: '完整操作与验证范围见各平台材料内的 README。链接或签名通过不等于真机播放通过。',
  pending: '此版本的下载尚未发布。发布后的文件与校验值会列在这里。',
  pendingRelink: '此版本的重链接材料尚未发布。请勿将源码包单独视为完整的应用重链接交付。',
  checksums: '下载 SHA-256 清单',
  integrity: '下载后核对 SHA-256；文件名、版本与校验值应同时匹配。',
  file: '文件',
  size: '大小',
  hash: 'SHA-256',
  instructions: '组件许可与操作说明',
  requestNote: '如需索取匹配材料，只需说明 Harbor 版本、构建号和平台，免费提供。无需提交账号密码、私钥或私人媒体。',
  intro: 'Harbor 使用 VideoLAN 的 VLCKit／libVLC 和其依赖提供兼容播放。组件各自的版权与开源许可继续适用；Harbor 自有应用代码采用独立许可。',
  versionNote: '这些材料只对应此处列明的应用及库版本，不代表所有历史 TestFlight 包都使用相同的播放库。',
  sections: [
    {
      title: '库源码、修改与构建',
      body: [
        '源码包包含固定的 VLCKit／libVLC 版本、官方补丁、Harbor 对库的修改和构建材料，以及实际依赖的来源与许可。源码与构建清单用校验值对应，不以一个上游项目首页代替实际使用版本。',
        '本播放构建排除了查明的不适合所选闭源发行方案的 GPL 插件与实现。VLC 的其它版本或插件可能采用不同条款，应按具体组件核对。生成器例外和依赖自己的告知保留在完整许可材料中。',
        '维护时优先保留接入层和构建配置的调整。库内补丁随源码列出修改者、日期和用途；升级时重新核对补丁是否仍有必要，不扩大为通用功能分支。',
      ],
    },
    {
      title: 'Harbor 应用代码与重链接',
      body: [
        'LGPL 2.1 第 6 条提供不同的交付路径。本版重链接材料按第 6(a) 条组织：提供匹配的库源码，以及足以与修改后的兼容库重新链接应用的目标文件和必要材料。',
        'Harbor 的编译目标文件是应用的二进制材料，其使用范围以材料内的应用许可为准。它们不是 Harbor 的 Swift／业务源码。开源库、补丁和公开工具仍按各自许可提供。',
        '动态 framework 本身不能证明可替换条件已满足。请使用与目标平台、架构和接口兼容的库，并按对应材料内的版本与链接说明操作。',
      ],
    },
    {
      title: '替换、签名与本机使用',
      body: [
        '先下载匹配版本的源码和目标平台重链接材料，核对校验值。在独立目录内按源码说明构建修改版库，再按重链接材料的 README 生成应用。不要把一个版本的目标文件与另一个版本的链接参数混用。',
        '需要签名或设备安装时，使用你自己的 Apple 开发身份及适用的配置。材料不包含开发者私钥、个人凭据或可转用的分发签名。不要关闭系统安全检查，也不要覆盖正在使用的 Harbor 或其数据；使用材料说明的独立安装流程。',
        '签名、安装及运行要求取决于平台和你自己的开发环境；材料随附的验证说明列出实际测试范围。修改版应用并非 Harbor 官方发行包，不会自动继承 TestFlight 资格、官方签名或更新渠道。',
      ],
    },
    {
      title: '许可与用户权利',
      body: [
        'VLCKit／libVLC 在本构建中采用 LGPL 2.1 或更高版本；其它所选组件按各自许可证提供。完整告知、版权和例外须与相应材料一起保留。',
        'Harbor 使用条款不限制相关开源许可授予的权利，包括许可允许的自用修改及为调试该修改而进行的逆向工程。请同时遵守应用目标文件的独立许可和适用的 Apple 条款。',
        '本页记录交付材料及其操作范围，不代表 Apple 的审核或上架结论。若发现下载与安装版本不对应、文件缺失或无法按说明重链接，请通过下方官方支持渠道反馈。',
      ],
    },
    {
      title: '书面提供承诺与版本保留',
      body: [
        '随包附有书面提供承诺的构建，向每位接收者免费提供 LGPL 2.1 第 6(a) 条所列材料。版本匹配的材料至少保留至最后一次分发该特定构建之日起满三年；期限不会只从网页首次发布日期计算。',
        '历史构建 611162339 原包没有附本次新增的书面承诺，其对应源码与目标文件在此直接提供，不把该承诺倒记为旧包已包含的文件。新版 611170140 随包提供该承诺；各版文件分别归档，不能相互替代。',
        '如下载链接不可用，也可向下方 Harbor 支持邮箱免费请求匹配材料。只需说明应用版本、构建号和平台，不需要另行接受协议或提交密码、私钥及私人媒体。',
      ],
    },
  ],
  references: '许可原文与上游来源',
  lgpl: '阅读 GNU LGPL 2.1 全文',
  vlckit: '查看 VLCKit 固定版本',
  libvlc: '查看 libVLC 固定版本',
  apple: '阅读 Apple 标准 EULA',
};

const en: typeof zh = {
  downloads: 'Version-matched downloads',
  variant: 'Playback library build',
  application: 'Matching Harbor versions',
  source: 'Download VLC corresponding sources',
  sourceDetail: 'The libraries used, Harbor’s library patches, build scripts, version inventory and component licences.',
  notices: 'Download complete component notices',
  noticesDetail: 'Copyright, licence and third-party notices for this playback build, matching the notices bundled in the app.',
  relink: 'Application relinking materials',
  relinkMac: 'Download macOS relinking materials',
  relinkIOS: 'Download iOS relinking materials',
  relinkDetail: 'The matching Harbor application object files, resources and linking tools. Application objects retain their separate licence; Harbor business source is not included.',
  offer: 'Download the LGPL written offer',
  offerDetail: 'For Harbor builds that include this offer: matching source and application object materials at no charge, with the stated retention period.',
  objectLicense: 'Download application object permissions',
  objectLicenseDetail: 'Harbor objects and resources remain proprietary. Recipients retain own-use modification, relinking and reverse-engineering rights for debugging those modifications.',
  offerIncluded: 'Written offer included in the app',
  historicalBuild: 'Historical build; original app did not include this offer',
  noPublishedRelink: 'Relinking files for this build have not been published and are not available to download yet.',
  verifiedScope: 'Actual verification scope',
  verifiedBuilds: 'The independent relinking checks below apply to builds',
  macosScope: 'macOS: relinked and actually run with an interface-compatible modified library; tested architectures',
  iosScope: 'iOS arm64: object materials, relinking and development signing were checked; execution with the modified library on a physical device remains unverified.',
  iosRuntimeDone: 'iOS arm64: relinking, signing and actual device execution with the modified library were checked. See the kit’s README for the exact test scope.',
  scopeNote: 'See each platform kit’s README for the complete procedure and verification scope. Linking or signing success is not a device playback result.',
  pending: 'Downloads for this version have not been published. Published files and checksums will appear here.',
  pendingRelink: 'Relinking materials for this version have not been published. The source archive alone is not a complete application relinking delivery.',
  checksums: 'Download SHA-256 checksums',
  integrity: 'Verify SHA-256 after downloading. The filename, version and checksum must all match.',
  file: 'File',
  size: 'Size',
  hash: 'SHA-256',
  instructions: 'Component licences and instructions',
  requestNote: 'To request matching materials at no charge, identify your Harbor version, build and platform. No account password, private signing key or private media is required.',
  intro: 'Harbor uses VideoLAN’s VLCKit/libVLC and their dependencies for compatibility playback. Each component retains its copyright and open-source licence. Harbor’s own application code has a separate licence.',
  versionNote: 'These materials match only the app and library versions listed here. Historical TestFlight builds may use different playback libraries.',
  sections: [
    {
      title: 'Library sources, changes and builds',
      body: [
        'The source archive includes the pinned VLCKit/libVLC versions, upstream patches, Harbor’s library changes and build materials, and the sources and licences of the dependencies used. Checksums bind the sources to the inventory; a link to an upstream home page does not identify the actual version used.',
        'This playback build excludes the identified GPL plugins and implementations that do not fit the selected proprietary application distribution route. Other VLC versions or plugins may have different terms and must be checked separately. Generator exceptions and component notices are retained in the complete licence materials.',
        'Maintenance favours integration code and build configuration. Library patches record their author, date and purpose. Upgrades review whether each patch is still needed rather than extending a general-purpose fork.',
      ],
    },
    {
      title: 'Harbor application code and relinking',
      body: [
        'Section 6 of LGPL 2.1 provides alternative delivery routes. These relinking materials follow section 6(a): matching library sources, plus the application objects and other materials needed to relink with a modified, interface-compatible library.',
        'Harbor application objects are compiled binary materials, governed by the application licence included with the kit. They are not Harbor’s Swift or business source code. The libraries, patches and public tools retain their own licences.',
        'A dynamic framework alone does not establish that replacement conditions are met. Use a library compatible with the platform, architecture and interface, and follow the version and linking instructions supplied with the matching materials.',
      ],
    },
    {
      title: 'Replacement, signing and personal use',
      body: [
        'Download the matching sources and platform-specific relinking materials and verify the checksums. Build your modified library in a separate directory using the source instructions, then generate the application using the relinking kit’s README. Do not combine one version’s objects with another version’s link settings.',
        'Where signing or device installation is needed, use your own Apple development identity and applicable configuration. No developer private keys, personal credentials or reusable distribution signing are supplied. Do not disable system security checks or overwrite your normal Harbor app or its data; use the separate installation process described in the kit.',
        'Signing, installation and runtime requirements depend on the platform and your development environment. The supplied verification notes state what was actually tested. Your modified application is not an official Harbor distribution and does not inherit TestFlight eligibility, the official signature or its update channel.',
      ],
    },
    {
      title: 'Licences and recipient rights',
      body: [
        'VLCKit/libVLC in this build use LGPL 2.1 or later. Other selected components use their own licences. Preserve the complete notices, copyrights and exceptions with the corresponding materials.',
        'Harbor’s terms do not restrict rights granted by the applicable open-source licences, including permitted modifications for personal use and reverse engineering to debug those modifications. Follow the application object files’ separate licence and the applicable Apple terms as well.',
        'This page describes the delivery materials and their scope. It is not an Apple review or publication decision. If the materials do not match your installed version, are incomplete or cannot be relinked as documented, contact official support below.',
      ],
    },
    {
      title: 'Written offer and version retention',
      body: [
        'For builds that include the written offer, each recipient is offered the materials specified by LGPL 2.1 section 6(a) at no charge. Matching materials are retained for at least three years after the last distribution of that particular build, rather than only from this page’s first publication.',
        'Historical build 611162339 did not contain this new written offer. Its matching sources and objects are provided directly here; the offer is not retroactively described as having been bundled. New build 611170140 includes the offer. Materials are archived by build and are not interchangeable.',
        'If a download is unavailable, request the matching materials at no charge from Harbor support below. Identify the app version, build and platform. No additional agreement, password, private signing key or private media is required to receive them.',
      ],
    },
  ],
  references: 'Licence text and upstream sources',
  lgpl: 'Read the full GNU LGPL 2.1',
  vlckit: 'View the pinned VLCKit version',
  libvlc: 'View the pinned libVLC version',
  apple: 'Read Apple’s Standard EULA',
};

export const harborOpenSourceCopy = (language: string) => language.toLowerCase().startsWith('zh') || language === 'yue' ? zh : en;
