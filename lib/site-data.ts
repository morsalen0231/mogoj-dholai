export type CategoryId = "A" | "B" | "C" | "D" | "E";

export type Category = {
  id: CategoryId;
  slug: string;
  title: string;
  subtitle: string;
  accent: string;
};

export type Article = {
  id: string;
  slug: string;
  categoryId: CategoryId;
  titleBn: string;
  titleEn: string;
  coverLabel: string;
  teaser: string;
  contentStandard: string[];
  contentFunny: string[];
  funFact: string;
  imageUrl: string;
  tags: string[];
};

export type LeaderboardEntry = {
  name: string;
  points: number;
  title: string;
};

export type MythGameQuestion = {
  statement: string;
  answer: boolean;
  explanation: string;
};

export type TimelineGameRound = {
  title: string;
  intro: string;
  items: Array<{ label: string; order: number }>;
};

export type OddFactRound = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const categories: Category[] = [
  { id: "A", slug: "space", title: "মহাকাশ ও এলিয়েন রহস্য", subtitle: "তারকা, গ্রহ, রহস্য আর ভবিষ্যতের কল্পনা", accent: "from-[#ffd166] via-[#ff8c42] to-[#7b2cbf]" },
  { id: "B", slug: "history", title: "ইতিহাসের নিষিদ্ধ পাতা", subtitle: "হারানো শহর, যুদ্ধ, অভিশাপ, আর আড়ালের গল্প", accent: "from-[#f4d35e] via-[#ee964b] to-[#9c6644]" },
  { id: "C", slug: "science", title: "মানবদেহ ও বিচিত্র বিজ্ঞান", subtitle: "শরীর, মস্তিষ্ক, ঘুম, AI আর ভবিষ্যতের বিজ্ঞান", accent: "from-[#90f1ef] via-[#00afb9] to-[#0b3c49]" },
  { id: "D", slug: "games", title: "ব্রেইন চ্যালেঞ্জ ও গেম", subtitle: "কুইজ, পাজল, মেমরি আর চোখ ধাঁধানো চ্যালেঞ্জ", accent: "from-[#ffcad4] via-[#ff5d8f] to-[#9d174d]" },
  { id: "E", slug: "life-hacks", title: "লাইফস্টাইল ও সারভাইভাল", subtitle: "মনের ভাষা, বিপদে টিকে থাকা, খাবার আর ফোকাস", accent: "from-[#d9ed92] via-[#52b788] to-[#1b4332]" },
];

