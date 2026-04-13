<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/asset-index

साउंडवीव साउंडट्रैक पैकों की अखंडता (इंटीग्रिटी) का अनुक्रमण (इंडेक्सिंग) और ऑडिटिंग।

## यह क्या करता है

- **`buildPackIndex(pack)`** — प्रत्येक इकाई संग्रह के भीतर, तेज़ आईडी-आधारित लुकअप मैप बनाएं और डुप्लिकेट आईडी का पता लगाएं।
- **`auditPackIntegrity(pack)`** — सभी अखंडता जांच (टूटे हुए संदर्भ, डुप्लिकेट, स्व-संदर्भ, अप्रयुक्त इकाइयां) चलाएं और वर्गीकृत निष्कर्षों (`त्रुटियां`, `चेतावनी`, `टिप्पणियां`) को, एक निश्चित क्रम में लौटाएं।
- **`findUnusedAssets(pack)`** — वे संपत्तियां (एसेट्स) जिन्हें किसी भी स्टम या ट्रांज़िशन स्टिंगर द्वारा संदर्भित नहीं किया गया है।
- **`findUnusedStems(pack)`** — वे स्टम जिन्हें किसी भी दृश्य (सीन) लेयर द्वारा संदर्भित नहीं किया गया है।
- **`findUnreferencedScenes(pack)`** — वे दृश्य जिन्हें किसी भी बाइंडिंग, बैकअप या ट्रांज़िशन द्वारा संदर्भित नहीं किया गया है।
- **`summarizePackIntegrity(pack)`** — एक ऑब्जेक्ट में इकाई गणना, अप्रयुक्त गणना और निष्कर्ष गणना।

## अखंडता कोड

| कोड | गंभीरता | अर्थ |
|------|----------|---------|
| `duplicate_asset_id` | त्रुटि | दो या अधिक संपत्तियों में समान आईडी है। |
| `duplicate_stem_id` | त्रुटि | दो या अधिक स्टम में समान आईडी है। |
| `duplicate_scene_id` | त्रुटि | दो या अधिक दृश्यों में समान आईडी है। |
| `duplicate_binding_id` | त्रुटि | दो या अधिक बाइंडिंग में समान आईडी है। |
| `duplicate_transition_id` | त्रुटि | दो या अधिक ट्रांज़िशन में समान आईडी है। |
| `missing_asset_ref` | त्रुटि | स्टम एक ऐसी संपत्ति को संदर्भित करता है जो मौजूद नहीं है। |
| `missing_stinger_asset_ref` | त्रुटि | ट्रांज़िशन एक ऐसे स्टिंगर एसेट को संदर्भित करता है जो मौजूद नहीं है। |
| `missing_stem_ref` | त्रुटि | दृश्य लेयर एक ऐसे स्टम को संदर्भित करता है जो मौजूद नहीं है। |
| `missing_fallback_scene_ref` | त्रुटि | दृश्य बैकअप एक ऐसे दृश्य को संदर्भित करता है जो मौजूद नहीं है। |
| `missing_binding_scene_ref` | त्रुटि | बाइंडिंग एक ऐसे दृश्य को संदर्भित करता है जो मौजूद नहीं है। |
| `missing_transition_from_scene_ref` | त्रुटि | ट्रांज़िशन का 'से' दृश्य मौजूद नहीं है। |
| `missing_transition_to_scene_ref` | त्रुटि | ट्रांज़िशन का 'टू' दृश्य मौजूद नहीं है। |
| `scene_self_fallback` | चेतावनी | दृश्य स्वयं पर वापस जाता है। |
| `transition_self_reference` | चेतावनी | ट्रांज़िशन का 'से' और 'टू' एक ही दृश्य है। |
| `unused_asset` | चेतावनी | कोई भी स्टम या स्टिंगर किसी संपत्ति को संदर्भित नहीं करता है। |
| `unused_stem` | चेतावनी | कोई भी दृश्य लेयर किसी स्टम को संदर्भित नहीं करता है। |
| `unreferenced_scene` | टिप्पणी | कोई भी बाइंडिंग, बैकअप या ट्रांज़िशन किसी दृश्य को संदर्भित नहीं करता है। |

## उपयोग

```ts
import { auditPackIntegrity, summarizePackIntegrity } from "@motif/asset-index";

const audit = auditPackIntegrity(pack);
if (audit.errors.length > 0) {
  console.error("Pack has integrity errors:", audit.errors);
}

const summary = summarizePackIntegrity(pack);
console.log(`${summary.assetCount} assets, ${summary.errorCount} errors`);
```
