# 7-Zip 26.05 corresponding source

DitSee dynamically uses the unmodified x64 `7z.dll` from Igor Pavlov's official 7-Zip 26.05 release (2026-10-21) for additional read-only archive formats. Copyright (C) 1999–2026 Igor Pavlov; other credited authors and exact terms are retained in `licenses/7zip-LICENSE.txt`. The full LGPL 2.1 and unRAR notices are included alongside it.

- Binary origin: https://github.com/ip7z/7zip/releases/download/26.05/7z2605-x64.exe
- Corresponding source origin: https://github.com/ip7z/7zip/releases/download/26.05/7z2605-src.7z
- Included complete, unmodified source: `7z2605-src.7z`, 1,552,479 bytes.
- Source SHA-256: `FA081A1A33186158D71E9E24F494ED852EF8D0C9D06E21A86FB4713D94B55AE9`.
- Shipped library SHA-256: `78BF6B668D75801E3AA180B4CCB16E6D8395FBA80DEC8A065055BB6F8DFABB82`, 1,908,736 bytes.

These hashes identify the delivered files, not a runtime restriction on replacement. The installer was opened as an archive; it was not installed or run. No explorer extension, registry registration, updater or 7-Zip user interface is bundled.

The source archive includes the complete `C`, `CPP`, `Asm`, and `DOC` trees, the makefiles and the original copyright/license files. See its `DOC/readme.txt` for build prerequisites and instructions. The full Windows format DLL is built from `CPP/7zip/Bundles/Format7zF`, using a compatible Visual C++/Windows SDK environment and its supplied makefile; choose the x64 platform. The original source has not been patched.

The separately loaded DLL resides at `native/7z.dll` in the application folder. Close DitSee and replace that file with an interface-compatible x64 library to use a modified build; DitSee does not require the original checksum, signature or version. Its COM-style interface IDs and stream contracts must remain compatible. The source package can be opened with a 7z-compatible archive tool.

To the extent required by LGPL 2.1 §6, modification of DitSee for your own use and reverse engineering for debugging such modifications are permitted. No DitSee term removes the rights granted by the included third-party licenses. The bundled library and source are supplied without warranty, as stated in those licenses. unRAR source must not be used to recreate a RAR-compatible compressor.
