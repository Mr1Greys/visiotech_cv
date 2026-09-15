import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CirclePlay,
  Clock3,
  ExternalLink,
  Menu,
  Minus,
  MoveRight,
  Play,
  Plus,
  ScanLine,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';

const navItems = [
  { label: 'Продукт', href: '#product' },
  { label: 'Кейсы', href: '#cases' },
  { label: 'Как работает', href: '#how' },
  { label: 'Цены', href: '#pricing' },
];

const reasons = [
  {
    number: '01',
    title: 'Считает каждую позицию отдельно',
    text: 'Три шаурмы за 30 секунд — это три независимых трека, а не одно размазанное событие.',
    meta: 'TRACKING / MULTI-OBJECT',
    accent: 'mint',
  },
  {
    number: '02',
    title: 'Не путает открытое с готовым',
    text: 'Система ждёт физического изменения объекта при сворачивании, а не верит случайной метке.',
    meta: 'STATE / OPEN → CLOSED',
    accent: 'orange',
  },
  {
    number: '03',
    title: 'Не считает фоновый шум',
    text: 'Аномально долгий объект становится фоном и не портит итоговую цифру незаметно.',
    meta: 'FILTER / ANOMALY',
    accent: 'mint',
  },
  {
    number: '04',
    title: 'Переживает руки повара',
    text: 'Короткое перекрытие не сбрасывает трек и не создаёт дубль — объект восстанавливается.',
    meta: 'OCCLUSION / RECOVERY',
    accent: 'orange',
  },
  {
    number: '05',
    title: 'Работает на том, что уже стоит',
    text: 'Сначала проверяем вашу текущую камеру. Если ракурс не подходит — честно скажем это.',
    meta: 'INPUT / EXISTING CAMERA',
    accent: 'mint',
  },
  {
    number: '06',
    title: 'Считает продукцию, не людей',
    text: 'Без распознавания лиц и слежки за персоналом. Только событие появления готовой позиции.',
    meta: 'PRIVACY / BY DESIGN',
    accent: 'orange',
  },
];

const cases = [
  {
    id: 'shawarma',
    eyebrow: 'Проверено на реальной точке',
    title: 'Шаурма',
    subtitle: 'Переход «открыта → завёрнута» на каждом треке отдельно.',
    detail: 'Даже когда повар ведёт 3–4 позиции одновременно.',
    count: '08',
    status: 'CONFIRMED',
    color: 'mint',
  },
  {
    id: 'hookah',
    eyebrow: 'Проверено на реальной точке',
    title: 'Кальянная',
    subtitle: 'Подсчёт забитых чаш в фиксированной рабочей зоне мастера.',
    detail: 'С привязкой к смене, зоне и мастеру.',
    count: '14',
    status: 'TRACKING',
    color: 'orange',
  },
  {
    id: 'kitchen',
    eyebrow: 'Проверено на реальной точке',
    title: 'Кухня',
    subtitle: 'Каждое блюдо с раздачи — событие с таймкодом.',
    detail: 'Сверка результата с чеками и сменными отчётами.',
    count: '32',
    status: 'SYNCED',
    color: 'mint',
  },
];

const processSteps = [
  ['01', 'Скажите, что считать', '«Хочу считать шаурму на точке на Ленинском». Одной фразы достаточно.'],
  ['02', 'Пришлите короткий ролик', 'Файл или ссылка с существующей камеры. Ничего устанавливать не нужно.'],
  ['03', 'Мы оценим камеру', 'Проверим угол, свет, перекрытия и зону подсчёта. Честно ответим, получится ли.'],
  ['04', 'Предложим схему запуска', 'Обработка на мини-ПК на точке или в облаке — в зависимости от потока.'],
  ['05', 'Настроим счётчик', 'Модель дообучается под ваш угол, освещение и конкретную позицию.'],
  ['06', 'Счёт пошёл', 'Цифры в реальном времени, отчёты по сменам и сверка с кассой.'],
];

