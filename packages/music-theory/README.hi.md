<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/music-theory

साउंडवीव के लिए संगीत सिद्धांत के बुनियादी तत्व और उपयोगिताएं — स्केल, कॉर्ड, मोटिफ और तीव्रता परिवर्तन।

## इसमें क्या शामिल है

- पिच क्लास और नोट नाम संचालन
- स्केल परिभाषाएं और पिच क्लास जनरेशन
- कॉर्ड की गुणवत्ता, ध्वनि और प्रगति के लिए सहायक उपकरण
- मोटिफ परिवर्तन (ट्रांसपोज़, इनवर्ट, रिवर्स, रिदम स्केल)
- विविधता निर्माण (लयबद्ध, मधुर, पतला, घना, उच्चारण)
- तीव्रता स्तर निर्धारण (निम्न, मध्यम, उच्च, तनाव, उज्ज्वल)

## मुख्य विशेषताएं

### स्केल और पिच

```ts
import {
  SCALES, pitchClass, octave, midiNote, noteName,
  scalePitchClasses, isInScale, snapToScale,
  transposeDiatonic,
} from "@motif-studio/music-theory";
```

### कॉर्ड

```ts
import {
  chordPitches, diatonicChord, diatonicChords,
  chordPalette, generatePadVoicing, generateBassLine,
  arpeggiateChord, progressionFromDegrees,
} from "@motif-studio/music-theory";
```

### मोटिफ परिवर्तन

```ts
import {
  transpose, invert, reverse, octaveShift,
  rhythmScale, duplicateWithVariation, transposeAndSnap,
} from "@motif-studio/music-theory";
```

### तीव्रता

```ts
import {
  lowIntensity, midIntensity, highIntensity,
  deriveIntensity, addTension, brighten,
} from "@motif-studio/music-theory";
```

## निर्भरताएँ

कोई नहीं — यह एक आधार पैकेज है जिसमें कोई निर्भरता नहीं है।
