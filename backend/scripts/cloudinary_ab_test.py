#!/usr/bin/env python3
"""Cloudinary A/B Test — Compare raw vs enhanced OCR quality for prize evidence."""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from services.cloudinary_admin import upload_photo, enhance_for_ocr
from services.gemini import extract_text_from_image


def word_quality_score(text: str) -> float:
    """Estimate OCR quality: ratio of recognizable words (3+ alpha chars) to total tokens."""
    words = text.split()
    if not words:
        return 0.0
    recognizable = sum(1 for w in words if len(w) >= 3 and any(c.isalpha() for c in w))
    return round(recognizable / len(words) * 100, 1)


async def main():
    if len(sys.argv) < 2:
        print("Usage: python cloudinary_ab_test.py <image_path>")
        print("  Uploads image to Cloudinary, runs OCR on raw vs enhanced, compares results.")
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"Error: file not found: {image_path}")
        sys.exit(1)

    with open(image_path, "rb") as f:
        photo_bytes = f.read()

    print(f"Image: {image_path} ({len(photo_bytes):,} bytes)")
    print("=" * 60)

    # Step 1: Upload
    print("\n[1/4] Uploading to Cloudinary...")
    upload_result = await upload_photo(photo_bytes, "ab-test")
    raw_url = upload_result["secure_url"]
    public_id = upload_result["public_id"]
    print(f"  Raw URL: {raw_url}")

    # Step 2: Enhance
    print("\n[2/4] Generating enhanced URL...")
    enhanced_url = enhance_for_ocr(public_id)  # this is sync, returns URL string
    print(f"  Enhanced URL: {enhanced_url}")

    # Step 3: OCR both
    print("\n[3/4] Running Gemini OCR on both versions...")
    raw_ocr, enhanced_ocr = await asyncio.gather(
        extract_text_from_image(raw_url),
        extract_text_from_image(enhanced_url),
    )

    # Step 4: Compare — extract raw_text string from OCR result dicts
    raw_text = raw_ocr.get("raw_text", "") if isinstance(raw_ocr, dict) else str(raw_ocr)
    enhanced_text = enhanced_ocr.get("raw_text", "") if isinstance(enhanced_ocr, dict) else str(enhanced_ocr)
    raw_confidence = raw_ocr.get("confidence", 0) if isinstance(raw_ocr, dict) else 0
    enhanced_confidence = enhanced_ocr.get("confidence", 0) if isinstance(enhanced_ocr, dict) else 0

    raw_score = word_quality_score(raw_text)
    enhanced_score = word_quality_score(enhanced_text)

    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    print(f"\n--- RAW OCR ({len(raw_text)} chars, {raw_score}% word quality, {raw_confidence:.0%} confidence) ---")
    print(raw_text[:500] + ("..." if len(raw_text) > 500 else ""))
    print(f"\n--- ENHANCED OCR ({len(enhanced_text)} chars, {enhanced_score}% word quality, {enhanced_confidence:.0%} confidence) ---")
    print(enhanced_text[:500] + ("..." if len(enhanced_text) > 500 else ""))
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Raw:      {len(raw_text):>6} chars | {raw_score}% word quality | {raw_confidence:.0%} Gemini confidence")
    print(f"  Enhanced: {len(enhanced_text):>6} chars | {enhanced_score}% word quality | {enhanced_confidence:.0%} Gemini confidence")
    improvement = enhanced_score - raw_score
    print(f"  Improvement: {'+' if improvement >= 0 else ''}{improvement:.1f}% word quality")
    print(f"  Raw confidence:      {raw_confidence:.0%}")
    print(f"  Enhanced confidence: {enhanced_confidence:.0%}")
    print(f"\n  Cloudinary transformations applied:")
    print(f"    e_improve (auto contrast/exposure)")
    print(f"    e_sharpen:100 (text legibility)")
    print(f"    a_auto_right (auto-deskew)")
    print(f"    e_grayscale (reduce noise)")
    print(f"    q_auto:best + f_auto (optimal delivery)")

    # Save evidence
    evidence_dir = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "evidence")
    os.makedirs(evidence_dir, exist_ok=True)
    evidence = {
        "image": os.path.basename(image_path),
        "raw_url": raw_url,
        "enhanced_url": enhanced_url,
        "raw_ocr_chars": len(raw_text),
        "enhanced_ocr_chars": len(enhanced_text),
        "raw_word_quality_pct": raw_score,
        "enhanced_word_quality_pct": enhanced_score,
        "raw_confidence": raw_confidence,
        "enhanced_confidence": enhanced_confidence,
        "improvement_pct": improvement,
        "transformations": ["e_improve", "e_sharpen:100", "a_auto_right", "e_grayscale", "q_auto:best", "f_auto"],
        "raw_ocr_preview": raw_text[:300],
        "enhanced_ocr_preview": enhanced_text[:300],
    }
    evidence_path = os.path.join(evidence_dir, "cloudinary-ab-results.json")
    with open(evidence_path, "w") as f:
        json.dump(evidence, f, indent=2)
    print(f"\n  Evidence saved to: {evidence_path}")


if __name__ == "__main__":
    asyncio.run(main())
