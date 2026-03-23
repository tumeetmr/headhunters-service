import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL']!,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = 'Lambda@2026';

interface RecruiterSeed {
  name: string;
  slug: string;
  email: string;
  title: string;
  bio: string;
  experience_years?: number;
  education?: string;
  sectors?: string[];
  specialties?: string[];
  skills?: string[];
  languages?: string[];
  awards?: string[];
  linkedin?: string;
  phone?: string;
  photoUrl?: string;
  insights?: { title: string; description?: string; mediaUrl?: string; thumbnailUrl?: string }[];
}

const recruiters: RecruiterSeed[] = [
  {
    name: 'Б.Очирзаяа',
    slug: 'ochirzaya',
    email: 'ochirzaya@lambda.mn',
    title:
      'Leadership & Management, Organizational Strategy, Executive Hiring Solutions',
    experience_years: 23,
    education: 'Executive MBA',
    sectors: ['Education', 'Trade', 'Mining', 'Consulting', 'HR'],
    bio: 'Бизнес, Менежментийн салбарт 20 гаруй жил ажилласан туршлагатай. Сүүлийн жилүүдэд Зөвлөх үйлчилгээ, Хүний нөөц бүрдүүлэлтийн чиглэлд төвлөрч ажиллаж байна. Удирдах албан тушаалын бүрдүүлэлт дээр түлхүү ажиллаж байна.',
    linkedin: 'https://www.linkedin.com/in/ochirzaya-bayarrentsen-8baa32b0',
    phone: '88886418',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1syJaL3bQQrMYY68bte6UPLssDG-JSGEN',
    insights: [
      {
        title: 'Ochirzaya Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1295006249169500%2F&show_text=false&width=267&t=0',
      }
    ]
  },
  {
    name: 'М.Оюун-Ундрам',
    slug: 'oyun-undram',
    email: 'oyun.undram@lambda.mn',
    title: 'HR & Business Leadership',
    experience_years: 10,
    education: 'Master of HR and Business Administration',
    specialties: ['Recruitment', 'Planning'],
    bio: 'Байгалийн зохион байгуулагч, эерэг эрч хүчээр дүүрэн манлайлагч. Миний зарчим бол үнэнч байдал болон тасралтгүй зүтгэл. Хүний нөөцийн бүрдүүлэлт, төлөвлөлтөөр голчлон ажилладаг.',
    linkedin:
      'https://www.linkedin.com/in/oyunundram-maisaikhan-50b9a1387/',
    phone: '86118108',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1p810I5NuqtKRHfiC1zXV23Xrdl-720ek',
  },
  {
    name: 'Ц.Намуун',
    slug: 'namuun',
    email: 'namuun@lambda.mn',
    title: 'International Relations & Project Manager',
    experience_years: 5,
    education: 'Master of Public Administration',
    specialties: [
      'International Recruitment',
      'Cross-cultural Communication',
      'Staffing',
    ],
    skills: ['IELTS 8.0', 'Diplomatic Communication', 'Strategic Partnership'],
    bio: 'Олон улсын болон бизнесийн байгууллагуудад гадаад харилцаа, төслийн менежерээр ажилласан. 1,000 програм хангамжийн инженер бэлтгэх стратегийн түншлэлийн төслийг удирдаж байсан туршлагатай.',
    linkedin: 'https://www.linkedin.com/in/namuun-tsendjav/',
    phone: '80107211',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1Oedf36g4Hs3Yu-a83PyhM09UaPF28x-k',
  },
  {
    name: 'Б.Урантуяа',
    slug: 'urantuya',
    email: 'urantuya@lambda.mn',
    title:
      'Executive Leadership Journalism, Economic Journalist, PR Specialist',
    experience_years: 18,
    sectors: [
      'Mining',
      'Construction',
      'Transport',
      'Food & Light Industry',
      'Education',
      'Tech',
    ],
    specialties: ['PR Portraits', 'Interviews', 'Recruiting Partner'],
    bio: 'Хэвлэл мэдээллийн салбарт 18 жил ажилласан. Recruiting Partner-ийн хүрээнд олон салбарын компаниудтай хамтын ажиллагаагаа өргөжүүлэн ажиллаж байна.',
    phone: '88004564',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1imfkfM9w4EVLTnrqmVfZaDaCvf43Z0hB',
  },
  {
    name: 'Г.Номин-Эрдэнэ',
    slug: 'nomin-erdene',
    email: 'nomin.erdene@lambda.mn',
    title: 'HR Partner & Operations Manager',
    experience_years: 2,
    education: 'International Relations (NUM, 2022)',
    sectors: ['Electronics', 'Construction', 'Mining (Oyu Tolgoi)'],
    specialties: ['Recruitment', 'Labor Relations'],
    bio: 'Энка Глобал констракшн ХХК-ийн Оюу Толгойн баяжуулалтын төсөл дээр Хүний нөөцийн сонгон шалгаруулалт хариуцаж байсан. Одоогоор Ламбда Глобал ХХК-д Хүний нөөцийн түнш.',
    linkedin:
      'https://www.linkedin.com/in/nominerdene-galbadrakh-40a963215/',
    phone: '89555342',
  },
  {
    name: 'Д.Одончимэг',
    slug: 'odonchimeg',
    email: 'odonchimeg@lambda.mn',
    title: 'Talent Partner',
    experience_years: 20,
    education: "Master's Degree (Engineering base)",
    specialties: [
      'L&D',
      'Recruitment',
      'ERP Implementation',
      'ISO Systems',
    ],
    bio: '1200 хүнтэй групп компанийн сургалт хөгжил, бүрдүүлэлт болон хүний нөөцийн нэгжийн ERP системийн нэвтрүүлэлтийг амжилттай хэрэгжүүлсэн.',
    linkedin: 'https://www.linkedin.com/odonchimeg-darambazar',
    phone: '93112686',
    photoUrl: 'https://drive.google.com/uc?export=view&id=12VXHaDEWQHn-hSpXs-bQg2WIrhwqhUtN',
  },
  {
    name: 'Д.Мөнхжаргал',
    slug: 'munkhjargal',
    email: 'munkhjargal@lambda.mn',
    title: 'Strategic Human Resources Partner',
    experience_years: 14,
    education: 'MBA in Human Resources Management',
    sectors: ['Mining', 'Automotive', 'Hospitality', 'Equipment'],
    specialties: [
      'End-to-end Talent Acquisition',
      'HR Systems',
      'Expatriate Mobilization',
      'Visa Process',
    ],
    bio: 'Strategic Human Resources Partner with 14+ years of experience in multinational corporation and industrial environments.',
    linkedin:
      'https://www.linkedin.com/in/munkhjargal-damdinsuren-a680b7187/',
    phone: '88103678',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1PmgbXPcJJNz3e5hiOCtKyFmGTEjEz2MD',
    insights: [
      {
        title: 'Munkhjargal Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1494519638767519%2F&show_text=false&width=267&t=0',
      }
    ]
  },
  {
    name: 'Э.Үүрцайх',
    slug: 'uurtsaikh',
    email: 'uurtsaikh@lambda.mn',
    title: 'HR Specialist',
    experience_years: 8,
    education: 'Master of HR Management and Business Administration',
    sectors: ['Construction', 'Mining'],
    specialties: ['Recruitment', 'Labor Relations'],
    bio: 'Хүний нөөцийн мэргэжлээрээ тасралтгүй 8 жил ажиллаж байна. Сонгон шалгаруулалт, хөдөлмөрийн харилцаа талдаа мэргэшсэн.',
    linkedin:
      'https://www.linkedin.com/in/uurtsaikh-enebish-238a09158',
    phone: '99956947',
  },
  {
    name: 'Уранбилэг',
    slug: 'uranbileg',
    email: 'uranbileg@lambda.mn',
    title: 'HR Consultant & Psychological Counselor',
    experience_years: 43,
    education: 'Nurse, Pharmacist, Teacher, Translator',
    sectors: ['Health', 'Education', 'Tourism'],
    bio: 'Эрүүл мэндийн салбарт 17 жил, боловсролын салбарт 26 жил ажилласан. Хүний нөөц, ажил мэргэлжийн сонголт хийхэд залууст сэтгэл зүйн зөвлөлгөө өгч байна.',
    linkedin:
      'https://www.linkedin.com/in/uranbileg-chogsom-829136a9/',
    phone: '99140669',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1iTlo32oacMEDDz27USDzSmuSVW3O0CFi',
  },
  {
    name: 'Д.Энхцэцэг',
    slug: 'enkhtsetseg',
    email: 'enkhtsetseg@lambda.mn',
    title: 'Executive Finance & Trade Specialist',
    experience_years: 25,
    education: 'Accountant, Economist, Master of Public Administration',
    specialties: [
      'Risk Management',
      'Strategic Planning',
      'Digital Product Implementation',
      'Non-performing Loans',
    ],
    bio: 'Санхүү болон худалдааны чиглэлээр 25+ жилийн удирдах түвшний туршлагатай. Олон улсын стандарттай нийцсэн бодлого, журам боловсруулах чиглэлээр мэргэшсэн.',
    linkedin:
      'https://www.linkedin.com/in/tsetsgee-dashdondog-9099b736a/',
    phone: '99075770',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1AwXSqQqkhvnHj3RCyiuPgwzsd5eMbhUK'
  },
  {
    name: 'Г.Ганчимэг',
    slug: 'ganchimeg-g',
    email: 'ganchimeg.g@lambda.mn',
    title: 'Professional Recruiter (Chinese & MNCs)',
    sectors: ['Telecom', 'IT', 'HR Consulting'],
    languages: ['English', 'Chinese'],
    specialties: ['Headhunting', 'MNC Talent Acquisition'],
    bio: 'Үндэстэн дамнасан компаниудад рекрутерээр ажилласан туршлагатай. Англи, Хятад хэлээр чөлөөтэй харилцдаг.',
    linkedin: 'https://www.linkedin.com/in/ganchimegg/',
    phone: '72111272',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1DaOPMOPwX3mx4G-8fkpFwMUXRgIXHUBu',
    insights: [
      {
        title: 'Ganchimeg Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F905125295733382%2F&show_text=false&width=267&t=0',
      }
    ]
  },
  {
    name: 'М.Зулаа',
    slug: 'zulaa',
    email: 'zulaa@lambda.mn',
    title: 'HR Manager',
    experience_years: 5,
    education: 'Business Administration (HR)',
    sectors: ['Food Production', 'Information Technology'],
    specialties: [
      'Organizational Culture',
      'Recruitment',
      'Performance Management',
    ],
    bio: 'Мэдээллийн технологийн салбарын хурдтай өөрчлөлт болон хүнсний салбарын стандарт, гүйцэтгэлийн удирдлагыг хослуулан ажиллах чадвартай.',
    linkedin: 'https://www.linkedin.com/in/munkhtur-zulaa-66521937',
    phone: '98989747',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1aBx_eOSwoSYzfEe3yt01Y0SO_fgq8QCG'
  },
  {
    name: 'С.Ариунаа',
    slug: 'ariunaa',
    email: 'ariunaa@lambda.mn',
    title: 'Human Resources & Executive Leadership',
    experience_years: 15,
    sectors: [
      'Banking',
      'Finance',
      'Engineering',
      'Education',
      'Renewable Energy',
    ],
    specialties: [
      'Workforce Planning',
      'Employee Motivation',
      'Performance Evaluation',
      'Foreign Recruitment',
    ],
    bio: '15 гаруй жилийн туршлагатай. Мянганы сорилтын сангийн төсөл болон сэргээгдэх эрчим хүчний томоохон төслүүдийн бүрдүүлэлт дээр ажиллаж байсан.',
    linkedin: 'https://www.linkedin.com/in/ariunaa-ser-od-2a156516a/',
    phone: '99105053',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1KjJi_6AvkMZ3dcSbJw0iT-A_c1fSzGrI',
    insights: [
      {
        title: 'Ariunaa Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1416007530205354%2F&show_text=false&width=267&t=0',
      },
    ],
  },
  {
    name: 'Т.Баярмаа',
    slug: 'bayarmaa',
    email: 'bayarmaa@lambda.mn',
    title: 'Mining & Engineering Recruiter',
    experience_years: 10,
    languages: ['English', 'Russian', 'Korean'],
    sectors: ['Mining', 'Construction', 'Finance', 'Education', 'Sales'],
    specialties: ['Expatriate Management', 'Procurement', 'Onboarding'],
    bio: 'Oyu Tolgoi Underground Project дээр 400 гаруй ажилтны бүрдүүлэлтийг хариуцан ажиллаж байсан туршлагатай.',
    linkedin: 'https://www.linkedin.com/in/bayarmaa-t-a181b185/',
    phone: '99834683',
    photoUrl: 'https://drive.google.com/uc?export=view&id=12wcTKJ1rLFlFhDKfhr5AO9-8Ybrjjs75',
  },
  {
    name: 'Э.Ганчимэг',
    slug: 'ganchimeg-e',
    email: 'ganchimeg.e@lambda.mn',
    title: 'Marketing & Sales Recruiter',
    sectors: ['Marketing', 'Sales', 'Commerce'],
    specialties: ['Talent Sourcing', 'Network Marketing'],
    bio: 'Борлуулалт, маркетинг, худалдааны салбаруудад мэргэшсэн чадварлаг хүний нөөцийн рекрутер.',
    linkedin: 'https://www.linkedin.com/in/ganchimeg-enebish/',
    phone: '88094000',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1etczTlOp1nyQ4W_j4Q2HuhbewNv6llYT',
    insights: [
      {
        title: 'Ganchimeg Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F799266812699995%2F&show_text=false&width=267&t=0',
      }
    ]
  },
  {
    name: 'Н.Амаржаргал',
    slug: 'amarjargal',
    email: 'amarjargal@lambda.mn',
    title: 'HR Consultant & ISO Auditor',
    experience_years: 22,
    education: 'Master of Business and Public Administration',
    specialties: [
      'HR Audit',
      'ISO 30400:2016',
      'ISO 9001:2015',
      'Strategic Management',
    ],
    sectors: [
      'Banking',
      'Manufacturing',
      'Retail',
      'Telecom',
      'Construction',
      'Healthcare',
    ],
    bio: '24 компанид зөвлөх үйлчилгээ үзүүлсэн. Хүний нөөцийн аудит, гүйцэтгэлийн үнэлгээ, ур чадварын зөрүүгийн шинжилгээгээр мэргэшсэн.',
    linkedin:
      'https://www.linkedin.com/in/amarjargal-nergui-0952606b/',
    phone: '89192017',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1RT4qGoQN9PmFokAyByL9aFIXS0XhsJMJ',
  },
  {
    name: 'Г.Дулам',
    slug: 'dulam',
    email: 'dulam@lambda.mn',
    title: 'HR Strategic Planning & Mentor',
    experience_years: 12,
    specialties: [
      'L&D',
      'Performance Management',
      'Coaching',
      'HR Strategy',
    ],
    awards: ['Best Innovator Member'],
    bio: 'Монголын томоохон групп компаниудад хүний нөөцийн бодлого хэрэгжүүлсэн. Дасгалжуулалтын академийн ментор.',
    linkedin: 'https://www.linkedin.com/in/dulam-gansukh-511b0079/',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1D5V4Qr0C3-JpV-rqjNKYDKD2hQRItMRW',
    insights: [
      {
        title: 'Dulam Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F948975324263440%2F&show_text=false&width=267&t=0',
      }
    ]
  },
];

