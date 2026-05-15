export const fallbackIssues = [
  {
    id: 'issue-1',
    num: 1,
    title: 'Build. Learn. Create.',
    subtitle: 'Premiere issue',
    date_label: 'April 2026',
    description:
      'A practical hobby issue covering budget PC builds, first planted tanks, creator setup basics, and data analysis workflows.',
    digital_url: '#',
    html_url: '',
    cover_url: '',
    published: true,
    tags: ['Tech', 'Aquascaping', 'YouTube', 'Data'],
    hotspots: [
      { id: 'hs-1', x_pct: 30, y_pct: 38, label: 'PC build checklist', url: '#', description: 'Parts and budget notes' },
      { id: 'hs-2', x_pct: 66, y_pct: 58, label: 'Tank setup', url: '#', description: 'Beginner aquascaping path' },
    ],
    articles: [
      {
        id: 'art-1',
        category: 'Tech and DIY',
        title: 'Build a High-Performance Gaming PC Under INR 50,000',
        description: 'A focused component guide for a capable first gaming and creator machine.',
        color_accent: 'green',
        page_num: 12,
      },
      {
        id: 'art-2',
        category: 'Data Analysis',
        title: 'Retail Insights Using Real-World Data',
        description: 'From raw CSV files to decisions, charts, and useful dashboard views.',
        color_accent: 'blue',
        page_num: 24,
      },
      {
        id: 'art-3',
        category: 'Aquascaping',
        title: 'Your First Planted Tank',
        description: 'Substrate, lighting, plant choices, and a patient setup routine.',
        color_accent: 'yellow',
        page_num: 34,
      },
    ],
  },
];

export const fallbackQuestions = [
  {
    id: 'q-yt-1',
    category: 'yt',
    question: 'Which metric best shows how well a video keeps viewers engaged?',
    options: ['Impressions', 'Average view duration', 'Upload time', 'Thumbnail size'],
    correct_idx: 1,
    explanation: 'Average view duration shows how long viewers stay with the content.',
    option_explanations: [
      'Impressions show reach, not how long viewers stayed.',
      'Correct. Average view duration measures how long viewers stay engaged.',
      'Upload time can help scheduling, but it is not an engagement metric.',
      'Thumbnail size is not a viewer-retention signal.',
    ],
  },
  {
    id: 'q-yt-2',
    category: 'yt',
    question: 'What should a strong creator setup improve first?',
    options: ['Audio clarity', 'Desk color', 'Cable length', 'Monitor brand'],
    correct_idx: 0,
    explanation: 'Clear audio usually improves perceived quality faster than visual upgrades.',
    option_explanations: [
      'Correct. Clean audio makes content feel more professional immediately.',
      'Desk color can help the set, but it is not the first quality upgrade.',
      'Cable length is only useful if it fixes a specific setup problem.',
      'Monitor brand does not matter to viewers as much as clear sound.',
    ],
  },
  {
    id: 'q-aq-1',
    category: 'aq',
    question: 'Why do planted tanks need a stable light schedule?',
    options: ['To heat the water', 'To control algae and plant growth', 'To replace filtration', 'To lower pH instantly'],
    correct_idx: 1,
    explanation: 'Consistent lighting helps plants grow while reducing algae swings.',
    option_explanations: [
      'Aquarium lights are not meant to heat the water.',
      'Correct. A steady light schedule balances plant growth and algae control.',
      'Lighting cannot replace biological or mechanical filtration.',
      'Lighting does not instantly lower pH.',
    ],
  },
  {
    id: 'q-aq-2',
    category: 'aq',
    question: 'What is a good first step before adding fish to a new aquarium?',
    options: ['Cycle the tank', 'Skip water testing', 'Add maximum fertilizer', 'Turn off filtration'],
    correct_idx: 0,
    explanation: 'Cycling builds the bacteria needed to process fish waste safely.',
    option_explanations: [
      'Correct. Cycling prepares the tank before livestock goes in.',
      'Testing is how you confirm the cycle is stable.',
      'Too much fertilizer can create algae and stress the system.',
      'Filtration should stay on while the tank matures.',
    ],
  },
  {
    id: 'q-tech-1',
    category: 'tech',
    subcategory: 'python',
    difficulty: 'basic',
    question: 'In Python, what does this expression return?',
    code_snippet: 'len([2, 4, 6, 8])',
    options: ['2', '4', '6', '8'],
    correct_idx: 1,
    explanation: 'len returns the number of items in the list.',
    option_explanations: [
      '2 is a list value, not the item count.',
      'Correct. The list contains four values.',
      '6 is a list value, not the item count.',
      '8 is a list value, not the item count.',
    ],
  },
  {
    id: 'q-tech-2',
    category: 'tech',
    subcategory: 'python',
    difficulty: 'basic',
    question: 'Which file type is commonly used for tabular data exports?',
    options: ['CSV', 'PNG', 'MP3', 'EXE'],
    correct_idx: 0,
    explanation: 'CSV is a common plain-text table format used by spreadsheets and data tools.',
    option_explanations: [
      'Correct. CSV stores rows and columns in plain text.',
      'PNG is an image format.',
      'MP3 is an audio format.',
      'EXE is a Windows executable file.',
    ],
  },
];

