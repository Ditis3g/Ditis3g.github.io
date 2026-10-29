# Third-party components

MjSee is an independent implementation. BandiView and ALSee names are used only to identify the public functionality studied; their code, graphics and branding are not included.

## Project-created artwork

The twelve built-in raster stickers were newly generated for this project and visually reviewed. They are not imported from BandiView, ALSee, stock character packs or third-party product graphics. The production atlas was separated into transparent 8-bit RGBA PNGs, isolated residual pixels and fully transparent hidden RGB were removed, and all metadata was stripped. The embedded files total 665,981 bytes and have a maximum edge of 256 pixels. They are not vector or print-resolution artwork. Exact dimensions, lengths and SHA-256 values are validated when each resource is loaded. No generation service, credentials or runtime network dependency is included with the sticker feature.

## Runtime components

| Component | Version / origin | Terms and attribution |
|---|---|---|
| Magick.NET Q16 HDRI x64 | 15.0.0, commit `79bb8700d7fe3a564f62926ab299fc2520cb2269` | Copyright Dirk Lemstra. Apache-2.0. See `licenses/Magick.NET-LICENSE.txt` and the complete upstream `licenses/Magick.NET-15.0.0-NOTICE.txt`. |
| ImageMagick and its native codecs | Included by the above package | Individual copyright and license texts, including LGPL components, are retained in the full upstream NOTICE. |
| SharpCompress | 1.0.0, commit `b6cc95af73950c914e0c6ce7ea3511528ede1121` | Copyright Adam Hathcock. MIT; `licenses/SharpCompress-LICENSE.txt`. Its BZip2 reader carries Apache-2.0 attribution; `licenses/SharpCompress-BZip2-NOTICE.txt` and the Apache-2.0 text in `licenses/Magick.NET-LICENSE.txt`. The package is unmodified. |
| ALZ/EGG compatibility reference and adapted code | alkegi/unalz `30b4ad40c5452c686df69b3b45554de3073e57a1`, alkegi/unegg `9929009ca4d010e8cd88bb796f7a1868162026d4`, alkegi/libazo `4af5b0d1b8c1bb1feb81d96158748292e46319e9` | Copyright (c) 2026 Sungjoon Moon, MIT; `licenses/Alkegi-LICENSE.txt`. The C# parser, bounded streaming I/O and adapted AZO/LEA code are altered versions, not the original Rust libraries. No separate binary/runtime package is included. |
| AZO algorithm lineage | kippler/xunazo `9503e21740079c9a439cd6592d34f9fbe72a3166` | Copyright (C) 2018 kippler@gmail.com, zlib; `licenses/Xunazo-LICENSE.txt`. Acknowledged upstream reference of libazo. MjSee's C# adaptation is explicitly marked as altered. |
| 7-Zip full x64 format library | 26.05, official 2026-10-21 binary, unmodified | Copyright (C) 1999–2026 Igor Pavlov and the credited upstream authors. LGPL-2.1-or-later, unRAR restriction, BSD-2/BSD-3 portions; `licenses/7zip-LICENSE.txt`, `licenses/7zip-LGPL-2.1.txt`, `licenses/7zip-unRAR-LICENSE.txt`. Only loaded by the data-only archive worker. |
| ACadSharp | 3.8.30, commit `760bd909c384b8f1a47c29acd1777ea8e3fe7cfe` | Copyright Albert Domenech. MIT; `licenses/ACadSharp-LICENSE.txt`. Used only by the isolated CAD reader. |
| CSUtilities / CSMath | ACadSharp shared-source submodule `a6505ab24bb45eac91e912179b2049136b7e88af` | Copyright Albert Domenech. MIT; `licenses/CSUtilities-LICENSE.txt`. |
| Windows SDK .NET projection | 10.0.19041.57 | Microsoft Windows SDK terms: https://aka.ms/WinSDKLicenseURL |
| C#/WinRT runtime | Supplied with the Windows SDK projection | Copyright Microsoft Corporation, MIT; `licenses/CsWinRT-LICENSE.txt`. |
| .NET / Windows Desktop Runtime | Installer self-contained payload: 10.0.14 win-x64; not bundled in the original framework-dependent folder | Microsoft and .NET contributors, MIT and component notices. Installer includes `licenses/DotNet-Runtime-LICENSE.txt`, `licenses/DotNet-Runtime-NOTICES.txt`, `licenses/DotNet-Desktop-LICENSE.txt` copied unchanged from the exact NuGet runtime packs. https://github.com/dotnet/runtime and https://github.com/dotnet/windowsdesktop |
| NSIS installer / Modern UI 2 | 3.13, unmodified compiler and runtime | NSIS contributors; Modern UI by Joost Verburg. zlib/libpng, compression-module licenses and LZMA linking exception in `licenses/NSIS-LICENSE.txt`. Complete unmodified corresponding source is bundled inside the installed app at `third_party/nsis/nsis-3.13-src.tar.bz2`. https://nsis.sourceforge.io/License |
| Windows SQLite (`winsqlite3`) | Operating-system component; not bundled | Used read-only for embedded CLIP preview databases. Original SQLite is public domain: https://www.sqlite.org/copyright.html . Windows supplies and services the OS binary. |
| Windows Color System / ICM (`mscms`, GDI) | Operating-system components; not bundled | Microsoft Windows APIs for read-only monitor-profile discovery and display-only color transforms. No monitor profiles or additional CMM binaries are installed or redistributed. |
| Vortice.Windows: Direct3D11, D3DCompiler, DXGI, DirectX | 3.8.3, commit `9e609cb9439c9872aa1b339f177e40ec96f77239` | Copyright Amer Koleci and Contributors. MIT; `licenses/Vortice.Windows.txt`. Used by the on-demand HDR display module. |
| Vortice.Mathematics | 2.1.0, commit `fa05ec6dcba48f3f7331791da6dc7f3d866b2ad6` | Copyright Amer Koleci and contributors. MIT; `licenses/Vortice.Mathematics.txt`. |
| SharpGen.Runtime / SharpGen.Runtime.COM | 2.4.2-beta, commit `6990bcafe124a4c22515ad19cee5a081da8db67b` | Copyright Alexandre Mutel, Jeremy Koritzinsky, Amer Koleci and contributors, as retained in `licenses/SharpGen.Runtime.txt`. MIT. |
| D3D11, DXGI and D3D shader compiler | Operating-system components; not bundled | Microsoft Windows APIs. The HDR path compiles project-authored shaders in memory and queries output capabilities without altering Windows HDR/profile settings. No third-party display driver or shader compiler installer is bundled. |

