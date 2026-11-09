function gc_hues(varargin)
% GC_HUES  GAIN CONTROL perception console, lab version: HUE ARRANGEMENT (D-15 STYLE)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Farnsworth, D. (1947). The Farnsworth Dichotomous Test for Color Blindness, Panel D-15. New York: Psychological Corporation.
%   Vingrys, A. J., & King-Smith, P. E. (1988). A quantitative scoring technique for panel tests of color vision. IOVS, 29(1), 50-63.
%
%   A reference cap and fifteen caps of equal CIELAB lightness (L* 60, chroma 32) round the hue circle (sRGB, uncalibrated).
%   Click the cap closest to the last one in the row until all are placed; BACKSPACE undoes. Score offline (Vingrys &
%   King-Smith). A demonstration, not a diagnosis. gc_hues
%   Output: data/hues_<participant>_<date>.csv  columns: position, cap_number
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, rect, ~, ~, ~, ~, fid, fn] = gcOpen('hues', 'position,cap_number', .12, S);
try
    ref = lch2rgb(60, 32, 4.2); caps = zeros(15, 3); for i = 1:15, caps(i, :) = lch2rgb(60, 32, 4.2 - i * 2 * pi / 17); end
    order = randperm(15); row = []; R = 22; H = rect(4);
    posRow = @(k) [70 + k * 54, H / 2 - 90]; posLoose = @(j) [70 + mod(j - 1, 8) * 108 + 54 * (j > 8), H / 2 + 80 + 90 * (j > 8)];
    msg(win, 'Click the loose cap closest in colour to the last cap in the row, then the next closest, until the row is full.\nBACKSPACE takes one back. (Uncalibrated colours: a demonstration, not a test.)\n\nSPACE to start.'); ShowCursor;
    while numel(row) < 15
        p = posRow(0); Screen('gluDisk', win, ref, p(1), p(2), R); Screen('FrameOval', win, [.91 .9 1], CenterRectOnPoint([0 0 2 2] * R, p(1), p(2)), 2);
        for k = 1:numel(row), p = posRow(k); Screen('gluDisk', win, caps(row(k), :), p(1), p(2), R); end
        for j = 1:15, if ~any(row == order(j)), p = posLoose(j); Screen('gluDisk', win, caps(order(j), :), p(1), p(2), R); end, end
        Screen('Flip', win);
        [~, ~, kc] = KbCheck; if kc(KbName('ESCAPE')), error('gc:quit', 'Escape'); end
        if kc(KbName('BackSpace')) && ~isempty(row), row(end) = []; KbReleaseWait; end
        [mx, my, b] = GetMouse(win);
        if any(b)
            while any(b), [~, ~, b] = GetMouse(win); end
            for j = 1:15, p = posLoose(j); if ~any(row == order(j)) && hypot(mx - p(1), my - p(2)) < R + 6, row(end + 1) = order(j); break; end, end %#ok<AGROW>
        end
    end
    for k = 1:15, fprintf(fid, '%d,%d\n', k, row(k)); end
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end

function rgb = lch2rgb(L, C, h)
% CIELAB LCh -> sRGB (0-1), clipped
a = C * cos(h); b = C * sin(h); fy = (L + 16) / 116; fx = fy + a / 500; fz = fy - b / 200;
inv = @(t) (t .^ 3 > .008856) .* t .^ 3 + (t .^ 3 <= .008856) .* (t - 16 / 116) / 7.787;
XYZ = [inv(fx) * .95047, inv(fy), inv(fz) * 1.08883];
v = XYZ * [3.2406 -.9689 .0557; -1.5372 1.8758 -.2040; -.4986 .0415 1.0570];
rgb = min(1, max(0, (v <= .0031308) .* 12.92 .* v + (v > .0031308) .* (1.055 * abs(v) .^ (1 / 2.4) - .055)));
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

function a = twoIFC(win, cx, cy, drawFn, ifi, dur, isi, col)
% two numbered intervals; drawFn(i) draws interval i's stimulus. Returns the interval chosen (1 or 2)
if nargin < 6, dur = .2; end
if nargin < 7, isi = .5; end
if nargin < 8, col = 0; end
for i = 1:2
    DrawFormattedText(win, num2str(i), 'center', cy - 240, col); Screen('DrawLines', win, [-7 7 0 0; 0 0 -7 7], 2, col, [cx cy]);
    vbl = Screen('Flip', win);
    drawFn(i); DrawFormattedText(win, num2str(i), 'center', cy - 240, col);
    vbl = Screen('Flip', win, vbl + isi - .5 * ifi);
    Screen('DrawLines', win, [-7 7 0 0; 0 0 -7 7], 2, col, [cx cy]); Screen('Flip', win, vbl + dur - .5 * ifi);
end
k = waitKey({'1!', '2@', '1', '2'}); a = k(1) - '0';
end
