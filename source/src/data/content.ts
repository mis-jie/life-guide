import catalog from "./catalog.json";

export type Evidence = "A" | "B" | "C";

export type Tip = {
  id: string;
  chapterId: string;
  title: string;
  summary: string;
  evidence: Evidence;
  cost: string;
  benefit: string;
  detail: string;
  source: string;
  detailStatus: "curated" | "summary-only";
};

export type Chapter = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  accent: string;
};

const curatedChapters: Chapter[] = [
  {
    id: "01",
    title: "不要早死",
    eyebrow: "安全与健康",
    description: "从交通、火灾和中毒等风险入手，先守住最难挽回的东西。",
    accent: "#bde85a",
  },
  {
    id: "03",
    title: "不要浪费精力",
    eyebrow: "时间与注意力",
    description: "减少打断、睡眠不足和任务切换，把有限的精力留给重要的事情。",
    accent: "#f0c85b",
  },
  {
    id: "05",
    title: "不要浪费钱",
    eyebrow: "金钱与选择",
    description: "从日常账单和常见骗局开始，减少不必要的支出和高代价决定。",
    accent: "#ef906a",
  },
  {
    id: "14",
    title: "账号与信息安全",
    eyebrow: "隐私与风险",
    description: "保护邮箱、支付和社交账号，避免一次盗号牵连全部数字资产。",
    accent: "#8dcad0",
  },
];

