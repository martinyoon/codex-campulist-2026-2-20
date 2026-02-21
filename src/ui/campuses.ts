export interface CampusOption {
  id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  city: string;
}

export const CAMPUS_OPTIONS: CampusOption[] = [
  {
    id: "3c8d5c48-f693-4f67-bf54-df73015f9e56",
    slug: "kaist-main",
    name_ko: "카이스트 대전 본원",
    name_en: "KAIST Main Campus (Daejeon)",
    city: "Daejeon",
  },
  {
    id: "84a7e7c4-44a6-4b2e-9f03-1d7fdf04f201",
    slug: "cnu",
    name_ko: "충남대학교",
    name_en: "Chungnam National University",
    city: "Daejeon",
  },
  {
    id: "95b5d1a7-6f1d-4d66-a4e3-7f5959f6d202",
    slug: "hanbat",
    name_ko: "국립한밭대학교",
    name_en: "Hanbat National University",
    city: "Daejeon",
  },
  {
    id: "a4f4c6f8-0d9f-4b2a-8f62-0b6bbf7ae303",
    slug: "mokwon",
    name_ko: "목원대학교",
    name_en: "Mokwon University",
    city: "Daejeon",
  },
  {
    id: "b68f0e57-a053-4c23-93b5-613f20a44404",
    slug: "paichai",
    name_ko: "배재대학교",
    name_en: "Pai Chai University",
    city: "Daejeon",
  },
  {
    id: "c7b9bfc1-4f5f-49b4-a0f8-11ad9e555505",
    slug: "woosong",
    name_ko: "우송대학교",
    name_en: "Woosong University",
    city: "Daejeon",
  },
];

export const DEFAULT_CAMPUS_ID = CAMPUS_OPTIONS[0].id;

export const getCampusNameById = (campusId: string): string => {
  const campus = CAMPUS_OPTIONS.find((item) => item.id === campusId);
  if (!campus) {
    return "알 수 없는 캠퍼스";
  }
  return campus.name_ko;
};
