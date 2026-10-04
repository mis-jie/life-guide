import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  chapters,
  getChapter,
  getChapterTips,
  getTip,
  tips,
  type Evidence,
  type Tip,
} from "./data/content";
import {
  readLastTipId,
  rememberLastTip,
  useLocalProgress,
  type ItemProgress,
} from "./hooks/useLocalProgress";
import { useTheme, type Theme } from "./hooks/useTheme";

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);
  return null;
}

function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="高性价比人生指南首页">
        <span className="brand-mark">衡</span>
        <span>生活选择指南</span>
      </Link>
      <nav className="desktop-nav" aria-label="主导航">
        <NavLink to="/">首页</NavLink>
        <NavLink to="/book">阅读全书</NavLink>
        <NavLink to="/featured">精选建议</NavLink>
        <NavLink to="/dashboard">我的清单</NavLink>
      </nav>
      <button className="theme-toggle" onClick={onToggleTheme} aria-label={`切换为${theme === "light" ? "深色" : "浅色"}模式`}>
        <span aria-hidden="true">{theme === "light" ? "◐" : "☀"}</span>
        <span>{theme === "light" ? "深色" : "浅色"}</span>
      </button>
      <Link className="header-cta" to="/book">开始阅读</Link>
    </header>
  );
}

function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="手机端主导航">
      <NavLink to="/"><span>⌂</span>首页</NavLink>
      <NavLink to="/book"><span>▤</span>全书</NavLink>
      <NavLink to="/featured"><span>☆</span>精选</NavLink>
      <NavLink to="/dashboard"><span>✓</span>清单</NavLink>
      <NavLink to="/book#chapters"><span>•••</span>更多</NavLink>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>生活选择指南</strong>
        <p>从一条能做到的建议开始，慢慢把生活过得更稳。</p>
      </div>
      <div className="footer-note">
        <p>目录、标题与摘要依据 PDF 版本 6f6d969 整理；20 条建议已补充完整说明，其余条目仍待逐条核对。</p>
        <p>原著为 eternity4719《高性价比人生指南》，依据 CC BY 4.0 使用。</p>
        <p>收藏、待做、完成状态和主题设置只保存在当前浏览器中，不会上传到服务器。</p>
        <a href="https://github.com/eternity4719/HowToLiveBetter" target="_blank" rel="noreferrer">查看原始项目</a>
      </div>
    </footer>
  );
}

type ProgressActionsProps = {
  tip: Tip;
  state: ItemProgress;
  onStatus: (status: "done" | "todo") => void;
  onFavorite: () => void;
  onShare: () => void;
};

function ProgressActions({ tip, state, onStatus, onFavorite, onShare }: ProgressActionsProps) {
  return (
    <div className="tip-actions" aria-label={`${tip.title}的操作`}>
      <button className={state.status === "done" ? "is-selected" : ""} onClick={() => onStatus("done")} aria-pressed={state.status === "done"}>✓ 已做到</button>
      <button className={state.status === "todo" ? "is-selected" : ""} onClick={() => onStatus("todo")} aria-pressed={state.status === "todo"}>＋ 待做</button>
      <button className={state.favorite ? "is-selected" : ""} onClick={onFavorite} aria-pressed={state.favorite}>{state.favorite ? "★ 已收藏" : "☆ 收藏"}</button>
      <button onClick={onShare}>分享</button>
    </div>
  );
}

