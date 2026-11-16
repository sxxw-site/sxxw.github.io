import DocumentLayout from '../components/DocumentLayout';
import { harborDelivery, harborOpenSourceCopy, type DeliveryArtifact } from '../content/apps/harbor.open-source';

export default function HarborOpenSourceContent({ language }: { language: string }) {
  const copy = harborOpenSourceCopy(language);
  const availableRelinks = harborDelivery.relink.verified ? harborDelivery.relink.artifacts.filter((artifact) => artifact.href) : [];
  const artifact = (file: DeliveryArtifact, label: string, description: string, version?: string) => file.href ? <li key={file.filename} className="harbor-download">
    <a className="harbor-download-link" href={file.href} aria-label={version ? `${label} · Harbor ${version}` : undefined}>{label}<span aria-hidden="true">↗</span></a>
    <p>{description}</p>
    <dl className="harbor-download-meta">
      <div><dt>{copy.file}</dt><dd><code>{file.filename}</code></dd></div>
      <div><dt>{copy.size}</dt><dd>{file.bytes.toLocaleString(language)} bytes</dd></div>
      <div><dt>{copy.hash}</dt><dd><code>{file.sha256}</code></dd></div>
    </dl>
  </li> : null;

  return <>
    <section className="product-section harbor-delivery" id="downloads">
      <div className="product-section-heading"><h2>{copy.downloads}</h2></div>
      <dl className="harbor-delivery-version">
        <div><dt>{copy.variant}</dt><dd>VLCKit {harborDelivery.vlckitVersion} / libVLC {harborDelivery.libvlcVersion}<br /><code>{harborDelivery.libraryVariant}</code></dd></div>
        <div><dt>{copy.application}</dt><dd>{harborDelivery.applicationBuilds.map((app) => <span key={`${app.version}-${app.build}`}>{app.version} ({app.build})</span>)}</dd></div>
      </dl>
      <p className="harbor-delivery-note">{copy.versionNote}</p>
      <ul className="harbor-downloads">
        {artifact(harborDelivery.source, copy.source, copy.sourceDetail)}
        {artifact(harborDelivery.notices, copy.notices, copy.noticesDetail)}
        {artifact(harborDelivery.offer, copy.offer, copy.offerDetail)}
        {artifact(harborDelivery.objectLicense, copy.objectLicense, copy.objectLicenseDetail)}
      </ul>
      {!harborDelivery.source.href && <p className="harbor-delivery-note">{copy.pending}</p>}
      <p className="harbor-delivery-note">{copy.integrity}</p>
      {harborDelivery.checksums.href && <a className="harbor-inline-link" href={harborDelivery.checksums.href}>{copy.checksums}<span aria-hidden="true">↗</span></a>}
    </section>

    <section className="product-section harbor-delivery" id="relink">
      <div className="product-section-heading"><h2>{copy.relink}</h2></div>
      <p className="harbor-delivery-note">{copy.relinkDetail}</p>
      {harborDelivery.applicationBuilds.map((app) => {
        const files = availableRelinks.filter((file) => file.version === app.version && file.build === app.build);
        return <div className="harbor-relink-build" key={`${app.version}-${app.build}`}>
          <h3>Harbor {app.version} ({app.build})</h3>
          <p className="harbor-delivery-note">{app.offerIncluded ? copy.offerIncluded : copy.historicalBuild}</p>
          {files.length ? <ul className="harbor-downloads">{files.map((file) => artifact(file, file.platform === 'macos' ? copy.relinkMac : copy.relinkIOS, copy.relinkDetail, `${file.version} (${file.build})`))}</ul>
            : <p className="harbor-delivery-note">{copy.noPublishedRelink}</p>}
        </div>;
      })}
      <aside className="harbor-verification-scope">
        <h3>{copy.verifiedScope}</h3>
        <p>{copy.verifiedBuilds}: {harborDelivery.relink.verifiedBuilds.join(' / ')}</p>
        {harborDelivery.relink.macosRuntimeArchitectures.length > 0 && <p>{copy.macosScope}: {harborDelivery.relink.macosRuntimeArchitectures.join(' / ')}</p>}
        <p>{harborDelivery.relink.iosDeviceRuntimeVerified ? copy.iosRuntimeDone : copy.iosScope}</p>
        <p>{copy.scopeNote}</p>
      </aside>
    </section>

    <DocumentLayout title={copy.instructions} eyebrow="Harbor" contentLanguage={language}
      meta={harborDelivery.libraryVariant} intro={copy.intro} sections={copy.sections}>
      <h3>{copy.references}</h3>
      <ul className="harbor-licence-links">
        <li><a href="/apps/harbor/open-source/LGPL-2.1.txt">{copy.lgpl}</a></li>
        <li><a href={`https://code.videolan.org/videolan/VLCKit/-/tree/${harborDelivery.vlckitCommit}`} target="_blank" rel="noreferrer">{copy.vlckit} · <code>{harborDelivery.vlckitCommit.slice(0, 8)}</code></a></li>
        <li><a href={`https://code.videolan.org/videolan/vlc/-/tree/${harborDelivery.libvlcCommit}`} target="_blank" rel="noreferrer">{copy.libvlc} · <code>{harborDelivery.libvlcCommit.slice(0, 8)}</code></a></li>
        <li><a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noreferrer">{copy.apple}</a></li>
      </ul>
    </DocumentLayout>
  </>;
}
