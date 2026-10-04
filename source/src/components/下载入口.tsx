import { guideMeta } from "../data/content";

export const PDF_PATH = "/how-to-live-better.pdf";

export function DownloadEntry({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`download-entry${compact ? " compact" : ""}`} aria-label="官方原版 PDF">
      <div><span>{guideMeta.version} · {guideMeta.tipCount} 条完整版</span><strong>在线阅读或保存官方原版 PDF</strong></div>
      <div className="download-actions">
        <a className="button primary" href={PDF_PATH} download>下载 PDF</a>
        <a className="button ghost" href={PDF_PATH} target="_blank" rel="noreferrer">在线阅读</a>
      </div>
    </section>
  );
}
