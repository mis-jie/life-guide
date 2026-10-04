const PDF_PATH = "/life-guide-6f6d969.pdf";

export function DownloadEntry({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`download-entry${compact ? " compact" : ""}`} aria-label="固定版 PDF">
      <div><span>6f6d969 · 649 条固定版</span><strong>也可以下载 PDF 慢慢读</strong></div>
      <div className="download-actions">
        <a className="button primary" href={PDF_PATH} download>下载 PDF</a>
        <a className="button ghost" href={PDF_PATH} target="_blank" rel="noreferrer">在线预览</a>
      </div>
    </section>
  );
}