export const fallbackLeaderboard = [
  { id: 'u1', username: 'maker_01', score_total: 18, score_yt: 5, score_aq: 6, score_tech: 7 },
  { id: 'u2', username: 'tankbuilder', score_total: 12, score_yt: 2, score_aq: 8, score_tech: 2 },
  { id: 'u3', username: 'pixelpilot', score_total: 9, score_yt: 6, score_aq: 1, score_tech: 2 },
];

export const fallbackSiteConfig = {
  ticker_items: [
    'Gaming PC Under INR 50K',
    'Aquascaping Guide',
    'Data Analysis Deep Dive',
    'Creator Setup Tour',
    'Python Crash Course',
    'Issue #1 Out Now',
  ],
  ticker_separator: '◆',
  interactive_label: 'Interactive Preview',
  interactive_title: 'Explore the Issue',
  interactive_description: 'Hover over glowing points to open links, notes, and references from this magazine issue.',
  interactive_bg_url: '',
  home_issue_label: 'Premiere Issue',
  home_hero_title_top: 'BUILD.',
  home_hero_title_accent: 'LEARN.',
  home_hero_title_outline: 'CREATE.',
  home_hero_description: 'One passion. Endless possibilities. Dive into tech, DIY, data analysis, YouTube creation, and aquascaping in one place.',
  home_primary_cta: 'Read Latest Issue',
  home_secondary_cta: 'Take the Quiz',
  home_featured_label: 'From the Issue',
  home_featured_title: 'Featured Reads',
  home_quiz_title: 'Test Your Knowledge',
  home_quiz_description: 'Sign in and compete. Solve questions, earn points, and climb the leaderboard.',
  home_quiz_button: 'Start Quiz',
  home_footer_text: '2026 TIME4HOBBIES - Build. Learn. Create.',
  home_categories: [
    { name: 'Tech & DIY', description: 'Gaming Builds - Tools - Circuits', color: 'green', icon: 'T' },
    { name: 'Data Analysis', description: 'Dashboards - Insights - Python', color: 'blue', icon: 'D' },
    { name: 'YouTube', description: 'Creator Setups - Gear - Tips', color: 'red', icon: 'Y' },
    { name: 'Aquascaping', description: 'Planted Tanks - Fish - Guides', color: 'yellow', icon: 'A' },
  ],
  quiz_subcategories: [
    { key: 'python', label: 'Python', description: 'Syntax, data handling, scripting, and problem solving.', color: 'green', icon: 'PY' },
    { key: 'js', label: 'JavaScript', description: 'Browser logic, functions, objects, and async basics.', color: 'yellow', icon: 'JS' },
    { key: 'java', label: 'Java', description: 'Core Java, OOP, collections, and backend fundamentals.', color: 'red', icon: 'JV' },
    { key: 'ai', label: 'AI', description: 'Machine learning concepts, prompts, models, and workflows.', color: 'blue', icon: 'AI' },
    { key: 'iot', label: 'IoT', description: 'Sensors, microcontrollers, networking, and device logic.', color: 'green', icon: 'IO' },
    { key: 'sql', label: 'SQL', description: 'Databases, queries, joins, and data manipulation.', color: 'blue', icon: 'SQL' },
  ],
};

export const categoryMeta = {
  yt: { label: 'YouTube / Content', short: 'YouTube', className: 'yt', accent: 'var(--red)', ghost: 'YT' },
  aq: { label: 'Aquascaping', short: 'Aquascaping', className: 'aq', accent: 'var(--blue)', ghost: 'AQ' },
  tech: { label: 'Tech / Data / Python', short: 'Tech / Python', className: 'tech', accent: 'var(--green)', ghost: 'PY' },
};

export const difficultyMeta = {
  basic: { label: 'Basic', short: 'Basic' },
  intermediate: { label: 'Intermediate', short: 'Inter' },
  advanced: { label: 'Advanced', short: 'Adv' },
};