The codec package is used unmodified. Source and build instructions are available at:

- https://github.com/dlemstra/Magick.NET/tree/79bb8700d7fe3a564f62926ab299fc2520cb2269
- https://github.com/dlemstra/ImageMagick.Native
- https://github.com/ImageMagick/ImageMagick
- https://github.com/adamhathcock/sharpcompress/tree/b6cc95af73950c914e0c6ce7ea3511528ede1121
- https://github.com/microsoft/CsWinRT
- https://github.com/DomCR/ACadSharp/tree/760bd909c384b8f1a47c29acd1777ea8e3fe7cfe
- https://github.com/alkegi/unalz/tree/30b4ad40c5452c686df69b3b45554de3073e57a1
- https://github.com/alkegi/unegg/tree/9929009ca4d010e8cd88bb796f7a1868162026d4
- https://github.com/alkegi/libazo/tree/4af5b0d1b8c1bb1feb81d96158748292e46319e9
- https://github.com/kippler/xunazo/tree/9503e21740079c9a439cd6592d34f9fbe72a3166
- https://github.com/amerkoleci/Vortice.Windows/tree/9e609cb9439c9872aa1b339f177e40ec96f77239
- https://github.com/amerkoleci/Vortice.Mathematics/tree/fa05ec6dcba48f3f7331791da6dc7f3d866b2ad6
- https://github.com/SharpGenTools/SharpGenTools/tree/6990bcafe124a4c22515ad19cee5a081da8db67b