function TipCard({ tip, progressApi, onShare }: { tip: Tip; progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const chapter = getChapter(tip.chapterId)!;
  const state = progressApi.get(tip.id);
  return (
    <article className="tip-card">
      <div className="tip-card-top">
        <span className="tip-id">{tip.id}</span>
        <span className={`evidence evidence-${tip.evidence.toLowerCase()}`}>证据 {tip.evidence}</span>
      </div>
      <p className="tip-chapter">{chapter.eyebrow} · {chapter.title}</p>
      <h3><Link to={`/tip/${tip.id}`}>{tip.title}</Link></h3>
      <p>{tip.summary}</p>
      <div className="tip-meta">
        {tip.detailStatus === "curated" ? <><span>{tip.cost}</span><span>{tip.benefit}</span></> : <><span>已收录 PDF 摘要</span><span>完整详情待核对</span></>}
      </div>
      <ProgressActions
        tip={tip}
        state={state}
        onStatus={(status) => progressApi.toggleStatus(tip.id, status)}
        onFavorite={() => progressApi.toggleFavorite(tip.id)}
        onShare={() => onShare(tip)}
      />
      <Link className="text-link" to={`/tip/${tip.id}`}>{tip.detailStatus === "curated" ? "查看完整说明" : "查看摘要与来源"}</Link>
    </article>
  );
}

function ShareDialog({ tip, onClose }: { tip: Tip | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tip) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [tip, onClose]);

  if (!tip) return null;
  const url = `${window.location.origin}${window.location.pathname}#/tip/${tip.id}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <button className="dialog-close" onClick={onClose} aria-label="关闭分享弹窗">×</button>
        <p className="section-kicker">分享一件值得做的小事</p>
        <h2 id="share-title">{tip.title}</h2>
        <blockquote>{tip.summary}</blockquote>
        <label htmlFor="share-url">建议链接</label>
        <div className="copy-row"><input id="share-url" readOnly value={url} /><button onClick={copy}>{copied ? "已复制" : "复制链接"}</button></div>
        <p className="dialog-hint">演示版不会自动发布到任何第三方平台。</p>
      </section>
    </div>
  );
}

function HomePage({ progressApi, onShare }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const featured = ["01-01", "05-05", "14-01", "34-08"].map(getTip).filter((tip): tip is Tip => Boolean(tip));
  const [active, setActive] = useState(0);
  const current = featured[active];
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">有限的时间、金钱与精力</p>
          <h1>把生活里的选择，<em>看得更清楚</em></h1>
          <p className="hero-lead">阅读有来源的生活建议，比较成本与收益，挑出真正适合自己的下一步。</p>
          <div className="hero-actions"><Link className="button primary" to="/book">开始阅读</Link><Link className="button secondary" to="/featured">先看精选建议</Link></div>
          <div className="hero-stats"><span><strong>{tips.length}</strong> 条当前收录</span><span><strong>{chapters.length}</strong> 个生活主题</span><span><strong>A/B/C</strong> 证据分级</span></div>
        </div>
        <div className="hero-visual"><img src="/hero-life-guide.png" alt="一本摊开的行动手册旁摆放着时钟、硬币、盾牌和绿芽的原创拼贴插画" /></div>
      </section>

      <section className="featured-stage section-wrap">
        <div className="section-heading"><div><p className="section-kicker">从一件小事开始</p><h2>今天值得先做什么？</h2></div><span>{String(active + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}</span></div>
        <div className="featured-card">
          <div><span className="tip-id">{current.id}</span><span className={`evidence evidence-${current.evidence.toLowerCase()}`}>证据 {current.evidence}</span></div>
          <h3>{current.title}</h3><p>{current.summary}</p>
          <div className="featured-controls">
            <button onClick={() => setActive((active - 1 + featured.length) % featured.length)} aria-label="上一条建议">上一条</button>
            <div className="dots">{featured.map((item, index) => <button key={item.id} className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`查看第 ${index + 1} 条建议`} />)}</div>
            <button onClick={() => setActive((active + 1) % featured.length)} aria-label="下一条建议">下一条</button>
          </div>
          <Link className="text-link" to={`/tip/${current.id}`}>看看怎么做</Link>
        </div>
      </section>

      <section className="section-wrap" id="chapters">
        <div className="section-heading"><div><p className="section-kicker">按眼前的问题阅读</p><h2>从最关心的主题开始</h2></div><Link className="text-link" to="/book">浏览全部建议</Link></div>
        <div className="chapter-grid">
          {chapters.map((chapter) => (
            <Link className="chapter-card" to={`/book/${chapter.id}`} key={chapter.id} style={{ "--accent": chapter.accent } as CSSProperties}>
              <span>{chapter.id} / 34</span><h3>{chapter.title}</h3><p>{chapter.description}</p><strong>{getChapterTips(chapter.id).length} 条当前建议</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="evidence-section section-wrap">
        <div><p className="section-kicker">先看依据，再决定行动</p><h2>同一句建议，可信程度可能不同</h2><p>证据等级帮助你快速判断信息来自较扎实的研究、一般研究支持，还是经验与通行做法。</p></div>
        <div className="evidence-list">
          <article><b>A</b><div><h3>有具体数字可查</h3><p>来自较扎实的研究或官方材料。</p></div></article>
          <article><b>B</b><div><h3>有研究支持</h3><p>有依据，但数字或适用范围仍有限。</p></div></article>
          <article><b>C</b><div><h3>经验与通行做法</h3><p>主要依据经验、规则或普遍做法。</p></div></article>
        </div>
      </section>

      <section className="quick-list section-wrap">
        <div className="section-heading"><div><p className="section-kicker">先试一试</p><h2>四条代表性建议</h2></div></div>
        <div className="tip-grid">{featured.map((tip) => <TipCard key={tip.id} tip={tip} progressApi={progressApi} onShare={onShare} />)}</div>
      </section>
    </>
  );
}

function BookPage({ progressApi, onShare, featuredOnly = false }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void; featuredOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [evidence, setEvidence] = useState<Evidence | "全部">("全部");
  const [chapterId, setChapterId] = useState("全部");
  const pool = featuredOnly ? tips.filter((tip) => tip.evidence === "A") : tips;
  const filtered = pool.filter((tip) => {
    const matchesText = `${tip.title}${tip.summary}${tip.detail}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesChapter = chapterId === "全部" || tip.chapterId === chapterId;
    return matchesText && matchesChapter && (evidence === "全部" || tip.evidence === evidence);
  });
  return (
    <main className="page-shell">
      <section className="page-intro"><p className="section-kicker">{featuredOnly ? "证据等级 A" : "当前收录"}</p><h1>{featuredOnly ? "高证据等级建议" : "找到眼前需要解决的问题"}</h1><p>{featuredOnly ? `当前共有 ${pool.length} 条 A 级建议，仍需结合个人情况与原始来源判断。` : `输入关键词，或按章节和证据等级筛选 ${tips.length} 条建议。`}</p></section>
      <section className="filter-panel" aria-label="建议筛选">
        <label><span>搜索建议</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：睡眠、安全带、密码" /></label>
        {!featuredOnly && <label><span>所属章节</span><select value={chapterId} onChange={(event) => setChapterId(event.target.value)}><option value="全部">全部章节</option>{chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.id} · {chapter.title}</option>)}</select></label>}
        <fieldset><legend>证据等级</legend><div className="filter-buttons">{(["全部", "A", "B", "C"] as const).map((item) => <button key={item} className={evidence === item ? "active" : ""} onClick={() => setEvidence(item)}>{item}</button>)}</div></fieldset>
        <p className="result-count">找到 {filtered.length} 条建议</p>
      </section>
      {!featuredOnly && <section className="chapter-strip" id="chapters">{chapters.map((chapter) => <Link key={chapter.id} to={`/book/${chapter.id}`}><span>{chapter.id}</span>{chapter.title}</Link>)}</section>}
      {filtered.length ? <section className="tip-grid">{filtered.map((tip) => <TipCard key={tip.id} tip={tip} progressApi={progressApi} onShare={onShare} />)}</section> : <section className="empty-state"><strong>没有找到相关建议</strong><p>换一个关键词，或者清除筛选条件。</p><button onClick={() => { setQuery(""); setEvidence("全部"); setChapterId("全部"); }}>清除筛选</button></section>}
    </main>
  );
}

