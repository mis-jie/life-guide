import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import { DownloadEntry, PDF_PATH } from "./components/下载入口";
import { SiteLink as Link, SiteNavLink as NavLink } from "./components/站内链接";
import { SourceList } from "./components/来源列表";
import { GlossaryText } from "./components/术语解释";
import { emptyFilters, FullFilter, type FilterState } from "./components/完整筛选器";
import { chapters, costLabels, getChapter, getChapterTips, getTip, guideMeta, tips, type Tip } from "./data/content";
import { readLastTipId, rememberLastTip, useLocalProgress, type ItemProgress } from "./hooks/useLocalProgress";
import { useTheme, type Theme } from "./hooks/useTheme";
import { GlossaryPage } from "./pages/术语表页";
import { VersionPage } from "./pages/版本说明页";

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: "auto" }), [location.pathname]);
  return null;
}

function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return <header className="site-header">
    <Link className="brand" to="/" aria-label="高性价比人生指南首页"><span className="brand-mark">衡</span><span>生活选择指南</span></Link>
    <nav className="desktop-nav" aria-label="主导航"><NavLink to="/">首页</NavLink><NavLink to="/book">阅读全书</NavLink><NavLink to="/featured">精选建议</NavLink><NavLink to="/glossary">术语表</NavLink><NavLink to="/dashboard">我的清单</NavLink></nav>
    <button className="theme-toggle" onClick={onToggleTheme} aria-label={`切换为${theme === "light" ? "深色" : "浅色"}模式`}><span aria-hidden="true">{theme === "light" ? "◐" : "☀"}</span><span>{theme === "light" ? "深色" : "浅色"}</span></button>
    <Link className="header-cta" to="/book">开始阅读</Link>
  </header>;
}

function MobileNav() {
  return <nav className="mobile-nav" aria-label="手机端主导航"><NavLink to="/"><span>⌂</span>首页</NavLink><NavLink to="/book"><span>▤</span>全书</NavLink><NavLink to="/glossary"><span>?</span>术语</NavLink><NavLink to="/dashboard"><span>✓</span>清单</NavLink><NavLink to="/version"><span>•••</span>说明</NavLink></nav>;
}

function Footer() {
  return <footer className="site-footer"><div><strong>生活选择指南</strong><p>从一条能做到的建议开始，慢慢把生活过得更稳。</p></div><div className="footer-note"><p>完整收录固定提交 {guideMeta.version} 的 {guideMeta.chapterCount} 章、{guideMeta.tipCount} 条建议；其中争议 65 条、待核实 3 条。</p><p>原著为 eternity4719《高性价比人生指南》，依据 CC BY 4.0 使用。</p><p>收藏、待做、完成状态和主题只保存在当前浏览器中，不会上传。</p><div className="footer-links"><Link to="/version">版本、许可与风险声明</Link><Link to="/glossary">查看术语表</Link><a href={PDF_PATH} target="_blank" rel="noreferrer">阅读官方 PDF</a><a href={guideMeta.sourceRepository} target="_blank" rel="noreferrer">查看原始项目</a></div></div></footer>;
}

type ProgressActionsProps = { tip: Tip; state: ItemProgress; onStatus: (status: "done" | "todo") => void; onFavorite: () => void; onShare: () => void };
function ProgressActions({ tip, state, onStatus, onFavorite, onShare }: ProgressActionsProps) {
  return <div className="tip-actions" aria-label={`${tip.title}的操作`}><button className={state.status === "done" ? "is-selected" : ""} onClick={() => onStatus("done")} aria-pressed={state.status === "done"}>✓ 已做到</button><button className={state.status === "todo" ? "is-selected" : ""} onClick={() => onStatus("todo")} aria-pressed={state.status === "todo"}>＋ 待做</button><button className={state.favorite ? "is-selected" : ""} onClick={onFavorite} aria-pressed={state.favorite}>{state.favorite ? "★ 已收藏" : "☆ 收藏"}</button><button onClick={onShare}>分享</button></div>;
}

