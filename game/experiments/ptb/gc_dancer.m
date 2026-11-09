function gc_dancer(varargin)
% GC_DANCER  GAIN CONTROL perception console, lab version: SPINNING DANCER (SILHOUETTE ILLUSION)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Kayahara, N. (2003). Silhouette illusion [Animated figure]. Procreo Flash Design Laboratory.
%   Troje, N. F., & McAdams, M. (2010). The viewing-from-above bias and the silhouette illusion. i-Perception, 1(3), 143-148.
%
%   An original silhouette figure (not Kayahara's drawing) spinning on one toe at 0.42 rev/s in orthographic projection:
%   joints in 3D, turned about the standing leg, drawn as thick strokes with no shading or outline.
%   Press A (CLOCKWISE) or L (COUNTER-CLOCKWISE) on every change; 30 s with 'quick', otherwise 90 s.
%   gc_dancer   or   gc_dancer('quick')
%   Output: data/dancer_<participant>_<date>.csv  columns: stimulus, percept, onset_s, duration_s
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('dancer', 'stimulus,percept,onset_s,duration_s', 0, S);
try
    secs = 90; if quick, secs = 30; end
    J = containers.Map({'foot', 'knee', 'hip', 'hip2', 'knee2', 'foot2', 'neck', 'shL', 'shR', 'elL', 'haL', 'elR', 'haR', 'head'}, ...
        {[0 0 0], [1 44 2], [0 88 0], [4 90 -2], [44 100 8], [88 112 14], [0 162 0], [-17 156 -2], [17 156 2], [-24 192 6], [-6 224 10], [48 166 14], [80 178 26], [0 184 2]});
    BONES = {'foot', 'knee', 14; 'knee', 'hip', 19; 'hip2', 'knee2', 18; 'knee2', 'foot2', 13; 'hip', 'neck', 32; 'shL', 'shR', 16; ...
        'shL', 'elL', 12; 'elL', 'haL', 10; 'shR', 'elR', 12; 'elR', 'haR', 10};
    k = 1.75; col = [.91 .9 1];
    msg(win, 'Watch her spin. Seen from above, is she turning clockwise (A) or counter-clockwise (L)? Press on every flip.\\n\\nSPACE to start.', 1 - 0);
    names = {'a', 'l'}; labels = {'CLOCKWISE', 'COUNTER-CLOCKWISE'}; codes = [KbName('a') KbName('l')]; esc = KbName('ESCAPE');
    cur = 0; tOn = 0; t0 = Screen('Flip', win); vbl = t0;
    while vbl - t0 < secs
        t = vbl - t0;
        c = cos(t * 2 * pi * .42); s_ = sin(t * 2 * pi * .42);
        for b = 1:size(BONES, 1)
            p1 = J(BONES{b, 1}, :); p2 = J(BONES{b, 2}, :); wd = BONES{b, 3} * k;
            x1 = cx + (p1(1) * c + p1(3) * s_) * k; y1 = cy + 210 - p1(2) * k; x2 = cx + (p2(1) * c + p2(3) * s_) * k; y2 = cy + 210 - p2(2) * k;
            n = [-(y2 - y1) x2 - x1] / max(eps, hypot(x2 - x1, y2 - y1)) * wd / 2;   % thick limb: a quad with round caps
            Screen('FillPoly', win, col, [x1 + n(1) y1 + n(2); x2 + n(1) y2 + n(2); x2 - n(1) y2 - n(2); x1 - n(1) y1 - n(2)], 1);
            Screen('gluDisk', win, col, x1, y1, wd / 2); Screen('gluDisk', win, col, x2, y2, wd / 2);
        end
        h = J('head', :); Screen('gluDisk', win, col, cx + (h(1) * c + h(3) * s_) * k, cy + 210 - h(2) * k, 14 * k);
        vbl = Screen('Flip', win);
        [down, secsK, kc] = KbCheck;
        if down
            if kc(esc), error('gc:quit', 'Escape pressed'); end
            hit = find(kc(codes), 1);
            if ~isempty(hit) && hit ~= cur
                if cur, fprintf(fid, '%s,%s,%.3f,%.3f\n', 'dancer', labels{cur}, tOn, secsK - t0 - tOn); end
                cur = hit; tOn = secsK - t0;
            end
        end
    end
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end
end

% ---------------- shared helpers ----------------
function [win, rect, cx, cy, ppd, ifi, fid, fn] = gcOpen(id, header, bg, S)
% participant ID, data file (data/<id>_<participant>_<date>.csv), window, pixels per degree, frame interval
participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('%s_%s_%s.csv', id, participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, '%s\n', header);
PsychDefaultSetup(2); KbName('UnifyKeyNames');
if S.skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
[win, rect] = PsychImaging('OpenWindow', S.screenNumber, bg);
Screen('BlendFunction', win, 'GL_SRC_ALPHA', 'GL_ONE_MINUS_SRC_ALPHA');
[cx, cy] = RectCenter(rect); ppd = rect(3) / S.screenWidthCm * 2 * S.viewDistCm * tand(.5); ifi = Screen('GetFlipInterval', win);
Screen('TextSize', win, 24); HideCursor;
end

function gcClose(fid, fn, err)
% close the file and the screen; rethrow anything but Escape
fclose(fid); sca; ShowCursor;
if nargin > 2 && ~isempty(err) && ~strcmp(err.identifier, 'gc:quit'), rethrow(err); end
fprintf('Saved %s\n', fn);
end

function tex = gaborTex(win, c, sfCpd, oriDeg, ppd, sizeDeg, sdDeg, bg)
% a Gabor on grey bg (0-1) as a float texture; ori 0 = vertical stripes, positive = clockwise; random phase
n = round(sizeDeg * ppd); [x, y] = meshgrid((1:n) - n / 2); th = oriDeg * pi / 180;
env = exp(-(x .^ 2 + y .^ 2) / (2 * (sdDeg * ppd) ^ 2));
L = bg * (1 + c * env .* sin(2 * pi * sfCpd / ppd * (x * cos(th) + y * sin(th)) + rand * 2 * pi));
tex = Screen('MakeTexture', win, min(1, max(0, L)), [], [], 2);
end

function msg(win, text, col, wait)
if nargin < 3 || isempty(col), col = [1 1 1]; end
if nargin < 4, wait = true; end
DrawFormattedText(win, text, 'center', 'center', col, 90); Screen('Flip', win);
if wait, waitKey({'space', 'Return'}); end
end

function [k, rt] = waitKey(names, t0, maxWait)
% wait for one of the named keys (KbName names); Escape quits. rt from t0 (GetSecs). k = '' after maxWait seconds
if nargin < 2 || isempty(t0), t0 = GetSecs; end
if nargin < 3, maxWait = inf; end
codes = zeros(1, numel(names)); for i = 1:numel(names), c = KbName(names{i}); codes(i) = c(1); end
esc = KbName('ESCAPE'); KbReleaseWait;
while GetSecs - t0 < maxWait
    [down, secs, kc] = KbCheck;
    if down
        if kc(esc), error('gc:quit', 'Escape pressed'); end
        hit = find(kc(codes), 1);
        if ~isempty(hit), k = names{hit}; rt = secs - t0; return; end
    end
    WaitSecs(0.001);
end
k = ''; rt = NaN;
end
