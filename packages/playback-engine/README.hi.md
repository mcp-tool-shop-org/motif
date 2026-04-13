<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/playback-engine

साउंडवीव दृश्यों और अनुक्रमों के लिए वास्तविक समय में प्लेबैक, मिक्सिंग, रेंडरिंग और प्रभाव प्रणाली।

## इसमें क्या शामिल है

- ट्रांसपोर्ट नियंत्रण (प्ले, पॉज़, स्टॉप, सीक)
- एसेट लोडिंग और डिकोडिंग
- स्टेम मिक्सिंग के साथ दृश्य प्लेबैक
- दृश्यों के बीच ट्रांज़िशन प्लेबैक
- अनुक्रम प्लेबैक (क्रमबद्ध दृश्य श्रृंखलाएं)
- मिक्सर जिसमें प्रति-स्टेम और बस-स्तर नियंत्रण शामिल है
- प्रभाव प्रसंस्करण (ईक्यू, डिले, रिवर्ब, कंप्रेसर)
- क्यू रेंडरिंग और ऑफलाइन निर्यात
- WAV एन्कोडिंग

## मुख्य एक्सपोर्ट

```ts
import {
  Transport,
  AssetLoader,
  ScenePlayer,
  TransitionPlayer,
  SequencePlayer,
  Mixer,
  CueRenderer,
  CuePlayer,
  createFxNodes,
  disposeFxNodes,
  dbToGain,
  encodeWav,
} from "@motif/playback-engine";
```

### मुख्य कक्षाएं
- `Transport` — प्लेबैक स्थिति, समय और सीक
- `AssetLoader` — ऑडियो एसेट प्राप्त करना और डिकोड करना
- `ScenePlayer` — लेयर्ड स्टेम के साथ दृश्यों को प्ले करना
- `TransitionPlayer` — दृश्यों के बीच क्रॉसफ़ेड और ट्रांज़िशन
- `SequencePlayer` — क्रमबद्ध दृश्य अनुक्रमों को प्ले करना
- `Mixer` — प्रति-स्टेम गेन, पैन, म्यूट, सोलो, बस रूटिंग
- `CueRenderer` — ऑडियो बफर में ऑफलाइन रेंडरिंग
- `CuePlayer` — क्यू-स्तर प्लेबैक समन्वय

### प्रभाव
- `createFxNodes` / `disposeFxNodes` — प्रभाव श्रृंखला का जीवन चक्र
- ईक्यू, डिले, रिवर्ब, कंप्रेसर के लिए अंतर्निहित प्रीसेट

## निर्भरताएँ

- `@motif/schema` — दृश्यों, स्टेम और ट्रांज़िशन के लिए प्रकार
- `@motif/audio-engine` — सैम्पल प्लेबैक प्रिमिटिव
- `@motif/scene-mapper` — दृश्य रिज़ॉल्यूशन के लिए ट्रिगर मूल्यांकन