function TipCard({ tip, progressApi, onShare }: { tip: Tip; progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const chapter = getChapter(tip.chapterId)!;
  const state = progressApi.get(tip.id);
  return <article className="tip-card"><div className="tip-card-top"><span className="tip-id">{tip.id}</span><div className="badge-row"><span className={`evidence evidence-${tip.evidence.toLowerCase()}`}>证据 {tip.evidence}</span><span className={`value-tier tier-${tip.valueTier}`}>{tip.valueTier}</span></div></div><p className="tip-chapter">{chapter.eyebrow} · {chapter.title}</p><h3><Link to={`/tip/${tip.id}`}>{tip.title}</Link></h3><p>{tip.plainLanguage}</p><div className="tip-meta"><span>{tip.resourceLabel}</span><span>{costLabels.money[tip.money]}</span><span>{costLabels.time[tip.time]}</span><span>{costLabels.effort[tip.effort]}</span>{tip.controversial && <span className="warning-chip">有争议</span>}{tip.needsVerification && <span className="warning-chip">待核实</span>}</div><ProgressActions tip={tip} state={state} onStatus={(status) => progressApi.toggleStatus(tip.id, status)} onFavorite={() => progressApi.toggleFavorite(tip.id)} onShare={() => onShare(tip)} /><Link className="text-link" to={`/tip/${tip.id}`}>查看完整说明与来源</Link></article>;
}

function ShareDialog({ tip, onClose }: { tip: Tip | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!tip) return; const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); document.addEventListener("keydown", close); return () => document.removeEventListener("keydown", close); }, [tip, onClose]);
  if (!tip) return null;
  const url = `${window.location.origin}${window.location.pathname}#/tip/${tip.id}`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setCopied(false); } };
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title"><button className="dialog-close" onClick={onClose} aria-label="关闭分享弹窗">×</button><p className="section-kicker">分享一件值得做的小事</p><h2 id="share-title">{tip.title}</h2><blockquote>{tip.plainLanguage}</blockquote><label htmlFor="share-url">本站建议链接</label><div className="copy-row"><input id="share-url" readOnly value={url} /><button onClick={copy}>{copied ? "已复制" : "复制链接"}</button></div></section></div>;
}