function ChapterPage({ progressApi, onShare }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const { chapterId = "" } = useParams();
  const chapter = getChapter(chapterId);
  if (!chapter) return <NotFound />;
  const chapterTips = getChapterTips(chapterId);
  const index = chapters.findIndex((item) => item.id === chapterId);
  return (
    <main className="page-shell">
      <nav className="breadcrumbs" aria-label="面包屑"><Link to="/book">全书</Link><span>/</span><span>{chapter.title}</span></nav>
      <section className="chapter-hero" style={{ "--accent": chapter.accent } as CSSProperties}><div><span>{chapter.id} / 34 · {chapter.eyebrow}</span><h1>{chapter.title}</h1><p>{chapter.description}</p></div><strong>{chapterTips.length}<small>条当前建议</small></strong></section>
      <section className="tip-grid">{chapterTips.map((tip) => <TipCard key={tip.id} tip={tip} progressApi={progressApi} onShare={onShare} />)}</section>
      <nav className="pager" aria-label="章节翻页">{index > 0 ? <Link to={`/book/${chapters[index - 1].id}`}>上一章：{chapters[index - 1].title}</Link> : <span />}{index < chapters.length - 1 ? <Link to={`/book/${chapters[index + 1].id}`}>下一章：{chapters[index + 1].title}</Link> : <span />}</nav>
    </main>
  );
}

