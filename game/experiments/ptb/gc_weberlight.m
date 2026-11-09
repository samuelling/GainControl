function gc_weberlight(varargin)
% GC_WEBERLIGHT  GAIN CONTROL perception console, lab version: WEBER'S LAW FOR LIGHT
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Weber, E. H. (1834). De pulsu, resorptione, auditu et tactu. Leipzig: Koehler.
%   Barlow, H. B. (1957). Increment thresholds at low intensities considered as signal/noise discriminations. J. Physiol., 136(3), 469-488.
%
%   2IFC: a 1 deg spot slightly brighter than the background flashes 150 ms above fixation in one interval; four
%   background grey levels interleaved; QUEST on log10 Weber fraction with grey levels linearised by the sRGB curve.
%   Measure your display for real luminances. gc_weberlight   or   gc_weberlight('quick')
%   Output: data/weberlight_<participant>_<date>.csv  columns: trial, background_grey, background_linear, weber_fraction, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, rect, cx, cy, ppd, ifi, fid, fn] = gcOpen('weberlight', 'trial,background_grey,background_linear,weber_fraction,correct', .5, S);
try
    N = 120; if quick, N = 60; end
    lin = @(v) (v <= .04045) .* v / 12.92 + (v > .04045) .* ((v + .055) / 1.055) .^ 2.4;
    enc = @(L) (L <= .0031308) .* 12.92 .* L + (L > .0031308) .* (1.055 * L .^ (1 / 2.4) - .055);
    bgs = [.08 .2 .45 .8]; q = cell(1, 4); for i = 1:4, q{i} = QuestCreate(-1.5, 1.2, .82, 3, .02, .5); q{i}.normalizePdf = 1; end
    spotR = CenterRectOnPoint([0 0 1 1] * ppd, cx, cy - 1.2 * ppd);
    msg(win, 'A faint spot, a little brighter than the background, flashes above the cross in one of two intervals.\nWhich one: 1 or 2?\n\nSPACE to start.', 1);
    for t = 1:N
        bi = mod(t - 1, 4) + 1; b = bgs(bi); I = lin(b); wf = 10 ^ min(0, max(-3, QuestMean(q{bi}))); first = rand < .5;
        Screen('FillRect', win, b); spotV = enc(min(1, I * (1 + wf))); txt = double(b < .4);
        a = twoIFC(win, cx, cy, @(i) drawSpot(i), ifi, .15, .5, txt);
        ok = a == 2 - first; q{bi} = QuestUpdate(q{bi}, log10(wf), ok);
        fprintf(fid, '%d,%g,%.5f,%.5f,%d\n', t, b, I, wf, ok);
    end
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end
    function drawSpot(i)
        Screen('FillRect', win, b); if (i == 1) == first, Screen('FillOval', win, spotV, spotR); end
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