async function main() {
  console.log('🌱 Starting seed...\n');

  const hashedPassword = await hash(DEFAULT_PASSWORD, 12);

  // ── Collect and upsert all unique Skill(type, value) ──────
  const allSkills = new Map<string, { type: string; value: string }>();
  const addSkill = (type: string, value?: string) => {
    if (!value) return;
    const normalized = value.trim();
    if (!normalized.length) return;
    allSkills.set(normalized.toLowerCase(), { type, value: normalized });
  };

  for (const r of recruiters) {
    r.skills?.forEach((v) => addSkill('SKILL', v));
    r.sectors?.forEach((v) => addSkill('INDUSTRY', v));
    r.specialties?.forEach((v) => addSkill('EXPERTISE', v));
    r.languages?.forEach((v) => addSkill('LANGUAGE', v));
    r.awards?.forEach((v) => addSkill('CERTIFICATION', v));
  }

  for (const skill of allSkills.values()) {
    await prisma.skill.upsert({
      where: { value: skill.value },
      update: { type: skill.type },
      create: skill,
    });
  }

  if (allSkills.size > 0) {
    console.log(`✓ Upserted ${allSkills.size} skills`);
  }

  const skillsByValue = new Map<string, string>();
  const persistedSkills = await prisma.skill.findMany({
    select: { id: true, value: true },
  });
  for (const skill of persistedSkills) {
    skillsByValue.set(skill.value.toLowerCase(), skill.id);
  }

  // ── Seed each recruiter ───────────────────────────────────
  for (const r of recruiters) {
    // 1. Create User
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        email: r.email,
        password: hashedPassword,
        name: r.name,
        role: 'RECRUITER',
      },
    });

    // 2. Create RecruiterProfile
    const profile = await prisma.recruiterProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        slug: r.slug,
        title: r.title,
        tagline: r.education ?? null,
        bio: r.bio,
        yearsExperience: r.experience_years ?? null,
        visibility: 'PUBLISHED',
        photoUrl: r.photoUrl ?? null,
        publicPhone: r.phone ?? null,
        isLeadPartner: (r.experience_years ?? 0) >= 15,
      },
    });

    // 3. Create Tags linked to Skill(type, value)
    const tags: { type: string; value: string; sortOrder: number }[] = [];

    r.skills?.forEach((v, i) =>
      tags.push({ type: 'SKILL', value: v, sortOrder: i }),
    );

    r.sectors?.forEach((v, i) =>
      tags.push({ type: 'INDUSTRY', value: v, sortOrder: i }),
    );
    r.specialties?.forEach((v, i) =>
      tags.push({ type: 'EXPERTISE', value: v, sortOrder: i }),
    );
    r.languages?.forEach((v, i) =>
      tags.push({ type: 'LANGUAGE', value: v, sortOrder: i }),
    );
    r.awards?.forEach((v, i) =>
      tags.push({ type: 'CERTIFICATION', value: v, sortOrder: i }),
    );

    for (const tag of tags) {
      const skillId = skillsByValue.get(tag.value.toLowerCase());
      if (!skillId) continue;

      await prisma.recruiterTag.upsert({
        where: {
          recruiterProfileId_skillId: {
            recruiterProfileId: profile.id,
            skillId,
          },
        },
        update: {
          sortOrder: tag.sortOrder,
        },
        create: {
          recruiterProfileId: profile.id,
          skillId,
          sortOrder: tag.sortOrder,
        },
      });
    }

    // 4. Create RecruiterLinks (LinkedIn + Phone)
    if (r.linkedin) {
      const url = r.linkedin.startsWith('http')
        ? r.linkedin
        : `https://${r.linkedin}`;
      await prisma.recruiterLink.upsert({
        where: {
          recruiterProfileId_type_url: {
            recruiterProfileId: profile.id,
            type: 'LINKEDIN',
            url,
          },
        },
        update: {},
        create: {
          recruiterProfileId: profile.id,
          type: 'LINKEDIN',
          label: 'LinkedIn',
          url,
        },
      });
    }

    if (r.phone) {
      const phoneUrl = `tel:+976${r.phone}`;
      await prisma.recruiterLink.upsert({
        where: {
          recruiterProfileId_type_url: {
            recruiterProfileId: profile.id,
            type: 'PHONE',
            url: phoneUrl,
          },
        },
        update: {},
        create: {
          recruiterProfileId: profile.id,
          type: 'PHONE',
          label: r.phone,
          url: phoneUrl,
        },
      });
    }

    // 5. Create RecruiterInsights
    if (r.insights) {
      for (let i = 0; i < r.insights.length; i++) {
        const insight = r.insights[i];
        await prisma.recruiterInsight.create({
          data: {
            recruiterProfileId: profile.id,
            title: insight.title,
            description: insight.description ?? null,
            mediaUrl: insight.mediaUrl ?? null,
            thumbnailUrl: insight.thumbnailUrl ?? null,
            status: 'PUBLISHED',
            sortOrder: i,
            publishedAt: new Date(),
          },
        });
      }
    }

    console.log(`  ✓ ${r.name} (${r.slug})`);
  }

  console.log(`\n🎉 Seeded ${recruiters.length} recruiters successfully!`);
  console.log(`   Default password: ${DEFAULT_PASSWORD}`);

  // ── Create Form Template ───────────────────────────────────
  const formTemplate = await prisma.formTemplate.upsert({
    where: { name: 'Recruiter Request Form - Mongolian' },
    update: {},
    create: {
      name: 'Recruiter Request Form - Mongolian',
      isActive: true,
      fields: {
        create: [
          {
            key: 'position_title',
            label: 'Ямар албан тушаалийн захиалга өгч буй вэ?',
            type: 'TEXT',
            placeholder: 'Албан тушаалын нэрийг оруулна уу',
            isRequired: true,
            sortOrder: 0,
          },
          {
            key: 'main_responsibilities',
            label: 'Энэ үүргийн үндсэн хариуцлагууд юу вэ?',
            type: 'TEXTAREA',
            placeholder: 'Үндсэн хариуцлагуудыг дэлгэрүүлэн бичнэ үү',
            isRequired: true,
            sortOrder: 1,
          },
          {
            key: 'required_skills',
            label: 'Энэ албан тушаалд шаардагдах гол ур чадварууд болон шалгуур үзүүлэлтүүд юу вэ?',
            type: 'TEXTAREA',
            placeholder: 'Шаардагдах ур чадвар болон крайтерийг оруулна уу',
            isRequired: true,
            sortOrder: 2,
          },
          {
            key: 'culture_fit',
            label: 'Танай компанийн соёлд ямар хүн нийцэх вэ?',
            type: 'TEXTAREA',
            placeholder: 'Компаний соёлд нийцэх хүний шинж чанарыг бичнэ үү',
            isRequired: true,
            sortOrder: 3,
          },
          {
            key: 'salary',
            label: 'Тус албан тушаалийн цалин хэд вэ?',
            type: 'TEXT',
            placeholder: 'Цалины хэмжээг оруулна уу (жишээ: 2,000,000 - 3,000,000 ₮)',
            isRequired: true,
            sortOrder: 4,
          },
          {
            key: 'benefits',
            label: 'Нэмэлт бонус, benefit бий юу?',
            type: 'TEXTAREA',
            placeholder: 'Боломжтай бонус болон benefitуудыг бичнэ үү',
            isRequired: false,
            sortOrder: 5,
          },
          {
            key: 'other_requirements',
            label: 'Өөр шаардлага, хүсэлтүүд бий юу?',
            type: 'TEXTAREA',
            placeholder: 'Бусад шаардалгууд эсвэл хүсэлтүүдийг бичнэ үү',
            isRequired: false,
            sortOrder: 6,
          },
          {
            key: 'feedback',
            label: 'Lambda.Global холбоотой санал хүсэлтээ бидэнд илгээнэ үү.',
            type: 'TEXTAREA',
            placeholder: 'Манай үйлчилгээний талаар санал хүсэлтээ оруулна уу',
            isRequired: false,
            sortOrder: 7,
          },
        ],
      },
    },
    include: { fields: true },
  });

  console.log(`✓ Created form template: "${formTemplate.name}" with ${formTemplate.fields.length} fields`);

  // ── Seed Subscription Plans ────────────────────────────────
  const subscriptionPlansData = [
    {
      name: 'STARTER',
      description: 'Perfect for getting started with Lambda',
      price: 0,
      currency: 'MNT',
      interval: 'MONTHLY',
      features: {
        max_active_projects: 1,
        max_proposals_viewable: 5,
        can_direct_message: false,
        can_shortlist: false,
        can_post_recruit_request: false,
        featured_projects: 0,
        dedicated_account_manager: false,
        analytics_access: false,
      },
      isActive: true,
    },
    {
      name: 'PROFESSIONAL',
      description: 'For companies actively hiring',
      price: 49900,
      currency: 'MNT',
      interval: 'MONTHLY',
      features: {
        max_active_projects: 3,
        max_proposals_viewable: 25,
        can_direct_message: true,
        can_shortlist: true,
        can_post_recruit_request: true,
        featured_projects: 1,
        dedicated_account_manager: false,
        analytics_access: true,
      },
      isActive: true,
    },
    {
      name: 'GROWTH',
      description: 'For growing companies looking to scale hiring',
      price: 99900,
      currency: 'MNT',
      interval: 'MONTHLY',
      features: {
        max_active_projects: 10,
        max_proposals_viewable: -1,
        can_direct_message: true,
        can_shortlist: true,
        can_post_recruit_request: true,
        featured_projects: 3,
        dedicated_account_manager: false,
        analytics_access: true,
      },
      isActive: true,
    },
  ];

  for (const planData of subscriptionPlansData) {
    await prisma.subscriptionPlan.upsert({
      where: { name: planData.name },
      update: { features: planData.features },
      create: planData,
    });
  }

  console.log(`✓ Seeded ${subscriptionPlansData.length} subscription plans`);

  // ── Seed Companies ─────────────────────────────────────────
  const companiesData = [
    {
      name: 'Ondo LLC',
      slug: 'ondo',
      email: 'hr@ondo.mn',
      industry: 'Technology & Innovation',
      location: 'Ulaanbaatar',
      website: 'https://www.ondo.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1ondo_logo',
      description: 'Technology-focused company building the future.',
      size: '500+',
    },
    {
      name: 'Lambda Global',
      slug: 'lambda-global',
      email: 'careers@lambda.mn',
      industry: 'Human Resources & Recruitment',
      location: 'Ulaanbaatar',
      website: 'https://www.lambda.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1lambda_logo',
      description: 'Leading recruitment consultancy in Mongolia.',
      size: '100+',
    },
    {
      name: 'Oyu Tolgoi LLC',
      slug: 'oyu-tolgoi',
      email: 'careers@ot.mn',
      industry: 'Mining & Resources',
      location: 'South Gobi',
      website: 'https://www.oyutolgoi.com',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1ot_logo',
      description: 'One of the world\'s largest copper mining projects.',
      size: '2000+',
    },
    {
      name: 'XAC Bank',
      slug: 'xac-bank',
      email: 'recruitment@xacbank.mn',
      industry: 'Banking & Finance',
      location: 'Ulaanbaatar',
      website: 'https://www.xacbank.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1xac_logo',
      description: 'Leading commercial bank in Mongolia.',
      size: '1000+',
    },
    {
      name: 'Enka Global Construction',
      slug: 'enka-global',
      email: 'hr@enka.mn',
      industry: 'Construction & Engineering',
      location: 'Ulaanbaatar',
      website: 'https://www.enka.com',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1enka_logo',
      description: 'International construction and engineering services.',
      size: '1500+',
    },
    {
      name: 'MobiCom Corporation',
      slug: 'mobicom',
      email: 'careers@mobicom.mn',
      industry: 'Telecommunications',
      location: 'Ulaanbaatar',
      website: 'https://www.mobicom.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1mobicom_logo',
      description: 'Mongolia\'s leading telecommunications provider.',
      size: '2000+',
    },
    {
      name: 'National University of Mongolia',
      slug: 'num',
      email: 'hr@num.edu.mn',
      industry: 'Education',
      location: 'Ulaanbaatar',
      website: 'https://www.num.edu.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1num_logo',
      description: 'Mongolia\'s premier higher education institution.',
      size: '800+',
    },
    {
      name: 'Temuulen Healthcare',
      slug: 'temuulen-health',
      email: 'careers@temuulen.mn',
      industry: 'Healthcare & Medical',
      location: 'Ulaanbaatar',
      website: 'https://www.temuulen.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1temuulen_logo',
      description: 'Leading private healthcare provider in Mongolia.',
      size: '500+',
    },
    {
      name: 'Gobi Cashmere',
      slug: 'gobi-cashmere',
      email: 'recruitment@gobicashmere.mn',
      industry: 'Manufacturing & Textiles',
      location: 'Gobi Region',
      website: 'https://www.gobicashmere.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1gobi_logo',
      description: 'Premium cashmere manufacturer serving global markets.',
      size: '300+',
    },
    {
      name: 'Peace Avenue Retail Group',
      slug: 'peace-avenue',
      email: 'hr@peaceavenue.mn',
      industry: 'Retail & Commerce',
      location: 'Ulaanbaatar',
      website: 'https://www.peaceavenue.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1peace_logo',
      description: 'Leading retail and shopping mall operator in Mongolia.',
      size: '600+',
    },
    {
      name: 'Mongolian Premier League (Football)',
      slug: 'mpl-football',
      email: 'admin@mpl.mn',
      industry: 'Sports & Entertainment',
      location: 'Ulaanbaatar',
      website: 'https://www.mpl.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1mpl_logo',
      description: 'Professional sports management and organization.',
      size: '200+',
    },
    {
      name: 'Eternal Energy Corp',
      slug: 'eternal-energy',
      email: 'careers@eternalenergy.mn',
      industry: 'Renewable Energy',
      location: 'Ulaanbaatar',
      website: 'https://www.eternalenergy.mn',
      logoUrl: 'https://drive.google.com/uc?export=view&id=1eternal_logo',
      description: 'Leading renewable energy company in Central Asia.',
      size: '400+',
    },
  ];

  const upsertedCompanies: typeof companiesData = [];
  for (const companyData of companiesData) {
    // Create or get user
    const user = await prisma.user.upsert({
      where: { email: companyData.email },
      update: {},
      create: {
        email: companyData.email,
        password: hashedPassword,
        name: companyData.name,
        role: 'COMPANY',
      },
    });

    // Create or get company
    const company = await prisma.company.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: companyData.name,
        slug: companyData.slug,
        industry: companyData.industry,
        location: companyData.location,
        website: companyData.website,
        logoUrl: companyData.logoUrl,
        description: companyData.description,
        size: companyData.size,
      },
    });

    upsertedCompanies.push(companyData);
    console.log(`  ✓ ${companyData.name} (${companyData.slug})`);
  }

  console.log(`✓ Seeded ${upsertedCompanies.length} companies`);

  // ── Assign Starter plan to companies ─────────────────────────
  const starterPlan = await prisma.subscriptionPlan.findUnique({
    where: { name: 'STARTER' },
  });

  if (starterPlan) {
    for (const company of upsertedCompanies) {
      const companyObj = await prisma.company.findUnique({
        where: { slug: company.slug },
      });
      if (companyObj) {
        await prisma.subscription.upsert({
          where: { companyId: companyObj.id },
          update: {},
          create: {
            companyId: companyObj.id,
            planId: starterPlan.id,
            status: 'ACTIVE',
          },
        });
      }
    }
    console.log(`✓ Assigned Starter plan to all companies`);
  }

  // ── Seed Mock Job Openings (for frontend testing) ───────────────────────
  const mockJobOpenings = [
    {
      companySlug: 'lambda-global',
      title: 'Senior Full Stack Engineer',
      description:
        'Build and scale core marketplace features for recruiter-company workflows, messaging, and analytics dashboards.',
      department: 'Engineering',
      location: 'Remote',
      employmentType: 'FULL_TIME',
      salaryMin: 8000000,
      salaryMax: 12000000,
      salaryCurrency: 'MNT',
      seniorityLevel: 'SENIOR',
      experienceYears: 5,
      feeType: 'PERCENTAGE',
      feePercentage: 12,
      feeFixed: null,
      status: 'OPEN',
      skills: ['TypeScript', 'NestJS', 'PostgreSQL', 'React'],
    },
    {
      companySlug: 'oyu-tolgoi',
      title: 'HR Operations Specialist',
      description:
        'Own recruitment operations, interview coordination, onboarding process quality, and stakeholder reporting.',
      department: 'Human Resources',
      location: 'Ulaanbaatar',
      employmentType: 'FULL_TIME',
      salaryMin: 3500000,
      salaryMax: 5500000,
      salaryCurrency: 'MNT',
      seniorityLevel: 'MID',
      experienceYears: 3,
      feeType: 'FIXED',
      feePercentage: null,
      feeFixed: 2000000,
      status: 'OPEN',
      skills: ['Recruitment', 'Excel', 'Stakeholder Management', 'HRIS'],
    },
    {
      companySlug: 'mobicom',
      title: 'Part-time Content & Social Coordinator',
      description:
        'Create bilingual social content calendars, coordinate campaigns, and support employer branding initiatives.',
      department: 'Marketing',
      location: 'Ulaanbaatar',
      employmentType: 'PART_TIME',
      salaryMin: 1800000,
      salaryMax: 2800000,
      salaryCurrency: 'MNT',
      seniorityLevel: 'JUNIOR',
      experienceYears: 1,
      feeType: 'PERCENTAGE',
      feePercentage: 10,
      feeFixed: null,
      status: 'OPEN',
      skills: ['Content Strategy', 'Canva', 'Copywriting', 'Social Media'],
    },
  ] as const;

  let seededJobCount = 0;
  for (const job of mockJobOpenings) {
    const company = await prisma.company.findUnique({
      where: { slug: job.companySlug },
      select: { id: true },
    });

    if (!company) {
      console.warn(`  ⚠ Skipped job "${job.title}" because company slug "${job.companySlug}" was not found`);
      continue;
    }

    const skillIds: string[] = [];
    for (const skillName of job.skills) {
      const skill = await prisma.skill.upsert({
        where: { value: skillName },
        update: { type: 'SKILL' },
        create: { type: 'SKILL', value: skillName },
        select: { id: true },
      });
      skillIds.push(skill.id);
    }

    const existingJob = await prisma.jobOpening.findFirst({
      where: {
        companyId: company.id,
        title: job.title,
      },
      select: { id: true },
    });

    if (existingJob) {
      await prisma.jobOpening.update({
        where: { id: existingJob.id },
        data: {
          description: job.description,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          seniorityLevel: job.seniorityLevel,
          experienceYears: job.experienceYears,
          feeType: job.feeType,
          feePercentage: job.feePercentage,
          feeFixed: job.feeFixed,
          status: job.status,
          skills: {
            deleteMany: {},
            create: skillIds.map((skillId) => ({
              skill: { connect: { id: skillId } },
            })),
          },
        },
      });
    } else {
      await prisma.jobOpening.create({
        data: {
          companyId: company.id,
          title: job.title,
          description: job.description,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          seniorityLevel: job.seniorityLevel,
          experienceYears: job.experienceYears,
          feeType: job.feeType,
          feePercentage: job.feePercentage,
          feeFixed: job.feeFixed,
          status: job.status,
          skills: {
            create: skillIds.map((skillId) => ({
              skill: { connect: { id: skillId } },
            })),
          },
        },
      });
    }

    seededJobCount += 1;
    console.log(`  ✓ Mock job: ${job.title} (${job.companySlug})`);
  }

  console.log(`✓ Seeded ${seededJobCount} mock job openings`);

  console.log(`\n🎉 Seed complete!`);
  console.log(`   ✓ ${recruiters.length} recruiters`);
  console.log(`   ✓ ${upsertedCompanies.length} companies`);
  console.log(`   ✓ 1 form template with ${formTemplate.fields?.length || 0} fields`);
  console.log(`   ✓ ${subscriptionPlansData.length} subscription plans`);
  console.log(`   ✓ ${mockJobOpenings.length} mock job openings`);
  console.log(`   Default password: ${DEFAULT_PASSWORD}`);

}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