const faqItems = [
  ['Нужно ли покупать новую камеру?', 'Нет. Сначала проверяем ту, что уже установлена. Если ракурс, свет и поток подходят — используем существующую камеру.'],
  ['Работает ли с любой камерой или видеорегистратором?', 'Нам нужен доступный видеопоток: RTSP напрямую с камеры или через NVR. Совместимость проверяем на вашем коротком ролике.'],
  ['Что если слабый интернет или нет статического IP?', 'Можно считать локально на мини-ПК на точке. В таком сценарии стабильный внешний IP не нужен.'],
  ['Что считается одной позицией для оплаты?', 'Одна позиция — это один тип продукции, которому модель нужно научиться узнавать: шаурма, пита и кальян — разные позиции.'],
  ['Вы видите лица персонала?', 'Нет. Продукт считает готовую продукцию, а не людей. Распознавание лиц не входит в задачу и не требуется для работы счётчика.'],
  ['Как работает бесплатная проверка?', 'Вы присылаете короткое видео с рабочей зоны. Мы оцениваем ракурс и показываем, получится ли считать именно ваш процесс.'],
  ['Если на точке несколько цехов или станций?', 'Можно подключить несколько камер и считать разные зоны. Стоимость управляемого сервиса зависит от камер, а не от числа позиций.'],
];

function Tag({ children, orange = false }: { children: ReactNode; orange?: boolean }) {
  return <span className={`eyebrow ${orange ? 'eyebrow-orange' : ''}`}>{children}</span>;
}

function CornerBox({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`corner-box ${className}`}>{children}</div>;
}

function ArrowLink({ children, href = '#contact', orange = false }: { children: ReactNode; href?: string; orange?: boolean }) {
  return (
    <a className={`text-link ${orange ? 'text-link-orange' : ''}`} href={href}>
      {children}
      <ArrowUpRight size={15} strokeWidth={1.8} />
    </a>
  );
}

function SectionHeading({
  tag,
  title,
  copy,
  id,
  orange = false,
}: {
  tag: string;
  title: ReactNode;
  copy?: string;
  id?: string;
  orange?: boolean;
}) {
  return (
    <div className="section-heading" id={id}>
      <Tag orange={orange}>{tag}</Tag>
      <h2 className="section-title">{title}</h2>
      {copy && <p className="section-heading-copy">{copy}</p>}
    </div>
  );
}