const curatedTips: Omit<Tip, "detailStatus">[] = [
  {
    id: "01-01",
    chapterId: "01",
    title: "系安全带，前排后排都系",
    summary: "坐前排系上安全带，出车祸时被撞死的概率大约降低一半。后排也需要系好。",
    evidence: "A",
    cost: "顺手就做",
    benefit: "显著降低致命伤风险",
    detail: "安全带不是只给前排准备的。每次上车先系好，再启动车辆；乘坐网约车和后排座位时也一样。",
    source: "https://howtolivebetter.net/book/01#01-01",
  },
  {
    id: "01-02",
    chapterId: "01",
    title: "骑摩托车、电动自行车戴头盔并扣好",
    summary: "戴头盔并把扣带扣好，事故中的死亡和头部受伤风险都会明显下降。",
    evidence: "A",
    cost: "少量花费",
    benefit: "保护头部，降低死亡风险",
    detail: "头盔必须大小合适、完整覆盖并扣紧扣带。松松垮垮地挂在头上，发生碰撞时很容易脱落。",
    source: "https://howtolivebetter.net/book/01#01-02",
  },
  {
    id: "01-03",
    chapterId: "01",
    title: "安装烟雾和一氧化碳报警器",
    summary: "能正常工作的烟雾报警器可以显著降低住宅火灾中的死亡风险。",
    evidence: "B",
    cost: "少量花费",
    benefit: "提前发现火灾和中毒风险",
    detail: "卧室外和主要生活区域应安装烟雾报警器；室内使用燃气或燃料取暖时，再增加一氧化碳报警器，并定期测试。",
    source: "https://howtolivebetter.net/book/01#01-03",
  },
  {
    id: "01-04",
    chapterId: "01",
    title: "燃气软管和灶具到期就换",
    summary: "不自己改燃气管道，设备达到使用年限后及时更换。",
    evidence: "C",
    cost: "少量花费",
    benefit: "减少燃气泄漏和火灾风险",
    detail: "定期查看软管、阀门和灶具状态。需要维修或改动时，联系正规的燃气服务单位，不自行拆改。",
    source: "https://howtolivebetter.net/book/01#01-04",
  },
  {
    id: "01-05",
    chapterId: "01",
    title: "不采、不买、不吃野生蘑菇",
    summary: "野生蘑菇很难靠外观和所谓土办法可靠辨别，有毒品种可能造成严重后果。",
    evidence: "A",
    cost: "不花钱",
    benefit: "避免食物中毒",
    detail: "颜色、虫咬、银器变色等方法都不能可靠判断蘑菇是否有毒。最稳妥的办法是不采、不买、不吃。",
    source: "https://howtolivebetter.net/book/01#01-05",
  },
  {
    id: "03-01",
    chapterId: "03",
    title: "关掉非必要通知，工作时把手机放到视线之外",
    summary: "即使没有查看手机，通知和手机本身也会占用注意力，降低任务表现。",
    evidence: "B",
    cost: "十分钟设置",
    benefit: "减少打断和注意力损耗",
    detail: "保留电话、家人和真正紧急的通知，其余应用关闭横幅和声音。需要连续思考时，把手机放进抽屉或另一个房间。",
    source: "https://howtolivebetter.net/book/03#03-01",
  },
  {
    id: "03-02",
    chapterId: "03",
    title: "固定起床时间，周末也一样",
    summary: "作息越不规律，身体的生物钟偏移越明显，学习和白天状态也更容易受到影响。",
    evidence: "B",
    cost: "需要坚持",
    benefit: "稳定睡眠节律",
    detail: "比起强迫自己立刻早睡，先固定每天起床时间更容易执行。周末与工作日尽量不要相差太多。",
    source: "https://howtolivebetter.net/book/03#03-02",
  },
  {
    id: "03-03",
    chapterId: "03",
    title: "每晚睡够 7 到 8 小时",
    summary: "长期每晚只睡 6 小时，认知表现会持续下降，而人往往察觉不到自己的退步。",
    evidence: "A",
    cost: "每天留出时间",
    benefit: "改善反应、判断和精力",
    detail: "先按起床时间倒推上床时间，为入睡预留缓冲。不要把长期疲惫当成正常状态。",
    source: "https://howtolivebetter.net/book/03#03-03",
  },
  {
    id: "03-04",
    chapterId: "03",
    title: "下午两点以后不碰咖啡因",
    summary: "睡前数小时摄入较多咖啡因，可能明显缩短实际睡眠时间。",
    evidence: "A",
    cost: "调整习惯",
    benefit: "减少咖啡因对睡眠的干扰",
    detail: "咖啡、浓茶、能量饮料和部分巧克力都可能含有咖啡因。下午需要提神时，可以先尝试走动、喝水或短暂休息。",
    source: "https://howtolivebetter.net/book/03#03-04",
  },
  {
    id: "03-05",
    chapterId: "03",
    title: "把邮件和消息改成每天固定几次批量处理",
    summary: "减少查看消息的频率，可以降低日常压力，而不一定减少实际处理的信息量。",
    evidence: "B",
    cost: "调整工作流程",
    benefit: "减少上下文切换",
    detail: "根据工作需要安排两到四个固定处理时段，并提前告诉合作伙伴真正紧急的联系方式。",
    source: "https://howtolivebetter.net/book/03#03-05",
  },
  {
    id: "05-01",
    chapterId: "05",
    title: "关掉所有自动续费，改为到期手动续",
    summary: "翻一遍常用平台的自动扣款列表，可以及时停止早已不用的订阅。",
    evidence: "C",
    cost: "约二十分钟",
    benefit: "减少长期小额浪费",
    detail: "依次检查支付平台、手机系统和常用应用的自动续费。真正需要的服务到期后再手动续，不需要的立即关闭。",
    source: "https://howtolivebetter.net/book/05#05-01",
  },
  {
    id: "05-02",
    chapterId: "05",
    title: "每年按时办理个税汇算",
    summary: "换过工作、只工作几个月或漏填专项附加扣除的人，可能通过年度汇算退税。",
    evidence: "A",
    cost: "十几分钟",
    benefit: "避免多缴税款",
    detail: "在官方个人所得税应用中核对收入、已缴税款和专项附加扣除。涉及政策时，以当年的官方说明为准。",
    source: "https://howtolivebetter.net/book/05#05-02",
  },
  {
    id: "05-03",
    chapterId: "05",
    title: "先查清公积金可以用于哪些支出",
    summary: "公积金的提取范围不只有买房，具体用途应按所在地的现行规定核对。",
    evidence: "A",
    cost: "查询和办理时间",
    benefit: "盘活已有账户资金",
    detail: "不同地区的提取条件和材料可能不同。需要租房、装修或支付相关住房费用时，先查询当地公积金中心的最新规则。",
    source: "https://howtolivebetter.net/book/05#05-03",
  },
  {
    id: "05-04",
    chapterId: "05",
    title: "每年重算一次手机和宽带套餐",
    summary: "长期使用的老套餐可能比当前在售套餐更贵，定期核对可以减少固定支出。",
    evidence: "A",
    cost: "半小时以内",
    benefit: "每年节省固定通信费用",
    detail: "查看实际使用的流量、通话和宽带速度，取消不需要的附加服务。办理前确认优惠期和违约条件。",
    source: "https://howtolivebetter.net/book/05#05-04",
  },
  {
    id: "05-05",
    chapterId: "05",
    title: "不买彩票",
    summary: "彩票奖金只占销售额的一部分，长期参与的平均回报低于投入。",
    evidence: "A",
    cost: "不花钱",
    benefit: "避免负期望支出",
    detail: "把购买彩票当成投资并不合适。若只是娱乐，也应该预先设置不会影响生活的极低上限。",
    source: "https://howtolivebetter.net/book/05#05-05",
  },
  {
    id: "14-01",
    chapterId: "14",
    title: "邮箱、支付和社交账号都开启二次验证",
    summary: "登录时增加第二次确认，可以拦住大量仅凭密码进行的盗号尝试。",
    evidence: "A",
    cost: "十分钟设置",
    benefit: "显著提升账号安全",
    detail: "优先使用设备弹窗或验证器应用，其次再使用短信验证码。保存恢复代码，但不要把它和密码放在同一个地方。",
    source: "https://howtolivebetter.net/book/14#14-01",
  },
  {
    id: "14-02",
    chapterId: "14",
    title: "邮箱密码单独设置，不和任何网站重复",
    summary: "邮箱可以重置许多其他账号的密码，一旦失守，影响范围会迅速扩大。",
    evidence: "C",
    cost: "十分钟设置",
    benefit: "保护全部关联账号",
    detail: "为主邮箱设置独立且足够长的密码，并配合密码管理器使用。不要把常用网站密码复制给邮箱。",
    source: "https://howtolivebetter.net/book/14#14-02",
  },
  {
    id: "14-03",
    chapterId: "14",
    title: "手机设置锁屏密码，SIM 卡设置 PIN 码",
    summary: "手机遗失后，锁屏和 SIM 卡 PIN 可以增加他人获取短信验证码的难度。",
    evidence: "C",
    cost: "几分钟设置",
    benefit: "降低丢手机后的盗号风险",
    detail: "设置不容易猜中的锁屏密码，并记录自己的 SIM 卡 PIN 和运营商客服电话。输错 PIN 多次会锁卡，操作前先确认规则。",
    source: "https://howtolivebetter.net/book/14#14-03",
  },
  {
    id: "14-04",
    chapterId: "14",
    title: "手机丢失后按固定顺序处理",
    summary: "先挂失 SIM 卡，再远程锁定设备、修改关键密码、报警并联系银行。",
    evidence: "C",
    cost: "立即行动",
    benefit: "缩小信息和资金损失",
    detail: "提前记下运营商、银行和设备查找服务的入口。真正丢失时按清单处理，可以避免在慌乱中遗漏关键步骤。",
    source: "https://howtolivebetter.net/book/14#14-04",
  },
  {
    id: "14-05",
    chapterId: "14",
    title: "银行卡被盗刷，先冻结再报警并联系银行",
    summary: "发现异常交易后立即止损，保留时间线、通知记录和报警材料。",
    evidence: "A",
    cost: "立即处理",
    benefit: "减少继续损失，保留追偿证据",
    detail: "先通过官方渠道挂失或冻结，再报警并向银行提交异议。不要通过陌生短信或搜索广告中的电话处理。",
    source: "https://howtolivebetter.net/book/14#14-05",
  },
];

