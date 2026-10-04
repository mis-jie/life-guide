import { guideMeta } from "../data/content";

export function VersionPage() {
  return (
    <main className="detail-shell">
      <section className="page-intro"><p className="section-kicker">版本与声明</p><h1>这份网站内容从哪里来</h1><p>本站固定复刻提交 {guideMeta.version} 的 34 章、649 条建议，不会随原项目后续更新自动变化。</p></section>
      <article className="policy-copy">
        <h2>固定版本</h2><p>完整提交号：<code>{guideMeta.commit}</code>。网站通过本地导入脚本读取该提交的 34 个章节文件，并校验 A/B/C、性价比、争议和待核实数量。</p>
        <h2>内容许可与改编</h2><p>原始内容来自 <a href={guideMeta.sourceRepository} target="_blank" rel="noreferrer">eternity4719／HowToLiveBetter</a>，正文按 <a href="https://creativecommons.org/licenses/by/4.0/deed.zh-hans" target="_blank" rel="noreferrer">CC BY 4.0</a> 使用。本站改变了页面布局、导航和交互，未把本站样式冒充为原作者设计。</p>
        <h2>风险提示</h2><p>固定版本内有 65 条争议标记和 3 处待核实。医疗、法律、金融和政策信息可能变化，也可能不适合你的具体情况；行动前应核对最新官方材料，必要时咨询合格专业人士。</p>
        <h2>隐私</h2><p>本站没有注册、登录、后端和数据库。收藏、待做、已做到、最近阅读位置和主题设置只保存在你当前浏览器的 localStorage 中，不会上传到服务器；清除浏览器数据后会消失。</p>
      </article>
    </main>
  );
}
