<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/schema

साउंडवीव साउंडट्रैक पैकों के लिए मानक प्रकार और सत्यापन।

## शामिल हैं:

- सभी मुख्य साउंडट्रैक इकाइयों के लिए टाइपस्क्रिप्ट प्रकार।
- पार्सिंग और सत्यापन के लिए ज़ोड स्कीमा।
- संरचित त्रुटियों के साथ सुरक्षित सत्यापन सहायक।
- स्कीमा संस्करण का प्रवर्तन (`schemaVersion: "1"`)।

## मुख्य इकाइयाँ:

- `SoundtrackPackMeta` — पैकेज की पहचान और संस्करण।
- `AudioAsset` — ऑडियो फ़ाइल संदर्भ, जिसमें प्रकार, अवधि और लूप बिंदु शामिल हैं।
- `Stem` — एक भूमिका के साथ एक संपत्ति से जुड़ा प्ले करने योग्य लेयर।
- `Scene` — स्टेम लेयर्स से बनी संगीत स्थिति।
- `SceneLayerRef` — एक दृश्य के भीतर स्टेम संदर्भ।
- `TriggerCondition` / `TriggerBinding` — रनटाइम स्थिति → दृश्य मैपिंग।
- `TransitionRule` — संगीत दृश्यों के बीच कैसे बदलता है।
- `SoundtrackPack` — पूरा पैकेज दस्तावेज़।
- `RuntimeMusicState` — ट्रिगर मूल्यांकन के लिए गेम की स्थिति।

## मुख्य निर्यात:

```ts
import {
  parseSoundtrackPack,
  safeParseSoundtrackPack,
  validateSoundtrackPack,
} from "@motif/schema";
```

### `parseSoundtrackPack(input: unknown): SoundtrackPack`

सख्त पार्सिंग। अमान्य डेटा होने पर त्रुटि उत्पन्न करता है।

### `safeParseSoundtrackPack(input: unknown)`

`{ success: true, data }` या `{ success: false, errors }` लौटाता है। कभी भी त्रुटि उत्पन्न नहीं करता।

### `validateSoundtrackPack(input: unknown): ValidationResult<SoundtrackPack>`

संरचित `ValidationIssue[]` के साथ `{ ok, data?, issues }` लौटाता है।

प्रत्येक त्रुटि में डिबगिंग के लिए `path`, `code` और `message` शामिल हैं।

## सत्यापन नियम:

- आवश्यक फ़ील्ड लागू।
- एनम मान लागू (संपत्ति प्रकार, स्टेम भूमिका, दृश्य श्रेणी, ट्रिगर ऑपरेशन, संक्रमण मोड)।
- `durationMs > 0`
- यदि मौजूद है, तो `loopStartMs >= 0`
- यदि दोनों मौजूद हैं, तो `loopEndMs > loopStartMs`
- `priority` एक पूर्णांक होना चाहिए।
- बाइंडिंग में कम से कम एक शर्त होनी चाहिए।
- दृश्यों में कम से कम एक लेयर होनी चाहिए।
- `crossfade` और `cooldown-fade` संक्रमणों के लिए `durationMs` आवश्यक है।
- `schemaVersion` `"1"` होना चाहिए।

## दायरा:

यह पैकेज संरचना और फ़ील्ड-स्तरीय शुद्धता को सत्यापित करता है।

उच्च-स्तरीय पैकेजों द्वारा क्रॉस-रेफरेंस अखंडता जांच (जैसे "दृश्य एक गुम स्टेम को संदर्भित करता है") को संभाला जाता है।
