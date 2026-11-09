#!/bin/bash
# Build GainControl.app for the Mac (Apple silicon and Intel) and wrap it in a disk image: macos/build/GainControl.dmg.
# Runs on a Mac with the Xcode command-line tools; no Xcode project needed. Used by .github/workflows/macos.yml.
#
#   macos/build.sh                      ad-hoc signed: runs on this Mac; elsewhere, right-click › Open the first time
#   SIGN_ID="Developer ID Application: …" macos/build.sh
#                                       signed for distribution (then notarize the dmg; see the workflow)
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
OUT=macos/build
APP=$OUT/GainControl.app
VERSION=${VERSION:-1.0}
# the game's own build number (game/js/version.js, shown on the title screen) is the app's build number
BUILD=${BUILD:-$(sed -nE 's/.*VERSION = ([0-9]+).*/\1/p' game/js/version.js)}
rm -rf "$OUT"; mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

# the app: the Mac shell plus the iOS app's local web server, for both kinds of Mac
SRC=(macos/main.swift ios/GainControl/LocalServer.swift)
for arch in arm64 x86_64; do
  swiftc -O -target $arch-apple-macos13.0 -o "$OUT/GainControl-$arch" "${SRC[@]}"
done
lipo -create -output "$APP/Contents/MacOS/GainControl" "$OUT/GainControl-arm64" "$OUT/GainControl-x86_64"
rm "$OUT"/GainControl-arm64 "$OUT"/GainControl-x86_64

sed -e "s/__VERSION__/$VERSION/" -e "s/__BUILD__/$BUILD/" macos/Info.plist > "$APP/Contents/Info.plist"
printf 'APPL????' > "$APP/Contents/PkgInfo"

# the icon
ICONSET=$OUT/AppIcon.iconset; mkdir -p "$ICONSET"
for s in 16 32 128 256 512; do
  sips -z $s $s macos/AppIcon.png --out "$ICONSET/icon_${s}x${s}.png" > /dev/null
  sips -z $((s * 2)) $((s * 2)) macos/AppIcon.png --out "$ICONSET/icon_${s}x${s}@2x.png" > /dev/null
done
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/AppIcon.icns"
rm -rf "$ICONSET"

# the game itself, as on the web
WEB=$APP/Contents/Resources/Web; mkdir -p "$WEB"
rsync -a --exclude 'preview.html' --exclude 'script.html' game/ "$WEB/"

# sign: a Developer ID with the hardened runtime if one is given, otherwise ad hoc
if [ -n "${SIGN_ID:-}" ]; then
  codesign --force --options runtime --timestamp --sign "$SIGN_ID" "$APP"
else
  codesign --force --sign - "$APP"
fi
codesign --verify --deep --strict "$APP"

# the disk image: the app and a shortcut to Applications, to drag it into
STAGE=$OUT/dmg; mkdir -p "$STAGE"
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
hdiutil create -volname "Gain Control" -srcfolder "$STAGE" -ov -format UDZO "$OUT/GainControl.dmg" > /dev/null
rm -rf "$STAGE"
if [ -n "${SIGN_ID:-}" ]; then codesign --sign "$SIGN_ID" --timestamp "$OUT/GainControl.dmg"; fi
echo "Built $ROOT/$OUT/GainControl.dmg ($(du -h "$OUT/GainControl.dmg" | cut -f1))"