function HomePage({ progressApi, onShare }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const featured = ["01-01", "05-05", "14-01", "34-08"].map(getTip).filter((tip): tip is Tip => Boolean(tip));
  const [active, setActive] = useState(0);
  const current = featured[active];
  return <><section className="hero"><div className="hero-copy"><p className="hero-kicker">有限的时间、金钱与精力</p><h1>把生活里的选择，<em>看得更清楚</em></h1><p className="hero-lead">完整阅读 {guideMeta.tipCount} 条有来源的生活建议，比较成本与收益，挑出真正适合自己的下一步。</p><div className="hero-actions"><Link className="button primary" to="/book">开始阅读</Link><a className="button secondary" href={PDF_PATH} target="_blank" rel="noreferrer">在线阅读 PDF</a></div><div className="hero-stats"><span><strong>{guideMeta.tipCount}</strong> 条完整建议</span><span><strong>{guideMeta.chapterCount}</strong> 个生活主题</span><span><strong>41</strong> 个术语解释</span></div></div><div className="hero-visual"><img src="/hero-life-guide.png" alt="一本摊开的行动手册旁摆放着时钟、硬币、盾牌和绿芽的原创拼贴插画" /></div></section>
    <section className="section-wrap"><DownloadEntry /></section>
    <section className="featured-stage section-wrap"><div className="section-heading"><div><p className="section-kicker">从一件小事开始</p><h2>今天值得先做什么？</h2></div><span>{String(active + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}</span></div><div className="featured-card"><div><span className="tip-id">{current.id}</span><span className={`evidence evidence-${current.evidence.toLowerCase()}`}>证据 {current.evidence}</span></div><h3>{current.title}</h3><p>{current.plainLanguage}</p><div className="featured-controls"><button onClick={() => setActive((active - 1 + featured.length) % featured.length)}>上一条</button><div className="dots">{featured.map((item, index) => <button key={item.id} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`查看第 ${index + 1} 条建议`} />)}</div><button onClick={() => setActive((active + 1) % featured.length)}>下一条</button></div><Link className="text-link" to={`/tip/${current.id}`}>看看完整内容</Link></div></section>
    <section className="section-wrap" id="chapters"><div className="section-heading"><div><p className="section-kicker">按眼前的问题阅读</p><h2>从最关心的主题开始</h2></div><Link className="text-link" to="/book">浏览全部建议</Link></div><div className="chapter-grid">{chapters.map((chapter) => <Link className="chapter-card" to={`/book/${chapter.id}`} key={chapter.id} style={{ "--accent": chapter.accent } as CSSProperties}><span>{chapter.id} / 34</span><h3>{chapter.title}</h3><p>{chapter.description}</p><strong>{chapter.tipCount} 条建议</strong></Link>)}</div></section>
    <section className="evidence-section section-wrap"><div><p className="section-kicker">先看依据，再决定行动</p><h2>证据等级和性价比是两回事</h2><p>A/B/C 表示依据强弱；极高、高、一般表示原作者按收益量级和三项成本做的行动排序。</p></div><div className="evidence-list"><article><b>A</b><div><h3>有具体数字可查</h3><p>来自较扎实的研究或官方材料。</p></div></article><article><b>B</b><div><h3>有研究支持</h3><p>有依据，但数字或适用范围仍有限。</p></div></article><article><b>C</b><div><h3>经验与通行做法</h3><p>主要依据经验、规则或普遍做法。</p></div></article></div></section>
    <section className="quick-list section-wrap"><div className="section-heading"><div><p className="section-kicker">先试一试</p><h2>四条代表性建议</h2></div></div><div className="tip-grid">{featured.map((tip) => <TipCard key={tip.id} tip={tip} progressApi={progressApi} onShare={onShare} />)}</div></section></>;
}

function matchesFilters(tip: Tip, filters: FilterState) {
  const query = filters.query.trim().toLowerCase();
  const haystack = [tip.title, tip.plainLanguage, tip.cost, tip.benefit, tip.notes, tip.sourceText].join("\n").toLowerCase();
  return (!query || haystack.includes(query)) && (filters.chapterId === "全部" || tip.chapterId === filters.chapterId) && (!filters.evidence.length || filters.evidence.includes(tip.evidence)) && (!filters.valueTier.length || filters.valueTier.includes(tip.valueTier)) && (!filters.resourceType.length || filters.resourceType.includes(tip.resourceType)) && (!filters.money.length || filters.money.includes(tip.money)) && (!filters.time.length || filters.time.includes(tip.time)) && (!filters.effort.length || filters.effort.includes(tip.effort));
}

function BookPage({ progressApi, onShare, featuredOnly = false }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void; featuredOnly?: boolean }) {
  const [filters, setFilters] = useState<FilterState>(featuredOnly ? { ...emptyFilters, evidence: ["A"] } : emptyFilters);
  const filtered = useMemo(() => tips.filter((tip) => matchesFilters(tip, filters)), [filters]);
  return <main className="page-shell"><section className="page-intro"><p className="section-kicker">{featuredOnly ? "从 A 级建议开始" : `${guideMeta.tipCount} 条完整收录`}</p><h1>{featuredOnly ? "高证据等级建议" : "找到眼前需要解决的问题"}</h1><p>搜索会同时检查标题、说人话、成本、收益、备注和来源；多个筛选条件可以组合使用。</p></section><DownloadEntry compact /><FullFilter value={filters} onChange={setFilters} resultCount={filtered.length} />{!featuredOnly && <section className="chapter-strip" id="chapters">{chapters.map((chapter) => <Link key={chapter.id} to={`/book/${chapter.id}`}><span>{chapter.id}</span>{chapter.title}</Link>)}</section>}{filtered.length ? <section className="tip-grid">{filtered.map((tip) => <TipCard key={tip.id} tip={tip} progressApi={progressApi} onShare={onShare} />)}</section> : <section className="empty-state"><strong>没有找到相关建议</strong><p>换一个关键词，或者清除筛选条件。</p><button onClick={() => setFilters(emptyFilters)}>清除筛选</button></section>}</main>;
}

