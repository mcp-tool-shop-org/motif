<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/audio-engine

साउंडवीव के लिए नमूना प्लेबैक और वॉयस प्रबंधन।

## इसमें क्या शामिल है

- ट्रिम किए गए क्षेत्र का प्लेबैक
- स्लाइस प्लेबैक
- किट स्लॉट प्लेबैक
- सैम्पल इंस्ट्रूमेंट नोट प्लेबैक (पिच शिफ्टिंग के साथ)
- वॉयस लाइफसाइकिल प्रबंधन

## मुख्य विशेषताएं

```ts
import {
  playTrimmedRegion,
  playSlice,
  playKitSlot,
  playSampleInstrumentNote,
} from "@motif-studio/audio-engine";
```

- `playTrimmedRegion` — ट्रिम सीमाओं के भीतर एक ऑडियो बफर चलाएं।
- `playSlice` — एक विशिष्ट नमूना स्लाइस चलाएं।
- `playKitSlot` — एक निर्दिष्ट पिच पर एक किट स्लॉट चलाएं।
- `playSampleInstrumentNote` — एक सैम्पल इंस्ट्रूमेंट पर एक पिच किए गए नोट को चलाएं।

## इसमें क्या शामिल नहीं है

- सीन ऑर्केस्ट्रेशन और मिक्सिंग (इसका प्रबंधन `@motif-studio/playback-engine` द्वारा किया जाता है)।
- ऑडियो फ़ाइल डिकोडिंग (ब्राउज़र ऑडियोकॉन्टेक्स्ट इसका प्रबंधन करता है)।
- क्लिप/क्यू कंपोज़िशन (इसका प्रबंधन `@motif-studio/clip-engine` द्वारा किया जाता है)।

## निर्भरताएं

- `@motif-studio/schema` — एसेट्स, स्लाइस, किट्स, इंस्ट्रूमेंट्स के लिए प्रकार।