export const articles: Article[] = [
  { id: "A1", slug: "our-solar-system", categoryId: "A", titleBn: "আমাদের সৌরজগত", titleEn: "Interactive Map", coverLabel: "সূর্যকে ঘিরে গ্রহদের মহা র‍্যালি", teaser: "সূর্য, গ্রহ, উপগ্রহ আর asteroid belt মিলিয়ে আমাদের cosmic neighbourhood।", contentStandard: ["সৌরজগতের কেন্দ্রে সূর্য, আর তাকে ঘিরে ঘুরছে আটটি গ্রহ।", "গ্রহের দূরত্ব যত বাড়ে, ততই সূর্যের আলো আর তাপ কমে যায়।", "এই interactive map পেজে orbit, day-length, moon-count আর planet facts layered cards-এ দেখানো হবে।"], contentFunny: ["সূর্য একটা বিশাল হাঁড়ি, আর গ্রহগুলো lane ধরে ঘোরা ব্যস্ত যাত্রী।", "পৃথিবী cosmic middle-class zone: না বেশি গরম, না বেশি ঠান্ডা।", "এই map-এ বোঝা যাবে কোন গ্রহ fashion show করছে আর কোনটা ice box।"], funFact: "জানেন কি? সূর্যের ভেতরে প্রায় ১৩ লাখটা পৃথিবী ধরে যাবে।", imageUrl: "/covers/solar-system", tags: ["interactive", "planets", "space"] },
  { id: "A2", slug: "black-hole-gravity-monster", categoryId: "A", titleBn: "ব্ল্যাক হোল: মহাকর্ষের দানব", titleEn: "Gravity Monster", coverLabel: "আলোও যেখানে পালাতে পারে না", teaser: "ব্ল্যাক হোল কেন ভয়ংকর, event horizon কী, আর কীভাবে এগুলো খুঁজে পাওয়া যায়।", contentStandard: ["ব্ল্যাক হোল তৈরি হয় যখন বিশাল নক্ষত্র নিজের মাধ্যাকর্ষণে ধসে পড়ে।", "ব্ল্যাক হোলকে সরাসরি দেখা যায় না, আশপাশের গ্যাস আর X-ray emission দেখে বোঝা যায়।", "singularity-তে কী হয়, সেটাই বড় বৈজ্ঞানিক রহস্য।"], contentFunny: ["ব্ল্যাক হোল cosmic vacuum cleaner না হলেও attitude তেমনই।", "gravity বলে, ‘সবাই লাইনে আসো’; আলোও তখন কাঁপে।", "এটা সেই পাড়ার গডফাদার, যাকে দেখা যায় না, কিন্তু প্রভাব সবখানে।"], funFact: "প্রথম ব্ল্যাক হোলের ছবি প্রকাশিত হয় ২০১৯ সালে।", imageUrl: "/covers/black-hole", tags: ["gravity", "astronomy", "mystery"] },
  { id: "A3", slug: "are-aliens-real-area-51", categoryId: "A", titleBn: "এলিয়েন কি সত্যি আছে?", titleEn: "Area 51 রহস্য", coverLabel: "অজানা সিগন্যাল, গোপন ঘাঁটি, আর মানুষের কল্পনা", teaser: "Area 51, UFO culture, এবং বৈজ্ঞানিকভাবে alien life খোঁজার পথ।", contentStandard: ["মহাবিশ্বের বিশালতায় আমরা একা কি না, এই প্রশ্নই alien জিজ্ঞাসার কেন্দ্র।", "Area 51 মূলত সামরিক পরীক্ষাকেন্দ্র, গোপনীয়তাই রহস্যকে বড় করেছে।", "এখনও alien সভ্যতার প্রমাণ মেলেনি, তবে অনুসন্ধান চলছে।"], contentFunny: ["Area 51 দেখলেই imagination gym membership নিয়ে নেয়।", "কেউ বলে UFO, কেউ বলে secret aircraft, কেউ বলে pure suspense।", "এলিয়েন থাকলে হয়তো আমাদের comment section দেখে already মন পরিবর্তন করেছে।"], funFact: "ড্রেক সমীকরণ বুদ্ধিমান সভ্যতার সম্ভাবনা অনুমান করতে ব্যবহৃত হয়।", imageUrl: "/covers/area-51", tags: ["aliens", "ufo", "area51"] },
  { id: "A4", slug: "first-city-on-mars", categoryId: "A", titleBn: "মঙ্গল গ্রহে মানুষের প্রথম শহর", titleEn: "Future City", coverLabel: "ধুলোমাখা লাল গ্রহে মানুষের বসতি", teaser: "Mars colony ডিজাইন, oxygen, food, shelter এবং মানসিক চ্যালেঞ্জ।", contentStandard: ["মঙ্গলে শহর বানাতে radiation protection, পানি, আর খাবারের closed-loop system দরকার।", "সম্ভাব্য বাসস্থান মাটির নিচে বা regolith dome-এ হতে পারে।", "isolation মানুষের মানসিক সুস্থতার বড় চ্যালেঞ্জ হবে।"], contentFunny: ["মঙ্গলে শহর মানে সবাই বলছে, পৃথিবীর ট্রাফিকের চেয়ে এটা ভাল।", "pizza delivery-র complaint desk ওখানে নেই।", "fresh বাতাসই হবে সবচেয়ে দামী জিনিস।"], funFact: "মঙ্গলের একদিন প্রায় ২৪ ঘণ্টা ৩৯ মিনিট।", imageUrl: "/covers/mars-city", tags: ["mars", "future", "colony"] },
  { id: "A5", slug: "space-travel-speed-of-light", categoryId: "A", titleBn: "স্পেস ট্রাভেল: আলোর গতিতে ভ্রমণ", titleEn: "Light-Speed Travel", coverLabel: "অসম্ভব, নাকি physics-এর twist?", teaser: "Relativity, time dilation, wormhole, আর interstellar travel-এর science fiction বনাম science।", contentStandard: ["ভরযুক্ত কোনো বস্তুকে আলোর গতিতে তোলা প্রায় অসম্ভবসদৃশ কঠিন।", "time dilation-এর কারণে দ্রুতগতির ভ্রমণকারীর সময় ভিন্নভাবে কেটে যেতে পারে।", "Warp drive ও wormhole এখনও তাত্ত্বিক পর্যায়ে।"], contentFunny: ["আলোর গতির fuel bill দেখে মহাবিশ্বও কেঁদে ফেলবে।", "দেরি করে ফিরলে বলতে পারবেন, physics-এর দোষ।", "wormhole এখনো highway approval পায়নি।"], funFact: "GPS স্যাটেলাইটে relativity correction দরকার হয়।", imageUrl: "/covers/light-speed", tags: ["relativity", "travel", "physics"] },
  { id: "A6", slug: "strange-sounds-of-space", categoryId: "A", titleBn: "মহাকাশের অদ্ভুত সব শব্দ", titleEn: "Audio Clips", coverLabel: "নীরব মহাকাশে শোনা যায় কেমন?", teaser: "প্লাজমা ওয়েভ, sonification, আর space audio visualisation।", contentStandard: ["মহাকাশে সাধারণ শব্দ ছড়ায় না, তবে data-কে সাউন্ডে রূপ দিলে অদ্ভুত audio শোনা যায়।", "NASA space data sonification ব্যবহার করে শিক্ষায় ও গবেষণায়।", "এই পেজে waveform-style UI দিয়ে data translation বোঝানো হবে।"], contentFunny: ["মহাকাশে চিৎকার শোনা যায় না, কিন্তু data-র DJ mix শোনা যায়।", "এগুলো science আর synthwave-এর বিয়ে বলা যায়।", "শুনলে মনে হবে universe headphone পরে কাজ করছে।"], funFact: "Sonification অনেক সময় chart-এর চেয়ে দ্রুত pattern ধরতে সাহায্য করে।", imageUrl: "/covers/space-sounds", tags: ["audio", "nasa", "space"] },
  { id: "B1", slug: "pyramid-mummy-curse", categoryId: "B", titleBn: "পিরামিডের মমি ও অভিশাপ", titleEn: "Curse of the Tomb", coverLabel: "মৃত রাজাদের ঘরে কল্পনা আর ইতিহাসের সংঘর্ষ", teaser: "মমি, সমাধি, প্রত্নতত্ত্ব, আর অভিশাপের জন্মকথা।", contentStandard: ["মমি সংরক্ষণ ছিল প্রাচীন মিশরের পরকাল বিশ্বাসের অংশ।", "curse গল্পের অনেকটাই কাকতালীয় অসুস্থতা বা sensational reporting।", "তারপরও পিরামিড রহস্য horror flavour ধরে রেখেছে।"], contentFunny: ["মমিরা বিশ্রাম নিচ্ছিল, আমরা গিয়ে flashlight মেরে জিজ্ঞেস করলাম history বলবেন?", "মানুষ boring গবেষণার চেয়ে dramatic গল্প বেশি পছন্দ করে।", "দরজায় যদি লেখা থাকত disturb করবেন না, horror কম হতো।"], funFact: "অনেক মমির ভেতর লিনেন, রজন, আর বিশেষ তেল ব্যবহার করা হতো।", imageUrl: "/covers/mummy-curse", tags: ["egypt", "mummy", "curse"] },
  { id: "B2", slug: "lost-city-atlantis", categoryId: "B", titleBn: "হারানো শহর আটলান্টিস", titleEn: "Underwater Mystery", coverLabel: "ডুবে যাওয়া সভ্যতা নাকি দার্শনিক গল্প?", teaser: "Atlantis-এর উৎস, myth, geology, আর civilisation debate।", contentStandard: ["আটলান্টিসের মূল উল্লেখ প্লেটোর লেখায়।", "অনেকে এটাকে বাস্তব হারানো শহর বলে খুঁজেছেন, কিন্তু প্রমাণ পাওয়া যায়নি।", "ভূতত্ত্ব আর ডুবে যাওয়া শহরের ইতিহাস মিথটাকে টিকিয়ে রেখেছে।"], contentFunny: ["এমন শহর যেটা সবাই খুঁজছে, location pin কেউ share করছে না।", "প্লেটোর moral story-কে আমরা treasure hunt বানিয়ে ফেলেছি।", "যদি সত্যি মেলে, underwater real estate boom হবে।"], funFact: "থেরা আগ্নেয়গিরির বিস্ফোরণের সঙ্গে Atlantis তত্ত্বের তুলনা করা হয়।", imageUrl: "/covers/atlantis", tags: ["atlantis", "myth", "lost-city"] },
  { id: "B3", slug: "unknown-stories-of-bengal-nawabs", categoryId: "B", titleBn: "বাংলার নবাবদের অজানা কাহিনী", titleEn: "Untold Bengal", coverLabel: "দরবার, বাণিজ্য, ক্ষমতা, আর ষড়যন্ত্র", teaser: "বাংলার নবাবদের রাজনৈতিক চাতুর্য, সংস্কৃতি, আর পতনের আড়ালের দিক।", contentStandard: ["বাংলার নবাবদের ইতিহাস শুধু যুদ্ধ নয়; বাণিজ্য আর নদীপথও বড় বিষয়।", "স্থানীয় শক্তি ও ইউরোপীয় কোম্পানির সংঘাতে রাজনৈতিক ভাগ্য বদলে যায়।", "timeline আর map snippet দিয়ে গল্প দেখানো হবে।"], contentFunny: ["এটা group chat drama-এর premium version, stakes শুধু বিশাল।", "tea table-এও empire বদলে যেতে পারে।", "সবাই হিসাব করছে কে কাকে পাশ কাটাবে।"], funFact: "নদীনির্ভর বাণিজ্য বাংলাকে অর্থনৈতিকভাবে শক্তিশালী করেছিল।", imageUrl: "/covers/bengal-nawabs", tags: ["bengal", "nawab", "history"] },
  { id: "B4", slug: "terrifying-weapons-of-world-war-2", categoryId: "B", titleBn: "দ্বিতীয় বিশ্বযুদ্ধের ভয়ঙ্কর সব অস্ত্র", titleEn: "Weapons of Fear", coverLabel: "প্রযুক্তি যখন ধ্বংসের কারখানা", teaser: "ট্যাংক, রকেট, chemical threat, আর পারমাণবিক যুগের সূচনা।", contentStandard: ["দ্বিতীয় বিশ্বযুদ্ধ সামরিক প্রযুক্তির দ্রুত প্রয়োগের বড় উদাহরণ।", "রাডার, bomber, rocket, submarine সবই ভয়ংকরভাবে ব্যবহৃত হয়।", "পারমাণবিক অস্ত্র নৈতিক প্রশ্নকে তীব্র করে তোলে।"], contentFunny: ["innovation সবসময় সুন্দর কাজে লাগে না।", "engineer-রা physics-কে খুশি করলেও humanity কেঁপে ওঠে।", "genius আর disaster কখনও একই workshop-এ জন্মায়।"], funFact: "রাডার প্রযুক্তির উন্নতি যুদ্ধের কৌশল পাল্টে দেয়।", imageUrl: "/covers/ww2-weapons", tags: ["ww2", "weapons", "technology"] },
  { id: "B5", slug: "bermuda-triangle", categoryId: "B", titleBn: "বারমুডা ট্রায়াঙ্গল: ফিরে না আসার গল্প", titleEn: "No Return Zone", coverLabel: "রহস্য, দুর্ঘটনা, নাকি exaggeration?", teaser: "Bermuda Triangle-এর myth, navigation risks, এবং মিডিয়ার প্রভাব।", contentStandard: ["বেশিরভাগ Bermuda ঘটনার পেছনে আবহাওয়া, navigation ভুল, বা মানবিক ত্রুটি থাকে।", "ট্রপিক্যাল ঝড় আর স্রোত দুর্ঘটনার সম্ভাবনা বাড়ায়।", "মিডিয়ার নাটকীয় ভাষা রহস্যকে বাড়িয়ে তুলেছে।"], contentFunny: ["জায়গাটা হয়তো বলছে, ভাই আমার reputation একটু কমাও।", "রহস্যের চেয়ে map reading skill কম থাকাই অনেক সময় সমস্যা।", "sea storm-কে ghost story বানাতে মানুষ ওস্তাদ।"], funFact: "বারমুডা ট্রায়াঙ্গলকে আলাদা অতিপ্রাকৃত danger zone হিসেবে স্বীকৃতি দেওয়া হয়নি।", imageUrl: "/covers/bermuda", tags: ["bermuda", "mystery", "ocean"] },
  { id: "B6", slug: "biggest-heists-in-history", categoryId: "B", titleBn: "ইতিহাসের সবচেয়ে বড় ৫টি চুরি", titleEn: "Legendary Heists", coverLabel: "সিনেমাকেও হার মানায় যেসব প্ল্যান", teaser: "বিশ্বের আলোচিত robbery, museum theft, এবং security gap।", contentStandard: ["বিখ্যাত heist-এ timing, insider knowledge, আর security weakness বড় ভূমিকা রাখে।", "অনেক artefact চুরি হয়ে দশক পরও নিখোঁজ থাকে।", "এই পেজে top 5 case card ও security lesson থাকবে।"], contentFunny: ["কিছু চোর এত organized ছিল যে project manager-ও হিংসে করবে।", "lock বড় হলেই লাভ নেই, human loophole আরও বড়।", "movie writer-রাও note নিতে বসে যায়।"], funFact: "অনেক বড় art theft-এর কাজ আজও উদ্ধার হয়নি।", imageUrl: "/covers/heists", tags: ["crime", "history", "heist"] },
  { id: "C1", slug: "inside-your-body", categoryId: "C", titleBn: "আপনার শরীরের ভেতরে যা ঘটছে", titleEn: "Microscopic View", coverLabel: "একটি শরীর, কোটি কোটি ক্ষুদ্র কর্মী", teaser: "Cell, blood, nerve signal এবং microscopic life processes-এর tour।", contentStandard: ["আপনার শরীরের ভেতরে প্রতি সেকেন্ডে অসংখ্য রাসায়নিক বিক্রিয়া ঘটে।", "রক্ত শুধু অক্সিজেন নয়; hormone ও nutrient-ও বহন করে।", "শরীর factory, network, আর security system একসাথে।"], contentFunny: ["আপনার শরীরের ভেতর hustle দেখে corporate office-ও লজ্জা পাবে।", "রক্ত courier service, immune system security guard।", "আপনি বসে থাকলেও ভেতরে nonstop team meeting চলছে।"], funFact: "মানবদেহে প্রায় ৩৭ ট্রিলিয়ন কোষ আছে বলে ধারণা করা হয়।", imageUrl: "/covers/body", tags: ["body", "cells", "health"] },
  { id: "C2", slug: "brain-hacks", categoryId: "C", titleBn: "মানুষের মস্তিষ্কের ১০টি হ্যাকস", titleEn: "Brain Hacks", coverLabel: "মনোযোগ, স্মৃতি, আর decision-making-এর ছোট shortcut", teaser: "কীভাবে মস্তিষ্ক pattern, habit, focus আর reward-এর মাধ্যমে কাজ করে।", contentStandard: ["chunking, spaced repetition, আর visual association স্মৃতি বাড়াতে সাহায্য করে।", "habit loop বুঝলে নতুন অভ্যাস গঠন সহজ হয়।", "এখানে ১০টি brain hack short card আকারে থাকবে।"], contentFunny: ["মস্তিষ্ক smart device, কিন্তু battery saver mode নিজে থেকেই on হয়।", "deadline না এলে brain short-term comfort পছন্দ করে।", "সঠিক hack দিলে brain-কে polite ভাবে focus করতে বলা যায়।"], funFact: "Spaced repetition long-term memory-তে তথ্য বসাতে সাহায্য করে।", imageUrl: "/covers/brain-hacks", tags: ["brain", "memory", "productivity"] },
  { id: "C3", slug: "dna-editing-superhuman", categoryId: "C", titleBn: "ডিএনএ পরিবর্তন: সুপার হিউম্যান?", titleEn: "DNA Editing", coverLabel: "CRISPR-এর প্রতিশ্রুতি আর নৈতিক দ্বিধা", teaser: "Gene editing-এর সম্ভাবনা, risk, ethics, এবং medical future।", contentStandard: ["CRISPR নির্দিষ্ট জিন বদলানোর সুযোগ তৈরি করেছে।", "germline editing আর unintended mutation বড় নৈতিক উদ্বেগ।", "সুপার হিউম্যান ধারণা বাস্তবে জটিল trade-off-এ ভরা।"], contentFunny: ["DNA edit মানেই superhero factory খুলে যায় না।", "একটা gene বদলালেই সব মিটে যায় না, biology এত simple না।", "ভাল tool মানেই সব ব্যবহার ভাল হবে না।"], funFact: "একটি বৈশিষ্ট্যের পেছনে বহু gene ও environment একসাথে কাজ করে।", imageUrl: "/covers/dna", tags: ["dna", "crispr", "ethics"] },
  { id: "C4", slug: "dream-mystery", categoryId: "C", titleBn: "ঘুমের ভেতর আপনি যা দেখেন", titleEn: "Dream Mystery", coverLabel: "স্বপ্ন, REM sleep, আর মনের লুকানো theatre", teaser: "স্বপ্ন কেন হয়, REM sleep কী, আর nightmare কেন মনে থাকে।", contentStandard: ["REM sleep-এ vivid dream বেশি দেখা যায়।", "স্বপ্ন স্মৃতি সাজানো বা আবেগ প্রক্রিয়াজাত করার ফল হতে পারে।", "সব স্বপ্নের নির্দিষ্ট অর্থ নেই।"], contentFunny: ["স্বপ্ন হলো brain-এর midnight cinema।", "script এমন হয় যা waking life-এ pitch করলে কেউ নেবে না।", "brain drama-কে শান্তির চেয়ে বেশি press coverage দেয়।"], funFact: "ঘুম থেকে ওঠার কিছুক্ষণের মধ্যে স্বপ্নের বড় অংশ ভুলে যাওয়া স্বাভাবিক।", imageUrl: "/covers/dream", tags: ["sleep", "dream", "psychology"] },
  { id: "C5", slug: "robots-and-ai-future", categoryId: "C", titleBn: "রোবট কি মানুষের জায়গা নেবে?", titleEn: "AI Future", coverLabel: "Automation, কাজের রূপান্তর, আর সহাবস্থান", teaser: "AI কোন কাজ বদলাবে, কোন কাজ বাড়াবে, আর মানুষের ভূমিকা কোথায় থাকবে।", contentStandard: ["AI routine কাজ দ্রুত করতে পারে, কিছু কাজ বদলে দিতে পারে।", "মানুষের জায়গা পুরো নেওয়ার চেয়ে কাজের ধরন পাল্টানো বেশি বাস্তব।", "automation spectrum দিয়ে hybrid কাজ দেখানো হবে।"], contentFunny: ["AI spreadsheet সামলাবে, office politics না।", "robot বনাম human না হয়ে future হবে human plus robot।", "headline যত ভয় দেখায়, বাস্তবটা তত nuanced।"], funFact: "অনেক শিল্পে automation মানুষকে higher-level decision-এ ঠেলে দেয়।", imageUrl: "/covers/ai-future", tags: ["ai", "robot", "future"] },
  { id: "C6", slug: "strange-diseases-and-treatment", categoryId: "C", titleBn: "অদ্ভুত সব রোগ ও তাদের চিকিৎসা", titleEn: "Rare Conditions", coverLabel: "দুর্লভ রোগ, কঠিন diagnosis, আর modern medicine", teaser: "Rare disease awareness, symptoms, research, এবং চিকিৎসার চ্যালেঞ্জ।", contentStandard: ["দুর্লভ রোগের বড় সমস্যা diagnosis delay।", "Genetic testing আর specialized clinic গুরুত্বপূর্ণ ভূমিকা রাখে।", "এই পেজ awareness দেবে, diagnosis নয়।"], contentFunny: ["কিছু rare disease এত uncommon যে Google-ও একটু হাঁ করে তাকায়।", "সঠিক diagnosis পাওয়া treasure hunt-এর মতো কঠিন।", "Medicine এখানেও হাল ছাড়ে না।"], funFact: "সব rare disease মিলিয়ে বিশ্বের অনেক মানুষকে প্রভাবিত করে।", imageUrl: "/covers/rare-disease", tags: ["medicine", "rare", "health"] },
  { id: "D1", slug: "optical-illusion", categoryId: "D", titleBn: "অপটিক্যাল ইলিউশন", titleEn: "Eye Puzzle", coverLabel: "চোখ দেখে, মস্তিষ্ক বানায় গল্প", teaser: "দৃষ্টি কীভাবে বিভ্রান্ত হয়, আর illusion আমাদের brain processing সম্পর্কে কী বলে।", contentStandard: ["দেখা মানেই বাস্তবের হুবহু কপি নয়।", "রঙ, contrast, perspective visual system-কে বিভ্রান্ত করতে পারে।", "scroll-based illusion card দিয়ে এই ধারণা দেখানো হবে।"], contentFunny: ["চোখ report পাঠায়, brain তাড়াহুড়ো করে conclusion দেয়।", "লাইন নড়ে না, তবু brain বলে নড়ছে।", "নিজের চোখকেই হালকা গ্যাসলাইট হতে দেখবেন।"], funFact: "অনেক illusion visual cortex-এর shortcut processing প্রকাশ করে।", imageUrl: "/covers/illusion", tags: ["illusion", "vision", "game"] },
  { id: "D2", slug: "daily-iq-test", categoryId: "D", titleBn: "প্রতিদিনের আইকিউ টেস্ট", titleEn: "Interactive Quiz", coverLabel: "দুই মিনিটে মাথার ওয়ার্ম-আপ", teaser: "দৈনিক ছোট quiz, instant score, আর brain streak।", contentStandard: ["দৈনিক quiz pattern recognition আর quick logic চর্চায় সাহায্য করতে পারে।", "এখানে score-এর পাশাপাশি streak আর XP reward থাকবে।", "এসব টেস্ট absolute intelligence নয়।"], contentFunny: ["এই quiz brain-কে জিজ্ঞেস করবে, ঘুমাচ্ছ নাকি online আছ?", "ভুল হলে প্রশ্নকেই দোষ দেওয়া ঐতিহ্যগত অধিকার।", "দুই মিনিটে আত্মসম্মান উঠতেও পারে নামতেও পারে।"], funFact: "Short logic quiz নিয়মিত practice-এর জন্য useful।", imageUrl: "/covers/iq", tags: ["quiz", "iq", "interactive"] },
  { id: "D3", slug: "math-magic-tricks", categoryId: "D", titleBn: "গণিতের জাদুকরী ট্রিকস", titleEn: "Math Magic", coverLabel: "হিসাব, pattern, আর wow moment", teaser: "সহজ mental math tricks-এর science ও stage effect।", contentStandard: ["গণিতের অনেক ম্যাজিক আসলে pattern exploitation।", "এগুলো মানসিক গণনায় আত্মবিশ্বাস বাড়াতে পারে।", "step-by-step reveal দিয়ে কারণও বোঝানো হবে।"], contentFunny: ["calculator আপনার সঙ্গে অভিমান করতে পারে।", "স্টেজে magic, ব্যাখ্যায় logic।", "সংখ্যাকে politely manipulate করার শিল্প এটি।"], funFact: "অনেক mental math trick base-10 pattern ব্যবহার করে।", imageUrl: "/covers/math-magic", tags: ["math", "trick", "puzzle"] },
  { id: "D4", slug: "memory-game", categoryId: "D", titleBn: "মেমরি গেম: আপনার মনে রাখার ক্ষমতা কত?", titleEn: "Memory Challenge", coverLabel: "কতক্ষণে মিলবে সব জোড়া?", teaser: "Card match game, recall speed, এবং memory score।", contentStandard: ["Memory game working memory আর attention অনুশীলনের সহজ উপায়।", "কম move-এ জোড়া মেলানো মানে focused recall।", "timer আর best score sync hook রাখা হবে।"], contentFunny: ["একই card দুবার খুলে ভুলে গেলে বুঝবেন brain casual mode-এ আছে।", "যে কম move-এ জোড়া মেলাবে, সে memory mafia।", "হারলে card-গুলোর মুখে হালকা হাসি কল্পনা করা যায়।"], funFact: "Memory games short-term visual recall চর্চায় ব্যবহার হয়।", imageUrl: "/covers/memory", tags: ["memory", "game", "cards"] },
  { id: "D5", slug: "logical-puzzles", categoryId: "D", titleBn: "লজিক্যাল পাজলস", titleEn: "Detective Riddles", coverLabel: "ক্লু পড়ুন, ফাঁদ এড়িয়ে সত্য ধরুন", teaser: "Detective-style riddles, contradiction spotting, আর deduction challenge।", contentStandard: ["Logical puzzle evidence আর assumption আলাদা করতে শেখায়।", "ছোট clue-ও বড় ভূমিকা রাখে।", "expandable hint system রাখা হবে।"], contentFunny: ["detective আপনি, suspect-ও আপনি।", "সমাধান হয়ে গেলে obvious লাগে, তার আগে confusing।", "এটা brain-এর ছোট crime scene investigation।"], funFact: "Deduction-based puzzle critical thinking চর্চায় কার্যকর।", imageUrl: "/covers/detective", tags: ["logic", "detective", "riddle"] },
  { id: "D6", slug: "fast-typing-game", categoryId: "D", titleBn: "ফাস্ট টাইপিং গেম", titleEn: "Bangla + English", coverLabel: "কীবোর্ডে আগুন ধরান", teaser: "বাংলা ও ইংলিশ typing challenge, WPM, accuracy, এবং streak।", contentStandard: ["Typing game speed-এর পাশাপাশি accuracy-ও মাপে।", "বাংলা ও ইংরেজি দুই ভাষার challenge muscle memory বাড়ায়।", "timer, WPM আর daily challenge mode থাকবে।"], contentFunny: ["এত দ্রুত হাত চলবে যে পাশের মানুষ secret mission ভাববে।", "speed বাড়াতে গিয়ে accuracy উধাও হলে game থামাবে।", "দুই ভাষায় টাইপ করলে keyboard-ও respect করবে।"], funFact: "Typing speed-এর পাশাপাশি error rate productivity-র বড় সূচক।", imageUrl: "/covers/typing", tags: ["typing", "speed", "bilingual"] },
  { id: "E1", slug: "psychology-reading-minds", categoryId: "E", titleBn: "সাইকোলজি: মানুষের মনের ভাষা চেনার উপায়", titleEn: "Read the Room", coverLabel: "body language, tone, আর context", teaser: "মানুষের আচরণ বুঝতে observation, empathy, আর bias-awareness কেন জরুরি।", contentStandard: ["mind reading না, বরং pattern observation-ই আসল।", "একই cue সবার ক্ষেত্রে একই মানে দেয় না।", "quick cue card থাকলেও oversimplification এড়িয়ে চলা হবে।"], contentFunny: ["ভ্রু কুঁচকালেই ভাববেন না সে আপনাকে অপছন্দ করে।", "মন বোঝা detective হওয়া না, observer হওয়া।", "context ছাড়া half movie দেখার মতো অবস্থা হয়।"], funFact: "Nonverbal cue helpful হলেও একে একমাত্র সত্য ধরা ভুল।", imageUrl: "/covers/psychology", tags: ["psychology", "body-language", "mind"] },
  { id: "E2", slug: "survival-guide", categoryId: "E", titleBn: "সারভাইভাল গাইড: বিপদে পড়লে যা করবেন", titleEn: "Survival Guide", coverLabel: "panic কমান, priority ঠিক করুন", teaser: "জরুরি সময়ে calm থাকা, signal দেওয়া, পানি, shelter, আর basic safety।", contentStandard: ["বিপদে প্রথম কাজ হলো panic কমিয়ে পরিস্থিতি মূল্যায়ন।", "পানি, আশ্রয়, শরীরের তাপমাত্রা, signal - এগুলো priority।", "শহর, বন, বন্যা, আগুন scenario checklist থাকবে।"], contentFunny: ["Survival-এর প্রথম নিয়ম hero mode না, smart mode।", "সিনেমার dramatic decision বাস্তবে বেশি কাজে দেয় না।", "একটা whistle অনেক সময় social post-এর চেয়ে useful।"], funFact: "Clear plan panic কমাতে সাহায্য করে।", imageUrl: "/covers/survival", tags: ["survival", "safety", "guide"] },
  { id: "E3", slug: "reduce-social-media-addiction", categoryId: "E", titleBn: "সোশ্যাল মিডিয়া এডিকশন কমানোর কৌশল", titleEn: "Feed Detox", coverLabel: "ডোপামিন লুপ থেকে একটু মুক্তি", teaser: "attention trap, doomscrolling, এবং healthier digital habits।", contentStandard: ["variable reward মানুষকে বারবার social app-এ ফেরায়।", "Time block, app friction, notification limit usage কমাতে সাহায্য করে।", "১ দিন, ৭ দিন, ৩০ দিনের reset plan থাকবে।"], contentFunny: ["একটা reel দেখতে গিয়ে ৪৫ মিনিট উধাও হওয়া modern black hole।", "brain বলে আরেকটা, আরেকটা।", "app icon লুকিয়ে রাখা passive revenge।"], funFact: "Friction বাড়ালে impulsive app opening কমে যেতে পারে।", imageUrl: "/covers/social-detox", tags: ["social-media", "habit", "focus"] },
  { id: "E4", slug: "five-meals-in-ten-minutes", categoryId: "E", titleBn: "১০ মিনিটে সুস্বাদু ৫টি রান্না", titleEn: "Science of Food", coverLabel: "দ্রুত রান্না, smart heat, আর texture play", teaser: "দ্রুত রান্নার science, heat transfer, flavour balance, এবং simple recipes।", contentStandard: ["দ্রুত রান্নার মূল হলো prep কমানো আর heat control।", "Food science বুঝলে texture ও browning বোঝা সহজ হয়।", "৫টি recipe-এর সঙ্গে science note থাকবে।"], contentFunny: ["রান্না মানে chemistry আর খিদের শান্তিচুক্তি।", "১০ মিনিটে খাবার মানে pressure cooker mood, but stylish।", "পেঁয়াজ একটু বেশি ভাজলেই chef feeling আসে।"], funFact: "Maillard reaction খাবারে গভীর রঙ ও স্বাদ তৈরি করে।", imageUrl: "/covers/food-science", tags: ["food", "recipe", "science"] },
  { id: "E5", slug: "home-fitness", categoryId: "E", titleBn: "শরীর ফিট রাখার ঘরোয়া উপায়", titleEn: "Home Fitness", coverLabel: "কম সরঞ্জাম, বেশি ধারাবাহিকতা", teaser: "ঘরে বসে mobility, strength, habit-building, এবং recovery tips।", contentStandard: ["জিম ছাড়াও bodyweight exercise, mobility আর ঘুম গুরুত্বপূর্ণ।", "ছোট circuit routine অনেকের জন্য বেশি টেকসই।", "beginner থেকে intermediate mini-plan থাকবে।"], contentFunny: ["সবচেয়ে ভারী জিনিস dumbbell না, আলসেমি।", "একটা চেয়ার আর ইচ্ছা থাকলে body বলবে শুরু করি।", "Consistency boring, result dramatic।"], funFact: "ছোট কিন্তু নিয়মিত workout sedentary ক্ষতি কমাতে সাহায্য করতে পারে।", imageUrl: "/covers/home-fitness", tags: ["fitness", "exercise", "home"] },
  { id: "E6", slug: "beat-laziness-productivity", categoryId: "E", titleBn: "প্রোডাক্টিভিটি: অলসতা দূর করার টিপস", titleEn: "Momentum Builder", coverLabel: "শুরু করা-ই অর্ধেক যুদ্ধ", teaser: "activation energy কমানো, tiny tasks, deep work, এবং focus ritual।", contentStandard: ["অলসতা অনেক সময় overwhelm বা unclear next step-এর ফল।", "কাজকে ছোট করে শুরু করলে activation energy কমে।", "২ মিনিট rule আর focus sprint toolkit থাকবে।"], contentFunny: ["অলসতা বলে পরে করব, deadline দরজায় এসে দাঁড়ায়।", "বড় কাজকে ছোট করলে brain ভয় কম পায়।", "আজ শুধু next obvious step-টাই বড় কাজ।"], funFact: "Task initiation-এর বাধা কমালে productivity বাড়তে পারে।", imageUrl: "/covers/productivity", tags: ["productivity", "focus", "habit"] },
];

