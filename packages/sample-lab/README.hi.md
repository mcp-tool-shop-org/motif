<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif-studio/sample-lab

साउंडवीव सैम्पल वर्कफ़्लो के लिए ट्रिमिंग, स्लाइसिंग, किट और इंस्ट्रूमेंट सहायक उपकरण।

## इसमें क्या शामिल है

- ऑडियो एसेट की ट्रिमिंग और लूप पॉइंट प्रबंधन
- समान और शुरुआत-आधारित स्लाइसिंग
- सैम्पल किट का निर्माण और स्लॉट प्रबंधन
- सैम्पल इंस्ट्रूमेंट का निर्माण और पिच उपयोगिताएं
- ऑडियो फ़ाइल आयात सहायक उपकरण (फ़ाइल नाम → एसेट अनुमान)

## मुख्य एक्सपोर्ट

### ट्रिम (`trim.ts`)
- `resolveTrimRegion(asset)` — प्रभावी ट्रिम सीमाएं
- `resolveLoopRegion(asset)` — प्रभावी लूप सीमाएं
- `applyTrim(asset, startMs, endMs)` — ट्रिम पॉइंट सेट करें
- `applyLoopPoints(asset, loopStartMs, loopEndMs)` — लूप पॉइंट सेट करें

### स्लाइस (`slice.ts`)
- `sliceEvenly(assetId, startMs, endMs, count)` — समान भागों में विभाजित करें
- `sliceAtOnsets(assetId, onsets, totalEndMs)` — विशिष्ट समय पर स्लाइस करें
- `sliceDurationMs(slice)` — स्लाइस की लंबाई

### किट (`kit.ts`)
- `createKit(id, name)` — खाली किट
- `addKitSlot(kit, slot)` / `removeKitSlot(kit, pitch)` / `updateKitSlot(kit, pitch, update)`
- `kitFromSlices(id, name, slices, basePitch)` — स्लाइस को MIDI पिच पर स्वचालित रूप से मैप करें
- `kitAssetIds(kit)` / `findDuplicateSlotPitches(kit)`

### इंस्ट्रूमेंट (`instrument.ts`)
- `createSampleInstrument(id, name, assetId, rootNote, pitchMin, pitchMax)`
- `pitchToPlaybackRate(rootNote, targetNote)` — पिच-शिफ्ट अनुपात
- `isInRange(instrument, note)` / `rangeSpan(instrument)`

### इम्पोर्ट (`import.ts`)
- `inferSourceType(name)` — फ़ाइल नाम से प्रकार का पता लगाएं
- `sourceTypeToKind(sourceType)` — स्रोत प्रकार को एसेट प्रकार में मैप करें
- `filenameToId(filename)` — फ़ाइल नाम से आईडी निकालें
- `buildImportedAsset(filename, durationMs, src)` — फ़ाइल से एसेट बनाएं

## इसमें क्या शामिल नहीं है

- ऑडियो फ़ाइल डिकोडिंग या प्लेबैक ( `@motif-studio/audio-engine` देखें)
- ऑडियो एसेट का परसिस्टेंस या फ़ाइल I/O
- यूआई घटक

## निर्भरताएं

- `@motif-studio/schema` — एसेट, स्लाइस, किट, इंस्ट्रूमेंट के लिए प्रकार
