/* SIGN WELL · articles.js
   BLOG_BUILD_AT = 這個資料檔被匯出的時間（毫秒）。
   前台用它判斷「本機 Live 快照」是不是已經過期。每次從後台 Export 都會自動更新。 */
window.BLOG_BUILD_AT = 1757548800000; // 2025-09-11

window.BLOG_ARTICLES = [
  {
    id: "vv-ecmo",
    title: "VV ECMO：它真正取代了肺臟的哪些功能？",
    subtitle: "從 gas exchange、sweep gas 到 blood flow，建立一個 ICU 床邊可用的生理框架。",
    slug: "vv-ecmo",
    category: "Critical Care",
    type: "Clinical Note",
    excerpt: "VV ECMO 能提供高度有效的氧合與二氧化碳移除，但不直接提供循環支持。理解 circuit 與生理，是後續判讀設定與併發症的基礎。",
    tags: ["ECMO", "ARDS", "ICU"],
    cover: "",
    status: "Published",
    featured: true,
    publishedAt: "2026-09-11",
    updatedAt: "2026-09-11",
    content: `## 一句話先記住\n\nVV ECMO 是**體外氣體交換支持**：把靜脈血引出體外，經膜式氧合器移除 CO₂、加入 O₂，再回到靜脈系統。\n\n> [!PEARL]\n> VV ECMO 的核心不是「把血壓撐起來」，而是把嚴重呼吸衰竭病人的 gas exchange 暫時搬到體外。\n\n## Circuit\n\nPatient → drainage cannula → pump → membrane oxygenator → return cannula → patient\n\n### Pump\n\n提供體外循環的血流。臨床上 ECMO blood flow 對氧合影響通常比 sweep gas 更直接。\n\n### Sweep gas\n\n主要決定 CO₂ 移除能力。提高 sweep 通常可增加 CO₂ clearance。\n\n## VV ECMO 為什麼不是 circulatory support？\n\n血液最後仍回到靜脈端，之後需要病人的右心、肺循環與左心把血液送到全身。因此 VV ECMO 並沒有像 VA ECMO 一樣直接把氧合後血液送入動脈系統。\n\n> [!KEY]\n> 遇到 refractory hypoxemia 時，不只看 ECMO 機器數字，也要重新確認 cannula position、recirculation、native cardiac output、hemoglobin 與 oxygen consumption。\n\n## 臨床思考\n\nECMO 是 rescue strategy，不是 ARDS 基本治療的替代品。病人仍需要 lung-protective ventilation、適當 PEEP、prone positioning 與可逆病因處理。`,
    references: [
      { authors: "Combes A, et al.", title: "Extracorporeal Membrane Oxygenation for Severe Acute Respiratory Distress Syndrome", journal: "N Engl J Med", year: "2018", doi: "10.1056/NEJMoa1800385", pmid: "29791822" }
    ]
  },
  {
    id: "gi-bleeding",
    title: "GI Bleeding：從急診評估到何時需要外科介入",
    subtitle: "把 resuscitation、risk stratification、endoscopy 與 surgical indication 串成一條臨床路徑。",
    slug: "gi-bleeding",
    category: "Surgery",
    type: "Deep Dive",
    excerpt: "面對 GI bleeding，第一個問題不是病灶在哪裡，而是病人是否正在失血性休克。之後才進入 localization、endoscopy 與 definitive hemostasis。",
    tags: ["GI bleeding", "Forrest", "Surgery"],
    cover: "",
    status: "Published",
    featured: false,
    publishedAt: "2026-09-10",
    updatedAt: "2026-09-10",
    content: `## 第一優先：先處理 physiology\n\n評估 airway、breathing、circulation，同時建立大口徑 IV access、抽血與交叉配血。\n\n## Upper vs Lower GI bleeding\n\nHematemesis、coffee-ground emesis 與 melena 典型上消化道出血；hematochezia 常提示下消化道出血，但大量上消化道出血也可能快速通過腸道。\n\n> [!WARNING]\n> 不要因為看到鮮紅色血便就排除 upper GI bleeding。若病人 hemodynamically unstable，來源仍需重新判斷。\n\n## 何時會走到外科？\n\n當內視鏡無法控制持續或反覆出血、無法進行內視鏡治療，或合併 perforation、需要手術處理的 underlying pathology 時，外科介入的重要性上升。`,
    references: []
  },
  {
    id: "cardiogenic-shock",
    title: "Cardiogenic Shock：不要只把它理解成低血壓",
    subtitle: "從 tissue hypoperfusion 出發，理解 shock phenotype、vasopressor、inotrope 與 mechanical support。",
    slug: "cardiogenic-shock",
    category: "Cardiology",
    type: "Quick Review",
    excerpt: "Cardiogenic shock 的核心是 cardiac output 不足導致組織灌流失衡；血壓只是其中一個訊號。",
    tags: ["Shock", "Cardiology", "ICU"],
    cover: "",
    status: "Published",
    featured: false,
    publishedAt: "2026-09-09",
    updatedAt: "2026-09-09",
    content: `## 核心概念\n\nCardiogenic shock 是因心臟泵血功能失敗造成的 systemic hypoperfusion。評估時需同時看血壓、尿量、意識、乳酸、末梢灌流與器官功能。\n\n## 床邊框架\n\n1. 找 reversible cause\n2. 評估 preload / afterload / contractility\n3. 維持冠狀動脈與器官灌流\n4. 必要時考慮 temporary mechanical circulatory support\n\n> [!PEARL]\n> 同樣是低血壓，不同病人的 preload、SVR 與 RV/LV failure phenotype 可以完全不同。`,
    references: []
  },
  {
    id: "acute-low-back-pain",
    title: "Acute Low Back Pain：先排除不能漏掉的 Red Flags",
    subtitle: "從常見 mechanical pain 到 fracture、infection、malignancy 與 cauda equina syndrome。",
    slug: "acute-low-back-pain",
    category: "Clinical Medicine",
    type: "Clinical Note",
    excerpt: "下背痛的價值不在於背完 differential，而是快速辨識哪些病人需要立即影像、神經外科或感染處置。",
    tags: ["Low back pain", "Neurology", "Spine"],
    cover: "",
    status: "Published",
    featured: false,
    publishedAt: "2026-09-07",
    updatedAt: "2026-09-07",
    content: `## 先問 Red Flags\n\n近期重大外傷、骨質疏鬆、長期 steroid、癌症病史、發燒、免疫抑制、進行性神經缺損、saddle anesthesia、尿滯留或失禁，都會改變後續策略。\n\n## Neurologic localization\n\nRadicular pain、dermatome sensory change、motor weakness 與 reflex change 可以幫助定位 root involvement。\n\n> [!KEY]\n> 若懷疑 cauda equina syndrome，重點不是把所有理學檢查做完，而是及早完成 urgent MRI 與 surgical evaluation。`,
    references: []
  },
  {
    id: "weight-management",
    title: "Medical Weight Management：把減重視為長期疾病管理",
    subtitle: "從能量平衡、行為介入到藥物治療，以長期維持而不是短期體重數字為目標。",
    slug: "weight-management",
    category: "Weight Management",
    type: "Patient Education",
    excerpt: "有效減重不只關乎熱量，更牽涉食慾、生理適應、睡眠、活動、藥物與長期追蹤。",
    tags: ["Obesity", "GLP-1", "Lifestyle"],
    cover: "",
    status: "Published",
    featured: false,
    publishedAt: "2026-09-05",
    updatedAt: "2026-09-05",
    content: `## 不只是一個體重數字\n\n評估體重管理時，除了 BMI，也應看腰圍、共病、體重歷程、飲食型態、睡眠、活動量與可持續性。\n\n## 長期維持\n\n減重後常出現食慾與能量消耗的生理適應，因此「維持」本身就是治療的一部分。\n\n> [!WARNING]\n> 藥物選擇與劑量需要個別化醫療評估，公開衛教內容不能取代個人診療。`,
    references: []
  }
];