export const leaderboard = [
  { name: "মগজরাজ মিতা", points: 980, title: "মগজরাজ" },
  { name: "কসমিক কবীর", points: 910, title: "রহস্য শিকারি" },
  { name: "নবাব নাবিল", points: 860, title: "ইতিহাস গোয়েন্দা" },
  { name: "কোয়ান্টাম কেয়া", points: 820, title: "ল্যাব সম্রাজ্ঞী" },
  { name: "পাজল পাভেল", points: 790, title: "ধাঁধা দানব" },
  { name: "ডিটক্স দীপ", points: 760, title: "ফোকাস ফকির" },
  { name: "চাণক্য চয়ন", points: 710, title: "মহাকাশচারী চাণক্য" },
  { name: "আইকিউ ইমরান", points: 680, title: "আইনস্টাইনের নাতি" },
  { name: "নবিশ নীলা", points: 590, title: "নবিশ খোর" },
  { name: "মামা মারুফ", points: 410, title: "চেষ্টা চলছে মামা" },
] satisfies LeaderboardEntry[];

export const profileBadges = [
  "৫টি আর্টিকেল পড়লে: নবিশ খোর",
  "১০টি কুইজ জিতলে: আইনস্টাইনের নাতি",
  "সব রহস্য সমাধান করলে: মহাকাশচারী চাণক্য",
];