function TipPage({ progressApi, onShare }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const { tipId = "" } = useParams();
  const tip = getTip(tipId);
  useEffect(() => {
    if (tip) rememberLastTip(tip.id);
  }, [tip]);
  if (!tip) return <NotFound />;
  const chapter = getChapter(tip.chapterId)!;
  const index = tips.findIndex((item) => item.id === tip.id);
  const state = progressApi.get(tip.id);
  return (
    <main className="detail-shell">
      <nav className="breadcrumbs" aria-label="面包屑"><Link to="/book">全书</Link><span>/</span><Link to={`/book/${chapter.id}`}>{chapter.title}</Link><span>/</span><span>{tip.id}</span></nav>
      <article className="tip-detail">
        <header><div><span className="tip-id">{tip.id}</span><span className={`evidence evidence-${tip.evidence.toLowerCase()}`}>证据 {tip.evidence}</span></div><p>{chapter.eyebrow} · {chapter.title}</p><h1>{tip.title}</h1><p className="detail-lead">{tip.summary}</p></header>
        <ProgressActions tip={tip} state={state} onStatus={(status) => progressApi.toggleStatus(tip.id, status)} onFavorite={() => progressApi.toggleFavorite(tip.id)} onShare={() => onShare(tip)} />
        <section className="cost-benefit"><div><span>{tip.detailStatus === "curated" ? "行动成本" : "当前状态"}</span><strong>{tip.detailStatus === "curated" ? tip.cost : "已收录 PDF 摘要"}</strong></div><div><span>{tip.detailStatus === "curated" ? "可能换回" : "下一步"}</span><strong>{tip.detailStatus === "curated" ? tip.benefit : "完整详情待核对"}</strong></div></section>
        <section className="detail-copy"><h2>{tip.detailStatus === "curated" ? "怎么做" : "当前收录情况"}</h2><p>{tip.detail}</p></section>
        <details className="source-details" open><summary>依据与来源</summary><p>{tip.detailStatus === "curated" ? "本页依据开源指南的摘要进行整理。健康、法律和政策相关内容可能随时间变化，请结合个人情况核对最新官方信息。" : "本页目前只复现 PDF 中能够确认的标题、摘要与证据等级。完整说明和原始引用请先到原项目核对，本站后续会按对应版本逐条补充。"}</p><a href={tip.source} target="_blank" rel="noreferrer">在原网站查看完整解释与来源</a></details>
      </article>
      <nav className="pager" aria-label="建议翻页">{index > 0 ? <Link to={`/tip/${tips[index - 1].id}`}>上一条：{tips[index - 1].title}</Link> : <span />}{index < tips.length - 1 ? <Link to={`/tip/${tips[index + 1].id}`}>下一条：{tips[index + 1].title}</Link> : <span />}</nav>
    </main>
  );
}

function DashboardPage({ progressApi, onShare }: { progressApi: ReturnType<typeof useLocalProgress>; onShare: (tip: Tip) => void }) {
  const marked = tips.filter((tip) => {
    const item = progressApi.get(tip.id);
    return item.status || item.favorite;
  });
  const done = tips.filter((tip) => progressApi.get(tip.id).status === "done").length;
  const todo = tips.filter((tip) => progressApi.get(tip.id).status === "todo").length;
  const favorites = tips.filter((tip) => progressApi.get(tip.id).favorite).length;
  const lastRead = getTip(readLastTipId());
  return (
    <main className="page-shell">
      <section className="page-intro"><p className="section-kicker">只属于当前浏览器</p><h1>我的行动清单</h1><p>这些标记不会上传到服务器。更换设备或清除浏览器数据后，记录会消失。</p></section>
      <section className="score-grid"><article><strong>{done}</strong><span>已做到</span></article><article><strong>{todo}</strong><span>待做</span></article><article><strong>{favorites}</strong><span>已收藏</span></article><article>{lastRead ? <Link to={`/tip/${lastRead.id}`}><strong>继续</strong><span>{lastRead.title}</span></Link> : <><strong>—</strong><span>暂无阅读记录</span></>}</article></section>
      {marked.length ? <section className="tip-grid">{marked.map((tip) => <TipCard key={tip.id} tip={tip} progressApi={progressApi} onShare={onShare} />)}</section> : <section className="empty-state"><strong>清单还是空的</strong><p>阅读建议时，可以把适合自己的标记为待做或收藏。</p><Link className="button primary" to="/book">去选一条建议</Link></section>}
    </main>
  );
}

function NotFound() {
  return <main className="page-shell"><section className="empty-state"><strong>没有找到这个页面</strong><p>链接可能已经变化，返回全书继续浏览。</p><Link className="button primary" to="/book">返回全书</Link></section></main>;
}

export default function App() {
  const progressApi = useLocalProgress();
  const { theme, toggleTheme } = useTheme();
  const [shareTip, setShareTip] = useState<Tip | null>(null);
  const closeShare = useMemo(() => () => setShareTip(null), []);
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<HomePage progressApi={progressApi} onShare={setShareTip} />} />
        <Route path="/book" element={<BookPage progressApi={progressApi} onShare={setShareTip} />} />
        <Route path="/featured" element={<BookPage featuredOnly progressApi={progressApi} onShare={setShareTip} />} />
        <Route path="/book/:chapterId" element={<ChapterPage progressApi={progressApi} onShare={setShareTip} />} />
        <Route path="/tip/:tipId" element={<TipPage progressApi={progressApi} onShare={setShareTip} />} />
        <Route path="/dashboard" element={<DashboardPage progressApi={progressApi} onShare={setShareTip} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <MobileNav />
      <ShareDialog tip={shareTip} onClose={closeShare} />
    </div>
  );
}
