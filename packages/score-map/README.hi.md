<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/score-map

साउंडवीव के लिए विश्व स्कोरिंग लॉजिक — मोटिफ परिवारों, स्कोर प्रोफाइल, क्यू परिवारों, विश्व मानचित्र प्रविष्टियों और व्युत्पत्ति।

## इसमें क्या शामिल है

- मोटिफ परिवार प्रबंधन (भिन्नताएं, दृश्य लिंक)
- स्कोर प्रोफाइल निर्माण और रेंज जांच
- क्यू परिवार निर्माण और दृश्य/मोटिफ एसोसिएशन
- स्कोर मानचित्र प्रविष्टि समाधान (प्रोफाइल, परिवार, मोटिफ)
- व्युत्पत्ति रिकॉर्ड और वंश अनुरेखण

## मुख्य निर्यात

### मोटिफ (`motif.ts`)
- `createMotifFamily(id, name)` — एक मोटिफ परिवार बनाएं
- `addVariant(family, variant)` / `removeVariant(family, variantId)`
- `linkScene(family, sceneId)` / `unlinkScene(family, sceneId)`
- `motifFamilyRefs(family)` — सभी संदर्भित इकाई आईडी
- `familiesReferencingId(families, entityId)` — उन परिवारों को ढूंढें जो किसी इकाई को संदर्भित करते हैं

### प्रोफाइल (`profile.ts`)
- `createScoreProfile(id, name, options)` — टेम्पो, तीव्रता, पैलेट, कुंजी/स्केल के साथ बनाएं
- `isTempoInRange(profile, bpm)` / `isIntensityInRange(profile, intensity)`
- `matchingPaletteTags(profileA, profileB)` — साझा ध्वनिक शब्दावली
- `mergeProfiles(base, overlay)` — प्रोफाइल को मिलाएं

### क्यू परिवार (`cue-family.ts`)
- `createCueFamily(id, name, role, sceneIds)` — भूमिका और दृश्यों के साथ बनाएं
- `addSceneToCueFamily` / `removeSceneFromCueFamily`
- `linkMotifToCueFamily(family, motifFamilyId)`
- `sharedMotifs(familyA, familyB)` / `sharedScenes(familyA, familyB)`
- `collectMotifFamilyIds(family)` — सभी मोटिफ परिवार आईडी

### समाधान (`resolve.ts`)
- `createScoreMapEntry(id, name, contextType)` — एक विश्व मानचित्र प्रविष्टि बनाएं
- `resolveProfile` / `resolveCueFamilies` / `resolveMotifFamilies`
- `entrySceneIds(entry, cueFamilies)` — क्यू परिवारों के माध्यम से पहुंच योग्य दृश्य
- `entriesByContext` / `entriesSharingMotif` / `resolveEntryContext`

### व्युत्पत्ति (`derivation.ts`)
- `createDerivation(id, sourceId, targetId, transform)` — एक व्युत्पत्ति रिकॉर्ड बनाएं
- `deriveScene(scene, transform)` — एक परिवर्तन लागू करें और एक नया दृश्य प्राप्त करें
- `derivationsFrom` / `derivationsTo` / `derivationChain` / `derivationGraphIds`

## इसमें क्या शामिल नहीं है

- ऑडियो प्लेबैक या रेंडरिंग
- दृश्य/स्टेम/बाइंडिंग प्रबंधन ( `@motif-studio/schema` देखें)
- ऑटोमेशन ( `@motif-studio/automation` देखें)
- यूआई घटक

## निर्भरताएँ

- `@motif-studio/schema` — मोटिफ, प्रोफाइल, दृश्य, क्यू परिवारों, व्युत्पत्तियों के लिए प्रकार