export const viralFacts = [
  { title: "মধু হাজার বছরেও নষ্ট হয় না", mood: "রহস্য", month: "ফেব্রুয়ারি" },
  { title: "অক্টোপাসের তিনটি হৃদয় আছে", mood: "আজব", month: "ফেব্রুয়ারি" },
  { title: "আপনার শরীরের ব্যাকটেরিয়া কোষের সংখ্যাও বিশাল", mood: "বোরিং তথ্য বাদ দাও", month: "মার্চ" },
  { title: "শনি গ্রহ পানিতে ভাসতে পারত, যদি বিশাল টব থাকত", mood: "শুধু রহস্য দেখাও", month: "মার্চ" },
];

export const knowledgeDrops = [
  {
    title: "আজকের আজব কম্বো",
    value: "Black Hole + ফুচকা",
    blurb: "দুটোই আপনার মন টেনে নেয়, কিন্তু একটার physics বেশি ভয়ঙ্কর।",
  },
  {
    title: "মগজ ঝাঁকুনি স্কোর",
    value: "৮.৯/১০",
    blurb: "আজকের content mix curiosity আর হাসির ideal ratio-তে আছে।",
  },
  {
    title: "বোরডম প্রতিরোধ",
    value: "৯৬%",
    blurb: "কারণ এখানে paragraph-এর মাঝেও attitude আছে।",
  },
];

