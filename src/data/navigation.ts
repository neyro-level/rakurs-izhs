export interface NavigationSection {
  key: string;
  num: string;
  title: string;
  menuLabel: string;
  footerLabel: string;
  href: string;
  desc: string;
}

export const homeSections: NavigationSection[] = [
  {
    key: 'whatwedo',
    num: '01',
    title: 'С чего начать',
    menuLabel: 'С ЧЕГО НАЧАТЬ',
    footerLabel: 'С чего начать',
    href: '/#section-whatwedo',
    desc: 'Собираем решение: участок, подрядчик, смета и ипотека до начала стройки.',
  },
  {
    key: 'projects',
    num: '02',
    title: 'Проекты домов',
    menuLabel: 'ПРОЕКТЫ',
    footerLabel: 'Проекты домов',
    href: '/#section-projects',
    desc: 'Показываем, какой дом реально построить по бюджету и площади.',
  },
  {
    key: 'mortgage',
    num: '03',
    title: 'Ипотека 6%',
    menuLabel: 'ИПОТЕКА',
    footerLabel: 'Ипотека 6%',
    href: '/#section-mortgage',
    desc: 'Проверяем ипотечный сценарий до выбора подрядчика и подачи в банк.',
  },
  {
    key: 'estimate',
    num: '04',
    title: 'Разбор сметы',
    menuLabel: 'СМЕТА',
    footerLabel: 'Разбор сметы',
    href: '/#section-estimate',
    desc: 'Сравниваем сметы построчно и показываем, где скрываются доплаты.',
  },
  {
    key: 'contractors',
    num: '05',
    title: 'Выбор подрядчика',
    menuLabel: 'ПОДРЯДЧИК',
    footerLabel: 'Выбор подрядчика',
    href: '/#section-contractors',
    desc: 'Сравниваем подрядчиков по критериям, а не по обещаниям.',
  },
  {
    key: 'whyfree',
    num: '06',
    title: 'Почему для клиента без отдельной оплаты',
    menuLabel: 'ПОЧЕМУ ТАК',
    footerLabel: 'Почему без отдельной оплаты',
    href: '/#section-whyfree',
    desc: 'Объясняем модель работы Ракурс и снимаем конфликт интересов.',
  },
  {
    key: 'path',
    num: '07',
    title: 'Как работаем',
    menuLabel: 'КАК РАБОТАЕМ',
    footerLabel: 'Как работаем',
    href: '/#section-path',
    desc: 'Показываем путь от заявки до понятного решения в 4 шага.',
  },
  {
    key: 'expert',
    num: '08',
    title: 'Эксперт и отзывы',
    menuLabel: 'ЭКСПЕРТ',
    footerLabel: 'Эксперт и отзывы',
    href: '/#section-expert',
    desc: 'Артемий Никулин, кейсы и отзывы о работе Ракурс.',
  },
  {
    key: 'faq',
    num: '09',
    title: 'Вопросы и ответы',
    menuLabel: 'FAQ',
    footerLabel: 'Вопросы и ответы',
    href: '/#section-faq',
    desc: 'Закрываем главные вопросы по ипотеке, участку, смете и подрядчику.',
  },
];

export const headerNavItems = homeSections.filter((section) =>
  ['projects', 'mortgage', 'estimate', 'contractors', 'path'].includes(section.key)
);

export const footerNavLinks = homeSections.filter((section) =>
  ['whatwedo', 'projects', 'mortgage', 'estimate', 'contractors', 'whyfree', 'path', 'expert', 'faq'].includes(section.key)
);

export const routeMapSections = homeSections;

export const sitePages = [
  { title: 'Главная', href: '/' },
  { title: 'Политика конфиденциальности', href: '/politika/' },
  { title: 'Политика использования cookies', href: '/cookies/' },
  { title: 'Страница благодарности', href: '/thanks/' },
];