const chapterEyebrow = (id: string) => {
  const number = Number(id);
  if (number <= 2) return "安全与健康";
  if (number <= 6) return "时间与金钱";
  if (number <= 9) return "保障与法律";
  if (number <= 12) return "关系与事业";
  if (number <= 14) return "应急与信息";
  if (number <= 16) return "住房与医疗";
  if (number <= 20) return "家庭与照护";
  if (number <= 24) return "出行与生活";
  if (number <= 28) return "事务与身体";
  if (number <= 32) return "恢复与成长";
  return "健康与支持";
};

const accentPalette = [
  "#bde85a",
  "#8dcad0",
  "#f0c85b",
  "#d99bd3",
  "#ef906a",
  "#84b995",
  "#c7a4ef",
  "#e6ac6d",
];

const curatedChapterMap = new Map(curatedChapters.map((chapter) => [chapter.id, chapter]));

export const chapters: Chapter[] = catalog.chapters.map((chapter) => {
  const curated = curatedChapterMap.get(chapter.id);
  return {
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
    eyebrow: curated?.eyebrow ?? chapterEyebrow(chapter.id),
    accent: curated?.accent ?? accentPalette[(Number(chapter.id) - 1) % accentPalette.length],
  };
});

const curatedTipMap = new Map(curatedTips.map((tip) => [tip.id, tip]));

export const tips: Tip[] = catalog.tips.map((catalogTip) => {
  const curated = curatedTipMap.get(catalogTip.id);
  if (curated) {
    return {
      ...curated,
      title: catalogTip.title,
      summary: catalogTip.summary,
      evidence: catalogTip.evidence as Evidence,
      detailStatus: "curated",
    };
  }

  return {
    id: catalogTip.id,
    chapterId: catalogTip.chapterId,
    title: catalogTip.title,
    summary: catalogTip.summary,
    evidence: catalogTip.evidence as Evidence,
    cost: "待核对完整条目",
    benefit: "先参考摘要判断",
    detail: "当前页面已完整收录 PDF 中的标题、要点摘要与证据等级。行动成本、可能收益、适用条件和原始依据尚未从对应版本逐条核对，因此这里不补写未经确认的信息。",
    source: `https://howtolivebetter.net/book/${catalogTip.chapterId}#${catalogTip.id}`,
    detailStatus: "summary-only",
  };
});

export const getChapter = (id: string) => chapters.find((chapter) => chapter.id === id);
export const getChapterTips = (id: string) => tips.filter((tip) => tip.chapterId === id);
export const getTip = (id: string) => tips.find((tip) => tip.id === id);
