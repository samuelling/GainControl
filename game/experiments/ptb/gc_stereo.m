function gc_stereo(varargin)
% GC_STEREO  GAIN CONTROL perception console, lab version: STEREOACUITY (RANDOM-DOT STEREOGRAMS)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Julesz, B. (1960). Binocular depth perception of computer-generated patterns. Bell System Technical Journal, 39(5), 1125-1162.
%   Westheimer, G. (1979). Cooperative neural processes involved in stereoscopic acuity. Experimental Brain Research, 36(4), 585-597.
%
%   Random-dot stereograms through Psychtoolbox's own stereo modes: stereoMode 6 (red-green anaglyph; 7 = green-red,
%   8 = red-blue) or 4 (side by side, for a mirror stereoscope). Two squares; one floats nearer (crossed disparity):
%   LEFT or RIGHT. 2-down-1-up staircase on disparity in pixels. gc_stereo   or   gc_stereo('quick')
%   Output: data/stereo_<participant>_<date>.csv  columns: trial, disparity_px, disparity_arcmin, nearer, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

stereoMode = 6;   % 6 red-green anaglyph (red = left eye), 8 red-blue, 4 side-by-side stereoscope
participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('stereo_%s_%s.csv', participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, 'trial,disparity_px,disparity_arcmin,nearer,correct\n');
PsychDefaultSetup(2); KbName('UnifyKeyNames'); if S.skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
try
    [win, rect] = PsychImaging('OpenWindow', S.screenNumber, 0, [], [], [], stereoMode); HideCursor;
    sr = Screen('Rect', S.screenNumber); ppd = sr(3) / S.screenWidthCm * 2 * S.viewDistCm * tand(.5);   % from the whole screen (side by side, each eye's view is half of it)
    N = 60; if quick, N = 30; end
    ES = 462; el = 3; dis = 6; run = 0; last = 0; rev = [];
    for eye = 0:1, Screen('SelectStereoDrawBuffer', win, eye); DrawFormattedText(win, 'Two squares hide in the dots; one floats NEARER.\nLEFT or RIGHT for the nearer square.\n\nSPACE to start.', 'center', 'center', 1); end
    Screen('Flip', win); waitKey({'space'});
    for t = 1:N
        nearL = rand < .5; D = round(dis); n = floor(ES / el); base = kron(rand(n) < .5, ones(el));
        for eye = 0:1
            im = base; sgn = 1 - 2 * eye;   % crossed disparity: the left eye's copy shifts right
            cxs = [ES / 2 - 110, ES / 2 + 110]; si = 2 - nearL; y0 = ES / 2 - 60; x0 = cxs(si) - 60;
            im(y0 + 1:y0 + 120, x0 + 1 + sgn * floor(D / 2):x0 + 120 + sgn * floor(D / 2)) = base(y0 + 1:y0 + 120, x0 + 1:x0 + 120);
            tex = Screen('MakeTexture', win, im, [], [], 2); Screen('SelectStereoDrawBuffer', win, eye); Screen('DrawTexture', win, tex); Screen('Close', tex);
        end
        Screen('Flip', win);
        k = waitKey({'LeftArrow', 'RightArrow'}); ok = strcmp(k, 'LeftArrow') == nearL;
        nr = 'right'; if nearL, nr = 'left'; end
        fprintf(fid, '%d,%d,%.3f,%s,%d\n', t, D, D * 60 / ppd, nr, ok);
        d = 0; if ok, run = run + 1; if run >= 2, run = 0; d = -1; end, else, run = 0; d = 1; end
        if d, if last && d ~= last, rev(end + 1) = dis; end, last = d; dis = max(2, min(40, dis * (.75 * (d < 0) + 1.33 * (d > 0)))); end %#ok<AGROW>
        Screen('Flip', win); WaitSecs(.3);
    end
    if numel(rev) >= 2, thr = exp(mean(log(rev(max(1, end - 5):end)))); else, thr = dis; end
    fprintf('Stereo threshold about %.0f arcsec\n', thr * 3600 / ppd);
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
