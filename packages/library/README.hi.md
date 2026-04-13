<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/library

टेम्प्लेट, स्नैपशॉट, शाखाएं, पसंदीदा, संग्रह, और साउंडवीव के लिए एंटिटी तुलना।

## यह क्या प्रदान करता है

- टेम्प्लेट बनाना, इंस्टेंट करना, फ़िल्टर करना और खोजना
- स्नैपशॉट बनाना, पुनर्स्थापित करना और क्वेरी करना
- शाखा बनाना, इंस्टेंट करना और उत्पत्ति का पता लगाना
- पसंदीदा प्रबंधन और एंटिटी बुकमार्क
- संग्रह का निर्माण, संशोधन, हटाना और पुनर्प्राप्ति
- एंटिटी तुलना और अंतर

## मुख्य विशेषताएं

### टेम्प्लेट (`templates.ts`)
- `createTemplate(id, name, kind, data, options?)` — एक पुन: प्रयोज्य टेम्प्लेट बनाएं
- `instantiateTemplate(template, newId)` — टेम्प्लेट से नई एंटिटी डेटा उत्पन्न करें
- `templatesOfKind` / `searchTemplates` / `templatesByTag`

### स्नैपशॉट (`snapshots.ts`)
- `takeSnapshot(id, label, entityId, entityKind, data, notes?)` — एंटिटी की स्थिति को स्थिर करें
- `restoreSnapshot(snapshot)` — एंटिटी डेटा को पुनर्प्राप्त करें
- `snapshotsForEntity` / `snapshotsOfKind` / `latestSnapshot` / `snapshotCounts`

### शाखाएं (`branches.ts`)
- `createBranch(id, name, sourceSnapshot, newEntityId, notes?)` — स्नैपशॉट से शाखा बनाएं
- `instantiateBranch(snapshot, branch)` — शाखा से नई एंटिटी डेटा उत्पन्न करें
- `branchesFromSnapshot` / `branchesOfKind` / `traceLineage` / `descendantBranches`

### पसंदीदा (`favorites.ts`)
- `createFavorite(id, entityId, entityKind, notes?)` — किसी एंटिटी को बुकमार्क करें
- `isFavorited(favorites, entityId)` — जांचें कि क्या बुकमार्क किया गया है
- `favoritesOfKind` — एंटिटी के प्रकार के आधार पर फ़िल्टर करें
- `createCollection` / `addToCollection` / `removeFromCollection` / `resolveCollection` / `searchCollections`

### तुलना (`compare.ts`)
- `compareEntities(a, b, entityKind, labelA, labelB)` — फ़ील्ड-दर-फ़ील्ड अंतर
- `areEqual(a, b)` — संरचनात्मक समानता जांच
- `diffCount(a, b)` — भिन्न फ़ील्ड की संख्या
- `promoteVersion(a, b, choice)` — विजेता चुनें

## यह क्या प्रदान नहीं करता

- एंटिटी का स्थायी भंडारण या संग्रहण
- यूआई घटक
- प्लेबैक या रेंडरिंग

## निर्भरताएँ

- `@motif/schema` — टेम्प्लेट, स्नैपशॉट, शाखाओं, पसंदीदा और संग्रह के लिए प्रकार।