export const mythBusters = [
  {
    myth: "আমরা মস্তিষ্কের ১০% ব্যবহার করি",
    fact: "মস্তিষ্কের বিভিন্ন অংশ বিভিন্ন সময়ে সক্রিয় থাকে; ১০% myth বৈজ্ঞানিকভাবে ঠিক না।",
  },
  {
    myth: "বারমুডা ট্রায়াঙ্গল pure supernatural",
    fact: "আবহাওয়া, navigation error, আর narrative exaggeration বড় ভূমিকা রাখে।",
  },
  {
    myth: "AI মানেই কালই সব চাকরি শেষ",
    fact: "বাস্তবে automation অনেক কাজ বদলায়, নতুন কাজও তৈরি করে।",
  },
];

export const demoPosts = [
  {
    name: "রহস্য রানী রূপা",
    category: "রহস্য",
    title: "মৌমাছি নাচ করে direction বলে",
    status: "approved",
  },
  {
    name: "ইতিহাস ফকির ফিরোজ",
    category: "ইতিহাস",
    title: "প্রাচীন রোমে fast food shop ছিল",
    status: "pending",
  },
  {
    name: "ফুড বিজ্ঞানী ফাইজা",
    category: "বিজ্ঞান",
    title: "ঝাল মরিচ মুখে আগুন না, pain receptor trick করে",
    status: "approved",
  },
];

