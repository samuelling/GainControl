#!/bin/bash
# Build "Gain Control.app" for the Mac (Apple silicon and Intel) and wrap it in a disk image: macos/build/GainControl.dmg.
# Runs on a Mac with the Xcode command-line tools; no Xcode project needed. Used by .github/workflows/macos.yml.
#
#   macos/build.sh [app|dmg|all]        all (the default) builds both; the workflow builds the app, notarizes and
#                                       staples it, then builds the dmg around it
#   SIGN_ID="Developer ID Application: …" macos/build.sh
#                                       signed for distribution (then notarize; see the workflow); without it, ad hoc:
#                                       runs on this Mac, elsewhere right-click › Open the first time
#   VERSION=1.0                         the version people see (About box, Finder); BUILD is the game's build number
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
STEP=${1:-all}
OUT=macos/build
APP="$OUT/Gain Control.app"   # the name people see in Applications
VERSION=${VERSION:-1.0}
# the game's own build number (game/js/version.js, shown on the title screen) is the app's build number
BUILD=${BUILD:-$(sed -nE 's/.*VERSION = ([0-9]+).*/\1/p' game/js/version.js)}

if [ "$STEP" != dmg ]; then
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

echo "Built $ROOT/$APP ($VERSION, build $BUILD)"
fi
[ "$STEP" = app ] && exit 0

# the disk image: the app and a shortcut to Applications, to drag it into, in a window with the game's line-art
# background (dmgbuild lays out the window without Finder); plain hdiutil if dmgbuild isn't available
DMG=$OUT/GainControl.dmg; rm -f "$DMG"
TIFF=$OUT/background.tiff
tiffutil -cathidpicheck macos/dmg/background.png macos/dmg/background@2x.png -out "$TIFF" > /dev/null 2>&1 || cp macos/dmg/background.png "$TIFF"
DMGBUILD=${DMGBUILD:-$(command -v dmgbuild || true)}
if [ -n "$DMGBUILD" ]; then
  "$DMGBUILD" -s macos/dmg/settings.py -D app="$APP" -D bg="$TIFF" -D icon="$APP/Contents/Resources/AppIcon.icns" "Gain Control" "$DMG"
else
  echo "(dmgbuild not found: a plain disk image, without the window layout. pip install dmgbuild for the full one.)"
  STAGE=$OUT/dmg; rm -rf "$STAGE"; mkdir -p "$STAGE"
  cp -R "$APP" "$STAGE/"
  ln -s /Applications "$STAGE/Applications"
  hdiutil create -volname "Gain Control" -srcfolder "$STAGE" -ov -format UDZO "$DMG" > /dev/null
  rm -rf "$STAGE"
fi
rm -f "$TIFF"
if [ -n "${SIGN_ID:-}" ]; then codesign --sign "$SIGN_ID" --timestamp "$DMG"; fi
echo "Built $ROOT/$DMG ($(du -h "$DMG" | cut -f1))"
