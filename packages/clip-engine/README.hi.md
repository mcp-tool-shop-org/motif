<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/clip-engine

साउंडवीव के लिए ऑडियो क्लिप अनुक्रमण, रचना और रूपांतरण इंजन।

## इसमें क्या शामिल है

- क्लिप प्लेबैक और सीन क्लिप असाइनमेंट
- नोट शेड्यूलिंग और क्वांटाइज्ड लॉन्च टाइमिंग
- रचना रूपांतरण (ट्रांसपोज़, इनवर्ट, रिवर्स, ऑक्टेव शिफ्ट, रिदम स्केल)
- विविधता उपकरण (लयबद्ध, मधुर, पतला, घना, उच्चारण, भूतिया हिट)
- तीव्रता व्युत्पत्ति (निम्न/मध्य/उच्च, तनाव, उज्ज्वल, पैड वाइसिंग, बास लाइन, आर्पेजिएट)
- कॉर्ड उपकरण (डायटॉनिक कॉर्ड, कॉर्ड पैलेट, प्रगति)
- क्यू शेड्यूलिंग और सेक्शन रिज़ॉल्यूशन

## मुख्य एक्सपोर्ट

```ts
import {
  ClipPlayer,
  SceneClipPlayer,
  scheduleNotes,
  clipTranspose,
  clipInvert,
  clipReverse,
  resolveCuePlan,
  chordPalette,
  diatonicChords,
} from "@motif/clip-engine";
```

### प्लेबैक
- `ClipPlayer` — नोट शेड्यूलिंग के साथ व्यक्तिगत क्लिप चलाता है।
- `SceneClipPlayer` — दृश्यों के भीतर क्लिप असाइन और चलाता है।

### रूपांतरण
- `clipTranspose`, `clipInvert`, `clipReverse`, `clipOctaveShift`, `clipRhythmScale`
- `clipDuplicateWithVariation`, `clipSnapToScale`, `clipFindOutOfScale`

### विविधताएं
- `clipRhythmicVariation`, `clipMelodicVariation`, `clipThinNotes`, `clipDensifyNotes`
- `clipAccentEveryN`, `clipAddGhostHits`, `clipRemoveGhostHits`

### तीव्रता
- `clipDeriveIntensity`, `clipAddTension`, `clipBrighten`
- `clipPadVoicing`, `clipBassLine`, `clipArpeggiate`

### क्यू शेड्यूलिंग
- `resolveCuePlan`, `sectionAtTick`, `sectionAtBar`
- `cueSecondsToTick`, टिक/बार/बीट रूपांतरण उपयोगिताएं

## निर्भरताएं

- `@motif/schema` — क्लिप, नोट्स, क्यू के लिए प्रकार।
- `@motif/instrument-rack` — प्लेबैक के लिए वॉयस प्रबंधन।
- `@motif/music-theory` — स्केल/कॉर्ड/मोटिफ प्रिमिटिव।