function ChapterPage({ progressApi, onShare }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const { chapterId = "" } = useParams(); const chapter = getChapter(chapterId); if (!chapter) return <NotFound />;
  const chapterTips = getChapterTips(chapterId); const index = chapters.findIndex((item) => item.id === chapterId);
  return <main className="page-shell"><nav className="breadcrumbs"><Link to="/book">全书</Link><span>/</span><span>{chapter.title}</span></nav><section className="chapter-hero" style={{ "--accent": chapter.accent } as CSSProperties}><div><span>{chapter.id} / 34 · {chapter.eyebrow}</span><h1>{chapter.title}</h1><p>{chapter.description}</p></div><strong>{chapterTips.length}<small>条完整建议</small></strong></section><nav className="chapter-toc" aria-label="本章目录">{chapterTips.map((tip) => <Link key={tip.id} to={`/tip/${tip.id}`}><span>{tip.number}</span>{tip.title}</Link>)}</nav><section className="tip-grid">{chapterTips.map((tip) => <TipCard key={tip.id} tip={tip} progressApi={progressApi} onShare={onShare} />)}</section><nav className="pager">{index > 0 ? <Link to={`/book/${chapters[index - 1].id}`}>上一章：{chapters[index - 1].title}</Link> : <span />}{index < chapters.length - 1 ? <Link to={`/book/${chapters[index + 1].id}`}>下一章：{chapters[index + 1].title}</Link> : <span />}</nav></main>;
}

function TipPage({ progressApi, onShare }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const { tipId = "" } = useParams(); const tip = getTip(tipId); useEffect(() => { if (tip) rememberLastTip(tip.id); }, [tip]); if (!tip) return <NotFound />;
  const chapter = getChapter(tip.chapterId)!; const index = tips.findIndex((item) => item.id === tip.id); const state = progressApi.get(tip.id);
  return <main className="detail-shell"><nav className="breadcrumbs"><Link to="/book">全书</Link><span>/</span><Link to={`/book/${chapter.id}`}>{chapter.title}</Link><span>/</span><span>{tip.id}</span></nav><article className="tip-detail"><header><div className="badge-row"><span className="tip-id">{tip.id}</span><span className={`evidence evidence-${tip.evidence.toLowerCase()}`}>证据 {tip.evidence}</span><span className={`value-tier tier-${tip.valueTier}`}>性价比 {tip.valueTier}</span><span className="resource-badge">{tip.resourceLabel}</span></div><p>{chapter.eyebrow} · {chapter.title}</p><h1>{tip.title}</h1><p className="detail-lead"><GlossaryText text={tip.plainLanguage} /></p></header><section className="cost-detail"><h2>行动成本</h2><p>{tip.cost}</p><div className="tip-meta"><span>{costLabels.money[tip.money]}</span><span>{costLabels.time[tip.time]}</span><span>{costLabels.effort[tip.effort]}</span></div></section><section className="detail-copy"><h2>可能换回什么</h2><p><GlossaryText text={tip.benefit} /></p></section><SourceList tip={tip} /><section className={`notes-panel${tip.controversial || tip.needsVerification ? " warning" : ""}`}><h2>备注</h2><p>{tip.notes}</p>{tip.controversial && <strong>这条在固定版本中明确标注为“争议”，请同时阅读备注里的反方证据或适用边界。</strong>}{tip.needsVerification && <strong>这条在固定版本中含“待核实”标记，不能把相关数字当成已经确认的事实。</strong>}</section><aside className="version-strip">内容固定于提交 <Link to="/version">{guideMeta.version}</Link>，医疗、法律、金融与政策信息请再核对最新官方资料。</aside><ProgressActions tip={tip} state={state} onStatus={(status) => progressApi.toggleStatus(tip.id, status)} onFavorite={() => progressApi.toggleFavorite(tip.id)} onShare={() => onShare(tip)} /></article><nav className="pager">{index > 0 ? <Link to={`/tip/${tips[index - 1].id}`}>上一条：{tips[index - 1].title}</Link> : <span />}{index < tips.length - 1 ? <Link to={`/tip/${tips[index + 1].id}`}>下一条：{tips[index + 1].title}</Link> : <span />}</nav></main>;
}

