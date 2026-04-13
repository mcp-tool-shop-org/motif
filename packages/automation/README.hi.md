<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/automation

साउंडवीव के लिए अभिव्यंजक ऑटोमेशन — लेन, इंटरपोलेशन, मैक्रो, एनवेलप और लाइव कैप्चर।

## इसमें क्या शामिल है

- ऑटोमेशन लेन बनाना और बिंदुओं का प्रबंधन
- समय-आधारित मान इंटरपोलेशन (रैखिक)
- मैक्रो स्टेट प्रबंधन और मल्टी-पैरामीटर मैपिंग
- क्यू संरचना गतिशीलता के लिए सेक्शन एनवेलप
- लाइव कैप्चर रिकॉर्डिंग, फ़िल्टरिंग और अनुप्रयोग

## मुख्य एक्सपोर्ट

### लेन (`lanes.ts`)
- `createLane(id, target, points)` — एक लक्ष्य और प्रारंभिक बिंदुओं के साथ एक लेन बनाएं
- `makeTarget(param, entityId)` — एक ऑटोमेशन लक्ष्य बनाएं
- `addPoint` / `removePointAt` / `updatePoint` / `clearLane`
- `lanesForTarget` / `lanesForParam` / `laneTimeSpan`

### इंटरपोलेशन (`interpolate.ts`)
- `evaluateLane(lane, timeMs)` — किसी भी समय पर इंटरपोलेटेड मान
- `interpolate(pointA, pointB, timeMs)` — रैखिक इंटरपोलेशन
- `sampleLane(lane, startMs, endMs, stepMs)` — नियमित अंतराल पर सैंपलिंग
- `evaluateLanesAt(lanes, timeMs)` — एक साथ कई लेन का मूल्यांकन करें

### मैक्रो (`macros.ts`)
- `defaultMacroState()` — डिफ़ॉल्ट तीव्रता/तनाव/ऊर्जा मान
- `createMacroMapping(id, macro, param, options)` — मैक्रो को पैरामीटर से मैप करें
- `evaluateMacros(mappings, macroState)` — सभी पैरामीटर मानों की गणना करें
- `applyMacroInfluence(baseValue, macroValue, influence)` — एकल प्रभाव गणना
- `mappingsForMacro` / `macrosAffectingParam`

### एनवेलप (`envelopes.ts`)
- `createEnvelope(id, target, sectionRole, points)` — सेक्शन-स्कोप ऑटोमेशन
- `evaluateEnvelope(envelope, timeMs)` — इंटरपोलेटेड एनवेलप मान
- `envelopesForTarget` / `entryEnvelopes` / `exitEnvelopes`

### कैप्चर (`capture.ts`)
- `createCapture(id, name, source)` — एक कैप्चर सत्र शुरू करें
- `recordPoint(capture, timeMs, value)` — एक मान रिकॉर्ड करें
- `finalizeCapture(capture)` — पूर्ण चिह्नित करें
- `applyCaptureToLane` / `mergeCaptureIntoLane` — लेन पर लागू करें
- `thinCapture(capture, tolerance)` — बिंदु घनत्व को कम करें
- `captureDuration(capture)` — कुल अवधि

## इसमें क्या शामिल नहीं है

- ऑडियो डीएसपी या प्रभाव प्रसंस्करण
- दृश्य ऑर्केस्ट्रेशन या प्लेबैक
- क्लिप रचना
- यूआई घटक

## निर्भरताएँ

- `@motif/schema` — लेन, लक्ष्य, बिंदु, मैक्रो, एनवेलप, कैप्चर के लिए प्रकार
