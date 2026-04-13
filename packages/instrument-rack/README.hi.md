<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/instrument-rack

साउंडवीव के लिए वाइस (आवाज) और इंस्ट्रूमेंट (वाद्य यंत्र) प्रबंधन - सिंथेसाइज़र, ड्रम और डिफ़ॉल्ट सेटिंग्स।

## इसमें क्या शामिल है

- सिंथ वाइस का निर्माण और पैरामीटर प्रबंधन
- प्रत्येक टुकड़े के लिए कॉन्फ़िगरेशन के साथ ड्रम वाइस का निर्माण
- इंस्ट्रूमेंट रैक का जीवन चक्र (बनाना, कनेक्ट करना, हटाना)
- वर्गीकृत पहुंच के साथ डिफ़ॉल्ट सेटिंग्स का संग्रह
- MIDI से आवृत्ति में रूपांतरण और पिच से ड्रम मैपिंग

## मुख्य विशेषताएं

```ts
import {
  InstrumentRack,
  SynthVoice,
  DrumVoice,
  FACTORY_PRESETS,
  getPreset,
  getPresetsByCategory,
  midiToFreq,
  pitchToDrum,
} from "@motif/instrument-rack";
```

- `InstrumentRack` — कई वाइस, रूटिंग और हटाने का प्रबंधन करता है।
- `SynthVoice` — लिफाफे और फिल्टर के साथ ऑसिलेटर-आधारित वाइस।
- `DrumVoice` — सैंपल-आधारित ताल वाइस।
- `FACTORY_PRESETS` — अंतर्निहित सेटिंग्स का संग्रह।
- `getPreset(name)` / `getPresetsByCategory(cat)` — सेटिंग्स की खोज।

## निर्भरताएँ

- `@motif/schema` — इंस्ट्रूमेंट, सेटिंग्स और वाइस के लिए प्रकार।