function DetectorPreview({ selectedCase }: { selectedCase: (typeof cases)[number] }) {
  const isHookah = selectedCase.id === 'hookah';
  const isKitchen = selectedCase.id === 'kitchen';
  return (
    <CornerBox className={`detector-preview detector-preview-${selectedCase.color}`}>
      <div className="preview-topbar">
        <span className="preview-file">LIVE / {selectedCase.id.toUpperCase()}_CAM_04</span>
        <span className="preview-record"><span className="live-dot" /> REC 00:24:18</span>
      </div>
      <div className="camera-screen preview-scene">
        <div className="scene-glow" />
        <div className="scene-table" />
        <div className="scene-object object-one" />
        <div className="scene-object object-two" />
        <div className="scene-object object-three" />
        <div className="scene-hand" />
        <div className="detector-frame frame-one" />
        <div className="detector-frame frame-two orange" />
        <div className="detector-label label-one">{isHookah ? 'BOWL / 0.97' : isKitchen ? 'PLATE / 0.96' : 'CLOSED / 0.94'}</div>
        <div className="detector-label label-two">{isHookah ? 'TRACK #042' : isKitchen ? 'TRACK #605' : 'OPEN / 0.91'}</div>
        <div className="scan-line" />
        <div className="preview-coordinates">x: 428&nbsp;&nbsp; y: 184&nbsp;&nbsp; w: 206&nbsp;&nbsp; h: 118</div>
      </div>
      <div className="preview-readout">
        <div>
          <span className="readout-label">ГОТОВО</span>
          <strong>{selectedCase.count}</strong>
        </div>
        <div className="readout-divider" />
        <div className="readout-status">
          <span className="readout-label">СОСТОЯНИЕ</span>
          <span className={`status-value status-${selectedCase.color}`}><span />{selectedCase.status}</span>
        </div>
        <span className="preview-confidence">CONFIDENCE 94%</span>
      </div>
    </CornerBox>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(cases[0]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container-wide header-inner">
          <a className="brand" href="#" aria-label="visiotech_cv — на главную">
            visiotech<span>_cv</span>
          </a>
          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
            {navItems.map((item) => (
              <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            ))}
            <button className="mobile-nav-cta" onClick={scrollToContact}>Проверить камеру <ArrowUpRight size={14} /></button>
          </nav>
          <button className="header-cta" onClick={scrollToContact}>Проверить мою камеру <ArrowUpRight size={15} /></button>
          <button className="menu-toggle" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      <main>
        <section className={`hero ${heroReady ? 'hero-ready' : ''}`}>
          <div className="hero-grid" />
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="container-wide hero-inner">
            <div className="hero-copy">
              <div className="hero-kicker"><span className="live-dot" /> ВИДЕОАНАЛИТИКА ДЛЯ HORECA <span className="kicker-line" /></div>
              <h1>Ваша камера<br />уже видит всё.<br /><em>Мы это считаем.</em></h1>
              <p className="hero-subtitle">Превращаем существующую камеру на точке в систему подсчёта производства — шаурма, кальян, блюда с кухни — и показываем разрыв с кассой цифрой, а не догадкой.</p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={scrollToContact}>Проверить мою камеру <ArrowUpRight size={16} /></button>
                <a className="btn-outline" href="#demo"><CirclePlay size={16} /> Смотреть, как это работает</a>
              </div>
              <div className="hero-note"><ShieldCheck size={14} /> Бесплатная оценка по вашему видео <span /> ничего покупать не нужно</div>
            </div>
            <div className="hero-visual">
              <div className="hero-visual-meta"><span>VISION / PROD-COUNT v2.4</span><span>CAM_04 / ONLINE</span></div>
              <CornerBox className="hero-camera">
                <div className="camera-screen hero-scene">
                  <div className="hero-kitchen-light" />
                  <div className="hero-counter" />
                  <div className="hero-food hero-food-a" />
                  <div className="hero-food hero-food-b" />
                  <div className="hero-food hero-food-c" />
                  <div className="hero-arm" />
                  <div className="detector-frame hero-frame-a" />
                  <div className="detector-frame orange hero-frame-b" />
                  <div className="detector-frame hero-frame-c" />
                  <span className="scene-chip chip-a">OPEN <b>0.91</b></span>
                  <span className="scene-chip chip-b">CLOSED <b>0.94</b></span>
                  <span className="scene-chip chip-c">TRACK #042</span>
                  <div className="hero-scan scan-line" />
                  <div className="hero-timestamp"><Clock3 size={12} /> 14:32:08.042</div>
                </div>
                <div className="hero-readout">
                  <div className="readout-main"><span>ГОТОВО</span><strong>08</strong></div>
                  <div className="hero-readout-middle"><span>ПОТОК</span><b><i /> STABLE</b></div>
                  <div className="hero-readout-right"><span>ТОЧНОСТЬ</span><b>94.2%</b></div>
                </div>
              </CornerBox>
              <div className="hero-float-tag"><span className="live-dot" /> LIVE DETECTION <b>✓</b></div>
              <div className="hero-visual-foot"><span>LOCAL STREAM / RTSP</span><span>NO FACE DATA</span></div>
            </div>
          </div>
          <div className="hero-bottom container-wide">
            <span>Камера остаётся вашей</span>
            <span className="hero-bottom-line" />
            <span>Результат становится измеримым</span>
            <ArrowDownRight size={17} />
          </div>
        </section>

        <section className="gap-section section-pad" id="product">
          <div className="container-wide">
            <SectionHeading tag="Разрыв между цехом и кассой" title={<>Продукция уходит весь день.<br /><em>Вы уверены, что вся?</em></>} copy="Большинство владельцев не имеют объективного способа это проверить. Тетрадка смены и учёт со слов — это не система, а доверие. Разрыв почти никогда не про злой умысел. Это погрешность ручного подсчёта на загруженной смене." />
            <div className="gap-layout">
              <div className="gap-visual">
                <div className="gap-visual-head"><span>SHIFT CONTROL / 01</span><b>НЕЗАВИСИМЫЙ УЧЁТ</b></div>
                <div className="gap-legend"><span className="legend-made"><i /> ГОТОВО НА ТОЧКЕ</span><span className="legend-pos"><i /> ПРОВЕДЕНО ПО КАССЕ</span></div>
                <div className="gap-label label-made"><span>СДЕЛАНО</span><b>146</b><small>позиций</small></div>
                <div className="gap-line gap-line-made"><span /></div>
                <div className="gap-label label-pos"><span>ПО КАССЕ</span><b>124</b><small>позиций</small></div>
                <div className="gap-line gap-line-pos"><span /></div>
                <div className="gap-difference"><span>НЕ УЧТЕНО</span><strong>22</strong><small>ПОЗИЦИИ</small></div>
                <div className="gap-grid-art" />
                <div className="gap-foot"><span>СМЕНА / 12:00—23:00</span><b>UNACCOUNTED OUTPUT</b></div>
              </div>
              <div className="metric-stack">
                <div className="metric-stack-head"><span>ЧТО МЕНЯЕТСЯ ПОСЛЕ ЗАПУСКА</span><b>03 SIGNALS</b></div>
                <CornerBox className="metric-card metric-card-orange"><span className="metric-index">01 / РИСК ПОТЕРЬ</span><strong>до 15<span>%</span></strong><p>типичное расхождение между приготовленным и проведённым по кассе без независимого учёта*</p><ArrowDownRight size={18} /></CornerBox>
                <CornerBox className="metric-card metric-card-mint"><span className="metric-index">02 / СЦЕНАРИИ</span><strong>6<span>+</span></strong><p>сценариев подсчёта: шаурма, кальян, кухня и другие рабочие зоны</p><ArrowDownRight size={18} /></CornerBox>
                <CornerBox className="metric-card metric-card-dark"><span className="metric-index">03 / ОБОРУДОВАНИЕ</span><strong>0 ₽</strong><p>на новое оборудование, если камера на точке уже подходит для задачи</p><ArrowDownRight size={18} /></CornerBox>
              </div>
            </div>
            <p className="footnote">* Оценка по отраслевым данным HoReCa. Точная цифра для вашей точки считается во время бесплатной оценки.</p>
          </div>
        </section>

        <section className="proof-section section-pad">
          <div className="container-wide">
            <div className="proof-head">
              <SectionHeading tag="Почему не ошибается" title={<>Не магия.<br /><em>Инженерия.</em></>} copy="Каждая функция отвечает на конкретный сбой, который происходит на реальной загруженной смене." />
              <div className="proof-side-note"><ScanLine size={16} /><span>MODEL LOG<br /><b>ALL SYSTEMS NOMINAL</b></span></div>
            </div>
            <div className="reason-grid">
              {reasons.map((reason) => (
                <CornerBox className={`reason-card reason-${reason.accent}`} key={reason.number}>
                  <div className="reason-top"><span>{reason.number}</span><span className="reason-meta">{reason.meta}</span></div>
                  <div className="reason-icon">{reason.accent === 'mint' ? <ScanLine size={20} /> : <Zap size={20} />}</div>
                  <h3>{reason.title}</h3>
                  <p>{reason.text}</p>
                  <div className="reason-track"><span /><span /><span /><span /><span /></div>
                </CornerBox>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section section-pad" id="how">
          <div className="container-wide">
            <SectionHeading tag="Как это происходит" title={<>От короткого видео<br /><em>до счёта в смене.</em></>} copy="Не продаём коробку и не просим перестраивать точку. Сначала смотрим на ваш реальный процесс, затем собираем схему вокруг него." />
            <div className="process-list">
              {processSteps.map(([number, title, text], index) => (
                <div className="process-row" key={number}>
                  <div className="process-number">{number}</div>
                  <div className="process-marker"><span /><i /></div>
                  <div className="process-content"><h3>{title}</h3><p>{text}</p></div>
                  <span className="process-arrow">{index === processSteps.length - 1 ? <Check size={17} /> : <ArrowUpRight size={17} />}</span>
                </div>
              ))}
            </div>
            <div className="process-quote"><span>“</span><p>Это не покупка AI-проекта — это управляемый сервис подсчёта, построенный вокруг камеры, которая у вас уже есть.</p><span>”</span></div>
          </div>
        </section>

        <section className="cases-section section-pad" id="cases">
          <div className="container-wide">
            <div className="cases-header"><SectionHeading tag="Где уже работает" title={<>Одна логика.<br /><em>Разные цеха.</em></>} /><p>Считаем то, что напрямую связано с выручкой. Открытый список сценариев — под задачу, ракурс и реальный процесс на точке.</p></div>
            <div className="case-tabs" role="tablist">
              {cases.map((item) => <button key={item.id} className={`case-tab ${activeCase.id === item.id ? 'active' : ''}`} onClick={() => setActiveCase(item)} role="tab" aria-selected={activeCase.id === item.id}><span>{item.title}</span><ChevronRight size={16} /></button>)}
            </div>
            <div className="case-feature">
              <div className="case-copy">
                <Tag orange={activeCase.color === 'orange'}>{activeCase.eyebrow}</Tag>
                <h3>{activeCase.title}</h3>
                <p className="case-subtitle">{activeCase.subtitle}</p>
                <p className="muted-copy">{activeCase.detail}</p>
                <div className="case-log"><span>EVENT LOG</span><b>14:32:08</b><span className="log-confirmed">✓ {activeCase.status}</span></div>
                <ArrowLink href="#contact">Прислать пример видео</ArrowLink>
              </div>
              <DetectorPreview selectedCase={activeCase} />
            </div>
            <div className="candidate-line"><span>ТОТ ЖЕ ПОДХОД, ДРУГИЕ ЗАДАЧИ</span><p>Кофейня <i /> Пекарня <i /> Фастфуд <i /> Бар <i /> Доставка</p><ArrowLink href="#contact">Обсудить свою задачу</ArrowLink></div>
          </div>
        </section>

        <section className="demo-section section-pad" id="demo">
          <div className="container-wide demo-grid">
            <div className="demo-copy"><Tag>Реальные кадры, реальный счёт</Tag><h2 className="section-title">Не рендер.<br /><em>Настоящая точка.</em></h2><p className="muted-copy">Система должна выдерживать не идеальный лабораторный свет, а руки повара, три объекта одновременно и случайную ошибку модели. Поэтому показываем саму механику счёта.</p><div className="demo-points"><span><Check size={14} /> 3 позиции → посчитано 3</span><span><Check size={14} /> перекрытие рукой → трек не сбился</span><span><Check size={14} /> ошибка метки → не засчитано</span></div><ArrowLink href="#contact" orange>Прислать своё видео на проверку</ArrowLink></div>
            <div className="demo-console corner-box">
              <div className="console-top"><span><span className="live-dot" /> DETECTION / LIVE</span><span>FPS 24.0 <i /> LATENCY 84ms</span></div>
              <div className="console-body"><div className="console-big-count">03<small> / 03</small></div><div className="console-label">CONFIRMED OUTPUT</div><div className="console-wave"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="console-events"><span><b>14:32:06</b> track #042 <em>OPEN</em></span><span><b>14:32:07</b> occlusion <em className="orange-text">RECOVERED</em></span><span><b>14:32:08</b> track #042 <em>CLOSED</em></span></div></div><div className="console-bottom"><span>MODEL: prod-count/v2.4</span><span>PRIVACY MODE: ACTIVE</span><ShieldCheck size={14} /></div>
            </div>
          </div>
        </section>

        <section className="compat-section section-pad">
          <div className="container-wide compat-grid">
            <div><SectionHeading tag="Подходит ли ваша точка" title={<>Пять вещей,<br /><em>которые уже есть.</em></>} copy="Не нужно закрывать все пункты сразу. Часть зависит от того, как в итоге будет развёрнута система." /></div>
            <div className="compat-list">
              {['У вас уже есть камера', 'Камера видит рабочую зону', 'В зоне достаточно света', 'Ракурс сверху или под углом', 'Поток доступен по RTSP / NVR'].map((item, index) => <div className="compat-item" key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p><Check size={17} /></div>)}
              <div className="compat-foot"><span>НЕ УВЕРЕНЫ?</span><button onClick={scrollToContact}>Пришлите короткое видео <ArrowUpRight size={15} /></button></div>
            </div>
          </div>
        </section>

        <section className="pricing-section section-pad" id="pricing">
          <div className="container-wide">
            <SectionHeading tag="Прозрачное ценообразование" title={<>Бесплатно — сначала.<br /><em>Потом два этапа.</em></>} copy="Вы платите не за обещание, а за понятный результат: сначала проверка, затем обучение позиции и работа системы." />
            <div className="pricing-grid">
              <CornerBox className="price-card price-free"><span className="price-step">ШАГ 01 / БЕСПЛАТНО</span><h3>Проверка камеры</h3><strong>0 ₽</strong><p>Честный ответ, получится ли на вашем видео. Короткий демо-ролик с подсчётом. Без обязательств.</p><ArrowLink href="#contact">Начать с проверки</ArrowLink></CornerBox>
              <CornerBox className="price-card price-training"><span className="price-step">ШАГ 02 / РАЗОВО</span><h3>Обучение счётчика</h3><strong>от 25 000 <small>₽ / позиция</small></strong><p>Настройка под вашу камеру и освещение. Чем больше позиций — тем дешевле каждая.</p><ArrowLink href="#contact">Обсудить задачу</ArrowLink></CornerBox>
              <CornerBox className="price-card price-service"><span className="price-step">ШАГ 03 / ЗАПУСК</span><h3>Работа системы</h3><strong>от 8 000 <small>₽ / мес</small></strong><p>Или 0 ₽/мес на своём сервере. Под управлением — мониторинг, отчёты, алерты и поддержка.</p><ArrowLink href="#contact" orange>Проверить мою камеру</ArrowLink></CornerBox>
            </div>
          </div>
        </section>

        <section className="faq-section section-pad">
          <div className="container-wide faq-grid">
            <div><Tag>Частые вопросы</Tag><h2 className="section-title">Честно отвечаем<br /><em>до запуска.</em></h2><p className="muted-copy">Если вопроса нет в списке — задайте его в форме. Ответим в течение одного рабочего дня.</p></div>
            <div className="faq-list">
              {faqItems.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}><span>{question}</span>{openFaq === index ? <Minus size={17} /> : <Plus size={17} />}</button>{openFaq === index && <p>{answer}</p>}</div>)}
            </div>
          </div>
        </section>

        <section className="contact-section section-pad" id="contact">
          <div className="container-wide contact-grid">
            <div className="contact-copy"><Tag orange>Начать с видео</Tag><h2 className="section-title">Дайте камере<br /><em>новую работу.</em></h2><p className="muted-copy">Пришлите короткий ролик с рабочей зоны. Мы проверим ракурс, покажем, что можно считать, и предложим честную схему запуска.</p><div className="contact-meta"><span><Clock3 size={15} /> Ответим в течение 1 рабочего дня</span><span><ShieldCheck size={15} /> Без спама и обязательств</span></div></div>
            <CornerBox className="lead-form-box">
              {submitted ? <div className="form-success"><div className="success-mark"><Check size={25} /></div><Tag>Заявка отправлена</Tag><h3>Спасибо. Видео уже в очереди.</h3><p>Мы свяжемся с вами в течение одного рабочего дня и подскажем, как лучше проверить точку.</p><button className="btn-outline" onClick={() => setSubmitted(false)}>Отправить ещё одну заявку</button></div> : <form ref={formRef} onSubmit={handleSubmit}><div className="form-head"><span>NEW REQUEST / 01</span><span>FREE ASSESSMENT</span></div><div className="form-row"><label>Имя<input className="input-dark" name="name" required placeholder="Как к вам обращаться?" /></label><label>Название точки / сети<input className="input-dark" name="company" required placeholder="Например, «Шаурма №1»" /></label></div><label>Что хотите считать?<textarea className="input-dark" name="task" required placeholder="Шаурму, чаши, блюда с раздачи..." /></label><div className="form-row"><label>Город<input className="input-dark" name="city" placeholder="Москва" /></label><label>Количество точек<input className="input-dark" name="locations" type="number" min="1" placeholder="1" /></label></div><div className="form-row"><label>Email<input className="input-dark" name="email" type="email" required placeholder="name@company.ru" /></label><label>Telegram / WhatsApp<input className="input-dark" name="contact" placeholder="@username или номер" /></label></div><label>Ссылка на видео <span className="optional">(опционально)</span><input className="input-dark" name="video" type="url" placeholder="https://disk.yandex.ru/..." /></label><button className="btn-primary form-submit" type="submit">Отправить заявку <ArrowUpRight size={16} /></button><p className="form-legal">Нажимая кнопку, вы соглашаетесь на обработку заявки. Никаких рассылок.</p></form>}
            </CornerBox>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container-wide footer-main"><div><a className="brand" href="#">visiotech<span>_cv</span></a><p>Видеоаналитика для HoReCa<br />на камерах, которые у вас уже есть.</p></div><div className="footer-nav"><span>НАВИГАЦИЯ</span>{navItems.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div><div className="footer-nav"><span>КОНТАКТЫ</span><a href="#contact">Telegram <ExternalLink size={12} /></a><a href="#contact">WhatsApp <ExternalLink size={12} /></a><a href="#contact">hello@visiotech.cv <ExternalLink size={12} /></a></div><div className="footer-cta"><span>Готовы увидеть свою цифру?</span><button onClick={scrollToContact}>Проверить камеру <MoveRight size={15} /></button></div></div>
        <div className="container-wide footer-bottom"><span>© 2026 visiotech_cv</span><span>PRODUCTION COUNTING / RU</span><span>NO FACE DATA / BY DESIGN</span></div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={Home} />
      </Switch>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}