import { DocumentAnalysisResult } from '../types';

export interface SampleDoc {
  id: string;
  titleAm: string;
  titleEn: string;
  fileType: string;
  date: string;
  result: DocumentAnalysisResult;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample_coffee_2016',
    titleAm: 'የኢትዮጵያ ቡና እና ሻይ ባለስልጣን ዓመታዊ የኤክስፖርት ሪፖርት (2016 ዓ.ም)',
    titleEn: 'Ethiopian Coffee & Tea Authority Annual Export Performance Report (2016 E.C.)',
    fileType: 'PDF Report / ሪፖርት',
    date: '2016 ዓ.ም',
    result: {
      ocrText: `የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ
የቡና እና ሻይ ባለስልጣን
ዓመታዊ የኤክስፖርት እና ምርት አፈጻጸም ሪፖርት - 2016 በጀት ዓመት

መግቢያ፡
የኢትዮጵያ የቡና ዘርፍ በሀገሪቱ የውጭ ምንዛሪ ግኝት ውስጥ ግንባር ቀደም ሚና መጫወቱን ቀጥሏል። በ2016 በጀት ዓመት ወደ ውጭ የተላከው የቡና መጠን 298,500 ቶን የደረሰ ሲሆን ይህም ከአምናው ተመሳሳይ ወቅት ጋር ሲነጻጸር የ18.4 በመቶ ጭማሪ አሳይቷል። በገንዘብ ሲተመን 1.43 ቢሊዮን የአሜሪካን ዶላር ገቢ ተገኝቷል።

ዋና ዋና የኤክስፖርት መዳረሻዎች፡
፩. ጀርመን (Germany)፡ 22% የገበያ ድርሻ
፪. ሳውዲ አረቢያ (Saudi Arabia)፡ 18% የገበያ ድርሻ
፫. አሜሪካ (United States)፡ 14% የገበያ ድርሻ
፬. ቤልጂየም (Belgium)፡ 11% የገበያ ድርሻ
፭. ጃፓን (Japan)፡ 9% የገበያ ድርሻ

የጥራት ደረጃ ማሻሻያ እና የሲዳማ፣ ይርጋጨፌ እና ጉጂ ቡናዎች በዓለም አቀፍ ደረጃ በልዩ ጣዕማቸው (Specialty Coffee) ከፍተኛ ዋጋ አስገኝተዋል። የዲጂታል መከታተያ ሥርዓት (Traceability System) መተግበሩ ለአርሶ አደሩ ቀጥተኛ ተጠቃሚነት የላቀ አስተዋጽኦ አድርጓል።`,
      documentType: 'ኦፊሴላዊ የኢኮኖሚ እና ኤክስፖርት ሪፖርት (Official Economic Export Report)',
      summaryAmharic: 'ይህ ሰነድ በ2016 በጀት ዓመት የኢትዮጵያ የቡና ኤክስፖርት አፈጻጸምን በዝርዝር ያትታል። በዓመቱ ውስጥ 298,500 ቶን ቡና ወደ ውጭ በመላክ 1.43 ቢሊዮን የአሜሪካ ዶላር ገቢ ተገኝቷል፤ ይህም የ18.4% እድገት ያሳያል። ጀርመን እና ሳውዲ አረቢያ ዋና ገዢዎች ሲሆኑ የሲዳማ፣ ይርጋጨፌ እና ጉጂ ስፔሻሊቲ ቡናዎች ከፍተኛ ዋጋ አስመዝግበዋል።',
      summaryEnglish: 'This official report outlines Ethiopia\'s coffee export performance for the 2016 Ethiopian fiscal year. Total export volume reached 298,500 metric tons, generating $1.43 billion USD in revenue—an 18.4% growth compared to the previous period. Germany and Saudi Arabia were the top destination markets, with Sidama, Yirgacheffe, and Guji specialty coffees fetching premium international prices.',
      keyPointsAmharic: [
        'በ2016 ዓ.ም የተገኘው የውጭ ምንዛሪ 1.43 ቢሊዮን ዶላር ደርሷል',
        'የኤክስፖርት መጠኑ 298,500 ቶን በመድረስ የ18.4% ጭማሪ አሳይቷል',
        'ጀርመን (22%) እና ሳውዲ አረቢያ (18%) ቀዳሚ የገበያ መዳረሻዎች ናቸው',
        'የዲጂታል መከታተያ ሥርዓት (Traceability) የአርሶ አደሩን ትርፍ አሻሽሏል',
      ],
      keyPointsEnglish: [
        'Total foreign currency earnings reached $1.43 Billion USD in 2016 E.C.',
        'Export volume expanded to 298,500 metric tons, up 18.4% year-over-year',
        'Germany (22%) and Saudi Arabia (18%) remained top destination markets',
        'Digital traceability systems significantly improved direct farmer compensation',
      ],
      entities: [
        { name: 'የቡና እና ሻይ ባለስልጣን', type: 'መንግስታዊ ተቋም / Govt Authority', amharic: 'የቡና እና ሻይ ባለስልጣን' },
        { name: 'ጀርመን (Germany)', type: 'የገበያ ሀገር / Country', amharic: 'ጀርመን' },
        { name: 'ሳውዲ አረቢያ (Saudi Arabia)', type: 'የገበያ ሀገር / Country', amharic: 'ሳውዲ አረቢያ' },
        { name: 'ሲዳማ እና ይርጋጨፌ', type: 'የአመራረት ክልል / Coffee Region', amharic: 'ሲዳማ / ይርጋጨፌ' },
      ],
      tableData: [
        { categoryAm: 'የኤክስፖርት ገቢ (ዶላር)', categoryEn: 'Export Earnings ($)', value: 1430, unit: 'ሚሊዮን ዶላር ($M)', trend: '+18.4%' },
        { categoryAm: 'የተላከው ቡና መጠን', categoryEn: 'Volume Exported', value: 298.5, unit: 'ሺህ ቶን (k Tons)', trend: '+14.2%' },
        { categoryAm: 'የስፔሻሊቲ ቡና ድርሻ', categoryEn: 'Specialty Coffee Share', value: 46, unit: 'በመቶኛ (%)', trend: '+8.1%' },
        { categoryAm: 'የአርሶ አደር ገቢ ድርሻ', categoryEn: 'Farmer Price Realization', value: 72, unit: 'በመቶኛ (%)', trend: '+11.5%' },
      ],
      chart: {
        titleAm: 'የኢትዮጵያ ቡና ኤክስፖርት እድገት በዓመታት (በሚሊዮን ዶላር)',
        titleEn: 'Ethiopian Coffee Export Revenue Growth (in Millions USD)',
        type: 'bar',
        data: [
          { name: '2013', value: 907, labelAm: '2013 ዓ.ም (907M)' },
          { name: '2014', value: 1120, labelAm: '2014 ዓ.ም (1,120M)' },
          { name: '2015', value: 1210, labelAm: '2015 ዓ.ም (1,210M)' },
          { name: '2016', value: 1430, labelAm: '2016 ዓ.ም (1,430M)' },
        ],
      },
    },
  },
  {
    id: 'sample_lalibela_history',
    titleAm: 'የላሊበላ ውቅር አብያተ ክርስቲያናት ጥንታዊ የታሪክ እና የህንፃ ጥበብ መዝገብ',
    titleEn: 'Historical Monograph: Rock-Hewn Architecture and Heritage of Lalibela (Roha)',
    fileType: 'ብራና / Historical Manuscript Archive',
    date: '12ኛው መቶ ክፍለ ዘመን / 12th Century',
    result: {
      ocrText: `በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።
ዝክረ ዜናሁ ለቅዱስ ላሊበላ ንጉሠ ጽዮን ወኢትዮጵያ።

በሮሃ ምድር (ደብረ ሮሃ) የተሰሩት አሥራ አንዱ አብያተ ክርስቲያናት ከእሳተ ጎሞራ ድንጋይ ተፈልፍለው ያለ ምንም ጭቃና መገጣጠሚያ የተሰሩ ድንቅ የአለም ቅርሶች ናቸው። 
ቅዱስ ላሊበላ ይህን ስራ በሰማያዊ መልአክ ረዳትነት በሃያ አራት ዓመታት ውስጥ እንዳጠናቀቀው በዜና መዋዕሉ ተጽፏል።

የአብያተ ክርስቲያናቱ ክፍፍል፡
፩. የመጀመሪያው ምድብ (ሰሜናዊ)፡ ቤተ መድኃኔ ዓለም (በዓለም ትልቁ ነጠላ የድንጋይ ህንፃ)፣ ቤተ ማርያም፣ ቤተ መስቀል፣ ቤተ ደናግል፣ ቤተ ጎልጎታ።
፪. ሁለተኛው ምድብ (ደቡባዊ)፡ ቤተ አማኑኤል፣ ቤተ መርቆሬዎስ፣ ቤተ አባ ሊባኖስ፣ ቤተ ገብርኤል ወሩፋኤል።
፫. ሦስተኛው ምድብ (ብቻውን የቆመው የመስቀል ቅርጽ ህንፃ)፡ ቤተ ጊዮርጊስ።

የሕንፃው ጥበብ የአክሱም ስልጣኔን የድንጋይ ቀረጻ እና የውቅር ጥበብ ከክርስትና መንፈሳዊ ምሥጢር ጋር ያዋሃደ የማይተካ ቅርስ ነው።`,
      documentType: 'የታሪክና የቅርስ ጥናት ሰነድ (Historical & Architectural Manuscript)',
      summaryAmharic: 'ሰነዱ በ12ኛው መቶ ክፍለ ዘመን በንጉሥ ላሊበላ የተሰሩትን 11ቱን የሮሃ ውቅር አብያተ ክርስቲያናት ታሪካዊ አመሰራረት፣ የህንፃ አወቃቀርና ምድብ ይዳስሳል። ህንፃዎቹ ከእሳተ ጎሞራ ድንጋይ ያለ ጭቃ የተፈለፈሉ ሲሆኑ በሰሜናዊ፣ ደቡባዊ እና በቤተ ጊዮርጊስ ተከፍለው ተቀምጠዋል።',
      summaryEnglish: 'This historical record details the 12th-century reign of King Lalibela and the construction of the eleven monolithic rock-hewn churches of Roha. Carved entirely from single volcanic scoria bedrock without mortar, the churches are cataloged into three clusters, culminating in the iconic Greek-cross shaped Bete Giyorgis.',
      keyPointsAmharic: [
        '11ቱ ውቅር አብያተ ክርስቲያናት ከአንድ ወጥ ቀይ ቋጥኝ ተፈልፍለው የተሰሩ ናቸው',
        'ቤተ መድኃኔ ዓለም በዓለም ትልቁ ነጠላ የድንጋይ ውቅር ቤተክርስቲያን ነው',
        'የአክሱም ስነ-ህንፃ ባህል (Beam-ends and stepped plinths) በግልጽ ይታይበታል',
        'ቤተ ጊዮርጊስ የተዋጣለት የኢትዮጵያ መስቀል ቅርጽ ምህንድስና መገለጫ ነው',
      ],
      keyPointsEnglish: [
        'All 11 churches are carved monolithically from singular volcanic bedrock without mortar',
        'Bete Medhane Alem is the largest rock-hewn monolith church in the world',
        'Exhibits classic Axumite architectural heritage with stepped plinths and wood-beam imitation',
        'Bete Giyorgis stands isolated as a masterpiece of Greek-cross symmetrical engineering',
      ],
      entities: [
        { name: 'ቅዱስ ላሊበላ (King Lalibela)', type: 'ታሪካዊ ንጉሥ / Emperor', amharic: 'ቅዱስ ላሊበላ' },
        { name: 'ሮሃ (ደብረ ሮሃ)', type: 'የቀድሞ ስም / Historic City', amharic: 'ሮሃ' },
        { name: 'ቤተ ጊዮርጊስ', type: 'ታዋቂ ቤተክርስቲያን / Monolith', amharic: 'ቤተ ጊዮርጊስ' },
        { name: 'ቤተ መድኃኔ ዓለም', type: 'ትልቁ ህንፃ / Cathedral', amharic: 'ቤተ መድኃኔ ዓለም' },
      ],
      tableData: [
        { categoryAm: 'አጠቃላይ የአብያተ ክርስቲያናት ብዛት', categoryEn: 'Total Rock Churches', value: 11, unit: 'ህንፃዎች', trend: 'ሙሉ ጥበቃ' },
        { categoryAm: 'የግንባታ ጊዜ ርዝማኔ', categoryEn: 'Construction Duration', value: 24, unit: 'ዓመታት (Years)', trend: 'ታሪካዊ' },
        { categoryAm: 'የቤተ መድኃኔ ዓለም ቁመት', categoryEn: 'Medhane Alem Height', value: 11.5, unit: 'ሜትር (Meters)', trend: 'ግዙፍ' },
        { categoryAm: 'ዓመታዊ ጎብኝዎች ቁጥር', categoryEn: 'Annual Pilgrims & Visitors', value: 145, unit: 'ሺህ (Thousands)', trend: '+28%' },
      ],
      chart: {
        titleAm: 'የጎብኝዎች እና ምዕመናን ቁጥር እድገት (በሺህ)',
        titleEn: 'Lalibela Pilgrim & Visitor Inflow (in Thousands)',
        type: 'bar',
        data: [
          { name: '2013', value: 85, labelAm: '2013 ዓ.ም (85k)' },
          { name: '2014', value: 92, labelAm: '2014 ዓ.ም (92k)' },
          { name: '2015', value: 118, labelAm: '2015 ዓ.ም (118k)' },
          { name: '2016', value: 145, labelAm: '2016 ዓ.ም (145k)' },
        ],
      },
    },
  },
];