export const roomSuggestions = [
  "obie-room",
  "mystery-club",
  "space-gossip",
  "brain-lab",
];

export const loginPerks = [
  "নিজের প্রোফাইল glow আর level track হবে",
  "post submit করে approve হলে point পাবেন",
  "real-time chat-এ নিজের নামেই ঢুকবেন",
  "leaderboard-এ আপনার XP দেখা যাবে",
];

export const officeLaws = [
  "যে boring headline লিখবে, তাকে ৭ কাপ চা খাওয়ানো হবে।",
  "প্রতি feature launch-এর আগে কমপক্ষে ১টা আজব তথ্য বলতে হবে।",
  "Gradient ছাড়া review submit করলে ডিজাইন দেবতা রাগ করবেন।",
];

export const mythGameQuestions: MythGameQuestion[] = [
  {
    statement: "আমরা নাকি মস্তিষ্কের মাত্র ১০% ব্যবহার করি।",
    answer: false,
    explanation: "এটা classic myth। brain-এর আলাদা অংশ আলাদা সময়ে কাজ করে, idle পড়ে থাকে না।",
  },
  {
    statement: "অক্টোপাসের তিনটি হৃদয় আছে।",
    answer: true,
    explanation: "দুটো গিলে oxygen পাঠায়, আর একটা পুরো শরীরে blood pump করে। বেশ premium plumbing।",
  },
  {
    statement: "বারমুডা ট্রায়াঙ্গলকে official supernatural zone ধরা হয়।",
    answer: false,
    explanation: "না, বেশিরভাগ explanation weather, navigation issue আর media drama ঘিরে।",
  },
  {
    statement: "GPS system-এ relativity correction দরকার হয়।",
    answer: true,
    explanation: "Einstein না থাকলে আপনার map app একটু emotional হয়ে যেত।",
  },
  {
    statement: "মধু সহজে হাজার বছরেও নষ্ট হয় না।",
    answer: true,
    explanation: "Low moisture আর acidity-এর কারণে honey একদম stubborn food item।",
  },
];

