# dmgbuild settings for GainControl.dmg (used by macos/build.sh):
#   dmgbuild -s macos/dmg/settings.py -D app=macos/build/GainControl.app -D bg=… -D icon=… "Gain Control" out.dmg
# A window with the line-art background (background.png / @2x, combined into a TIFF by build.sh), the game on the
# left, the Applications folder on the right, and the names on solid chips drawn into the background.
import os.path
app = defines['app']                     # noqa: F821 (dmgbuild provides `defines`)
name = os.path.basename(app)
format = 'UDZO'
filesystem = 'HFS+'
files = [app]
symlinks = {'Applications': '/Applications'}
hide_extensions = [name]
icon = defines.get('icon')               # noqa: F821
background = defines['bg']               # noqa: F821
show_status_bar = False
show_tab_view = False
show_toolbar = False
show_pathbar = False
show_sidebar = False
window_rect = ((200, 140), (640, 400))
default_view = 'icon-view'
arrange_by = None
icon_size = 112
text_size = 13
label_pos = 'bottom'
icon_locations = {name: (160, 185), 'Applications': (480, 185)}