This workspace build is a development preview, not an assertion that a public distribution compliance review is complete. Before external redistribution, review the exact native-codec build, corresponding-source and relinking obligations for the LGPL components. Do not remove the included notices. Codec patent requirements can depend on jurisdiction and use.

### 7-Zip source and dynamic replacement

The complete corresponding 26.05 source archive is included at `third_party/7zip/7z2605-src.7z`, together with origin, hashes, upstream build instructions and dynamic-library replacement guidance in `third_party/7zip/README.md`. No source patches were applied. Its `DOC/readme.txt` and `CPP/7zip/Bundles/Format7zF` makefiles describe building the full DLL. The LGPL library is separately loaded from `native/7z.dll`; an interface-compatible x64 modified build is allowed, without an original checksum or signature requirement. Modification for the customer's own use and reverse engineering to debug those modifications are permitted to the extent required by LGPL §6.

The DLL was extracted from the official installer as archive data; the installer was not executed. No 7-Zip shell extension, registry modification, updater or user interface is installed or bundled. The actual version's notices and complete corresponding source accompany the binary. This specific source provision does not remove the separate native-image-codec compliance review noted above.

## Interoperability references and test inputs

ALZ/EGG format observations were consulted in [alkegi/docs](https://github.com/alkegi/docs/tree/36230c34d3056604cc63519e9855a79e894496b7), CC0-1.0. The ALZ DLZ BZip2 decoder parses framing/Huffman/MTF/BWT directly, rather than copying the large SharpCompress BZip2 implementation or using repeated speculative marker probes. Ordinary EGG BZip2 and LZMA call the existing unmodified SharpCompress dependency. Standard CRC, AES/PBKDF2 and HMAC operations are compatibility mechanisms, not recommendations to create new encrypted archives.

The official ESTsoft UnEGG module and source are **not** included or used. Their separately reviewed commercial-use conditions must not be confused with the above permissively licensed references. The official EGG specification PDF is likewise not redistributed. This development preview is not a claim that every patent or external-distribution legal review has been completed.

The CLIP preview reader is independently implemented. Public format observations and safety guidance consulted:

- https://github.com/Inochi2D/clip-d/blob/main/SPEC.md
- https://github.com/youichi-uda/clip-clai/blob/master/docs/clip-format-spec.md
- https://www.sqlite.org/c3ref/deserialize.html
- https://www.sqlite.org/security.html

The bounded C# 3DS reader uses the assimp project's importer as an interoperability reference, pinned to commit `3314b742e291b122430fb34eb4c87b09b55a6f7f`. No assimp binary or runtime dependency is included. The BSD-3-Clause attribution is retained in `licenses/Assimp-reference-LICENSE.txt`.

- https://github.com/assimp/assimp/tree/3314b742e291b122430fb34eb4c87b09b55a6f7f/code/AssetLib/3DS

The bounded C# HP-GL reader is independently implemented against HP's public *PCL 5 Printer Language Technical Reference Manual*, part II, chapters 17–23: https://www.hp.com/ctg/Manual/bpl13211.pdf . It interprets data only and does not execute printer/job commands. HP's public triangle diagnostic is also tested: https://support.hp.com/in-en/document/bpp02546 . Neither the reference manual nor printer software is bundled.

Public test files are not shipped in the application. Their sources and terms:

- HDR OpenEXR samples: Academy Software Foundation's OpenEXR image collection, commit `e38ffb0790f62f05a6f083a6fa4cac150b3b7452`, BSD-3-Clause; copyright Industrial Light & Magic and other credited contributors. `Desk`, `Rec709`, `XYZ`, `GoldenGate` and `Carrots` are hash-verified test inputs, not bundled artwork. The collection's complete license is retained alongside the development-only reference files. https://github.com/AcademySoftwareFoundation/openexr-images/tree/e38ffb0790f62f05a6f083a6fa4cac150b3b7452
- `test.clip`: Kazuhito Takahashi, 2024, MIT. https://github.com/Kazuhito00/clip_studio_paint_tool/tree/385dbc76f17b6fc4847ab4788eff8d81a006c693
- `test_export_all_features.clip`: copyright 2024, MIT. https://github.com/dobrokot/clip_to_psd/tree/e8db68c768f52ec91ba7530820f52537261cbad0
- DNG/NEF/CR3 samples: raw.pixls.us, CC0-1.0, repository file IDs 1033/5227/4659. https://raw.pixls.us/
- HEIC/AVIF examples: strukturag/libheif at commit `12a259a5882dd99d45ec5fc77e296a3b620d1e2e`. Repository LGPL-3.0 terms; used for testing only. https://github.com/strukturag/libheif
- Encrypted and solid ZIP/RAR/7Z test archives: SharpCompress project at commit `b6cc95af73950c914e0c6ce7ea3511528ede1121`, MIT repository. Public fixture passwords come from its test source, not user credentials. Test data is not bundled. https://github.com/adamhathcock/sharpcompress/tree/b6cc95af73950c914e0c6ce7ea3511528ede1121/tests/TestArchives/Archives
- CAB/LHA interoperability fixtures: libarchive project at commit `803c67fbacb0e46d95c2fa991f5380786f30604e`; associated tests copyright (c) 2008, 2010 Michihiro NAKAJIMA, BSD-2-Clause. Original uuencoded test files are decoded without editing their contents and used only for tests, not bundled. Their content is text, not photographic samples. Header-level-3 LHA is explicitly tracked as an unsupported case, not successful decoder coverage. https://github.com/libarchive/libarchive/tree/803c67fbacb0e46d95c2fa991f5380786f30604e/libarchive/test
- ALZ/EGG archives and split parts: alkegi/unalz and alkegi/unegg, at the pinned commits above. Their `tests/data/README.md` explicitly dedicate the fixtures to CC0-1.0. The input bytes are hash-verified and not bundled. Expected decoded lengths/CRC values come from the associated upstream regression tests. Reference content is text or arbitrary binary, not photo compatibility evidence; executable-shaped bytes are never executed. Separate project-created PNG fixtures test actual image display/conversion. Public test passwords are not user credentials.
- Animated and HDR AVIF samples: Alliance for Open Media's AOMediaCodec/libavif at commit `9b07a9d7a874b159bb4e14b80a6f08bb469d06f7`, BSD-2-Clause as identified by the data README. HDR color patches in BT.709/BT.2020/P3 and the Seine photos are hash-verified; the SDR gainmap sample is an explicit unsupported-HDR case. The complete license is retained with development references. Used for interoperability tests only; not bundled. https://github.com/AOMediaCodec/libavif/tree/9b07a9d7a874b159bb4e14b80a6f08bb469d06f7/tests/data
- DWG/DXF samples: ACadSharp at commit `760bd909c384b8f1a47c29acd1777ea8e3fe7cfe`, MIT repository. `sample_AC1014.dwg`, `sample_AC1032.dwg`, `sample_AC1009_binary.dxf`, `sample_AC1032_binary.dxf`, `svg/export_sample.dwg`. Testing only; not bundled. https://github.com/DomCR/ACadSharp/tree/760bd909c384b8f1a47c29acd1777ea8e3fe7cfe/samples
- 3DS samples: assimp at commit `3314b742e291b122430fb34eb4c87b09b55a6f7f`, BSD-3-Clause repository. Files are from `test/models/3DS`, not the separately licensed `test/models-nonbsd` folder. Testing only; not bundled. https://github.com/assimp/assimp/tree/3314b742e291b122430fb34eb4c87b09b55a6f7f/test/models/3DS
- HP-GL samples: ezhpgl contributors, copyright 2026, MIT. `linework.hpgl`, `transformed.hpgl`, `curves-and-fills.hpgl`, `labels.hpgl` at commit `9273464c15de02debf37cb8551f0bb39b1f97d1f`. Testing only; neither fixtures nor the ezhpgl library are bundled. Attribution retained in `licenses/ezhpgl-fixtures-LICENSE.txt`. https://github.com/monozukuri-ai/ezhpgl/tree/9273464c15de02debf37cb8551f0bb39b1f97d1f/examples

## Optional background-removal model

Model weights are **not bundled** in the release. The application asks before downloading the approximately 4.5 MB U²-Net small model, verifies its SHA-256, and runs inference locally through Windows APIs. No photo is sent to the model download host.

- Original model project: https://github.com/xuebinqin/U-2-Net
- Model project license: Apache-2.0; see `licenses/U2Net-LICENSE.txt`.
- Distribution of the ONNX weights: https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx
- Download SHA-256: `309C8469258DDA742793DCE0EBEA8E6DD393174F89934733ECC8B14C76F4DDD8`
- Reference preprocessing description: https://github.com/danielgatis/rembg/blob/main/rembg/sessions/u2netp.py
- rembg attribution/license: https://github.com/danielgatis/rembg ; `licenses/rembg-LICENSE.txt`.

The small model's output is not guaranteed to accurately isolate hair, glass, shadows or every subject. The user must inspect the result. Windows OCR and face detection depend on installed Windows features and have their own recognition limitations.

## Optional two-times super-resolution model

AMD SESR x2 is an optional 93,732-byte model. The published model card identifies Apache-2.0 terms. Weights are unmodified, verified before use, not bundled, and downloaded only after confirmation.

- Publisher/model card: https://huggingface.co/amd/ryzenai-sesr
- Pinned download: https://huggingface.co/amd/ryzenai-sesr/resolve/bad8fad865bfb9cc88f72818c7079c6667de4d51/sesr_nchw_fp32.onnx
- SHA-256: `4B686864A8B17CF9AAAD0D787F7B7A133C95317F408CAC5204701D7291199711`
- Attribution: `licenses/SESR-NOTICE.txt`; standard Apache-2.0 text: `licenses/U2Net-LICENSE.txt`.

The network runs locally on RGB tiles with reflected context and preserves alpha separately. It is an enhancement, not recovery of proven original detail. Small text, faces and textures may change. Current input limit: 12 megapixels. No publisher endorsement or equivalence to other products' AI quality is asserted.

## Optional object-removal model

LaMa is an optional 208,044,816-byte model, exported to ONNX by Carve. The original Samsung Research project and published model card identify Apache-2.0 terms. The unmodified opset-17 export is used; no quantization or opset-relabeling conversion is performed.

- Original project: https://github.com/advimman/lama
- Export project: https://github.com/Carve-Photos/lama
- Publisher/model card: https://huggingface.co/Carve/LaMa-ONNX
- Pinned download: https://huggingface.co/Carve/LaMa-ONNX/resolve/c3c0c9e468934d62e79c329e35d82dd09ff8c444/lama_fp32.onnx
- SHA-256: `1FAEF5301D78DB7DDA502FE59966957EC4B79DD64E16F03ED96913C7A4EB68D6`
- Attribution and terms: `licenses/LaMa-NOTICE.txt`; full standard Apache-2.0 license text is included with the other optional models.

Weights are not bundled. Photos are processed locally; only the pinned model is downloaded after confirmation. A square 512×512 context is synthesized, then composited strictly within the selected rectangle. Outside pixels and source alpha are retained in the decoded, edited sRGB image. New output is an 8-bit PNG without original metadata. This is plausible synthesis, not factual recovery of hidden content. Current input limit: 24 megapixels; arbitrary brush masks and interactive refinement are not yet implemented.