export const timelineGameRounds: TimelineGameRound[] = [
  {
    title: "মহাকাশ টাইমলাইন গুছান",
    intro: "সবচেয়ে পুরনো থেকে নতুন ক্রমে সাজান।",
    items: [
      { label: "মানুষ প্রথম চাঁদে নামে", order: 1969 },
      { label: "প্রথম ব্ল্যাক হোল image প্রকাশিত হয়", order: 2019 },
      { label: "হাবল স্পেস টেলিস্কোপ launch হয়", order: 1990 },
      { label: "স্পুটনিক-১ কক্ষপথে যায়", order: 1957 },
    ],
  },
  {
    title: "ইতিহাসের ঝাঁকুনি সাজান",
    intro: "timeline mismatch করলে ইতিহাস স্যার ভুরু কুঁচকাবেন।",
    items: [
      { label: "টাইটানিক ডুবে যায়", order: 1912 },
      { label: "দ্বিতীয় বিশ্বযুদ্ধ শুরু", order: 1939 },
      { label: "বাংলাদেশ স্বাধীন হয়", order: 1971 },
      { label: "ইন্টারনেট public era শুরু", order: 1990 },
    ],
  },
];

export const oddFactRounds: OddFactRound[] = [
  {
    prompt: "এই তিনটার মধ্যে কোনটা সত্যি?",
    options: [
      "শনি গ্রহ পানিতে ভাসতে পারত, যদি বিশাল টব থাকত",
      "সূর্য প্রতিদিন রঙ বদলাতে mood ring ব্যবহার করে",
      "পিরামিডের ভেতরে Wi-Fi signal naturally boost হয়",
    ],
    correctIndex: 0,
    explanation: "Saturn-এর average density পানির চেয়ে কম। টবটা খুঁজে পেলেই physics খুশি।",
  },
  {
    prompt: "আজব কিন্তু সত্য fact ধরুন",
    options: [
      "অক্টোপাস boredom-এ sudoku খেলে",
      "মৌমাছি নাচের মাধ্যমে food direction জানায়",
      "ব্ল্যাক হোলের ভেতরে pizza crust harder হয়",
    ],
    correctIndex: 1,
    explanation: "Bee waggle dance real thing। insects-এরও GPS briefing আছে।",
  },
  {
    prompt: "কোনটা সত্যি science fact?",
    options: [
      "আপনার শরীরে কোষের সঙ্গে অসংখ্য microbe-ও থাকে",
      "মানুষ ঘুমের সময় brain পুরোপুরি switch off থাকে",
      "DNA edit করলে height সঙ্গে সঙ্গে double হয়",
    ],
    correctIndex: 0,
    explanation: "Human body একা না, microbiome-ও full-time roommate।",
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getCategoryById(id: CategoryId) {
  return categories.find((category) => category.id === id);
}
