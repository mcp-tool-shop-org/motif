<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/motif/readme.png" width="200" alt="Motif">
</p>

# @motif/test-kit

साउंडवीव पैकेजों के लिए परीक्षण उपकरण, नमूना संग्रह और सहायक उपकरण।

## इसमें क्या शामिल है

- परीक्षण के लिए JSON फ़ाइलें (न्यूनतम संग्रह, अखंडता परीक्षण संग्रह, अमान्य संग्रह)
- सहायक फ़ाइलें जो परीक्षण डेटा लोड करती हैं
- सहायक फ़ाइलों का पथ निर्धारण

## मुख्य विशेषताएं

```ts
import { FIXTURES, loadFixture, fixturePath } from "@motif/test-kit";

const pack = loadFixture(FIXTURES.MINIMAL_PACK);
```

### सहायक फ़ाइलें

| स्थिर मान | सहायक फ़ाइल | उद्देश्य |
|----------|-------------|---------|
| `MINIMAL_PACK` | `minimal-pack.json` | न्यूनतम मान्य संग्रह |
| `STARTER_PACK` | `starter-pack.json` | अधिक विस्तृत प्रारंभिक संग्रह |
| `INVALID_MISSING_META` | `invalid-pack-missing-meta.json` | स्कीमा सत्यापन: मेटाडेटा गायब |
| `INVALID_BAD_TRANSITION` | `invalid-pack-bad-transition.json` | स्कीमा सत्यापन: गलत संक्रमण |
| `INVALID_EMPTY_SCENE_LAYERS` | `invalid-pack-empty-scene-layers.json` | स्कीमा सत्यापन: खाली परतें |
| `INVALID_BAD_ASSET_DURATION` | `invalid-pack-bad-asset-duration.json` | स्कीमा सत्यापन: गलत अवधि |
| `INTEGRITY_VALID` | `integrity-valid-pack.json` | अखंडता: सही संग्रह |
| `INTEGRITY_MISSING_ASSET_REF` | `integrity-missing-asset-ref.json` | अखंडता: टूटा हुआ संपत्ति संदर्भ |
| `INTEGRITY_MISSING_STEM_REF` | `integrity-missing-stem-ref.json` | अखंडता: टूटा हुआ स्टेम संदर्भ |
| `INTEGRITY_MISSING_SCENE_REF` | `integrity-missing-scene-ref.json` | अखंडता: टूटा हुआ दृश्य संदर्भ |
| `INTEGRITY_DUPLICATE_IDS` | `integrity-duplicate-ids.json` | अखंडता: डुप्लिकेट आईडी |
| `INTEGRITY_SELF_REFERENCE` | `integrity-self-reference-pack.json` | अखंडता: स्वयं को संदर्भित करने वाली इकाइयां |
| `INTEGRITY_UNUSED_ENTITIES` | `integrity-unused-entities.json` | अखंडता: अप्रयुक्त इकाइयां |

## इसमें क्या शामिल नहीं है

- एप्लिकेशन-स्तरीय परीक्षण (ये प्रत्येक पैकेज के `test/` निर्देशिका में मौजूद होते हैं)
- परीक्षण रनर कॉन्फ़िगरेशन (प्रत्येक पैकेज का अपना `vitest.config.ts` होता है)