function DashboardPage({ progressApi, onShare }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const marked = tips.filter((tip) => { const item = progressApi.get(tip.id); return item.status || item.favorite; }); const done = tips.filter((tip) => progressApi.get(tip.id).status === "done").length; const todo = tips.filter((tip) => progressApi.get(tip.id).status === "todo").length; const favorites = tips.filter((tip) => progressApi.get(tip.id).favorite).length; const lastRead = getTip(readLastTipId());
  return <main className="page-shell"><section className="page-intro"><p className="section-kicker">只属于当前浏览器</p><h1>我的行动清单</h1><p>这些标记不会上传到服务器。更换设备或清除浏览器数据后，记录会消失。</p></section><section className="score-grid"><article><strong>{done}</strong><span>已做到</span></article><article><strong>{todo}</strong><span>待做</span></article><article><strong>{favorites}</strong><span>已收藏</span></article><article>{lastRead ? <Link to={`/tip/${lastRead.id}`}><strong>继续</strong><span>{lastRead.title}</span></Link> : <><strong>—</strong><span>暂无阅读记录</span></>}</article></section>{marked.length ? <section className="tip-grid">{marked.map((tip) => <TipCard key={tip.id} tip={tip} progressApi={progressApi} onShare={onShare} />)}</section> : <section className="empty-state"><strong>清单还是空的</strong><p>阅读建议时，可以把适合自己的标记为待做或收藏。</p><Link className="button primary" to="/book">去选一条建议</Link></section>}</main>;
}

function NotFound() { return <main className="page-shell"><section className="empty-state"><strong>没有找到这个页面</strong><p>链接可能已经变化，返回全书继续浏览。</p><Link className="button primary" to="/book">返回全书</Link></section></main>; }

export default function App() {
  const progressApi = useLocalProgress(); const { theme, toggleTheme } = useTheme(); const [shareTip, setShareTip] = useState<Tip | null>(null); const closeShare = useMemo(() => () => setShareTip(null), []);
  return <div className="app-shell"><ScrollToTop /><Header theme={theme} onToggleTheme={toggleTheme} /><Routes><Route path="/" element={<HomePage progressApi={progressApi} onShare={setShareTip} />} /><Route path="/book" element={<BookPage progressApi={progressApi} onShare={setShareTip} />} /><Route path="/featured" element={<BookPage featuredOnly progressApi={progressApi} onShare={setShareTip} />} /><Route path="/book/:chapterId" element={<ChapterPage progressApi={progressApi} onShare={setShareTip} />} /><Route path="/tip/:tipId" element={<TipPage progressApi={progressApi} onShare={setShareTip} />} /><Route path="/dashboard" element={<DashboardPage progressApi={progressApi} onShare={setShareTip} />} /><Route path="/glossary" element={<GlossaryPage />} /><Route path="/version" element={<VersionPage />} /><Route path="*" element={<NotFound />} /></Routes><Footer /><MobileNav /><ShareDialog tip={shareTip} onClose={closeShare} /></div>;
}
